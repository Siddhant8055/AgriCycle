import { describe, expect, it } from 'vitest';
import { filterListings, sortListings } from './listingUtils';

const listings = [
  { id: 'one', price: '₹1,200/t', qty: '8 tonnes', postedDays: 2, distance: '18 km' },
  { id: 'two', price: '₹550/t', qty: '15 tonnes', postedDays: 1, distance: '42 km' },
  { id: 'three', price: '₹850/t', qty: '12 tonnes', postedDays: 5, distance: '25 km' },
];

describe('sortListings', () => {
  it('sorts listings by newest and nearest distance', () => {
    expect(sortListings(listings, 'newest').map((listing) => listing.id))
      .toEqual(['two', 'one', 'three']);
    expect(sortListings(listings, 'distance').map((listing) => listing.id))
      .toEqual(['one', 'three', 'two']);
  });

  it('sorts currency-formatted prices numerically', () => {
    expect(sortListings(listings, 'price_asc').map((listing) => listing.id))
      .toEqual(['two', 'three', 'one']);
    expect(sortListings(listings, 'price_desc').map((listing) => listing.id))
      .toEqual(['one', 'three', 'two']);
  });

  it('sorts by quantity when Most Quantity is selected', () => {
    expect(sortListings(listings, 'qty_desc').map((listing) => listing.id))
      .toEqual(['two', 'three', 'one']);
  });
});

describe('filterListings', () => {
  const detailedListings = [
    { ...listings[0], crop: 'Paddy Straw', farmer: 'Rajesh Patil', location: 'Hatkanangale', condition: 'Dry', storageForm: 'Baled' },
    { ...listings[1], crop: 'Sugarcane Residue', farmer: 'Mahadev Shinde', location: 'Miraj', condition: 'Semi-dry', storageForm: 'Loose' },
  ];

  it('filters by case-insensitive search across listing details', () => {
    expect(filterListings(detailedListings, { search: 'RAJESH' }).map((listing) => listing.id))
      .toEqual(['one']);
    expect(filterListings(detailedListings, { search: 'miraj' }).map((listing) => listing.id))
      .toEqual(['two']);
  });

  it('combines crop, condition, and inclusive price filters', () => {
    expect(filterListings(detailedListings, {
      crop: 'sugarcane',
      condition: 'Semi-dry',
      minPrice: '1000',
      maxPrice: '1200',
    }).map((listing) => listing.id)).toEqual([]);
    expect(filterListings(detailedListings, {
      crop: 'sugarcane',
      condition: 'Semi-dry',
      minPrice: '500',
      maxPrice: '600',
    }).map((listing) => listing.id)).toEqual(['two']);
  });
});
