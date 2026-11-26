const authService = require('./auth.service');

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, latitude, longitude, address } = req.body;
    const data = await authService.register({
      name,
      email,
      phone,
      password,
      role,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      address,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, phone, identifier, password } = req.body;
    const data = await authService.login({
      email,
      phone,
      identifier,
      password,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
