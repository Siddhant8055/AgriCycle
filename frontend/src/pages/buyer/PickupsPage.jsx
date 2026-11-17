import { CheckCircle, Calendar, Truck, AlertTriangle, Package, MapPin } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import './BuyerPickupsPage.css';

const DEMO_PICKUPS = [
  {
    id: 'PU-B-001', crop: 'Paddy Straw', emoji: '🌾',
    farmer: 'Rajesh Patil', qty: '8 tonnes', totalValue: '₹7,200',
    pickupDate: 'Nov 8, 2026', location: 'Hatkanangale, Kolhapur',
    status: 'scheduled',
    timeline: [
      { label: 'Request Sent', done: true, time: 'Oct 25, 10:30 AM' },
      { label: 'Farmer Accepted', done: true, time: 'Oct 26, 2:15 PM' },
      { label: 'Pickup Scheduled', done: true, time: 'Oct 27, 11:00 AM' },
      { label: 'Pickup Complete', done: false, time: 'Nov 8, 2026' },
      { label: 'Payment Confirmed', done: false, time: '—' },
    ],
  },
  {
    id: 'PU-B-002', crop: 'Wheat Straw', emoji: '🌱',
    farmer: 'Sunita Kamble', qty: '10 tonnes', totalValue: '₹6,200',
    pickupDate: 'Oct 20, 2026', location: 'Shirol, Kolhapur',
    status: 'completed',
    timeline: [
      { label: 'Request Sent', done: true, time: 'Oct 15' },
      { label: 'Farmer Accepted', done: true, time: 'Oct 15' },
      { label: 'Pickup Scheduled', done: true, time: 'Oct 16' },
      { label: 'Pickup Complete', done: true, time: 'Oct 20' },
      { label: 'Payment Confirmed', done: true, time: 'Oct 21' },
    ],
  },
];

export default function BuyerPickupsPage() {
  return (
    <AppShell pageTitle="Pickup Status">
      <div className="bpu-header">
        <div>
          <h2 className="bpu-title">Pickup Status</h2>
          <p className="bpu-sub">Track pickups for your accepted requests</p>
        </div>
      </div>

      <div className="bpu-stats">
        {[
          { label: 'Scheduled', value: DEMO_PICKUPS.filter(p => p.status === 'scheduled').length, Icon: Calendar, color: 'blue' },
          { label: 'Completed', value: DEMO_PICKUPS.filter(p => p.status === 'completed').length, Icon: CheckCircle, color: 'success' },
          { label: 'Total', value: DEMO_PICKUPS.length, Icon: Package, color: 'muted' },
        ].map(s => (
          <div key={s.label} className={`bpu-stat bpu-${s.color}`}>
            <s.Icon size={18} />
            <div>
              <p className="bpu-stat-val">{s.value}</p>
              <p className="bpu-stat-lbl">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bpu-demo">
        <AlertTriangle size={13} />
        <span><strong>Demo data.</strong> Pickup is proposed, not guaranteed until both parties confirm.</span>
      </div>

      <div className="bpu-list">
        {DEMO_PICKUPS.map(pu => (
          <Card key={pu.id} className="bpu-card animate-fadeIn">
            <div className="bpu-card-header">
              <div className="bpu-card-left">
                <span className="bpu-emoji">{pu.emoji}</span>
                <div>
                  <div className="bpu-id-row">
                    <span className="bpu-id">{pu.id}</span>
                    <StatusBadge status={pu.status} />
                  </div>
                  <h3 className="bpu-crop">{pu.crop}</h3>
                  <p className="bpu-farmer">from {pu.farmer}</p>
                </div>
              </div>
              <div className="bpu-meta">
                <div className="bpu-meta-item"><Package size={12} /><span>{pu.qty} · {pu.totalValue}</span></div>
                <div className="bpu-meta-item"><MapPin size={12} /><span>{pu.location}</span></div>
                <div className="bpu-meta-item"><Calendar size={12} /><span>Pickup: {pu.pickupDate}</span></div>
              </div>
            </div>
            <div className="bpu-timeline">
              {pu.timeline.map((step, i) => (
                <div key={i} className="bpu-step">
                  <div className="bpu-step-col">
                    <div className={`bpu-dot ${step.done ? 'done' : ''}`}>
                      {step.done && <CheckCircle size={10} />}
                    </div>
                    {i < pu.timeline.length - 1 && <div className={`bpu-line ${step.done ? 'done' : ''}`} />}
                  </div>
                  <div className="bpu-step-info">
                    <p className={`bpu-step-label ${step.done ? 'done' : ''}`}>{step.label}</p>
                    <p className="bpu-step-time">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
            {pu.status !== 'completed' && (
              <div className="bpu-notice"><Truck size={13} /><span>Coordinate pickup details with the farmer directly after acceptance.</span></div>
            )}
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
