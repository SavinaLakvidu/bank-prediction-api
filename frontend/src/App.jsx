import { useState } from 'react';
import './App.css';
const JOB_OPTIONS = ['admin.', 'blue-collar', 'entrepreneur', 'housemaid', 'management',
  'retired', 'self-employed', 'services', 'student', 'technician', 'unemployed', 'unknown'];
const MARITAL_OPTIONS = ['divorced', 'married', 'single', 'unknown'];
const EDUCATION_OPTIONS = ['illiterate', 'basic.4y', 'basic.6y', 'basic.9y', 'high.school',
  'professional.course', 'university.degree', 'unknown'];
const YES_NO_UNKNOWN = ['yes', 'no', 'unknown'];
const CONTACT_OPTIONS = ['cellular', 'telephone'];
const MONTH_OPTIONS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DAY_OPTIONS = ['mon', 'tue', 'wed', 'thu', 'fri'];

function App() {
  const [form, setForm] = useState({
    age: 35, job: 'admin.', marital: 'married', education: 'high.school',
    housing: 'no', loan: 'no', contact: 'cellular', month: 'may',
    day_of_week: 'mon', campaign: 1, pdays: 999, previous: 0, poutcome: 'nonexistent'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('https://ominous-space-spork-x5x7xxqrww79c947-8000.app.github.dev/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail?.[0]?.msg || 'Prediction failed');
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="header-band">
        <h2>Term Deposit Subscription Predictor</h2>
        <p className="intro">
          Enter a client's details to estimate their likelihood of subscribing to a term deposit.
          Use this to help prioritize who to call first.
        </p>
      </div>
      <div className="form-grid">
        <fieldset>
          <legend>Client Profile</legend>
          <label>Age
            <input type="number"
              value={form.age === 0 ? '' : form.age}
              onChange={e => handleChange('age', e.target.value === '' ? 0 : Number(e.target.value))} />
          </label>
          <label>Job
            <select value={form.job} onChange={e => handleChange('job', e.target.value)}>
              {JOB_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label>Marital Status
            <select value={form.marital} onChange={e => handleChange('marital', e.target.value)}>
              {MARITAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label>Education
            <select value={form.education} onChange={e => handleChange('education', e.target.value)}>
              {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Financial Status</legend>
          <label>Housing Loan
            <select value={form.housing} onChange={e => handleChange('housing', e.target.value)}>
              {YES_NO_UNKNOWN.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label>Personal Loan
            <select value={form.loan} onChange={e => handleChange('loan', e.target.value)}>
              {YES_NO_UNKNOWN.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </fieldset>
      </div>
      <fieldset>
        <legend>Campaign Contact Details</legend>
        <label>Contact Type
          <select value={form.contact} onChange={e => handleChange('contact', e.target.value)}>
            {CONTACT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label>Planned Contact Month
          <select value={form.month} onChange={e => handleChange('month', e.target.value)}>
            {MONTH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label>Planned Contact Day
          <select value={form.day_of_week} onChange={e => handleChange('day_of_week', e.target.value)}>
            {DAY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label>Contacts Made This Campaign (so far)
          <input type="number" min="1"
            value={form.campaign === 0 ? '' : form.campaign}
            onChange={e => handleChange('campaign', e.target.value === '' ? 0 : Number(e.target.value))} />
        </label>
        <label>Previous Contacts (in earlier campaigns)
          <input type="number" min="0"
            value={form.previous === 0 ? '' : form.previous}
            onChange={e => {
              const val = e.target.value === '' ? 0 : Number(e.target.value);
              if (val === 0) {
                setForm({ ...form, previous: val, pdays: 999, poutcome: 'nonexistent' });
              } else {
                setForm({ ...form, previous: val });
              }
            }} />
        </label>

        {form.previous > 0 && (
          <>
            <label>Days Since That Last Contact
              <input type="number" min="0"
                value={form.pdays === 999 || form.pdays === 0 ? '' : form.pdays}
                onChange={e => handleChange('pdays', e.target.value === '' ? 0 : Number(e.target.value))} />
            </label>
            <label>Outcome of That Previous Campaign
              <select value={form.poutcome} onChange={e => handleChange('poutcome', e.target.value)}>
                <option value="success">success</option>
                <option value="failure">failure</option>
              </select>
            </label>
          </>
        )}
        {form.previous === 0 && (
          <span className="hint">No previous contact — "days since" and "previous outcome" aren't applicable.</span>
        )}
      </fieldset>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Predicting...' : 'Predict Likelihood'}
      </button>

      {error && <div className="error-box">Error: {error}</div>}

      {result && (
        <div className="result-box">
          <div className="result-label">Prediction</div>
          <div className="result-value">{result.prediction === 'yes' ? 'Likely to subscribe' : 'Unlikely to subscribe'}</div>
          <div className="prob-track">
            <div className="prob-fill" style={{ width: `${result.probability * 100}%` }} />
          </div>
          <div className="prob-pct">{(result.probability * 100).toFixed(1)}% probability of subscribing</div>
        </div>
      )}
    </div>
  );  
}

export default App;