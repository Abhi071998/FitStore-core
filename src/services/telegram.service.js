import logger from '../config/logger.js';

// Stands in for sendOrderNotification from mail.service.js - same shape,
// swapped in because Render blocks outbound SMTP entirely (confirmed via
// ETIMEDOUT on both port 587 and a literal IPv4 address). Telegram's API
// is a plain HTTPS POST, which isn't affected by that block.
export async function sendOrderNotification(order, items) {
  const lines = items.map(
    (item) =>
      `- ${item.product_sizes.products.name} (${item.product_sizes.size}) x${item.quantity} @ Rs.${item.product_sizes.products.selling_price}`
  );

  const total = items.reduce(
    (sum, item) => sum + Number(item.product_sizes.products.selling_price) * Number(item.quantity),
    0
  );

  const text = [
    `New order #${order.id} - pending approval`,
    `${order.shipping_name} (${order.shipping_email})`,
    `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}`,
    '',
    ...lines,
    '',
    `Total: Rs.${total}`,
    '',
    `To approve, go to: ${process.env.FRONTEND_URL}`,
  ].join('\n');

  try {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
    });

    if (!res.ok) {
      throw new Error(`Telegram API responded ${res.status}: ${await res.text()}`);
    }

    logger.info(`Order notification sent to Telegram for order #${order.id}`);
  } catch (err) {
    logger.error(err, `Failed to send Telegram order notification for order #${order.id}`);
  }
}
