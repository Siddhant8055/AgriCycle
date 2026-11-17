import { Info, TrendingUp, Package, CheckCircle, Users } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader } from '../../components/ui/Card';
import './AnalyticsPage.css';

// Demo data — illustrative only
const MONTHLY_REVENUE = [
  { month: 'Jun', revenue: 4200, listings: 1 },
  { month: 'Jul', revenue: 7800, listings: 2 },
  { month: 'Aug', revenue: 5500, listings: 2 },
  { month: 'Sep', revenue: 12400, listings: 4 },
  { month: 'Oct', revenue: 18650, listings: 5 },
  { month: 'Nov', revenue: 9600, listings: 3 },
];

const CROP_BREAKDOWN = [
  { name: 'Paddy Straw', value: 38, color: '#047857' },
  { name: 'Sugarcane Residue', value: 25, color: '#059669' },
  { name: 'Wheat Straw', value: 17, color: '#d97706' },
  { name: 'Cotton Stalks', value: 12, color: '#0369a1' },
  { name: 'Others', value: 8, color: '#718078' },
];

const STATUS_DATA = [
  { name: 'Active', value: 3, color: '#047857' },
  { name: 'Completed', value: 8, color: '#0369a1' },
  { name: 'Pending', value: 1, color: '#d97706' },
  { name: 'Draft', value: 1, color: '#718078' },
];

const BUYER_ACTIVITY = [
  { month: 'Jun', requests: 2, conversions: 1 },
  { month: 'Jul', requests: 4, conversions: 2 },
  { month: 'Aug', requests: 3, conversions: 2 },
  { month: 'Sep', requests: 7, conversions: 4 },
  { month: 'Oct', requests: 10, conversions: 6 },
  { month: 'Nov', requests: 5, conversions: 3 },
];

const KPI_CARDS = [
  { label: 'Total Gross Revenue', value: '₹58,150', sub: 'Illustrative, year to date', icon: TrendingUp, color: 'green' },
  { label: 'Total Listings', value: '13', sub: 'All time', icon: Package, color: 'blue' },
  { label: 'Completed Sales', value: '8', sub: 'Fulfilled', icon: CheckCircle, color: 'success' },
  { label: 'Unique Buyers', value: '6', sub: 'Engaged', icon: Users, color: 'amber' },
];

const fmtINR = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

export default function AnalyticsPage() {
  return (
    <AppShell pageTitle="Analytics">
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Analytics</h2>
          <p className="analytics-sub">Overview of your listings, revenue, and buyer activity</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="analytics-disclaimer">
        <Info size={14} />
        <span><strong>Illustrative demo data only.</strong> All figures shown are for UI demonstration. Connect the backend API for real analytics.</span>
      </div>

      {/* KPI Row */}
      <div className="analytics-kpi-row">
        {KPI_CARDS.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className={`kpi-card kpi-${k.color}`}>
              <div className="kpi-icon"><Icon size={20} /></div>
              <div>
                <p className="kpi-value">{k.value}</p>
                <p className="kpi-label">{k.label}</p>
                <p className="kpi-sub">{k.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="analytics-charts-row">
        {/* Revenue Trend */}
        <Card className="analytics-chart-card">
          <CardHeader title="Monthly Revenue Trend" subtitle="Illustrative gross asking value" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MONTHLY_REVENUE} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--agri-border-light)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--agri-muted)' }} />
              <YAxis tickFormatter={v => `₹${v / 1000}k`} tick={{ fontSize: 12, fill: 'var(--agri-muted)' }} />
              <Tooltip formatter={v => [fmtINR(v), 'Gross Revenue']} />
              <Bar dataKey="revenue" name="Revenue" fill="var(--agri-green)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Crop Breakdown */}
        <Card className="analytics-chart-card">
          <CardHeader title="Crop Breakdown" subtitle="By percentage of listings" />
          <div className="pie-chart-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={CROP_BREAKDOWN}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {CROP_BREAKDOWN.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={v => [`${v}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {CROP_BREAKDOWN.map(item => (
                <div key={item.name} className="pie-legend-item">
                  <span className="pie-legend-dot" style={{ background: item.color }} />
                  <span className="pie-legend-name">{item.name}</span>
                  <span className="pie-legend-pct">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="analytics-charts-row">
        {/* Buyer Activity */}
        <Card className="analytics-chart-card">
          <CardHeader title="Buyer Activity" subtitle="Requests received vs. successful conversions" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={BUYER_ACTIVITY} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--agri-border-light)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--agri-muted)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--agri-muted)' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="requests" name="Requests" stroke="var(--agri-info)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="conversions" name="Conversions" stroke="var(--agri-green)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Listing Status */}
        <Card className="analytics-chart-card">
          <CardHeader title="Listing Status Distribution" subtitle="All time, all listings" />
          <div className="pie-chart-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={STATUS_DATA}
                  cx="50%" cy="50%"
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {STATUS_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {STATUS_DATA.map(item => (
                <div key={item.name} className="pie-legend-item">
                  <span className="pie-legend-dot" style={{ background: item.color }} />
                  <span className="pie-legend-name">{item.name}</span>
                  <span className="pie-legend-pct">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
