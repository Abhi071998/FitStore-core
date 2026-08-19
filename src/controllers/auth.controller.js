import { register, login } from '../services/auth.service.js';

// Creates a new cust_user account and returns a signed JWT.
export async function registerHandler(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const result = await register({ name, email, password });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// Verifies email/password and returns a signed JWT.
export async function loginHandler(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const result = await login({ email, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
