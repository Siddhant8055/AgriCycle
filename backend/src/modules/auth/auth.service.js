const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/database');
const { config } = require('../../config/environment');
const { AppError } = require('../../middlewares/errorHandler');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      name: user.name,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

const formatLocation = (loc) => {
  if (!loc) return null;
  if (typeof loc === 'object') return loc;
  const match = String(loc).match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (match) {
    const lng = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    return {
      type: 'Point',
      coordinates: [lng, lat],
      longitude: lng,
      latitude: lat,
    };
  }
  return loc;
};

const sanitizeUser = (user) => {
  const { password_hash, ...safeUser } = user;
  return {
    ...safeUser,
    location: formatLocation(safeUser.location),
  };
};

class AuthService {
  async register({ name, email, phone, password, role = 'FARMER', latitude, longitude, address }) {
    if (!name || (!email && !phone) || !password) {
      throw new AppError('Name, password, and at least one contact (email or phone) are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    const normalizedRole = role.toUpperCase();
    if (!['FARMER', 'BUYER', 'ADMIN'].includes(normalizedRole)) {
      throw new AppError('Role must be FARMER, BUYER, or ADMIN', 400);
    }

    // Check if email or phone already exists
    const existingCheck = await pool.query(
      `SELECT id FROM users 
       WHERE ($1::text IS NOT NULL AND email = $1) 
          OR ($2::text IS NOT NULL AND phone = $2);`,
      [email || null, phone || null]
    );

    if (existingCheck.rows.length > 0) {
      throw new AppError('A user with this email or phone number already exists', 409, 'USER_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let locationValue = null;
    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
      locationValue = `SRID=4326;POINT(${longitude} ${latitude})`;
    }

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role, address, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, phone, role, address, is_active, created_at, location;`,
      [name, email || null, phone || null, passwordHash, normalizedRole, address || null, locationValue]
    );

    const newUser = sanitizeUser(result.rows[0]);
    const token = generateToken(newUser);

    return { user: newUser, token };
  }

  async login({ email, phone, identifier, password }) {
    const loginIdentifier = identifier || email || phone;
    if (!loginIdentifier || !password) {
      throw new AppError('Email/phone and password are required', 400);
    }

    const result = await pool.query(
      `SELECT id, name, email, phone, password_hash, role, address, is_active, created_at, location
       FROM users 
       WHERE email = $1 OR phone = $1;`,
      [loginIdentifier.trim()]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid email/phone or password', 401, 'INVALID_CREDENTIALS');
    }

    const user = result.rows[0];

    if (!user.is_active) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403, 'ACCOUNT_INACTIVE');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email/phone or password', 401, 'INVALID_CREDENTIALS');
    }

    const safeUser = sanitizeUser(user);
    const token = generateToken(safeUser);
    return { user: safeUser, token };
  }

  async getProfile(userId) {
    const result = await pool.query(
      `SELECT id, name, email, phone, role, address, is_active, created_at, location
       FROM users 
       WHERE id = $1;`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User profile not found', 404, 'USER_NOT_FOUND');
    }

    return sanitizeUser(result.rows[0]);
  }
}

module.exports = new AuthService();
