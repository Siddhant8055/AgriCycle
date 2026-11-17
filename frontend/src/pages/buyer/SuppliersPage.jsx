import { useState } from 'react';
import { MapPin, Star, ArrowRight, Search, Package, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import './SuppliersPage.css';

const DEMO_SUPPLIERS = [
  {
    id: 'f1', name: 'Rajesh Patil', initial: 'R',
    location: 'Hatkanangale, Kolhapur', distance: '18 km',
    crops: ['Paddy Straw', 'Wheat Straw'],
    rating: 4.8, totalSales: 12, verified: true,
    lastActive: '2 days ago', listingId: '1',
  },
  {
    id: 'f2', name: 'Sunita Kamble', initial: 'S',
    location: 'Shirol, Kolhapur', distance: '25 km',
    crops: ['Wheat Straw', 'Soybean Stover'],
    rating: 4.5, totalSales: 7, verified: true,
    lastActive: '1 day ago', listingId: '3',
  },
  {
    id: 'f3', name: 'Mahadev Shinde', initial: 'M',
    location: 'Miraj, Sangli', distance: '32 km',
    crops: ['Sugarcane Residue'],
    rating: 4.2, totalSales: 5, verified: false,
    lastActive: '5 days ago', listingId: '2',
  },
  {
    id: 'f4', name: 'Prashant Mane', initial: 'P',
    location: 'Kagal, Kolhapur', distance: '42 km',
    crops: ['Soybean Stover', 'Cotton Stalks'],
    rating: 4.6, totalSales: 9, verified: true,
    lastActive: 'Today', listingId: '4',
  },
];

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(['f1', 'f2']);

  const filtered = DEMO_SUPPLIERS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase()) ||
    s.crops.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSave = (id) => {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <AppShell pageTitle="Suppliers">
      <div className="sup-header">
        <div>
          <h2 className="sup-title">Suppliers</h2>
          <p className="sup-sub">Farmers you've interacted with or shortlisted</p>
        </div>
      </div>

      {/* Stats */}
      <div className="sup-stats">
        <div className="sup-stat">
          <Package size={18} style={{ color: 'var(--agri-green)' }} />
          <div>
            <p className="sup-stat-val">{DEMO_SUPPLIERS.length}</p>
            <p className="sup-stat-lbl">Total Farmers</p>
          </div>
        </div>
        <div className="sup-stat">
          <Star size={18} style={{ color: '#f59e0b' }} />
          <div>
            <p className="sup-stat-val">{saved.length}</p>
            <p className="sup-stat-lbl">Shortlisted</p>
          </div>
        </div>
        <div className="sup-stat">
          <CheckCircle size={18} style={{ color: 'var(--agri-success)' }} />
          <div>
            <p className="sup-stat-val">{DEMO_SUPPLIERS.filter(s => s.verified).length}</p>
            <p className="sup-stat-lbl">Verified</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card padding="sm">
        <div className="sup-search-wrap">
          <Search size={15} className="sup-search-icon" />
          <input
            type="search"
            placeholder="Search by name, location, or crop…"
            className="sup-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* Supplier cards */}
      <div className="sup-grid">
        {filtered.map(supplier => (
          <Card key={supplier.id} hover className="sup-card animate-fadeIn">
            <div className="sup-card-top">
              <div className="sup-avatar">
                {supplier.initial}
                {supplier.verified && <span className="sup-verified-badge" title="Verified">✓</span>}
              </div>
              <div className="sup-info">
                <h3 className="sup-name">{supplier.name}</h3>
                <p className="sup-loc"><MapPin size={11} /> {supplier.location} · {supplier.distance}</p>
                <div className="sup-rating">
                  <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  <span>{supplier.rating}</span>
                  <span className="sup-sales">· {supplier.totalSales} sales</span>
                </div>
              </div>
              <button
                className={`sup-save-btn ${saved.includes(supplier.id) ? 'saved' : ''}`}
                onClick={() => toggleSave(supplier.id)}
                title={saved.includes(supplier.id) ? 'Remove from shortlist' : 'Shortlist'}
              >
                <Star size={16} fill={saved.includes(supplier.id) ? '#f59e0b' : 'none'} color={saved.includes(supplier.id) ? '#f59e0b' : 'var(--agri-muted)'} />
              </button>
            </div>

            <div className="sup-crops">
              {supplier.crops.map(c => (
                <Badge key={c} variant="primary" size="sm">{c}</Badge>
              ))}
            </div>

            <div className="sup-footer">
              <span className="sup-last-active">Active {supplier.lastActive}</span>
              <div className="sup-actions">
                <Link to={`/buyer/listings/${supplier.listingId}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight size={13} />}>
                    View Listing
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card padding="lg">
          <div className="sup-empty">
            <span style={{ fontSize: '2.5rem' }}>👨‍🌾</span>
            <h3>No suppliers found</h3>
            <p>Try adjusting your search term.</p>
          </div>
        </Card>
      )}
    </AppShell>
  );
}
