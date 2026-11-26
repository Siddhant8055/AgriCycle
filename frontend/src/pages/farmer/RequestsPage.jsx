import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle, XCircle, Clock, ArrowRight,
  Filter, AlertTriangle, MessageSquare, Package, Check
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import apiClient from '../../lib/apiClient.js';
import './RequestsPage.css';

const DEMO_REQUESTS = [
  {
    id: 'r1', buyer: 'Agro Compost Co.', buyerInitial: 'A',
    crop: 'Paddy Straw', listingId: '1',
    offer: '₹900/t', qty: '8 tonnes', status: 'pending',
    time: '2 hours ago', message: 'Interested in bulk purchase. Can arrange transport.',
  },
  {
    id: 'r2', buyer: 'Green Energy Ltd.', buyerInitial: 'G',
    crop: 'Paddy Straw', listingId: '1',
    offer: '₹850/t', qty: '12 tonnes', status: 'active',
    time: '1 day ago', message: 'Need full quantity for biogas plant. Regular orders possible.',
  },
  {
    id: 'r3', buyer: 'BioChar India', buyerInitial: 'B',
    crop: 'Wheat Straw', listingId: '3',
    offer: '₹650/t', qty: '5 tonnes', status: 'completed',
    time: '3 days ago', message: 'Payment done, pickup scheduled for Nov 5.',
  },
  {
    id: 'r4', buyer: 'Biogas Plant Pvt.', buyerInitial: 'B',
    crop: 'Sugarcane Residue', listingId: '2',
    offer: '₹1,100/t', qty: '8 tonnes', status: 'pending',
    time: '5 hours ago', message: 'Looking for regular supply. Willing to sign MOA.',
  },
  {
    id: 'r5', buyer: 'FarmFresh Compost', buyerInitial: 'F',
    crop: 'Cotton Stalks', listingId: '5',
    offer: '₹500/t', qty: '5 tonnes', status: 'declined',
    time: '2 days ago', message: 'Need dry material only.',
  },
];

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Accepted' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
];

const SUMMARY = [
  { label: 'Total Requests', value: 5, icon: MessageSquare, color: 'blue' },
  { label: 'Pending Action', value: 2, icon: Clock, color: 'amber' },
  { label: 'Accepted', value: 1, icon: CheckCircle, color: 'green' },
  { label: 'Completed', value: 1, icon: Package, color: 'success' },
];

export default function RequestsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [acceptedIds, setAcceptedIds] = useState([]);
  const [declinedIds, setDeclinedIds] = useState([]);
  const [requests, setRequests] = useState(DEMO_REQUESTS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadOffers() {
      try {
        const res = await apiClient.get('/offers');
        if (isMounted && res.data?.success && res.data?.data?.length > 0) {
          setRequests(res.data.data);
          setIsLive(true);
        }
      } catch (err) {
        console.warn('Offers fallback loaded:', err.message);
      }
    }
    loadOffers();
    return () => { isMounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!statusFilter) return requests;
    return requests.filter(r => r.status === statusFilter);
  }, [requests, statusFilter]);

  const accept = async (id) => {
    setAcceptedIds(prev => [...prev, id]);
    try {
      await apiClient.patch(`/offers/${id}/status`, { status: 'ACCEPTED' });
    } catch (err) {
      console.warn('Accept fallback:', err.message);
    }
  };

  const decline = async (id) => {
    setDeclinedIds(prev => [...prev, id]);
    try {
      await apiClient.patch(`/offers/${id}/status`, { status: 'REJECTED' });
    } catch (err) {
      console.warn('Decline fallback:', err.message);
    }
  };

  return (
    <AppShell pageTitle="Buyer Requests">
      {/* Header */}
      <div className="requests-header">
        <div>
          <h2 className="requests-title">Buyer Requests</h2>
          <p className="requests-sub">Manage incoming offers from buyers on your listings</p>
        </div>
      </div>

      {/* Summary */}
      <div className="requests-summary">
        {SUMMARY.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`req-sum-card req-sum-${s.color}`}>
              <Icon size={18} />
              <div>
                <p className="req-sum-value">{s.value}</p>
                <p className="req-sum-label">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo notice */}
      <div className="requests-demo-notice">
        <AlertTriangle size={13} />
        <span><strong>Demo data</strong> — connect backend for real requests.</span>
      </div>

      {/* Filter */}
      <Card padding="sm">
        <div className="requests-filter-row">
          <Filter size={14} style={{ color: 'var(--agri-muted)' }} />
          <Select
            id="reqStatusFilter"
            options={STATUS_OPTS}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ maxWidth: 200 }}
          />
          <p className="requests-count-text">
            {filtered.length} request{filtered.length !== 1 ? 's' : ''}
            {statusFilter ? ' (filtered)' : ''}
          </p>
        </div>
      </Card>

      {/* Requests List */}
      <div className="requests-list-wrap">
        {filtered.length === 0 ? (
          <Card padding="lg">
            <div className="requests-empty">
              <MessageSquare size={36} />
              <h3>No requests found</h3>
              <p>Try a different filter.</p>
            </div>
          </Card>
        ) : (
          filtered.map(req => {
            const isAccepted = acceptedIds.includes(req.id);
            const isDeclined = declinedIds.includes(req.id);
            const effectiveStatus = isAccepted ? 'active' : isDeclined ? 'declined' : req.status;

            return (
              <Card key={req.id} className="req-card animate-fadeIn">
                <div className="req-card-top">
                  <div className="req-card-buyer">
                    <div className="req-card-avatar">{req.buyerInitial}</div>
                    <div>
                      <p className="req-card-buyer-name">{req.buyer}</p>
                      <p className="req-card-time">{req.time}</p>
                    </div>
                  </div>
                  <StatusBadge status={effectiveStatus} />
                </div>

                <div className="req-card-details">
                  <div className="req-card-detail-item">
                    <span className="req-card-label">Crop</span>
                    <span className="req-card-value">{req.crop}</span>
                  </div>
                  <div className="req-card-detail-item">
                    <span className="req-card-label">Quantity</span>
                    <span className="req-card-value">{req.qty}</span>
                  </div>
                  <div className="req-card-detail-item">
                    <span className="req-card-label">Offered Price</span>
                    <span className="req-card-value req-offer-highlight">{req.offer}</span>
                  </div>
                </div>

                {req.message && (
                  <div className="req-card-message">
                    <MessageSquare size={12} />
                    <span>"{req.message}"</span>
                  </div>
                )}

                <div className="req-card-footer">
                  <Link to={`/farmer/listings/${req.listingId}`}>
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={13} />}>
                      View Listing
                    </Button>
                  </Link>
                  {(req.status === 'pending' && !isAccepted && !isDeclined) && (
                    <div className="req-card-actions">
                      <Button variant="primary" size="sm" leftIcon={<CheckCircle size={13} />}
                        onClick={() => accept(req.id)}>
                        Accept
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<XCircle size={13} />}
                        onClick={() => decline(req.id)}>
                        Decline
                      </Button>
                    </div>
                  )}
                  {(isAccepted || req.status === 'active') && (
                    <span className="req-status-text success">✓ Accepted — contact info shared</span>
                  )}
                  {(isDeclined || req.status === 'declined') && (
                    <span className="req-status-text declined">✕ Declined</span>
                  )}
                  {req.status === 'completed' && (
                    <span className="req-status-text completed">✓ Completed</span>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
