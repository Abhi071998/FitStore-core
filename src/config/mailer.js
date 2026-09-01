import nodemailer from 'nodemailer';
import dns from 'node:dns/promises';
import logger from './logger.js';

const smtpHost = process.env.SMTP_HOST;

// Some hosts (Render included) have no working outbound IPv6 route, but
// smtp.gmail.com is dual-stack - neither `family: 4` on the transport nor
// dns.setDefaultResultOrder('ipv4first') stopped it from still dialing the
// IPv6 address and failing with ENETUNREACH. Resolving to a literal IPv4
// address ourselves removes the ambiguity entirely: there's no other
// address left for the connection layer to pick.
async function resolveSmtpHost() {
  try {
    const { address } = await dns.lookup(smtpHost, { family: 4 });
    return address;
  } catch (err) {
    logger.error(err, `Failed to resolve ${smtpHost} to an IPv4 address, falling back to hostname`);
    return smtpHost;
  }
}

const transporter = nodemailer.createTransport({
  host: await resolveSmtpHost(),
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  // Connecting via a bare IP means TLS needs to be told which hostname's
  // certificate to actually validate against.
  tls: { servername: smtpHost },
});

export default transporter;
