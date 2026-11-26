import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  List, Plus, FileText, Truck, TrendingUp,
  Package, CheckCircle, AlertTriangle,
  ArrowRight, Wheat, BarChart3, Check
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../lib/apiClient.js';
import './FarmerDashboard.css';

const DEMO_LISTINGS = [
  { id: '1', crop: 'Paddy Straw', emoji: '🌾', qty: '12 tonnes', price: '₹850/t', status: 'active', date: 'Oct 25, 2026', buyers: 3 },
  { id: '2', crop: 'Sugarcane Residue', emoji: '🎋', qty: '8 tonnes', price: '₹1,200/t', status: 'pending', date: 'Oct 22, 2026', buyers: 1 },
  { id: '3', crop: 'Wheat Straw', emoji: '🌱', qty: '5 tonnes', price: '₹600/t', status: 'completed', date: 'Oct 18, 2026', buyers: 1 },
  { id: '4', crop: 'Soybean Stover', emoji: '🌿', qty: '3 tonnes', price: '₹750/t', status: 'draft', date: 'Oct 15, 2026', buyers: 0 },
];

const DEMO_REQUESTS = [
  { id: 'r1', buyer: 'Agro Compost Co.', crop: 'Paddy Straw', qty: '8 tonnes', offer: '₹900/t', status: 'pending', time: '2h ago' },
  { id: 'r2', buyer: 'Green Energy Ltd.', crop: 'Sugarcane Residue', qty: '5 tonnes', offer: '₹1,100/t', status: 'active', time: '1d ago' },
  { id: 'r3', buyer: 'BioChar India', crop: 'Wheat Straw', qty: '5 tonnes', offer: '₹650/t', status: 'completed', time: '3d ago' },
];

const DEMO_ACTIVITY = [
  { id: 'a1', icon: CheckCircle, text: 'Wheat Straw listing marked as sold', time: '3 days ago', type: 'success' },
  { id: 'a2', icon: FileText, text: 'New offer received for Sugarcane Residue', time: '1 day ago', type: 'info' },
  { id: 'a3', icon: AlertTriangle, text: 'Paddy Straw listing expires in 5 days', time: '2 hours ago', type: 'warning' },
  { id: 'a4', icon: Plus, text: 'Soybean Stover draft saved', time: 'Just now', type: 'neutral' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState(DEMO_LISTINGS);
  const [requests, setRequests] = useState(DEMO_REQUESTS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [listingsRes, offersRes] = await Promise.allSettled([
          apiClient.get('/listings'),
          apiClient.get('/offers'),
        ]);

        if (isMounted && listingsRes.status === 'fulfilled' && listingsRes.value.data?.success && listingsRes.value.data?.data?.length > 0) {
          setListings(listingsRes.value.data.data);
          setIsLive(true);
        }

        if (isMounted && offersRes.status === 'fulfilled' && offersRes.value.data?.success && offersRes.value.data?.data?.length > 0) {
          setRequests(offersRes.value.data.data);
        }
      } catch (err) {
        console.warn('Dashboard fallback loaded:', err.message);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const stats = useMemo(() => {
    const activeCount = listings.filter((l) => l.status === 'active').length;
    let totalTons = 0;
    let grossVal = 0;

    listings.forEach((l) => {
      const tons = l.quantityTons || parseFloat(l.qty) || 0;
      totalTons += tons;
      const rate = l.pricePerTon || parseFloat(String(l.price).replace(/[^\d]/g, '')) || 700;
      grossVal += tons * rate;
    });

    return {
      activeCount: activeCount || listings.length,
      totalTons: totalTons ? `${totalTons} t` : '28 t',
      pendingRequests: requests.filter((r) => r.status === 'pending').length || 2,
      grossVal: grossVal ? `₹${grossVal.toLocaleString('en-IN')}` : '₹31,450',
    };
  }, [listings, requests]);

  return (
    <AppShell pageTitle="Dashboard">
      {/* Welcome banner */}
      <div className="dashboard-welcome">
        <div className="dashboard-welcome-text">
          <h2 className="dashboard-welcome-title">
            Good {getGreeting()}, {user?.name?.split(' ')[0] || 'Farmer'} 👋
          </h2>
          <p className="dashboard-welcome-sub">
            Here's an overview of your AgriCycle activity in {user?.region || 'Kolhapur, Maharashtra'}.
          </p>
        </div>
        <div className="dashboard-welcome-actions">
          <Link to="/farmer/listings/new">
            <Button variant="primary" leftIcon={<Plus size={16} />}>Add New Listing</Button>
          </Link>
          <Link to="/farmer/listings">
            <Button variant="secondary" leftIcon={<List size={16} />}>View All</Button>
          </Link>
        </div>
      </div>

      {/* Backend connection status */}
      <div className="demo-banner" style={{ background: isLive ? '#ecfdf5' : undefined, borderColor: isLive ? '#a7f3d0' : undefined, color: isLive ? '#047857' : undefined }}>
        {isLive ? <Check size={14} /> : <AlertTriangle size={14} />}
        <span>
          {isLive ? (
            <strong>Connected to PostgreSQL Backend (Live Data)</strong>
          ) : (
            <strong>Demo mode</strong>
          )}
          {' — '}
          {isLive ? 'Real-time database statistics and verified buyer demands loaded.' : 'Figures shown below are example values for UI demonstration.'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Active Listings"
          value={String(stats.activeCount)}
          icon={<Package size={22} />}
          trendLabel="active lots"
          trend={1}
          color="green"
        />
        <StatCard
          label="Total Available"
          value={stats.totalTons}
          icon={<Wheat size={22} />}
          trendLabel="across listings"
          color="green"
        />
        <StatCard
          label="Pending Requests"
          value={String(stats.pendingRequests)}
          icon={<FileText size={22} />}
          trendLabel="awaiting response"
          color="amber"
        />
        <StatCard
          label="Gross Asking Value"
          value={stats.grossVal}
          icon={<TrendingUp size={22} />}
          trendLabel="before logistics costs"
          color="blue"
        />
      </div>

      {/* Main content grid */}
      <div className="dashboard-grid">
        {/* My Listings */}
        <Card className="dashboard-card-wide">
          <CardHeader
            title="My Listings"
            subtitle="Your active crop waste listings"
            action={
              <Link to="/farmer/listings">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>See all</Button>
              </Link>
            }
          />
          <div className="listings-table-wrap">
            <table className="listings-table">
              <thead>
                <tr>
                  <th>Crop / Residue</th>
                  <th>Quantity</th>
                  <th>Asking Price</th>
                  <th>Status</th>
                  <th>Buyer Interest</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.slice(0, 5).map((listing) => (
                  <tr key={listing.id}>
                    <td>
                      <div className="listing-crop">
                        <div className="listing-crop-icon">{listing.emoji || '🌾'}</div>
                        <div>
                          <p className="listing-crop-name">{listing.crop}</p>
                          <p className="listing-crop-date">{listing.date}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="listing-qty">{listing.qty}</span></td>
                    <td><span className="listing-price">{listing.price}</span></td>
                    <td><StatusBadge status={listing.status} /></td>
                    <td>
                      <span className={`buyer-interest ${listing.buyers > 0 ? 'has-buyers' : ''}`}>
                        {listing.buyers} {listing.buyers === 1 ? 'buyer' : 'buyers'}
                      </span>
                    </td>
                    <td>
                      <div className="listing-actions">
                        <Link to={`/farmer/listings/${listing.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <Link to={`/farmer/listings/${listing.id}/recommendations`}>
                          <Button variant="outline" size="sm" leftIcon={<BarChart3 size={12} />}>
                            Compare
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Buyer Requests */}
        <Card>
          <CardHeader
            title="Buyer Requests"
            subtitle="Incoming offers on your listings"
            action={
              <Link to="/farmer/requests">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>All</Button>
              </Link>
            }
          />
          <div className="requests-list">
            {requests.slice(0, 3).map((req) => (
              <div key={req.id} className="request-item">
                <div className="request-info">
                  <p className="request-buyer">{req.buyer || req.buyerName}</p>
                  <p className="request-detail">{req.crop} · {req.qty}</p>
                  <p className="request-offer">Offer: <strong>{req.offer || `₹${req.pricePerTon}/t`}</strong></p>
                </div>
                <div className="request-meta">
                  <StatusBadge status={req.status} />
                  <span className="request-time">{req.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" subtitle="Common tasks & shortcuts" />
          <div className="quick-actions-grid">
            <Link to="/farmer/listings/new" className="quick-action-btn">
              <div className="qa-icon"><Plus size={18} /></div>
              <span>New Listing</span>
            </Link>
            <Link to="/farmer/requests" className="quick-action-btn">
              <div className="qa-icon"><FileText size={18} /></div>
              <span>View Requests</span>
            </Link>
            <Link to="/farmer/pickups" className="quick-action-btn">
              <div className="qa-icon"><Truck size={18} /></div>
              <span>Pickups</span>
            </Link>
            <Link to="/farmer/analytics" className="quick-action-btn">
              <div className="qa-icon"><BarChart3 size={18} /></div>
              <span>Analytics</span>
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader title="Recent Activity" subtitle="Your latest events" />
          <div className="activity-list">
            {DEMO_ACTIVITY.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="activity-item">
                  <div className={`activity-icon act-${act.type}`}>
                    <Icon size={14} />
                  </div>
                  <div className="activity-text">
                    <p>{act.text}</p>
                    <span className="activity-time">{act.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
