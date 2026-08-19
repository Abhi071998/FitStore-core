import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const SALT_ROUNDS = 10;

// Signs a JWT carrying the cust_user's id and email.
function signToken(custUser) {
  return jwt.sign({ sub: custUser.id.toString(), email: custUser.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

// Creates a cust_user with a hashed password, rejecting duplicate emails.
export async function register({ name, email, password }) {
  const existing = await prisma.cust_user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const custUser = await prisma.cust_user.create({
    data: { name, email, password: hashed },
  });

  return { token: signToken(custUser), user: { id: custUser.id, name: custUser.name, email: custUser.email } };
}

// Checks email/password against the stored hash and returns a token on success.
export async function login({ email, password }) {
  const custUser = await prisma.cust_user.findFirst({ where: { email, deleted_at: null } });
  if (!custUser) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, custUser.password);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  return { token: signToken(custUser), user: { id: custUser.id, name: custUser.name, email: custUser.email } };
}
