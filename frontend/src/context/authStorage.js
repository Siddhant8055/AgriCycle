const VALID_ROLES = new Set(['farmer', 'buyer']);

export function parseStoredUser(value) {
  if (!value) return null;

  try {
    const user = JSON.parse(value);
    if (
      !user ||
      typeof user !== 'object' ||
      typeof user.id !== 'string' ||
      typeof user.name !== 'string' ||
      !VALID_ROLES.has(user.role)
    ) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
