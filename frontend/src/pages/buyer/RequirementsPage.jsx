import { useState } from 'react';
import { Plus, MapPin, CheckCircle2, Trash2, AlertTriangle, Info } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import './RequirementsPage.css';

const CROP_OPTS = [
  { value: '', label: 'Select crop type…' },
  { value: 'paddy_straw', label: 'Paddy Straw' },
  { value: 'wheat_straw', label: 'Wheat Straw' },
  { value: 'sugarcane_residue', label: 'Sugarcane Residue' },
  { value: 'soybean_stover', label: 'Soybean Stover' },
  { value: 'cotton_stalks', label: 'Cotton Stalks' },
  { value: 'maize_stalks', label: 'Maize Stalks' },
  { value: 'any', label: 'Any / Open to suggestions' },
];

const FREQ_OPTS = [
  { value: 'one_time', label: 'One-time purchase' },
  { value: 'monthly', label: 'Monthly recurring' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'as_needed', label: 'As needed' },
];

const DEMO_POSTED = [
  {
    id: 'RQ-001', crop: 'Paddy Straw', qty: '20 tonnes/month',
    budget: '₹900/t', location: 'Kolhapur region (100 km)', freq: 'Monthly recurring',
    status: 'active', postedDate: 'Oct 20, 2026', responses: 3,
    purpose: 'Compost manufacturing plant',
  },
  {
    id: 'RQ-002', crop: 'Sugarcane Residue', qty: '10 tonnes',
    budget: '₹1,100/t', location: 'Sangli / Kolhapur', freq: 'One-time',
    status: 'active', postedDate: 'Nov 1, 2026', responses: 1,
    purpose: 'Biogas pilot project',
  },
];

export default function RequirementsPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    cropType: '', qty: '', unit: 'tonnes',
    budget: '', location: '', radius: '50',
    frequency: 'one_time', purpose: '', notes: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.cropType) errs.cropType = 'Select a crop type';
    if (!form.qty || isNaN(form.qty) || Number(form.qty) <= 0) errs.qty = 'Enter a valid quantity';
    if (!form.location.trim()) errs.location = 'Enter your preferred location';
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
    setShowForm(false);
    alert('Requirement posted! In production: POST /api/v1/requirements');
  };

  return (
    <AppShell pageTitle="My Requirements">
      <div className="req-page-header">
        <div>
          <h2 className="req-page-title">Buying Requirements</h2>
          <p className="req-page-sub">Post your crop residue requirements so matching farmers can reach you</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={15} />} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : 'Post Requirement'}
        </Button>
      </div>

      {/* How it works */}
      <Card padding="sm" className="how-it-works">
        <div className="hiw-steps">
          {[
            { n: '1', label: 'Post your requirement' },
            { n: '2', label: 'Matching farmers see it' },
            { n: '3', label: 'Farmers contact you' },
            { n: '4', label: 'Agree terms & pickup' },
          ].map(s => (
            <div key={s.n} className="hiw-step">
              <div className="hiw-num">{s.n}</div>
              <span className="hiw-label">{s.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Post form */}
      {showForm && (
        <Card className="animate-fadeIn req-form-card">
          <h3 className="req-form-title">New Buying Requirement</h3>
          <div className="req-form-grid">
            <Select id="cropType" name="cropType" label="Crop / Residue Type"
              options={CROP_OPTS} value={form.cropType} onChange={handleChange}
              error={errors.cropType} required />
            <div className="input-group">
              <Input id="qty" name="qty" label="Quantity Needed"
                type="number" min="0.1" step="0.1" placeholder="e.g., 20"
                value={form.qty} onChange={handleChange} error={errors.qty} required />
              <Select id="unit" name="unit" label="Unit"
                options={[{ value: 'tonnes', label: 'Tonnes' }, { value: 'kg', label: 'KG' }, { value: 'quintals', label: 'Quintals' }]}
                value={form.unit} onChange={handleChange} />
            </div>
            <Input id="budget" name="budget" label="Max Budget (₹/tonne, optional)"
              type="number" min="0" placeholder="e.g., 900"
              value={form.budget} onChange={handleChange}
              hint="Helps farmers decide if worth contacting you" />
            <Select id="frequency" name="frequency" label="Purchase Frequency"
              options={FREQ_OPTS} value={form.frequency} onChange={handleChange} />
            <Input id="location" name="location" label="Preferred Location / Region"
              placeholder="e.g., Kolhapur, Sangli"
              value={form.location} onChange={handleChange}
              error={errors.location} required leftIcon={<MapPin size={15} />} />
            <Select id="radius" name="radius" label="Radius"
              options={[{ value: '25', label: '25 km' }, { value: '50', label: '50 km' }, { value: '100', label: '100 km' }, { value: '200', label: '200 km' }]}
              value={form.radius} onChange={handleChange} />
          </div>
          <Input id="purpose" name="purpose" label="Intended Use / Purpose"
            placeholder="e.g., Compost plant, Biogas, Animal Feed"
            value={form.purpose} onChange={handleChange} />
          <Textarea id="notes" name="notes" label="Additional Notes"
            placeholder="Any specific quality requirements, delivery terms…"
            value={form.notes} onChange={handleChange} />
          <div className="req-form-footer">
            <div className="req-form-notice">
              <Info size={13} /> Your contact details will only be shared with verified farmers you approve.
            </div>
            <Button variant="primary" leftIcon={<CheckCircle2 size={15} />} onClick={handleSubmit}>
              Post Requirement
            </Button>
          </div>
        </Card>
      )}

      {submitted && (
        <div className="req-submitted-banner animate-fadeIn">
          <CheckCircle2 size={16} /> <strong>Requirement posted!</strong> Farmers matching your criteria will be able to find you.
        </div>
      )}

      {/* Demo notice */}
      <div className="req-demo-notice">
        <AlertTriangle size={13} />
        <span><strong>Demo data</strong> — requires backend to list real requirements.</span>
      </div>

      {/* Posted requirements */}
      <div>
        <h3 className="req-section-title">Your Posted Requirements</h3>
        <div className="req-posted-list">
          {DEMO_POSTED.map(r => (
            <Card key={r.id} className="req-posted-card animate-fadeIn">
              <div className="req-posted-top">
                <div>
                  <div className="req-posted-id-row">
                    <span className="req-posted-id">{r.id}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <h3 className="req-posted-crop">{r.crop}</h3>
                  <p className="req-posted-purpose">{r.purpose}</p>
                </div>
                <Button variant="ghost" size="sm" leftIcon={<Trash2 size={13} />}
                  onClick={() => alert('Delete: ' + r.id)}>
                  Remove
                </Button>
              </div>
              <div className="req-posted-details">
                <div className="rpd-item"><span className="rpd-label">Qty</span><span className="rpd-val">{r.qty}</span></div>
                <div className="rpd-item"><span className="rpd-label">Budget</span><span className="rpd-val rpd-budget">{r.budget}</span></div>
                <div className="rpd-item"><span className="rpd-label">Location</span><span className="rpd-val">{r.location}</span></div>
                <div className="rpd-item"><span className="rpd-label">Frequency</span><span className="rpd-val">{r.freq}</span></div>
              </div>
              <div className="req-posted-footer">
                <span className="req-posted-date">Posted {r.postedDate}</span>
                <span className="req-posted-responses">
                  {r.responses} farmer{r.responses !== 1 ? 's' : ''} responded
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
