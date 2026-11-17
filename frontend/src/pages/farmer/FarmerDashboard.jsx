import { Link } from 'react-router-dom';
import {
  List, Plus, FileText, Truck, TrendingUp,
  Package, CheckCircle, AlertTriangle,
  ArrowRight, Wheat, BarChart3
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import './FarmerDashboard.css';

// Demo data - illustrative only, labelled as such
const DEMO_LISTINGS = [
  { id: '1', crop: 'Paddy Straw', qty: '12 tonnes', price: '₹850/t', status: 'active', date: 'Oct 25, 2026', buyers: 3 },
  { id: '2', crop: 'Sugarcane Residue', qty: '8 tonnes', price: '₹1,200/t', status: 'pending', date: 'Oct 22, 2026', buyers: 1 },
  { id: '3', crop: 'Wheat Straw', qty: '5 tonnes', price: '₹600/t', status: 'completed', date: 'Oct 18, 2026', buyers: 1 },
  { id: '4', crop: 'Soybean Stover', qty: '3 tonnes', price: '₹750/t', status: 'draft', date: 'Oct 15, 2026', buyers: 0 },
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

export default function FarmerDashboard() {
  const { user } = useAuth();

  return (
    <AppShell pageTitle="Dashboard">
      {/* Welcome banner */}
      <div className="dashboard-welcome">
        <div className="dashboard-welcome-text">
          <h2 className="dashboard-welcome-title">
            Good {getGreeting()}, {user?.name?.split(' ')[0] || 'Farmer'} 👋
          </h2>
          <p className="dashboard-welcome-sub">
            Here's an overview of your AgriCycle activity in {user?.region}.
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

      {/* Demo mode notice */}
      <div className="demo-banner">
        <AlertTriangle size={14} />
        <span><strong>Illustrative demo data</strong> — figures shown below are example values for UI demonstration only. Connect the backend API for real data.</span>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Active Listings"
          value="4"
          icon={<Package size={22} />}
          trendLabel="this month"
          trend={2}
          color="green"
        />
        <StatCard
          label="Total Available"
          value="28 t"
          icon={<Wheat size={22} />}
          trendLabel="across all listings"
          color="green"
        />
        <StatCard
          label="Pending Requests"
          value="2"
          icon={<FileText size={22} />}
          trendLabel="awaiting response"
          color="amber"
        />
        <StatCard
          label="Gross Asking Value"
          value="₹31,450"
          icon={<TrendingUp size={22} />}
          trendLabel="before costs (illustrative)"
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
                {DEMO_LISTINGS.map((listing) => (
                  <tr key={listing.id}>
                    <td>
                      <div className="listing-crop">
                        <div className="listing-crop-icon">🌾</div>
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
            {DEMO_REQUESTS.map((req) => (
              <div key={req.id} className="request-item">
                <div className="request-info">
                  <p className="request-buyer">{req.buyer}</p>
                  <p className="request-detail">{req.crop} · {req.qty}</p>
                  <p className="request-offer">Offer: <strong>{req.offer}</strong></p>
                </div>
                <div className="request-right">
                  <StatusBadge status={req.status} />
                  <span className="request-time">{req.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader title="Recent Activity" subtitle="Your latest events" />
          <div className="activity-list">
            {DEMO_ACTIVITY.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className={`activity-item activity-${item.type}`}>
                  <div className="activity-icon">
                    <Icon size={14} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">{item.text}</p>
                    <p className="activity-time">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick links */}
        <Card>
          <CardHeader title="Quick Actions" />
          <div className="quick-actions">
            <Link to="/farmer/listings/new" className="quick-action-btn">
              <div className="quick-action-icon green"><Plus size={20} /></div>
              <span>New Listing</span>
            </Link>
            <Link to="/farmer/requests" className="quick-action-btn">
              <div className="quick-action-icon amber"><FileText size={20} /></div>
              <span>View Requests</span>
            </Link>
            <Link to="/farmer/pickups" className="quick-action-btn">
              <div className="quick-action-icon blue"><Truck size={20} /></div>
              <span>Pickups</span>
            </Link>
            <Link to="/farmer/analytics" className="quick-action-btn">
              <div className="quick-action-icon purple"><BarChart3 size={20} /></div>
              <span>Analytics</span>
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
