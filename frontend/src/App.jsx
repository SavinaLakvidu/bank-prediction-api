import { useState } from 'react';

const JOB_OPTIONS = ['admin.', 'blue-collar', 'entrepreneur', 'housemaid', 'management',
  'retired', 'self-employed', 'services', 'student', 'technician', 'unemployed', 'unknown'];
const MARITAL_OPTIONS = ['divorced', 'married', 'single', 'unknown'];
const EDUCATION_OPTIONS = ['illiterate', 'basic.4y', 'basic.6y', 'basic.9y', 'high.school',
  'professional.course', 'university.degree', 'unknown'];
const YES_NO_UNKNOWN = ['yes', 'no', 'unknown'];
const CONTACT_OPTIONS = ['cellular', 'telephone'];
const MONTH_OPTIONS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DAY_OPTIONS = ['mon', 'tue', 'wed', 'thu', 'fri'];
const POUTCOME_OPTIONS = ['failure', 'nonexistent', 'success'];

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
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Term Deposit Subscription Predictor</h2>

      <label>Age<br/>
        <input type="number" value={form.age} onChange={e => handleChange('age', Number(e.target.value))} />
      </label><br/><br/>

      <label>Job<br/>
        <select value={form.job} onChange={e => handleChange('job', e.target.value)}>
          {JOB_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label><br/><br/>

      <label>Marital Status<br/>
        <select value={form.marital} onChange={e => handleChange('marital', e.target.value)}>
          {MARITAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label><br/><br/>

      <label>Education<br/>
        <select value={form.education} onChange={e => handleChange('education', e.target.value)}>
          {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label><br/><br/>

      <label>Housing Loan<br/>
        <select value={form.housing} onChange={e => handleChange('housing', e.target.value)}>
          {YES_NO_UNKNOWN.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label><br/><br/>

      <label>Personal Loan<br/>
        <select value={form.loan} onChange={e => handleChange('loan', e.target.value)}>
          {YES_NO_UNKNOWN.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label><br/><br/>

      <label>Contact Type<br/>
        <select value={form.contact} onChange={e => handleChange('contact', e.target.value)}>
          {CONTACT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label><br/><br/>

      <label>Contact Month<br/>
        <select value={form.month} onChange={e => handleChange('month', e.target.value)}>
          {MONTH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label><br/><br/>

      <label>Contact Day of Week<br/>
        <select value={form.day_of_week} onChange={e => handleChange('day_of_week', e.target.value)}>
          {DAY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label><br/><br/>

      <label>Number of Contacts This Campaign<br/>
        <input type="number" min="1" value={form.campaign} onChange={e => handleChange('campaign', Number(e.target.value))} />
      </label><br/><br/>

      <label>Days Since Last Contact (999 = never)<br/>
        <input type="number" min="0" value={form.pdays} onChange={e => handleChange('pdays', Number(e.target.value))} />
      </label><br/><br/>

      <label>Previous Contacts<br/>
        <input type="number" min="0" value={form.previous} onChange={e => handleChange('previous', Number(e.target.value))} />
      </label><br/><br/>

      <label>Previous Campaign Outcome<br/>
        <select value={form.poutcome} onChange={e => handleChange('poutcome', e.target.value)}>
          {POUTCOME_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label><br/><br/>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Predicting...' : 'Predict'}
      </button>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: '#fee', border: '1px solid #c33' }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16, padding: 12, background: result.prediction === 'yes' ? '#efe' : '#f5f5f5', border: '1px solid #999' }}>
          <strong>Prediction: {result.prediction.toUpperCase()}</strong><br/>
          Probability of subscribing: {(result.probability * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

export default App;