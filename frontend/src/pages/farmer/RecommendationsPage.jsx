import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Info, TrendingUp, Truck, Factory, Sprout,
  XCircle, ChevronDown, ChevronUp, CheckCircle, Compass
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import apiClient from '../../lib/apiClient.js';
import './RecommendationsPage.css';

const ICON_MAP = {
  direct_sale: TrendingUp,
  compost: Sprout,
  biochar: Factory,
  fodder: Truck,
};

const DEMO_RECOMMENDATIONS = [
  {
    id: 'r1',
    rank: 1,
    type: 'direct_sale',
    label: 'Direct Sale to Biomass Co-gen',
    buyer: 'Demo Sugar Mill Co-generation Unit',
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
    rationale: 'Highest net proceeds. Buyer is nearby and accepts baled residue.',
    assumptions: ['Transport: buyer-arranged at ₹25/t-km + fixed ₹500', 'Handling: ₹550/t baling & labor'],
    uncertainty: 'Transport cost is estimated with 1.3 road tortuosity factor.',
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
    priceUnit: '₹2,500/t compost',
    distance: '0 km (On-Farm)',
    quantity: '12 t → ~7.2 t compost',
    eligible: true,
    rationale: 'Converts residue to higher-value compost but requires processing labor and decomposition time.',
    assumptions: ['Conversion ratio: 60% compost yield', 'Labor & turning cost: ₹300/t raw residue'],
    uncertainty: 'Compost market price is benchmarked from Kolhapur organic demand.',
  },
  {
    id: 'r3',
    rank: 3,
    type: 'biochar',
    label: 'Biochar Pyrolysis Production',
    buyer: 'BioChar India / Regional Co-op',
    icon: Factory,
    color: '#d97706',
    grossRevenue: 9600,
    transportCost: 0,
    handlingCost: 800,
    processingCost: 2400,
    netProceeds: 3520,
    priceUnit: '₹12,000/t biochar',
    distance: 'On-Farm Kiln',
    quantity: '12 t → ~3 t biochar',
    eligible: true,
    rationale: 'Premium carbon product; local pyrolysis equipment required.',
    assumptions: ['Pyrolysis conversion yield: 25%', 'Kiln operating & labor: ₹1,500/t'],
    uncertainty: 'Biochar market rate assumes soil conditioner certification.',
  },
  {
    id: 'r4',
    rank: null,
    type: 'fodder',
    label: 'Cattle Feed / Dairy Procurer',
    buyer: null,
    icon: Truck,
    color: '#b42318',
    grossRevenue: null,
    netProceeds: null,
    eligible: false,
    exclusionReason: 'Untreated rice / sugarcane straw contains high silica (>12%) and low digestibility, unsuitable for raw livestock feed.',
    assumptions: [],
  },
];

const fmt = (n) => (n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—');

export default function RecommendationsPage() {
  const { id } = useParams();
  const [expanded, setExpanded] = useState({});
  const [recommendations, setRecommendations] = useState(DEMO_RECOMMENDATIONS);
  const [breakEvenKm, setBreakEvenKm] = useState(null);
  const [listingMeta, setListingMeta] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveRecommendations() {
      try {
        const response = await apiClient.get(`/recommendations/${id}`);
        if (isMounted && response.data?.success && response.data?.data) {
          const recData = response.data.data;
          if (recData.recommendations && recData.recommendations.length > 0) {
            const mapped = recData.recommendations.map((r) => ({
              ...r,
              icon: ICON_MAP[r.type] || TrendingUp,
              color: r.color || (r.eligible ? '#047857' : '#b42318'),
              assumptions: r.assumptions || [],
            }));
            setRecommendations(mapped);
            setBreakEvenKm(recData.breakEvenDistanceKm);
            setListingMeta({
              cropType: recData.cropType,
              quantityTons: recData.quantityTons,
            });
            setIsLive(true);
          }
        }
      } catch (err) {
        console.warn('Using demo recommendation data:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchLiveRecommendations();
    return () => { isMounted = false; };
  }, [id]);

  const toggle = (rid) => setExpanded((e) => ({ ...e, [rid]: !e[rid] }));

  const barData = useMemo(() => {
    return recommendations
      .filter((r) => r.eligible && r.netProceeds !== null)
      .map((r) => ({
        name: r.label.split(' ').slice(0, 2).join(' '),
        grossRevenue: r.grossRevenue,
        totalCost: Math.max(0, r.grossRevenue - r.netProceeds),
        netProceeds: r.netProceeds,
      }));
  }, [recommendations]);

  return (
    <AppShell pageTitle="Pathway Recommendations">
      <div className="rec-header">
        <Link to={`/farmer/listings/${id}`}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>Back to listing</Button>
        </Link>
        <div className="rec-header-info">
          <h2 className="rec-main-title">Utilization Pathway Comparison</h2>
          <p className="rec-main-sub">
            {listingMeta ? `${listingMeta.cropType.replace(/_/g, ' ')} · ${listingMeta.quantityTons} tonnes` : 'Paddy Straw · 12 tonnes'} · Kolhapur District
          </p>
        </div>
      </div>

      {/* Engine Status Banner */}
      <div className="rec-disclaimer" style={{ background: isLive ? '#ecfdf5' : undefined, borderColor: isLive ? '#a7f3d0' : undefined }}>
        {isLive ? <CheckCircle size={15} color="#047857" /> : <Info size={15} />}
        <span>
          {isLive ? (
            <>
              <strong>Live Valuation Engine Active:</strong> Evaluated in real time via PostgreSQL system cost benchmarks and PostGIS buyer matching.
            </>
          ) : (
            <>
              <strong>Decision-Support Notice:</strong> All values compare estimated revenue with transport, handling, and processing deductions to compute Net Realizable Value.
            </>
          )}
        </span>
      </div>

      {/* Break-Even Distance Highlight Card if available */}
      {breakEvenKm !== null && breakEvenKm > 0 && (
        <Card padding="sm" style={{ marginBottom: '1.25rem', borderLeft: '4px solid #047857', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Compass size={22} color="#047857" />
            <div>
              <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                Break-Even Transport Radius: {breakEvenKm} km
              </strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Any buyer located beyond {breakEvenKm} km incurs freight costs higher than the profit of converting this residue into on-farm compost.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Comparison chart */}
      <Card>
        <CardHeader
          title="Revenue vs Cost Comparison"
          subtitle="Estimated Gross Revenue, Deductions, and Net Realizable Value per eligible pathway"
        />
        <div className="rec-chart-wrap" role="img" aria-label="Bar chart comparing gross revenue, costs, and net proceeds for each pathway">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--agri-border-light)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--agri-muted)' }} />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: 'var(--agri-muted)' }} />
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
              {barData.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>₹{row.grossRevenue.toLocaleString('en-IN')}</td>
                  <td>₹{row.totalCost.toLocaleString('en-IN')}</td>
                  <td className="rec-table-net">₹{row.netProceeds.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </Card>

      {/* Pathway Cards */}
      <div className="rec-pathways-list">
        {recommendations.map((rec) => {
          const Icon = rec.icon || TrendingUp;
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
                        #{rec.rank} Best Value
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
                    {rec.distance && rec.distance !== '—' && (
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
                        <span>Handling & baling cost</span>
                        <span>{fmt(rec.handlingCost)}</span>
                      </div>
                      {rec.processingCost > 0 && (
                        <div className="rec-breakdown-row">
                          <span>Processing labor cost</span>
                          <span>{fmt(rec.processingCost)}</span>
                        </div>
                      )}
                      <div className="rec-assumptions">
                        <p className="rec-assumptions-title">Key Economic Assumptions</p>
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
