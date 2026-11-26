import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle, XCircle, MessageSquare, AlertTriangle, Filter } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import './BuyerRequestsPage.css';

const DEMO_REQUESTS = [
  {
    id: 'REQ-001', crop: 'Paddy Straw', emoji: '🌾', listingId: '1',
    farmer: 'Rajesh Patil', qty: '8 tonnes', offeredPrice: '₹900/t',
    status: 'pending', sentTime: '2 hours ago',
    message: 'Need for composting facility.',
  },
  {
    id: 'REQ-002', crop: 'Wheat Straw', emoji: '🌱', listingId: '3',
    farmer: 'Sunita Kamble', qty: '10 tonnes', offeredPrice: '₹620/t',
    status: 'active', sentTime: '1 day ago',
    message: 'Animal feed supply for dairy farm.',
  },
  {
    id: 'REQ-003', crop: 'Maize Stalks', emoji: '🌽', listingId: '6',
    farmer: 'Anand Patil', qty: '15 tonnes', offeredPrice: '₹500/t',
    status: 'completed', sentTime: '1 week ago',
    message: 'Biogas plant requirement.',
  },
  {
    id: 'REQ-004', crop: 'Cotton Stalks', emoji: '🌸', listingId: '5',
    farmer: 'Vikas Desai', qty: '5 tonnes', offeredPrice: '₹550/t',
    status: 'declined', sentTime: '3 days ago',
    message: 'Compost use.',
  },
];

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Accepted' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
];

export default function BuyerRequestsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const filtered = statusFilter ? DEMO_REQUESTS.filter(r => r.status === statusFilter) : DEMO_REQUESTS;

  return (
    <AppShell pageTitle="My Requests">
      <div className="breq-header">
        <div>
          <h2 className="breq-title">My Requests</h2>
          <p className="breq-sub">Track all your sent requests to farmers</p>
        </div>
        <Link to="/buyer/marketplace">
          <Button variant="primary" size="sm">Browse Listings</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="breq-stats">
        {[
          { label: 'Total', value: DEMO_REQUESTS.length, color: '#0369a1' },
          { label: 'Pending', value: DEMO_REQUESTS.filter(r => r.status === 'pending').length, color: '#d97706' },
          { label: 'Accepted', value: DEMO_REQUESTS.filter(r => r.status === 'active').length, color: '#047857' },
          { label: 'Completed', value: DEMO_REQUESTS.filter(r => r.status === 'completed').length, color: '#15803d' },
        ].map(s => (
          <div key={s.label} className="breq-stat-card" style={{ '--stat-color': s.color }}>
            <p className="breq-stat-value">{s.value}</p>
            <p className="breq-stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="breq-demo-notice">
        <AlertTriangle size={13} />
        <span><strong>Demo data</strong> — real requests require backend connection.</span>
      </div>

      {/* Filter */}
      <Card padding="sm">
        <div className="breq-filter-row">
          <Filter size={14} style={{ color: 'var(--agri-muted)' }} />
          <Select id="breqStatus" options={STATUS_OPTS} value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)} style={{ maxWidth: 200 }} />
          <span className="breq-count">{filtered.length} request{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </Card>

      {/* List */}
      <div className="breq-list">
        {filtered.map(req => (
          <Card key={req.id} className="breq-card animate-fadeIn">
            <div className="breq-card-top">
              <div className="breq-card-left">
                <span className="breq-emoji">{req.emoji}</span>
                <div>
                  <div className="breq-id-row">
                    <span className="breq-id">{req.id}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <h3 className="breq-crop">{req.crop}</h3>
                  <p className="breq-farmer">from {req.farmer} · {req.sentTime}</p>
                </div>
              </div>
              <Link to={`/buyer/listings/${req.listingId}`}>
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={13} />}>View</Button>
              </Link>
            </div>

            <div className="breq-details">
              <div className="breq-det-item">
                <span className="breq-det-label">Quantity</span>
                <span className="breq-det-value">{req.qty}</span>
              </div>
              <div className="breq-det-item">
                <span className="breq-det-label">Your Offer</span>
                <span className="breq-det-value breq-offer">{req.offeredPrice}</span>
              </div>
            </div>

            {req.message && (
              <div className="breq-message">
                <MessageSquare size={12} />
                <span>"{req.message}"</span>
              </div>
            )}

            <div className="breq-status-footer">
              {req.status === 'pending' && (
                <span className="breq-status-note pending"><Clock size={12} /> Awaiting farmer's response</span>
              )}
              {req.status === 'active' && (
                <span className="breq-status-note accepted"><CheckCircle size={12} /> Farmer accepted — contact info shared</span>
              )}
              {req.status === 'completed' && (
                <span className="breq-status-note completed"><CheckCircle size={12} /> Transaction completed</span>
              )}
              {req.status === 'declined' && (
                <span className="breq-status-note declined"><XCircle size={12} /> Farmer declined this request</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
