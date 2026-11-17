import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus, Search, Package, BarChart3, ArrowRight,
  CheckCircle, Clock, AlertTriangle, FileText, X
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import './ListingsPage.css';

const DEMO_LISTINGS = [
  { id: '1', crop: 'Paddy Straw', emoji: '🌾', qty: '12 tonnes', price: '₹850/t', status: 'active', date: 'Oct 25, 2026', buyers: 3, location: 'Hatkanangale' },
  { id: '2', crop: 'Sugarcane Residue', emoji: '🎋', qty: '8 tonnes', price: '₹1,200/t', status: 'pending', date: 'Oct 22, 2026', buyers: 1, location: 'Kolhapur' },
  { id: '3', crop: 'Wheat Straw', emoji: '🌱', qty: '5 tonnes', price: '₹600/t', status: 'completed', date: 'Oct 18, 2026', buyers: 1, location: 'Shirol' },
  { id: '4', crop: 'Soybean Stover', emoji: '🌿', qty: '3 tonnes', price: '₹750/t', status: 'draft', date: 'Oct 15, 2026', buyers: 0, location: 'Kagal' },
  { id: '5', crop: 'Cotton Stalks', emoji: '🌸', qty: '10 tonnes', price: '₹550/t', status: 'active', date: 'Oct 12, 2026', buyers: 2, location: 'Ichalkaranji' },
  { id: '6', crop: 'Maize Stalks', emoji: '🌽', qty: '7 tonnes', price: '₹500/t', status: 'active', date: 'Oct 10, 2026', buyers: 0, location: 'Hatkanangale' },
];

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'draft', label: 'Draft' },
];

const STAT_CARDS = [
  { label: 'Total Listings', value: 6, icon: Package, color: 'green' },
  { label: 'Active', value: 3, icon: CheckCircle, color: 'success' },
  { label: 'Pending Response', value: 1, icon: Clock, color: 'amber' },
  { label: 'Drafts', value: 1, icon: FileText, color: 'muted' },
];

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [statusFilter, setStatusFilter] = useState('');

  const updateSearch = (value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set('search', value);
      else next.delete('search');
      return next;
    }, { replace: true });
  };

  const filtered = useMemo(() => {
    let data = [...DEMO_LISTINGS];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(l => l.crop.toLowerCase().includes(s) || l.location.toLowerCase().includes(s));
    }
    if (statusFilter) data = data.filter(l => l.status === statusFilter);
    return data;
  }, [search, statusFilter]);

  const clearFilters = () => { updateSearch(''); setStatusFilter(''); };
  const hasFilters = search || statusFilter;

  return (
    <AppShell pageTitle="My Listings">
      {/* Header */}
      <div className="listings-page-header">
        <div>
          <h2 className="listings-page-title">My Listings</h2>
          <p className="listings-page-sub">Manage and track all your crop residue listings</p>
        </div>
        <Link to="/farmer/listings/new">
          <Button variant="primary" leftIcon={<Plus size={16} />}>New Listing</Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="listings-stats-row">
        {STAT_CARDS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`listings-stat-card stat-${s.color}`}>
              <div className="listings-stat-icon"><Icon size={18} /></div>
              <div>
                <p className="listings-stat-value">{s.value}</p>
                <p className="listings-stat-label">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="listings-filters">
          <div className="listings-search-wrap">
            <Search size={15} className="listings-search-icon" />
            <input
              type="search"
              placeholder="Search by crop or location…"
              className="listings-search-input"
              value={search}
              onChange={e => updateSearch(e.target.value)}
            />
          </div>
          <Select
            id="statusFilter"
            options={STATUS_OPTS}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="listings-filter-select"
          />
          {hasFilters && (
            <Button variant="ghost" size="sm" leftIcon={<X size={13} />} onClick={clearFilters}>Clear</Button>
          )}
        </div>
      </Card>

      {/* Demo notice */}
      <div className="listings-demo-notice">
        <AlertTriangle size={13} />
        <span><strong>Demo data</strong> — connect backend API for real listings.</span>
      </div>

      {/* Results count */}
      <p className="listings-count">{filtered.length} listing{filtered.length !== 1 ? 's' : ''}{hasFilters ? ' (filtered)' : ''}</p>

      {/* Listings Grid */}
      {filtered.length === 0 ? (
        <Card padding="lg">
          <div className="listings-empty">
            <div className="listings-empty-icon">📋</div>
            <h3>No listings found</h3>
            <p>Try adjusting your filters, or add a new listing.</p>
            <Link to="/farmer/listings/new">
              <Button variant="primary" leftIcon={<Plus size={15} />}>Add Listing</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="listings-cards-grid">
          {filtered.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ListingCard({ listing }) {
  return (
    <Card hover className="lc-card animate-fadeIn">
      <div className="lc-header">
        <div className="lc-emoji">{listing.emoji}</div>
        <div className="lc-title-group">
          <h3 className="lc-crop">{listing.crop}</h3>
          <p className="lc-location">📍 {listing.location}</p>
        </div>
        <StatusBadge status={listing.status} />
      </div>

      <div className="lc-details">
        <div className="lc-detail-item">
          <span className="lc-detail-label">Quantity</span>
          <span className="lc-detail-value">{listing.qty}</span>
        </div>
        <div className="lc-detail-item">
          <span className="lc-detail-label">Price</span>
          <span className="lc-detail-value lc-price">{listing.price}</span>
        </div>
        <div className="lc-detail-item">
          <span className="lc-detail-label">Posted</span>
          <span className="lc-detail-value">{listing.date}</span>
        </div>
        <div className="lc-detail-item">
          <span className="lc-detail-label">Buyer Interest</span>
          <span className={`lc-detail-value ${listing.buyers > 0 ? 'lc-buyers-active' : ''}`}>
            {listing.buyers} {listing.buyers === 1 ? 'buyer' : 'buyers'}
          </span>
        </div>
      </div>

      <div className="lc-actions">
        <Link to={`/farmer/listings/${listing.id}`} style={{ flex: 1 }}>
          <Button variant="secondary" size="sm" style={{ width: '100%' }} rightIcon={<ArrowRight size={13} />}>
            View Details
          </Button>
        </Link>
        <Link to={`/farmer/listings/${listing.id}/recommendations`}>
          <Button variant="outline" size="sm" leftIcon={<BarChart3 size={13} />}>
            Compare
          </Button>
        </Link>
      </div>
    </Card>
  );
}
