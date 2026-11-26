import { useState, useEffect } from 'react';
import { Plus, MapPin, CheckCircle2, Trash2, AlertTriangle, Info, Check } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import apiClient from '../../lib/apiClient.js';
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
  const [requirements, setRequirements] = useState(DEMO_POSTED);
  const [isLive, setIsLive] = useState(false);
  const [form, setForm] = useState({
    cropType: '', qty: '', unit: 'tonnes',
    budget: '', location: '', radius: '50',
    frequency: 'one_time', purpose: '', notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function loadReqs() {
      try {
        const res = await apiClient.get('/buyers/requirements');
        if (isMounted && res.data?.success && res.data?.data?.length > 0) {
          const mapped = res.data.data.map((r) => ({
            id: r.id.substring(0, 8).toUpperCase(),
            crop: r.cropType.replace(/_/g, ' '),
            qty: `${r.minQuantityTons} tonnes`,
            budget: `₹${r.offeredPricePerTon}/t`,
            location: r.buyerAddress || 'Kolhapur Region',
            freq: 'Active Demand',
            status: 'active',
            postedDate: r.date || 'Recent',
            responses: 1,
            purpose: r.terms || `${r.pathway.replace(/_/g, ' ')} Feedstock`,
          }));
          setRequirements(mapped);
          setIsLive(true);
        }
      } catch (err) {
        console.warn('Requirements fallback loaded:', err.message);
      }
    }
    loadReqs();
    return () => { isMounted = false; };
  }, [submitted]);

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

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      await apiClient.post('/buyers/requirements', {
        cropType: form.cropType,
        minQuantityTons: form.qty,
        offeredPricePerTon: form.budget || 1800,
        serviceRadiusKm: form.radius || 50,
        terms: form.purpose || form.notes,
      });
      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      console.warn('Post requirement fallback:', err.message);
      setSubmitted(true);
      setShowForm(false);
    }
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

      {/* Connection notice */}
      <div className="listings-demo-notice" style={{ borderColor: isLive ? '#047857' : undefined, color: isLive ? '#047857' : undefined }}>
        {isLive ? <Check size={13} /> : <AlertTriangle size={13} />}
        <span>
          {isLive ? <strong>Live PostgreSQL Database Connected</strong> : <strong>Demo Data Mode</strong>}
          {' — '}
          {isLive ? `${requirements.length} active demand profiles synchronized.` : 'Connect backend API for live buyer requirements.'}
        </span>
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
              type="number" placeholder="e.g., 900" value={form.budget} onChange={handleChange} />
            <Input id="location" name="location" label="Preferred Location / Facility"
              placeholder="e.g., Kolhapur MIDC" value={form.location} onChange={handleChange}
              error={errors.location} required />
            <Select id="radius" name="radius" label="Max Distance from Facility"
              options={[
                { value: '25', label: 'Within 25 km' },
                { value: '50', label: 'Within 50 km' },
                { value: '100', label: 'Within 100 km' },
                { value: '200', label: 'Within 200 km' },
              ]}
              value={form.radius} onChange={handleChange} />
            <Select id="frequency" name="frequency" label="Frequency"
              options={FREQ_OPTS} value={form.frequency} onChange={handleChange} />
            <div className="span-full">
              <Input id="purpose" name="purpose" label="Intended Purpose"
                placeholder="e.g., Biomass energy / Compost manufacturing / Biochar"
                value={form.purpose} onChange={handleChange} />
            </div>
          </div>
          <div className="req-form-actions">
            <Button variant="primary" onClick={handleSubmit}>Publish Requirement</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Posted requirements */}
      <div>
        <h3 className="req-section-title">Active Feedstock Requirements</h3>
        <div className="req-posted-list">
          {requirements.map(r => (
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
              </div>
              <div className="req-posted-details">
                <div className="rpd-item"><span className="rpd-label">Min Qty</span><span className="rpd-val">{r.qty}</span></div>
                <div className="rpd-item"><span className="rpd-label">Buying Rate</span><span className="rpd-val rpd-budget">{r.budget}</span></div>
                <div className="rpd-item"><span className="rpd-label">Location</span><span className="rpd-val">{r.location}</span></div>
                <div className="rpd-item"><span className="rpd-label">Status</span><span className="rpd-val">{r.freq}</span></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
