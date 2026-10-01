from pydantic import BaseModel, Field
from typing import Literal
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load('models/model.pkl')
scaler = joblib.load('models/scaler.pkl')
job_tier_map = joblib.load('models/job_tier_map.pkl')
tier_num_map = joblib.load('models/tier_num_map.pkl')
education_order = joblib.load('models/education_order.pkl')
high_success_months = joblib.load('models/high_success_months.pkl')
feature_columns = joblib.load('models/feature_columns.pkl')

class ClientInput(BaseModel):
    age: int = Field(..., ge=17, le=100)
    job: Literal['admin.', 'blue-collar', 'entrepreneur', 'housemaid', 'management',
                 'retired', 'self-employed', 'services', 'student', 'technician',
                 'unemployed', 'unknown']
    marital: Literal['divorced', 'married', 'single', 'unknown']
    education: Literal['illiterate', 'basic.4y', 'basic.6y', 'basic.9y', 'high.school',
                        'professional.course', 'university.degree', 'unknown']
    housing: Literal['yes', 'no', 'unknown']
    loan: Literal['yes', 'no', 'unknown']
    contact: Literal['cellular', 'telephone']
    month: Literal['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    day_of_week: Literal['mon', 'tue', 'wed', 'thu', 'fri']
    campaign: int = Field(..., ge=1)
    pdays: int = Field(..., ge=0)
    previous: int = Field(..., ge=0)
    poutcome: Literal['failure', 'nonexistent', 'success']

COLS_TO_SCALE = ['age', 'education', 'campaign', 'pdays', 'previous',
                  'emp.var.rate', 'cons.price.idx', 'cons.conf.idx',
                  'euribor3m', 'nr.employed', 'job_risk_tier']

def preprocess(client: ClientInput) -> pd.DataFrame:
    row = {
        'age': client.age, 'job': client.job, 'marital': client.marital,
        'education': client.education, 'housing': client.housing, 'loan': client.loan,
        'contact': client.contact, 'month': client.month, 'day_of_week': client.day_of_week,
        'campaign': min(client.campaign, 14),  # same cap applied in training
        'pdays': 0 if client.pdays == 999 else client.pdays,
        'pdays_known': 0 if client.pdays == 999 else 1,
        'previous': client.previous, 'poutcome': client.poutcome,
    }
    df = pd.DataFrame([row])

    # Ordinal encode education (same dict used in training)
    df['education_known'] = int(df['education'].iloc[0] in education_order)
    df['education'] = df['education'].map(education_order).fillna(-1).astype(int)

    # One-hot encode nominal categoricals
    df = pd.get_dummies(df, columns=['housing', 'loan', 'contact', 'marital',
                                      'poutcome', 'day_of_week', 'month'])

    # job_risk_tier (binning, same mapping as training)
    tier = job_tier_map.get(client.job, 'medium')
    df['job_risk_tier'] = tier_num_map[tier]

    # high_success_month flag
    df['high_success_month'] = int(client.month in high_success_months)

    # Economic indicators: use the scaler's own training means as "raw" input
    econ_cols = ['emp.var.rate', 'cons.price.idx', 'cons.conf.idx', 'euribor3m', 'nr.employed']
    for i, col in enumerate(econ_cols):
        df[col] = scaler.mean_[COLS_TO_SCALE.index(col)]

    # Align to the exact training column set and order
    df = df.reindex(columns=feature_columns, fill_value=0)

    # Scale, using the already-fitted scaler (never refit here)
    df[COLS_TO_SCALE] = scaler.transform(df[COLS_TO_SCALE])

    return df

@app.post("/predict")
def predict(client: ClientInput):
    try:
        X = preprocess(client)
        proba = model.predict_proba(X)[0][1]
        prediction = "yes" if proba >= 0.5 else "no"
        return {
            "prediction": prediction,
            "probability": round(float(proba), 4)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")