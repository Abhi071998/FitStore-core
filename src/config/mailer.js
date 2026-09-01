import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  // smtp.gmail.com resolves to an IPv6 address on some hosts (e.g. Render),
  // and outbound IPv6 there is unreachable - force IPv4 so the connection
  // actually succeeds instead of hanging on ENETUNREACH.
  family: 4,
});

export default transporter;
