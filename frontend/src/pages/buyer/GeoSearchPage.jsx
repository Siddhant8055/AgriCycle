import { useState } from 'react';
import { MapPin, Filter, List, Map, Phone, ArrowRight, Info, Truck } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import './GeoSearchPage.css';

const NEARBY_LISTINGS = [
  {
    id: 'g1', crop: 'Paddy Straw', emoji: '🌾',
    farmer: 'Rajesh Patil', distance: '18 km', qty: '12 t',
    price: '₹850/t', status: 'active',
    lat: 16.68, lng: 74.24, village: 'Hatkanangale'
  },
  {
    id: 'g2', crop: 'Wheat Straw', emoji: '🌱',
    farmer: 'Sunita Kamble', distance: '25 km', qty: '15 t',
    price: '₹600/t', status: 'active',
    lat: 16.70, lng: 74.30, village: 'Shirol'
  },
  {
    id: 'g3', crop: 'Maize Stalks', emoji: '🌽',
    farmer: 'Anand Patil', distance: '22 km', qty: '20 t',
    price: '₹500/t', status: 'active',
    lat: 16.65, lng: 74.46, village: 'Ichalkaranji'
  },
  {
    id: 'g4', crop: 'Sugarcane Residue', emoji: '🎋',
    farmer: 'Mahadev Shinde', distance: '32 km', qty: '8 t',
    price: '₹1,200/t', status: 'active',
    lat: 16.84, lng: 74.64, village: 'Miraj'
  },
  {
    id: 'g5', crop: 'Soybean Stover', emoji: '🌿',
    farmer: 'Prashant Mane', distance: '42 km', qty: '6 t',
    price: '₹750/t', status: 'active',
    lat: 16.57, lng: 74.29, village: 'Kagal'
  },
];

const REQUEST_TIMELINE = [
  { status: 'Request Sent', done: true, time: 'Oct 25, 10:30 AM' },
  { status: 'Farmer Notified', done: true, time: 'Oct 25, 10:32 AM' },
  { status: 'Farmer Response', done: true, time: 'Oct 26, 2:15 PM' },
  { status: 'Pickup Scheduled', done: false, time: 'Awaiting confirmation' },
  { status: 'Pickup Complete', done: false, time: '—' },
];

export default function GeoSearchPage() {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [radius, setRadius] = useState('50');
  const [cropFilter, setCropFilter] = useState('');
  const [selected, setSelected] = useState(null);

  return (
    <AppShell pageTitle="Geo Search">
      {/* Header */}
      <div className="geo-header">
        <div>
          <h2 className="geo-title">Find Nearby Residue Listings</h2>
          <p className="geo-sub">Search by location and radius to discover compatible listings.</p>
        </div>
        <div className="geo-view-toggle">
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} /> List
          </button>
          <button
            className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <Map size={16} /> Map
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="geo-filters">
          <Input
            id="geo-location"
            label="Your Location"
            placeholder="e.g., Sangli, Maharashtra"
            defaultValue="Sangli, Maharashtra"
            leftIcon={<MapPin size={16} />}
            className="geo-filter-input"
          />
          <Select
            id="geo-radius"
            label="Radius"
            options={[
              { value: '25', label: '25 km' },
              { value: '50', label: '50 km' },
              { value: '75', label: '75 km' },
              { value: '100', label: '100 km' },
            ]}
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="geo-filter-sm"
          />
          <Select
            id="geo-crop"
            label="Crop Type"
            placeholder="All types"
            options={[
              { value: 'paddy', label: 'Paddy Straw' },
              { value: 'wheat', label: 'Wheat Straw' },
              { value: 'sugarcane', label: 'Sugarcane Residue' },
              { value: 'maize', label: 'Maize Stalks' },
            ]}
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="geo-filter-sm"
          />
          <Button variant="primary" leftIcon={<Filter size={16} />} style={{ alignSelf: 'flex-end', height: 44 }}>
            Search
          </Button>
        </div>
      </Card>

      <div className="geo-disclaimer">
        <Info size={13} />
        <span>Farmer locations shown as approximate district areas only — exact coordinates are kept private. Distances are straight-line estimates, not road distances.</span>
      </div>

      <div className="geo-layout">
        {/* Listings Panel */}
        <div className="geo-results">
          <p className="geo-results-count">{NEARBY_LISTINGS.length} listings within {radius} km</p>
          <div className="geo-list">
            {NEARBY_LISTINGS.map((listing) => (
              <div
                key={listing.id}
                className={`geo-listing-row ${selected?.id === listing.id ? 'selected' : ''}`}
                onClick={() => setSelected(listing)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(listing)}
                aria-pressed={selected?.id === listing.id}
              >
                <div className="geo-listing-emoji">{listing.emoji}</div>
                <div className="geo-listing-info">
                  <p className="geo-listing-crop">{listing.crop}</p>
                  <p className="geo-listing-loc">
                    <MapPin size={11} /> {listing.village} · {listing.distance}
                  </p>
                  <p className="geo-listing-qty">{listing.qty} · <strong>{listing.price}</strong></p>
                </div>
                <StatusBadge status={listing.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Map / Detail Panel */}
        <div className="geo-map-panel">
          {/* Fake map placeholder */}
          <div className="geo-map-area">
            <div className="geo-map-placeholder">
              <div className="geo-map-bg">
                {/* Decorative map pins */}
                {NEARBY_LISTINGS.map((l, i) => (
                  <div
                    key={l.id}
                    className={`geo-map-pin ${selected?.id === l.id ? 'geo-map-pin-selected' : ''}`}
                    style={{
                      left: `${15 + (i * 18) % 70}%`,
                      top: `${20 + (i * 23) % 55}%`,
                    }}
                    title={`${l.crop} – ${l.village}`}
                    onClick={() => setSelected(l)}
                  >
                    <MapPin size={selected?.id === l.id ? 28 : 20} />
                    {selected?.id === l.id && (
                      <div className="geo-map-pin-label">{l.crop}</div>
                    )}
                  </div>
                ))}
                <div className="geo-map-label">
                  <Info size={14} />
                  Illustrative map — not actual GPS positions. Backend integration will provide real coordinates.
                </div>
              </div>
            </div>
          </div>

          {/* Selected listing detail */}
          {selected && (
            <div className="geo-detail animate-fadeIn">
              <div className="geo-detail-header">
                <span className="geo-detail-emoji">{selected.emoji}</span>
                <div>
                  <h3 className="geo-detail-crop">{selected.crop}</h3>
                  <p className="geo-detail-loc"><MapPin size={12} /> {selected.village}, Kolhapur · {selected.distance}</p>
                </div>
              </div>
              <div className="geo-detail-grid">
                <div className="geo-detail-field">
                  <span className="geo-detail-label">Quantity</span>
                  <span className="geo-detail-value">{selected.qty}</span>
                </div>
                <div className="geo-detail-field">
                  <span className="geo-detail-label">Asking Price</span>
                  <span className="geo-detail-value" style={{ color: 'var(--agri-green)' }}>{selected.price}</span>
                </div>
                <div className="geo-detail-field">
                  <span className="geo-detail-label">Farmer</span>
                  <span className="geo-detail-value">{selected.farmer}</span>
                </div>
                <div className="geo-detail-field">
                  <span className="geo-detail-label">Est. Transport</span>
                  <span className="geo-detail-value" style={{ color: 'var(--agri-muted)', fontSize: '0.8rem' }}>
                    <Info size={11} /> Illustrative only
                  </span>
                </div>
              </div>
              <div className="geo-detail-actions">
                <Button variant="primary" size="sm" leftIcon={<ArrowRight size={14} />}>
                  Send Request
                </Button>
                <Button variant="secondary" size="sm" leftIcon={<Phone size={14} />}>
                  Contact Info
                </Button>
              </div>
              <p className="geo-detail-note">
                Contact details are shared only after the farmer accepts a request.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Request Timeline Demo */}
      <Card>
        <CardHeader
          title="Active Request Timeline"
          subtitle="Request #REQ-2026-042 · Paddy Straw"
        />
        <div className="request-timeline">
          {REQUEST_TIMELINE.map((item, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-indicator">
                <div className={`timeline-dot ${item.done ? 'done' : ''}`} />
                {i < REQUEST_TIMELINE.length - 1 && (
                  <div className={`timeline-line ${item.done ? 'done' : ''}`} />
                )}
              </div>
              <div className="timeline-content">
                <p className={`timeline-status ${item.done ? 'done' : ''}`}>{item.status}</p>
                <p className="timeline-time">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="timeline-note">
          <Truck size={14} />
          <span>Pickup is proposed only — not confirmed until both parties accept. This timeline reflects request status, not real-time vehicle location.</span>
        </div>
      </Card>
    </AppShell>
  );
}
