import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Info, TrendingUp, Truck, Factory, Sprout,
  XCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import './RecommendationsPage.css';

// Demo recommendation data – illustrative estimates, labelled as such
const DEMO_RECOMMENDATIONS = [
  {
    id: 'r1',
    rank: 1,
    type: 'direct_sale',
    label: 'Direct Sale to Buyer',
    buyer: 'Agro Compost Co.',
    icon: TrendingUp,
    color: '#047857',
    grossRevenue: 10200,
    transportCost: 1440,
    handlingCost: 600,
    netProceeds: 8160,
    priceUnit: '₹850/t',
    distance: '18 km',
    quantity: '12 t',
    eligible: true,
    rationale: 'Highest net proceeds. Buyer is nearby and accepts baled paddy straw.',
    assumptions: ['Transport: buyer-arranged at ₹120/t/100km', 'Handling: ₹50/t'],
    uncertainty: 'Transport cost is estimated. Actual negotiation may vary.',
  },
  {
    id: 'r2',
    rank: 2,
    type: 'compost',
    label: 'On-Farm Compost Pathway',
    buyer: null,
    icon: Sprout,
    color: '#059669',
    grossRevenue: 12000,
    transportCost: 0,
    handlingCost: 3200,
    processingCost: 4800,
    netProceeds: 4000,
    priceUnit: '₹1,000/t compost',
    distance: '—',
    quantity: '12 t → ~4 t compost',
    eligible: true,
    rationale: 'Converts residue to higher-value compost but requires processing equipment and time.',
    assumptions: ['Conversion ratio: 3:1 (straw:compost)', 'Processing cost includes labour & inputs: ₹400/t straw'],
    uncertainty: 'Compost market price is illustrative. Actual price depends on local demand.',
  },
  {
    id: 'r3',
    rank: 3,
    type: 'biochar',
    label: 'Biochar Production',
    buyer: 'BioChar India',
    icon: Factory,
    color: '#d97706',
    grossRevenue: 9600,
    transportCost: 2880,
    handlingCost: 800,
    processingCost: 2400,
    netProceeds: 3520,
    priceUnit: '₹3,200/t biochar',
    distance: '55 km',
    quantity: '12 t → ~3 t biochar',
    eligible: true,
    rationale: 'Premium output value but high transport distance and conversion losses reduce net proceeds.',
    assumptions: ['Conversion ratio: 4:1 (straw:biochar)', 'Transport: 55 km at ₹6/km/tonne straw'],
    uncertainty: 'Biochar price is an indicative market average. Processing requires off-farm unit.',
  },
  {
    id: 'r4',
    rank: null,
    type: 'export',
    label: 'Export / Long-Haul',
    buyer: null,
    icon: Truck,
    color: '#b42318',
    grossRevenue: null,
    netProceeds: null,
    eligible: false,
    exclusionReason: 'No verified export buyer available in the configured radius (100 km). Transport economics make this unviable at current quantity.',
    assumptions: [],
  },
];

const BAR_DATA = DEMO_RECOMMENDATIONS.filter((r) => r.eligible && r.netProceeds !== null).map((r) => ({
  name: r.label.split(' ').slice(0, 2).join(' '),
  grossRevenue: r.grossRevenue,
  totalCost: r.grossRevenue - r.netProceeds,
  netProceeds: r.netProceeds,
}));

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

export default function RecommendationsPage() {
  const { id } = useParams();
  const [expanded, setExpanded] = useState({});

  const toggle = (rid) => setExpanded((e) => ({ ...e, [rid]: !e[rid] }));

  return (
    <AppShell pageTitle="Pathway Recommendations">
      <div className="rec-header">
        <Link to={`/farmer/listings/${id}`}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>Back to listing</Button>
        </Link>
        <div className="rec-header-info">
          <h2 className="rec-main-title">Utilization Pathway Comparison</h2>
          <p className="rec-main-sub">Paddy Straw · 12 tonnes · Hatkanangale, Kolhapur</p>
        </div>
      </div>

      <div className="rec-disclaimer">
        <Info size={15} />
        <span>
          <strong>Illustrative estimates only.</strong> All values below are calculated from demo assumptions and are not verified market data. Actual costs, conversion ratios, and prices will vary. Do not treat these as guaranteed income.
        </span>
      </div>

      {/* Comparison chart */}
      <Card>
        <CardHeader
          title="Revenue vs Cost Comparison"
          subtitle="Illustrative gross revenue and estimated costs per eligible pathway"
        />
        <div className="rec-chart-wrap" role="img" aria-label="Bar chart comparing gross revenue, costs, and net proceeds for each pathway">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={BAR_DATA} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--agri-border-light)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--agri-muted)' }} />
              <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: 'var(--agri-muted)' }} />
              <Tooltip formatter={(v, n) => [`₹${v.toLocaleString('en-IN')}`, n]} />
              <Legend />
              <Bar dataKey="grossRevenue" name="Gross Revenue" fill="#047857" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalCost" name="Total Costs" fill="#d97706" radius={[4, 4, 0, 0]} />
              <Bar dataKey="netProceeds" name="Net Proceeds" fill="#0369a1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accessible table */}
        <details className="rec-table-details">
          <summary className="rec-table-summary">View as table (accessible version)</summary>
          <table className="rec-table">
            <thead>
              <tr>
                <th>Pathway</th>
                <th>Gross Revenue</th>
                <th>Total Costs</th>
                <th>Net Proceeds</th>
              </tr>
            </thead>
            <tbody>
              {BAR_DATA.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{fmt(row.grossRevenue)}</td>
                  <td>{fmt(row.totalCost)}</td>
                  <td className="rec-net-cell">{fmt(row.netProceeds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </Card>

      {/* Pathway cards */}
      <div className="rec-pathways">
        {DEMO_RECOMMENDATIONS.map((rec) => {
          const Icon = rec.icon;
          return (
            <Card key={rec.id} className={`rec-pathway ${!rec.eligible ? 'rec-excluded' : ''}`}>
              <div className="rec-pathway-header">
                <div className="rec-pathway-icon" style={{ background: `${rec.color}18`, color: rec.color }}>
                  <Icon size={20} />
                </div>
                <div className="rec-pathway-meta">
                  <div className="rec-pathway-title-row">
                    <h3 className="rec-pathway-title">{rec.label}</h3>
                    {rec.rank && (
                      <Badge variant={rec.rank === 1 ? 'success' : rec.rank === 2 ? 'info' : 'muted'} size="md">
                        #{rec.rank} Ranked
                      </Badge>
                    )}
                    {!rec.eligible && <Badge variant="danger" size="md">Excluded</Badge>}
                  </div>
                  {rec.buyer && <p className="rec-buyer">via {rec.buyer}</p>}
                </div>
              </div>

              {rec.eligible ? (
                <>
                  <div className="rec-financials">
                    <div className="rec-fin-item">
                      <span className="rec-fin-label">Gross Revenue</span>
                      <span className="rec-fin-value">{fmt(rec.grossRevenue)}</span>
                    </div>
                    <div className="rec-fin-item rec-fin-cost">
                      <span className="rec-fin-label">Costs</span>
                      <span className="rec-fin-value">
                        −{fmt((rec.transportCost || 0) + (rec.handlingCost || 0) + (rec.processingCost || 0))}
                      </span>
                    </div>
                    <div className="rec-fin-divider" />
                    <div className="rec-fin-item rec-fin-net">
                      <span className="rec-fin-label">Est. Net Proceeds</span>
                      <span className="rec-fin-value rec-net-amount">{fmt(rec.netProceeds)}</span>
                    </div>
                  </div>

                  <div className="rec-details-row">
                    {rec.distance !== '—' && (
                      <span className="rec-detail-badge">📍 {rec.distance}</span>
                    )}
                    <span className="rec-detail-badge">📦 {rec.quantity}</span>
                    <span className="rec-detail-badge">💰 {rec.priceUnit}</span>
                  </div>

                  <p className="rec-rationale">{rec.rationale}</p>

                  <button
                    className="rec-expand-btn"
                    onClick={() => toggle(rec.id)}
                    aria-expanded={!!expanded[rec.id]}
                  >
                    Cost breakdown & assumptions
                    {expanded[rec.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {expanded[rec.id] && (
                    <div className="rec-breakdown">
                      <div className="rec-breakdown-row">
                        <span>Transport cost</span>
                        <span>{fmt(rec.transportCost)}</span>
                      </div>
                      <div className="rec-breakdown-row">
                        <span>Handling cost</span>
                        <span>{fmt(rec.handlingCost)}</span>
                      </div>
                      {rec.processingCost && (
                        <div className="rec-breakdown-row">
                          <span>Processing cost</span>
                          <span>{fmt(rec.processingCost)}</span>
                        </div>
                      )}
                      <div className="rec-assumptions">
                        <p className="rec-assumptions-title">Key Assumptions</p>
                        <ul>
                          {rec.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                        {rec.uncertainty && (
                          <p className="rec-uncertainty"><Info size={12} /> {rec.uncertainty}</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rec-excluded-reason">
                  <XCircle size={16} />
                  <p>{rec.exclusionReason}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
