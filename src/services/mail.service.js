import transporter from '../config/mailer.js';
import logger from '../config/logger.js';

// Emails the store's fixed notification address with a new order's shipping
// details and line items. Never throws - a failed send shouldn't undo an
// already-persisted order, so callers just fire-and-forget this.
export async function sendOrderNotification(order, items) {
  const rows = items
    .map(
      (item) =>
        `<tr>
          <td>${item.product_sizes.products.name}</td>
          <td>${item.product_sizes.size}</td>
          <td>${item.quantity}</td>
          <td>₹${item.product_sizes.products.selling_price}</td>
        </tr>`
    )
    .join('');

  const total = items.reduce(
    (sum, item) => sum + Number(item.product_sizes.products.selling_price) * Number(item.quantity),
    0
  );

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ORDER_NOTIFICATION_EMAIL,
      subject: `New order #${order.id} - pending approval`,
      html: `
        <h2>New order #${order.id}</h2>
        <p><strong>${order.shipping_name}</strong> (${order.shipping_email})</p>
        <p>${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}</p>
        <table border="1" cellpadding="6" cellspacing="0">
          <thead><tr><th>Product</th><th>Size</th><th>Qty</th><th>Price</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p><strong>Total: ₹${total}</strong></p>
      `,
    });
  } catch (err) {
    logger.error(err, `Failed to send order notification email for order #${order.id}`);
  }
}
