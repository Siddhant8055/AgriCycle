import { Truck, CheckCircle, Clock, Package, AlertTriangle, MapPin, Calendar } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import './PickupsPage.css';

const DEMO_PICKUPS = [
  {
    id: 'PU-2026-001',
    crop: 'Paddy Straw', emoji: '🌾',
    buyer: 'Agro Compost Co.',
    qty: '8 tonnes', price: '₹900/t',
    pickupDate: 'Nov 8, 2026',
    location: 'Hatkanangale, Kolhapur',
    status: 'scheduled',
    timeline: [
      { label: 'Request Sent', done: true, time: 'Oct 25, 10:30 AM' },
      { label: 'Farmer Accepted', done: true, time: 'Oct 26, 2:15 PM' },
      { label: 'Pickup Scheduled', done: true, time: 'Oct 27, 11:00 AM' },
      { label: 'Pickup Complete', done: false, time: 'Nov 8, 2026 (pending)' },
      { label: 'Payment Released', done: false, time: '—' },
    ],
  },
  {
    id: 'PU-2026-002',
    crop: 'Wheat Straw', emoji: '🌱',
    buyer: 'BioChar India',
    qty: '5 tonnes', price: '₹650/t',
    pickupDate: 'Oct 20, 2026',
    location: 'Shirol, Kolhapur',
    status: 'completed',
    timeline: [
      { label: 'Request Sent', done: true, time: 'Oct 15, 9:00 AM' },
      { label: 'Farmer Accepted', done: true, time: 'Oct 15, 3:00 PM' },
      { label: 'Pickup Scheduled', done: true, time: 'Oct 16, 10:00 AM' },
      { label: 'Pickup Complete', done: true, time: 'Oct 20, 1:30 PM' },
      { label: 'Payment Released', done: true, time: 'Oct 21, 10:00 AM' },
    ],
  },
  {
    id: 'PU-2026-003',
    crop: 'Sugarcane Residue', emoji: '🎋',
    buyer: 'Biogas Plant Pvt.',
    qty: '8 tonnes', price: '₹1,100/t',
    pickupDate: 'TBD',
    location: 'Kolhapur District',
    status: 'pending',
    timeline: [
      { label: 'Request Sent', done: true, time: 'Nov 1, 4:00 PM' },
      { label: 'Farmer Accepted', done: true, time: 'Nov 2, 9:00 AM' },
      { label: 'Pickup Scheduled', done: false, time: 'Awaiting buyer confirmation' },
      { label: 'Pickup Complete', done: false, time: '—' },
      { label: 'Payment Released', done: false, time: '—' },
    ],
  },
];

export default function PickupsPage() {
  const scheduled = DEMO_PICKUPS.filter(p => p.status === 'scheduled').length;
  const completed = DEMO_PICKUPS.filter(p => p.status === 'completed').length;
  const pending = DEMO_PICKUPS.filter(p => p.status === 'pending').length;

  return (
    <AppShell pageTitle="Pickup Status">
      <div className="pickups-header">
        <div>
          <h2 className="pickups-title">Pickup Status</h2>
          <p className="pickups-sub">Track all scheduled and completed pickups for your listings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="pickups-stats">
        {[
          { label: 'Scheduled', value: scheduled, color: 'blue', Icon: Calendar },
          { label: 'Pending Date', value: pending, color: 'amber', Icon: Clock },
          { label: 'Completed', value: completed, color: 'success', Icon: CheckCircle },
          { label: 'Total', value: DEMO_PICKUPS.length, color: 'muted', Icon: Package },
        ].map(s => (
          <div key={s.label} className={`pickup-stat pu-stat-${s.color}`}>
            <s.Icon size={18} />
            <div>
              <p className="pu-stat-value">{s.value}</p>
              <p className="pu-stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Demo notice */}
      <div className="pickups-demo-notice">
        <AlertTriangle size={13} />
        <span><strong>Demo data</strong> — real pickup data will come from the backend API. Pickup is proposed only, not guaranteed until both parties confirm.</span>
      </div>

      {/* Pickup Cards */}
      <div className="pickups-list">
        {DEMO_PICKUPS.map(pickup => (
          <Card key={pickup.id} className="pickup-card animate-fadeIn">
            <div className="pickup-card-header">
              <div className="pickup-card-left">
                <span className="pickup-emoji">{pickup.emoji}</span>
                <div>
                  <div className="pickup-id-row">
                    <span className="pickup-id">{pickup.id}</span>
                    <StatusBadge status={pickup.status} />
                  </div>
                  <h3 className="pickup-crop">{pickup.crop}</h3>
                  <p className="pickup-buyer">via {pickup.buyer}</p>
                </div>
              </div>
              <div className="pickup-card-right">
                <div className="pickup-meta-item">
                  <Package size={12} />
                  <span>{pickup.qty} · {pickup.price}</span>
                </div>
                <div className="pickup-meta-item">
                  <MapPin size={12} />
                  <span>{pickup.location}</span>
                </div>
                <div className="pickup-meta-item">
                  <Calendar size={12} />
                  <span>Pickup: {pickup.pickupDate}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="pickup-timeline">
              {pickup.timeline.map((step, i) => (
                <div key={i} className="pickup-step">
                  <div className="pickup-step-indicator">
                    <div className={`pickup-step-dot ${step.done ? 'done' : ''}`}>
                      {step.done && <CheckCircle size={10} />}
                    </div>
                    {i < pickup.timeline.length - 1 && (
                      <div className={`pickup-step-line ${step.done ? 'done' : ''}`} />
                    )}
                  </div>
                  <div className="pickup-step-content">
                    <p className={`pickup-step-label ${step.done ? 'done' : ''}`}>{step.label}</p>
                    <p className="pickup-step-time">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {pickup.status !== 'completed' && (
              <div className="pickup-notice">
                <Truck size={13} />
                <span>Pickup date is proposed — confirm with the buyer to finalise logistics.</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
