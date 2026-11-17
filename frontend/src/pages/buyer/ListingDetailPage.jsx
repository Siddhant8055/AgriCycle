import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Scale, Package,
  CheckCircle, AlertTriangle, Info, Send, X
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { Input, Textarea } from '../../components/ui/Input';
import './BuyerListingDetail.css';

const DEMO_LISTINGS = {
  '1': {
    id: '1', crop: 'Paddy Straw', emoji: '🌾',
    qty: '12 tonnes', condition: 'Dry (<15% moisture)',
    storageForm: 'Baled', price: '₹850', priceUnit: 'per tonne',
    location: 'Hatkanangale, Kolhapur', distance: '18 km',
    status: 'active', postedDays: 2,
    farmer: 'Rajesh Patil', farmerInitial: 'R',
    uses: ['Compost', 'Animal Feed', 'Biochar'],
    description: 'Well-dried paddy straw, stored under shade after kharif harvest. Baled for easy loading.',
    notes: 'Buyer arranges transport. Available from farm gate only.',
    availableFrom: 'Nov 01, 2026',
  },
  '2': {
    id: '2', crop: 'Sugarcane Residue', emoji: '🎋',
    qty: '8 tonnes', condition: 'Semi-dry',
    storageForm: 'Loose', price: '₹1,200', priceUnit: 'per tonne',
    location: 'Miraj, Sangli', distance: '32 km',
    status: 'active', postedDays: 5,
    farmer: 'Mahadev Shinde', farmerInitial: 'M',
    uses: ['Biogas', 'Compost', 'Paper Pulp'],
    description: 'Sugarcane tops and leaves after post-harvest processing.',
    notes: 'Negotiable for bulk orders.',
    availableFrom: 'Oct 30, 2026',
  },
};

export default function BuyerListingDetailPage() {
  const { id } = useParams();
  const listing = DEMO_LISTINGS[id] || DEMO_LISTINGS['1'];

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [form, setForm] = useState({ qty: '', message: '', offerPrice: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.qty || isNaN(form.qty) || Number(form.qty) <= 0) errs.qty = 'Enter a valid quantity';
    return errs;
  };

  const handleSend = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setRequestSent(true);
    setShowRequestForm(false);
    alert('Request sent! In production: POST /api/v1/requests');
  };

  const totalAsk = Number(listing.price.replace('₹', '').replace(',', '')) *
    parseInt(listing.qty);

  return (
    <AppShell pageTitle="Listing Details">
      {/* Back */}
      <div className="bld-topbar">
        <Link to="/buyer/marketplace">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>Back to Marketplace</Button>
        </Link>
        <div className="bld-topbar-right">
          <span className="bld-posted">Posted {listing.postedDays}d ago</span>
          <StatusBadge status={listing.status} />
        </div>
      </div>

      {/* Request sent banner */}
      {requestSent && (
        <div className="bld-success-banner animate-fadeIn">
          <CheckCircle size={16} />
          <div>
            <p><strong>Request sent successfully!</strong></p>
            <p>The farmer will be notified. Contact details will be shared once they accept.</p>
          </div>
          <button onClick={() => setRequestSent(false)} className="bld-banner-close"><X size={14} /></button>
        </div>
      )}

      <div className="bld-layout">
        {/* Main */}
        <div className="bld-main">
          <Card>
            <div className="bld-hero">
              <div className="bld-emoji">{listing.emoji}</div>
              <div className="bld-hero-info">
                <h2 className="bld-crop-title">{listing.crop}</h2>
                <p className="bld-farmer">by {listing.farmer}</p>
                <div className="bld-tags">
                  {listing.uses.map(u => <Badge key={u} variant="primary" size="sm">{u}</Badge>)}
                </div>
              </div>
            </div>

            <div className="bld-info-grid">
              <div className="bld-info-item">
                <Scale size={14} className="bld-info-icon" />
                <div>
                  <p className="bld-info-label">Quantity</p>
                  <p className="bld-info-value">{listing.qty}</p>
                </div>
              </div>
              <div className="bld-info-item">
                <Package size={14} className="bld-info-icon" />
                <div>
                  <p className="bld-info-label">Form · Condition</p>
                  <p className="bld-info-value">{listing.storageForm} · {listing.condition}</p>
                </div>
              </div>
              <div className="bld-info-item">
                <MapPin size={14} className="bld-info-icon" />
                <div>
                  <p className="bld-info-label">Location</p>
                  <p className="bld-info-value">{listing.location} · <span className="bld-distance">{listing.distance}</span></p>
                </div>
              </div>
              <div className="bld-info-item">
                <CheckCircle size={14} className="bld-info-icon" />
                <div>
                  <p className="bld-info-label">Available From</p>
                  <p className="bld-info-value">{listing.availableFrom}</p>
                </div>
              </div>
            </div>

            {listing.description && (
              <div className="bld-section">
                <p className="bld-section-label">Description</p>
                <p className="bld-section-text">{listing.description}</p>
              </div>
            )}
            {listing.notes && (
              <div className="bld-section">
                <p className="bld-section-label">Farmer's Terms</p>
                <p className="bld-section-text">{listing.notes}</p>
              </div>
            )}
          </Card>

          {/* Farmer Info */}
          <Card>
            <CardHeader title="About the Farmer" />
            <div className="bld-farmer-card">
              <div className="bld-farmer-avatar">{listing.farmerInitial}</div>
              <div>
                <p className="bld-farmer-name">{listing.farmer}</p>
                <p className="bld-farmer-loc"><MapPin size={12} /> {listing.location}</p>
                <p className="bld-contact-note">
                  <Info size={12} /> Contact details shared only after farmer accepts your request.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="bld-sidebar">
          {/* Price card */}
          <Card className="bld-price-card">
            <p className="bld-price-label">Asking Price</p>
            <p className="bld-price-value">{listing.price}</p>
            <p className="bld-price-unit">{listing.priceUnit}</p>
            <div className="bld-price-total-row">
              <span>Asking total</span>
              <span className="bld-price-total">₹{totalAsk.toLocaleString('en-IN')}</span>
            </div>
            <p className="bld-price-disclaimer"><AlertTriangle size={11} /> Asking price only. Negotiation via request.</p>
            {!requestSent ? (
              <Button
                variant="primary"
                style={{ width: '100%', marginTop: 12 }}
                leftIcon={<Send size={15} />}
                onClick={() => setShowRequestForm(v => !v)}
              >
                {showRequestForm ? 'Cancel Request' : 'Send Request'}
              </Button>
            ) : (
              <div className="bld-sent-badge">
                <CheckCircle size={14} /> Request Sent
              </div>
            )}
          </Card>

          {/* Request Form */}
          {showRequestForm && !requestSent && (
            <Card className="animate-fadeIn">
              <h4 className="bld-form-title">Your Request Details</h4>
              <Input
                id="reqQty" name="qty" label="Quantity Needed (tonnes)"
                type="number" min="0.1" step="0.1"
                placeholder="e.g., 8"
                value={form.qty} onChange={handleChange}
                error={errors.qty} required
              />
              <Input
                id="reqOffer" name="offerPrice" label="Your Offer Price (₹/t, optional)"
                type="number" min="0"
                placeholder={`Farmer asks ${listing.price}`}
                value={form.offerPrice} onChange={handleChange}
                hint="Leave blank to accept asking price"
              />
              <Textarea
                id="reqMsg" name="message" label="Message to Farmer (optional)"
                placeholder="Introduce yourself, mention intended use…"
                value={form.message} onChange={handleChange}
              />
              <Button variant="primary" style={{ width: '100%' }} leftIcon={<Send size={14} />}
                onClick={handleSend}>
                Send Request
              </Button>
            </Card>
          )}

          <Card padding="sm">
            <h4 className="bld-form-title">📍 Distance</h4>
            <p className="bld-distance-val">{listing.distance}</p>
            <p className="bld-distance-note">Straight-line estimate. Actual road distance may differ.</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
