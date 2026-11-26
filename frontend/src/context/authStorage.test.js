import { describe, expect, it } from 'vitest';
import { parseStoredUser } from './authStorage';

describe('parseStoredUser', () => {
  it('restores a valid AgriCycle user', () => {
    const user = {
      id: 'farmer-001',
      name: 'Rajesh Patil',
      role: 'farmer',
    };

    expect(parseStoredUser(JSON.stringify(user))).toEqual(user);
  });

  it('rejects malformed or incomplete stored data', () => {
    expect(parseStoredUser('{')).toBeNull();
    expect(parseStoredUser(JSON.stringify({ id: 'buyer-001', role: 'buyer' }))).toBeNull();
    expect(parseStoredUser(JSON.stringify({ id: 'admin-001', name: 'Admin', role: 'admin' }))).toBeNull();
    expect(parseStoredUser(null)).toBeNull();
  });
});
