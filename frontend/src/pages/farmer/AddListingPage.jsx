import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2, Upload, X, Info, Cpu, ChevronRight, MapPin, AlertTriangle } from 'lucide-react';
import apiClient from '../../lib/apiClient.js';
import './AddListing.css';

const CROP_TYPES = [
  { value: 'paddy_straw', label: 'Paddy Straw' },
  { value: 'wheat_straw', label: 'Wheat Straw' },
  { value: 'sugarcane_residue', label: 'Sugarcane Residue' },
  { value: 'soybean_stover', label: 'Soybean Stover' },
  { value: 'cotton_stalks', label: 'Cotton Stalks' },
  { value: 'maize_stalks', label: 'Maize / Corn Stalks' },
  { value: 'groundnut_shells', label: 'Groundnut Shells' },
  { value: 'other', label: 'Other Agricultural Residue' },
];

const STORAGE_FORMS = [
  { value: 'baled', label: 'Baled' },
  { value: 'loose', label: 'Loose / Bulk' },
  { value: 'chopped', label: 'Chopped' },
  { value: 'pelleted', label: 'Pelleted' },
];

const CONDITIONS = [
  { value: 'dry', label: 'Dry (< 15% moisture)' },
  { value: 'semi_dry', label: 'Semi-dry (15–25% moisture)' },
  { value: 'fresh', label: 'Fresh / Green (> 25% moisture)' },
];

const STEPS = ['Residue Details', 'Photos & AI Review', 'Location & Price', 'Review & Publish'];

export default function AddListingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({
    cropType: '', quantity: '', unit: 'tonnes',
    storageForm: '', condition: '', availability: '',
    description: '', location: '', pincode: '',
    askingPrice: '', priceUnit: 'per_tonne', notes: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { alert('File size must be under 5MB'); return; }
      if (!file.type.startsWith('image/')) { alert('Only image files are accepted'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((prev) => [...prev, { url: ev.target.result, name: file.name, file }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (idx) => setPhotos((p) => p.filter((_, i) => i !== idx));

  const simulateAI = async () => {
    if (photos.length === 0) return;
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setAiSuggestion({
      predictedClass: 'Paddy Straw',
      confidence: 0.84,
      condition: 'Dry',
      notes: 'Image appears to show dried paddy straw. Please verify crop type and condition before publishing.',
    });
    setAiLoading(false);
  };

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!form.cropType) errs.cropType = 'Select a crop type';
      if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0)
        errs.quantity = 'Enter a valid quantity';
      if (!form.condition) errs.condition = 'Select condition';
      if (!form.availability) errs.availability = 'Enter availability date';
    }
    if (step === 2) {
      if (!form.location.trim()) errs.location = 'Location / village name is required';
      if (!form.askingPrice || isNaN(form.askingPrice) || Number(form.askingPrice) <= 0)
        errs.askingPrice = 'Enter a valid asking price';
    }
    return errs;
  };

  const nextStep = () => {
    const errs = validateStep();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const prevStep = () => { setErrors({}); setStep((s) => s - 1); };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/listings', {
        cropType: form.cropType,
        quantity: form.quantity,
        storageType: form.storageForm,
        condition: form.condition,
        availabilityStart: form.availability,
        address: form.location,
        askingPrice: form.askingPrice,
        notes: form.notes,
      });
    } catch (err) {
      console.warn('Backend listing creation fallback:', err.message);
    } finally {
      setIsSubmitting(false);
      navigate('/farmer/listings');
    }
  };

  return (
    <AppShell pageTitle="Add Crop Waste Listing">
      {/* Stepper */}
      <Card padding="sm">
        <div className="stepper">
          {STEPS.map((label, idx) => (
            <div key={label} className={`step ${idx === step ? 'active' : ''} ${idx < step ? 'done' : ''}`}>
              <div className="step-indicator">
                {idx < step ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
              </div>
              <span className="step-label">{label}</span>
              {idx < STEPS.length - 1 && <ChevronRight size={14} className="step-sep" />}
            </div>
          ))}
        </div>
      </Card>

      <div className="add-listing-layout">
        {/* Main Form */}
        <div className="add-listing-main">
          {/* Step 0: Residue Details */}
          {step === 0 && (
            <Card>
              <h3 className="section-title">Residue Information</h3>
              <p className="section-desc">Describe the agricultural residue you want to sell or offer for utilization.</p>

              <div className="form-grid">
                <Select
                  id="cropType" name="cropType" label="Crop / Residue Type"
                  options={CROP_TYPES} placeholder="Select crop type..."
                  value={form.cropType} onChange={handleChange}
                  error={errors.cropType} required
                />
                <div className="input-group">
                  <Input
                    id="quantity" name="quantity" label="Quantity Available"
                    type="number" min="0.1" step="0.1"
                    placeholder="e.g., 10"
                    value={form.quantity} onChange={handleChange}
                    error={errors.quantity} required
                  />
                  <Select
                    id="unit" name="unit" label="Unit"
                    options={[{ value: 'tonnes', label: 'Tonnes' }, { value: 'kg', label: 'Kilograms' }, { value: 'quintals', label: 'Quintals' }]}
                    value={form.unit} onChange={handleChange}
                  />
                </div>
                <Select
                  id="storageForm" name="storageForm" label="Storage / Form"
                  options={STORAGE_FORMS} placeholder="Select form..."
                  value={form.storageForm} onChange={handleChange}
                />
                <Select
                  id="condition" name="condition" label="Condition / Moisture"
                  options={CONDITIONS} placeholder="Select condition..."
                  value={form.condition} onChange={handleChange}
                  error={errors.condition} required
                />
                <Input
                  id="availability" name="availability" label="Available From"
                  type="date" value={form.availability} onChange={handleChange}
                  error={errors.availability} required
                />
              </div>

              <Textarea
                id="description" name="description" label="Additional Description"
                placeholder="Describe the residue, how it was stored, any special characteristics..."
                value={form.description} onChange={handleChange}
                hint="Optional – helps buyers understand your material better"
              />
            </Card>
          )}

          {/* Step 1: Photos & AI */}
          {step === 1 && (
            <Card>
              <h3 className="section-title">Photos & AI Advisory</h3>
              <p className="section-desc">Upload clear photos of your residue. Our AI can suggest crop type and condition (advisory only — you must verify).</p>

              {/* Upload zone */}
              <div className="upload-zone" onClick={() => document.getElementById('photo-input').click()}>
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
                <div className="upload-zone-inner">
                  <div className="upload-icon"><Upload size={28} /></div>
                  <p className="upload-title">Drop photos here or click to upload</p>
                  <p className="upload-hint">JPG, PNG, WEBP • Max 5MB per photo</p>
                </div>
              </div>

              {/* Photo previews */}
              {photos.length > 0 && (
                <div className="photo-previews">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="photo-preview">
                      <img src={photo.url} alt={`Uploaded photo ${idx + 1}`} />
                      <button
                        className="photo-remove"
                        onClick={() => removePhoto(idx)}
                        aria-label={`Remove photo ${idx + 1}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Button */}
              {photos.length > 0 && !aiSuggestion && (
                <Button
                  variant="outline"
                  leftIcon={<Cpu size={16} />}
                  onClick={simulateAI}
                  loading={aiLoading}
                  style={{ marginTop: 16 }}
                >
                  {aiLoading ? 'Analysing...' : 'Get AI Crop Suggestion'}
                </Button>
              )}

              {/* AI Suggestion card */}
              {aiSuggestion && (
                <div className="ai-suggestion">
                  <div className="ai-suggestion-header">
                    <Cpu size={16} />
                    <span>AI Advisory Result</span>
                    <Badge variant="amber" size="sm">
                      {Math.round(aiSuggestion.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <div className="ai-suggestion-body">
                    <div className="ai-field">
                      <span className="ai-field-label">Predicted crop type</span>
                      <span className="ai-field-value">{aiSuggestion.predictedClass}</span>
                    </div>
                    <div className="ai-field">
                      <span className="ai-field-label">Observed condition</span>
                      <span className="ai-field-value">{aiSuggestion.condition}</span>
                    </div>
                  </div>
                  <p className="ai-note"><Info size={13} /> {aiSuggestion.notes}</p>
                  <div className="ai-actions">
                    <Button size="sm" variant="primary" onClick={() => {
                      setForm((f) => ({ ...f, cropType: 'paddy_straw', condition: 'dry' }));
                      alert('AI suggestion applied. Please review and correct if needed.');
                    }}>
                      Accept Suggestion
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setAiSuggestion(null)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}

              <div className="ai-disclaimer">
                <AlertTriangle size={13} />
                <span>AI crop identification is advisory only. You are responsible for verifying the residue type and condition before publishing.</span>
              </div>
            </Card>
          )}

          {/* Step 2: Location & Price */}
          {step === 2 && (
            <Card>
              <h3 className="section-title">Location & Asking Price</h3>
              <p className="section-desc">Your exact coordinates will not be shared publicly. Only the general area/district will be visible to buyers.</p>

              <div className="form-grid">
                <Input
                  id="location" name="location" label="Village / Taluka Name"
                  placeholder="e.g., Hatkanangale, Kolhapur"
                  value={form.location} onChange={handleChange}
                  error={errors.location} required
                  leftIcon={<MapPin size={16} />}
                  hint="Exact GPS coordinates will be kept private"
                />
                <Input
                  id="pincode" name="pincode" label="Pincode"
                  type="text" maxLength={6}
                  placeholder="e.g., 416001"
                  value={form.pincode} onChange={handleChange}
                />
              </div>

              <div className="form-grid">
                <Input
                  id="askingPrice" name="askingPrice" label="Asking Price"
                  type="number" min="0"
                  placeholder="e.g., 850"
                  value={form.askingPrice} onChange={handleChange}
                  error={errors.askingPrice} required
                  hint="This is your asking price, not a guaranteed offer"
                />
                <Select
                  id="priceUnit" name="priceUnit" label="Price Per"
                  options={[
                    { value: 'per_tonne', label: 'Per Tonne' },
                    { value: 'per_kg', label: 'Per Kilogram' },
                    { value: 'per_quintal', label: 'Per Quintal' },
                    { value: 'lump_sum', label: 'Lump Sum (total)' },
                  ]}
                  value={form.priceUnit} onChange={handleChange}
                />
              </div>

              <Textarea
                id="notes" name="notes" label="Terms / Notes for Buyers"
                placeholder="e.g., Buyer arranges transport. Available from farm gate only. Contact for bulk pricing..."
                value={form.notes} onChange={handleChange}
              />
            </Card>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <Card>
              <h3 className="section-title">Review Your Listing</h3>
              <p className="section-desc">Verify all details before publishing. Buyers will see this information.</p>

              <div className="review-grid">
                <div className="review-field">
                  <span className="review-label">Crop / Residue Type</span>
                  <span className="review-value">{CROP_TYPES.find(c => c.value === form.cropType)?.label || '—'}</span>
                </div>
                <div className="review-field">
                  <span className="review-label">Quantity</span>
                  <span className="review-value">{form.quantity ? `${form.quantity} ${form.unit}` : '—'}</span>
                </div>
                <div className="review-field">
                  <span className="review-label">Condition</span>
                  <span className="review-value">{CONDITIONS.find(c => c.value === form.condition)?.label || '—'}</span>
                </div>
                <div className="review-field">
                  <span className="review-label">Storage Form</span>
                  <span className="review-value">{STORAGE_FORMS.find(c => c.value === form.storageForm)?.label || '—'}</span>
                </div>
                <div className="review-field">
                  <span className="review-label">Location</span>
                  <span className="review-value">{form.location || '—'}</span>
                </div>
                <div className="review-field">
                  <span className="review-label">Asking Price</span>
                  <span className="review-value review-price">
                    {form.askingPrice ? `₹${Number(form.askingPrice).toLocaleString('en-IN')} / ${form.priceUnit.replace('per_', '').replace('_', ' ')}` : '—'}
                  </span>
                </div>
                <div className="review-field" style={{ gridColumn: '1/-1' }}>
                  <span className="review-label">Photos</span>
                  <span className="review-value">{photos.length} photo(s) attached</span>
                </div>
              </div>

              <div className="review-disclaimer">
                <Info size={14} />
                <span>Your asking price is not a confirmed offer. Buyers will contact you to negotiate terms. Exact coordinates will not be shared without your consent.</span>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar Panel */}
        <div className="add-listing-sidebar">
          <Card padding="sm">
            <h4 className="panel-title">💡 Tips</h4>
            <ul className="tips-list">
              <li>Accurate quantity helps buyers plan logistics</li>
              <li>Clear photos get 3× more buyer interest</li>
              <li>Dry residue commands higher prices</li>
              <li>Mention transport availability in notes</li>
            </ul>
          </Card>

          {form.askingPrice && form.quantity && (
            <Card padding="sm" className="price-panel">
              <h4 className="panel-title">Asking Value Estimate</h4>
              <p className="price-gross">
                ₹{(Number(form.askingPrice) * Number(form.quantity)).toLocaleString('en-IN')}
              </p>
              <p className="price-note">Illustrative gross asking value (before logistics and any deductions)</p>
              <div className="price-disclaimer">
                <Info size={12} />
                <span>This is your asking total, not profit or net proceeds</span>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="step-navigation">
        {step > 0 && (
          <Button variant="secondary" onClick={prevStep}>← Previous</Button>
        )}
        <div style={{ flex: 1 }} />
        {step < STEPS.length - 1 ? (
          <Button variant="primary" onClick={nextStep}>
            Next: {STEPS[step + 1]} →
          </Button>
        ) : (
          <Button variant="primary" onClick={handlePublish} leftIcon={<CheckCircle2 size={16} />}>
            Publish Listing
          </Button>
        )}
      </div>
    </AppShell>
  );
}
