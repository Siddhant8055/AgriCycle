import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, BarChart3, MapPin, Scale, Package,
  CheckCircle, Clock, XCircle, AlertTriangle, MessageSquare,
  ChevronDown, ChevronUp, Phone
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import './ListingDetailPage.css';

// Demo data keyed by listing ID
const DEMO_LISTINGS = {
  '1': {
    id: '1', crop: 'Paddy Straw', emoji: '🌾',
    qty: '12 tonnes', unit: 'tonnes', condition: 'Dry (<15% moisture)',
    storageForm: 'Baled', price: '₹850', priceUnit: 'per tonne',
    location: 'Hatkanangale, Kolhapur', pincode: '416115',
    status: 'active', postedDate: 'Oct 25, 2026', availableFrom: 'Nov 01, 2026',
    description: 'Well-dried paddy straw, stored under shade. Collected after kharif harvest.',
    notes: 'Buyer arranges transport. Available from farm gate.',
    photos: 1,
  },
  '2': {
    id: '2', crop: 'Sugarcane Residue', emoji: '🎋',
    qty: '8 tonnes', unit: 'tonnes', condition: 'Semi-dry',
    storageForm: 'Loose', price: '₹1,200', priceUnit: 'per tonne',
    location: 'Kolhapur District', pincode: '416001',
    status: 'pending', postedDate: 'Oct 22, 2026', availableFrom: 'Oct 30, 2026',
    description: 'Sugarcane tops and leaves after harvest.',
    notes: 'Negotiable for bulk orders.',
    photos: 0,
  },
};

const DEMO_REQUESTS = {
  '1': [
    { id: 'r1', buyer: 'Agro Compost Co.', offer: '₹900/t', qty: '8 t', status: 'pending', time: '2 hours ago', phone: '+91 98765 43210' },
    { id: 'r2', buyer: 'Green Energy Ltd.', offer: '₹850/t', qty: '12 t', status: 'active', time: '1 day ago', phone: '+91 91234 56789' },
    { id: 'r3', buyer: 'BioChar India', offer: '₹800/t', qty: '5 t', status: 'completed', time: '3 days ago', phone: '+91 87654 32109' },
  ],
  '2': [
    { id: 'r4', buyer: 'Biogas Plant Pvt.', offer: '₹1,100/t', qty: '8 t', status: 'pending', time: '5 hours ago', phone: '+91 99887 76655' },
  ],
};

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedReq, setExpandedReq] = useState(null);

  const listing = DEMO_LISTINGS[id] || DEMO_LISTINGS['1'];
  const requests = DEMO_REQUESTS[id] || [];

  const handleDelete = () => {
    alert('In production: DELETE /api/v1/listings/' + id);
    navigate('/farmer/listings');
  };

  return (
    <AppShell pageTitle="Listing Details">
      {/* Back + Actions */}
      <div className="detail-topbar">
        <Link to="/farmer/listings">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>Back to Listings</Button>
        </Link>
        <div className="detail-topbar-actions">
          <Link to={`/farmer/listings/${id}/recommendations`}>
            <Button variant="outline" size="sm" leftIcon={<BarChart3 size={14} />}>Compare Pathways</Button>
          </Link>
          <Button variant="secondary" size="sm" leftIcon={<Edit2 size={14} />}
            onClick={() => alert('Edit form — connect to PUT /api/v1/listings/' + id)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />}
            onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="delete-confirm animate-fadeIn">
          <AlertTriangle size={16} />
          <span>Are you sure you want to delete this listing? This cannot be undone.</span>
          <div className="delete-confirm-btns">
            <Button variant="danger" size="sm" onClick={handleDelete}>Yes, Delete</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="detail-layout">
        {/* Main Info */}
        <div className="detail-main">
          <Card>
            <div className="detail-header">
              <div className="detail-emoji">{listing.emoji}</div>
              <div className="detail-title-group">
                <div className="detail-title-row">
                  <h2 className="detail-crop-title">{listing.crop}</h2>
                  <StatusBadge status={listing.status} />
                </div>
                <p className="detail-posted">Listed on {listing.postedDate}</p>
              </div>
            </div>

            <div className="detail-info-grid">
              <div className="detail-info-item">
                <Scale size={14} className="detail-info-icon" />
                <div>
                  <p className="detail-info-label">Quantity</p>
                  <p className="detail-info-value">{listing.qty}</p>
                </div>
              </div>
              <div className="detail-info-item">
                <Package size={14} className="detail-info-icon" />
                <div>
                  <p className="detail-info-label">Storage Form</p>
                  <p className="detail-info-value">{listing.storageForm}</p>
                </div>
              </div>
              <div className="detail-info-item">
                <CheckCircle size={14} className="detail-info-icon" />
                <div>
                  <p className="detail-info-label">Condition</p>
                  <p className="detail-info-value">{listing.condition}</p>
                </div>
              </div>
              <div className="detail-info-item">
                <Clock size={14} className="detail-info-icon" />
                <div>
                  <p className="detail-info-label">Available From</p>
                  <p className="detail-info-value">{listing.availableFrom}</p>
                </div>
              </div>
              <div className="detail-info-item">
                <MapPin size={14} className="detail-info-icon" />
                <div>
                  <p className="detail-info-label">Location</p>
                  <p className="detail-info-value">{listing.location} · {listing.pincode}</p>
                </div>
              </div>
            </div>

            {listing.description && (
              <div className="detail-desc">
                <p className="detail-desc-label">Description</p>
                <p className="detail-desc-text">{listing.description}</p>
              </div>
            )}
            {listing.notes && (
              <div className="detail-desc">
                <p className="detail-desc-label">Terms / Notes for Buyers</p>
                <p className="detail-desc-text">{listing.notes}</p>
              </div>
            )}
          </Card>

          {/* Buyer Requests */}
          <Card>
            <CardHeader
              title="Buyer Requests"
              subtitle={`${requests.length} request${requests.length !== 1 ? 's' : ''} on this listing`}
            />
            {requests.length === 0 ? (
              <div className="no-requests">
                <MessageSquare size={32} />
                <p>No buyer requests yet.</p>
                <p className="no-requests-sub">Share your listing to attract buyers.</p>
              </div>
            ) : (
              <div className="req-list">
                {requests.map(req => (
                  <div key={req.id} className="req-item animate-fadeIn">
                    <div className="req-item-top">
                      <div className="req-buyer-info">
                        <div className="req-avatar">{req.buyer.charAt(0)}</div>
                        <div>
                          <p className="req-buyer-name">{req.buyer}</p>
                          <p className="req-time">{req.time}</p>
                        </div>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="req-offer-row">
                      <span className="req-offer-label">Offer: <strong className="req-offer-price">{req.offer}</strong></span>
                      <span className="req-qty">Qty: {req.qty}</span>
                    </div>
                    {req.status === 'pending' && (
                      <div className="req-actions">
                        <Button variant="primary" size="sm" leftIcon={<CheckCircle size={13} />}
                          onClick={() => alert('Accepted! In production: PATCH /api/v1/requests/' + req.id)}>
                          Accept
                        </Button>
                        <Button variant="ghost" size="sm" leftIcon={<XCircle size={13} />}
                          onClick={() => alert('Declined')}>
                          Decline
                        </Button>
                        <button className="req-expand" onClick={() => setExpandedReq(expandedReq === req.id ? null : req.id)}>
                          <Phone size={13} /> Contact
                          {expandedReq === req.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    )}
                    {expandedReq === req.id && (
                      <div className="req-contact animate-fadeIn">
                        <p>Contact shared after accepting: <strong>{req.phone}</strong></p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          <Card className="price-highlight-card">
            <p className="price-highlight-label">Asking Price</p>
            <p className="price-highlight-value">{listing.price}</p>
            <p className="price-highlight-unit">{listing.priceUnit}</p>
            <div className="price-total-row">
              <span>Gross asking total</span>
              <span className="price-total">
                ₹{(parseInt(listing.price.replace('₹', '').replace(',', '')) *
                  parseInt(listing.qty)).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="price-disclaimer">Illustrative — not confirmed net proceeds</p>
          </Card>

          <Card padding="sm">
            <h4 className="sidebar-panel-title">📊 Interest</h4>
            <div className="interest-stats">
              <div className="interest-item">
                <span className="interest-num">{requests.length}</span>
                <span className="interest-label">Total Requests</span>
              </div>
              <div className="interest-item">
                <span className="interest-num">{requests.filter(r => r.status === 'pending').length}</span>
                <span className="interest-label">Pending</span>
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <h4 className="sidebar-panel-title">🖼️ Photos</h4>
            <p className="photos-count">{listing.photos} photo{listing.photos !== 1 ? 's' : ''} attached</p>
            {listing.photos === 0 && (
              <p className="photos-hint">Adding photos can increase buyer interest by 3×</p>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
