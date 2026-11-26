import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowDownWideNarrow, ArrowRight, Bookmark, Grid2X2,
  List, MapPin, Package, Scale, Search, SlidersHorizontal, X,
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { filterListings, sortListings } from './listingUtils';
import apiClient from '../../lib/apiClient.js';
import './BuyerMarketplace.css';

const DEMO_LISTINGS = [
  {
    id: '1', crop: 'Paddy Straw', emoji: '🌾',
    qty: '12 tonnes', condition: 'Dry', storageForm: 'Baled',
    location: 'Hatkanangale, Kolhapur', distance: '18 km',
    price: '₹850/t', askingTotal: '₹10,200',
    status: 'active', farmer: 'Rajesh Patil',
    uses: ['Compost', 'Animal Feed', 'Biochar'],
    postedDays: 2,
  },
  {
    id: '2', crop: 'Sugarcane Residue', emoji: '🎋',
    qty: '8 tonnes', condition: 'Semi-dry', storageForm: 'Loose',
    location: 'Miraj, Sangli', distance: '32 km',
    price: '₹1,200/t', askingTotal: '₹9,600',
    status: 'active', farmer: 'Mahadev Shinde',
    uses: ['Biogas', 'Compost', 'Paper Pulp'],
    postedDays: 5,
  },
  {
    id: '3', crop: 'Wheat Straw', emoji: '🌱',
    qty: '15 tonnes', condition: 'Dry', storageForm: 'Baled',
    location: 'Shirol, Kolhapur', distance: '25 km',
    price: '₹600/t', askingTotal: '₹9,000',
    status: 'active', farmer: 'Sunita Kamble',
    uses: ['Animal Feed', 'Compost', 'Mushroom Growing'],
    postedDays: 1,
  },
  {
    id: '4', crop: 'Soybean Stover', emoji: '🌿',
    qty: '6 tonnes', condition: 'Dry', storageForm: 'Chopped',
    location: 'Kagal, Kolhapur', distance: '42 km',
    price: '₹750/t', askingTotal: '₹4,500',
    status: 'active', farmer: 'Prashant Mane',
    uses: ['Compost', 'Biochar'],
    postedDays: 3,
  },
  {
    id: '5', crop: 'Cotton Stalks', emoji: '🌸',
    qty: '10 tonnes', condition: 'Dry', storageForm: 'Loose',
    location: 'Sangli', distance: '55 km',
    price: '₹550/t', askingTotal: '₹5,500',
    status: 'active', farmer: 'Vikas Desai',
    uses: ['Biochar', 'Compost'],
    postedDays: 7,
  },
  {
    id: '6', crop: 'Maize Stalks', emoji: '🌽',
    qty: '20 tonnes', condition: 'Semi-dry', storageForm: 'Loose',
    location: 'Ichalkaranji, Kolhapur', distance: '22 km',
    price: '₹500/t', askingTotal: '₹10,000',
    status: 'active', farmer: 'Anand Patil',
    uses: ['Animal Feed', 'Biogas'],
    postedDays: 4,
  },
];

const CROP_FILTER_OPTIONS = [
  { value: '', label: 'All Crop Types' },
  { value: 'paddy', label: 'Paddy Straw' },
  { value: 'sugarcane', label: 'Sugarcane Residue' },
  { value: 'wheat', label: 'Wheat Straw' },
  { value: 'soybean', label: 'Soybean Stover' },
  { value: 'cotton', label: 'Cotton Stalks' },
  { value: 'maize', label: 'Maize Stalks' },
];

const CONDITION_OPTIONS = [
  { value: '', label: 'Any Condition' },
  { value: 'Dry', label: 'Dry' },
  { value: 'Semi-dry', label: 'Semi-dry' },
  { value: 'Fresh', label: 'Fresh' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'distance', label: 'Nearest First' },
];

const FAVORITES_STORAGE_KEY = 'agricycle_marketplace_favorites';
const MAX_COMPARISON_ITEMS = 3;

function readFavoriteIds() {
  try {
    const saved = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!saved) return { ids: [], error: '' };
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.some((id) => typeof id !== 'string')) {
      return { ids: [], error: 'Saved favorites could not be read. You can continue saving favorites for this visit.' };
    }
    return { ids: parsed, error: '' };
  } catch {
    return { ids: [], error: 'Browser storage is unavailable. Favorites will only be saved for this visit.' };
  }
}

export default function BuyerMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [cropFilter, setCropFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid');
  const [favoriteState] = useState(readFavoriteIds);
  const [favoriteIds, setFavoriteIds] = useState(favoriteState.ids);
  const [storageMessage, setStorageMessage] = useState(favoriteState.error);
  const [comparisonIds, setComparisonIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState(DEMO_LISTINGS);

  useEffect(() => {
    let isMounted = true;
    async function loadListings() {
      try {
        const res = await apiClient.get('/listings?status=ACTIVE');
        if (isMounted && res.data?.success && res.data?.data?.length > 0) {
          setListings(res.data.data);
        }
      } catch (err) {
        console.warn('Marketplace fallback loaded:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadListings();
    return () => { isMounted = false; };
  }, []);

  const updateSearch = (value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value.trim()) next.set('search', value);
      else next.delete('search');
      return next;
    }, { replace: true });
  };

  const filtered = useMemo(() => {
    const matches = filterListings(listings, {
      search,
      crop: cropFilter,
      condition: conditionFilter,
      minPrice,
      maxPrice,
    });
    return sortListings(matches, sort);
  }, [listings, search, cropFilter, conditionFilter, minPrice, maxPrice, sort]);

  const activeFilterCount = [
    search.trim(),
    cropFilter,
    conditionFilter,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;
  const invalidPriceRange = minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice);
  const comparisonListings = listings.filter((listing) => comparisonIds.includes(listing.id));

  const clearFilters = () => {
    updateSearch('');
    setCropFilter('');
    setConditionFilter('');
    setMinPrice('');
    setMaxPrice('');
  };

  const toggleFavorite = (listingId) => {
    const next = favoriteIds.includes(listingId)
      ? favoriteIds.filter((id) => id !== listingId)
      : [...favoriteIds, listingId];
    setFavoriteIds(next);
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      setStorageMessage('');
    } catch {
      setStorageMessage('Browser storage is unavailable. Favorites will only be saved for this visit.');
    }
  };

  const toggleComparison = (listingId) => {
    setComparisonIds((current) => {
      if (current.includes(listingId)) return current.filter((id) => id !== listingId);
      if (current.length >= MAX_COMPARISON_ITEMS) return current;
      return [...current, listingId];
    });
  };

  return (
    <AppShell pageTitle="Marketplace">
      {/* Banner */}
      <div className="marketplace-banner">
        <div>
          <h2 className="marketplace-banner-title">Browse Crop Waste Listings</h2>
          <p className="marketplace-banner-sub">
            Discover agricultural residues from farmers across Western Maharashtra.
            Prices are farmer asking prices, not confirmed offers.
          </p>
        </div>
        <Link to="/buyer/geo">
          <Button variant="white" leftIcon={<MapPin size={16} />}>Map View</Button>
        </Link>
      </div>

      <Card padding="md" className="marketplace-filter-card">
        <div className="marketplace-filter-heading">
          <div className="marketplace-filter-title">
            <SlidersHorizontal size={17} aria-hidden="true" />
            <h2>Find crop residue</h2>
          </div>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all <span className="active-filter-count">{activeFilterCount}</span>
            </Button>
          )}
        </div>
        <div className="marketplace-filters">
          <div className="marketplace-search">
            <Search size={16} className="market-search-icon" />
            <input
              type="search"
              placeholder="Search by crop, location, farmer..."
              className="market-search-input"
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              aria-label="Search listings"
            />
            {search && (
              <button
                type="button"
                className="market-search-clear"
                onClick={() => updateSearch('')}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <Select
            id="cropFilter"
            aria-label="Filter by crop type"
            options={CROP_FILTER_OPTIONS}
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="filter-select"
          />
          <Select
            id="conditionFilter"
            aria-label="Filter by condition"
            options={CONDITION_OPTIONS}
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="filter-select"
          />
          <Input
            id="minPrice"
            type="number"
            min="0"
            step="1"
            label="Min price / tonne"
            placeholder="₹ min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            aria-invalid={invalidPriceRange}
            className="price-filter"
          />
          <Input
            id="maxPrice"
            type="number"
            min="0"
            step="1"
            label="Max price / tonne"
            placeholder="₹ max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-invalid={invalidPriceRange}
            className="price-filter"
          />
        </div>
        {invalidPriceRange && (
          <p className="market-filter-error" role="alert">Minimum price must be less than or equal to maximum price.</p>
        )}
      </Card>

      <div className="market-results-bar">
        <div>
          <p className="market-results-count" aria-live="polite">
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
            {activeFilterCount > 0 ? ' matching your filters' : ''}
          </p>
          <p className="market-demo-note">Illustrative demo data — not real market prices or actual farmers</p>
        </div>
        <div className="market-results-controls">
          <label className="market-sort-control">
            <ArrowDownWideNarrow size={15} aria-hidden="true" />
            <span className="sr-only">Sort listings</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort listings">
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <div className="market-view-toggle" role="group" aria-label="Listing layout">
            <button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-pressed={view === 'grid'} aria-label="Grid view">
              <Grid2X2 size={17} />
            </button>
            <button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-pressed={view === 'list'} aria-label="List view">
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {storageMessage && <p className="market-storage-message" role="status">{storageMessage}</p>}

      {isLoading ? (
        <div className={`listings-grid listings-${view}`} aria-label="Loading demo listings" aria-busy="true">
          {Array.from({ length: 6 }, (_, index) => <ListingSkeleton key={index} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card padding="lg">
          <div className="market-empty">
            <div className="market-empty-icon" aria-hidden="true">🌾</div>
            <h3>{DEMO_LISTINGS.length === 0 ? 'No demo listings yet' : 'No listings match your search'}</h3>
            <p>{DEMO_LISTINGS.length === 0 ? 'Demo crop-residue listings will appear here.' : 'Try a different search or relax one or more filters.'}</p>
            {activeFilterCount > 0 && <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>}
          </div>
        </Card>
      ) : (
        <div className={`listings-grid listings-${view}`}>
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isFavorite={favoriteIds.includes(listing.id)}
              isCompared={comparisonIds.includes(listing.id)}
              comparisonDisabled={comparisonIds.length >= MAX_COMPARISON_ITEMS}
              onToggleFavorite={toggleFavorite}
              onToggleComparison={toggleComparison}
            />
          ))}
        </div>
      )}

      {comparisonIds.length > 0 && (
        <ComparisonPanel listings={comparisonListings} onRemove={toggleComparison} onClear={() => setComparisonIds([])} />
      )}
    </AppShell>
  );
}

function ListingCard({
  listing,
  isFavorite,
  isCompared,
  comparisonDisabled,
  onToggleFavorite,
  onToggleComparison,
}) {
  return (
    <Card padding="none" className="listing-card animate-fadeIn">
      <div className="listing-card-media">
        <span role="img" aria-label={`${listing.crop} illustration`}>{listing.emoji}</span>
        <StatusBadge status={listing.status} />
        <button
          type="button"
          className={`listing-favorite ${isFavorite ? 'is-favorite' : ''}`}
          onClick={() => onToggleFavorite(listing.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remove ${listing.crop} from saved listings` : `Save ${listing.crop}`}
          title={isFavorite ? 'Remove from saved listings' : 'Save listing'}
        >
          <Bookmark size={17} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="listing-card-content">
        <div className="listing-card-header">
          <div className="listing-card-title-group">
            <h3 className="listing-card-title">{listing.crop}</h3>
            <p className="listing-card-farmer">Offered by <strong>{listing.farmer}</strong></p>
          </div>
        </div>

        <div className="listing-card-price-block">
          <p className="listing-card-price">{listing.price}</p>
          <span>per tonne</span>
        </div>

        <div className="listing-card-details">
          <div className="listing-detail">
            <Scale size={14} />
            <span>{listing.qty} available</span>
          </div>
          <div className="listing-detail">
            <Package size={14} />
            <span>{listing.storageForm} storage</span>
            <Badge variant={listing.condition === 'Dry' ? 'success' : 'warning'} size="sm">{listing.condition}</Badge>
          </div>
          <div className="listing-detail">
            <MapPin size={14} />
            <span>{listing.location}</span>
            <span className="listing-distance">{listing.distance}</span>
          </div>
        </div>

        <div className="listing-uses">
          {listing.uses.slice(0, 3).map((use) => (
            <Badge key={use} variant="primary" size="sm">{use}</Badge>
          ))}
        </div>

        <div className="listing-card-footer">
          <span className="listing-card-posted">Posted {listing.postedDays}d ago</span>
          <label className="listing-compare-control">
            <input
              type="checkbox"
              checked={isCompared}
              disabled={!isCompared && comparisonDisabled}
              onChange={() => onToggleComparison(listing.id)}
              aria-label={`${isCompared ? 'Remove' : 'Add'} ${listing.crop} ${isCompared ? 'from' : 'to'} comparison`}
            />
            <span>Compare</span>
          </label>
          <Link to={`/buyer/listings/${listing.id}`} className="listing-details-link">
            View details <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

function ListingSkeleton() {
  return (
    <Card padding="none" className="listing-skeleton" aria-hidden="true">
      <div className="skeleton skeleton-media" />
      <div className="listing-skeleton-content">
        <div className="skeleton skeleton-line skeleton-line-title" />
        <div className="skeleton skeleton-line skeleton-line-short" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-line-short" />
      </div>
    </Card>
  );
}

function ComparisonPanel({ listings, onRemove, onClear }) {
  return (
    <Card className="comparison-panel" padding="md">
      <div className="comparison-header">
        <div>
          <h2>Compare listings <span>{listings.length} / {MAX_COMPARISON_ITEMS}</span></h2>
          <p>Compare the demo listing details side by side.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} leftIcon={<X size={15} />}>Clear comparison</Button>
      </div>
      <div className="comparison-table-wrap" role="region" aria-label="Listing comparison" tabIndex={0}>
        <table className="comparison-table">
          <thead>
            <tr>
              <th scope="col">Listing</th>
              {listings.map((listing) => (
                <th scope="col" key={listing.id}>
                  <span>{listing.emoji} {listing.crop}</span>
                  <button type="button" onClick={() => onRemove(listing.id)} aria-label={`Remove ${listing.crop} from comparison`}>
                    <X size={14} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Price / tonne', (listing) => listing.price],
              ['Quantity', (listing) => listing.qty],
              ['Condition', (listing) => listing.condition],
              ['Storage', (listing) => listing.storageForm],
              ['Farmer', (listing) => listing.farmer],
              ['Location', (listing) => `${listing.location} · ${listing.distance}`],
            ].map(([label, valueFor]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {listings.map((listing) => <td key={listing.id}>{valueFor(listing)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
