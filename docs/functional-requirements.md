# FitStore Core — Functional Requirements

## What this system is

This is the customer-facing side of FitStore, an online store that sells apparel to **wholesale/bulk buyers** — customers who order in large quantities (tens, hundreds, or thousands of units at a time), not individual shoppers buying one t-shirt.

It works alongside a separate admin system (built in Go) that store staff use to manage products, categories, and stock. This system is what a wholesale customer interacts with: browsing products, building an order, and submitting it.

There are two kinds of people who use this system:
- **Customer (wholesale buyer)** — browses products and places orders.
- **Admin (store staff)** — reviews and approves orders. Admin's own tools live in the separate Go system, but this system notifies them when a new order needs attention.

---

## 1. Account & Login

- A customer can **create an account** with their name, email, and a password.
  - An email can only be used once — the system won't allow two accounts with the same email.
- A customer can **log in** with their email and password.
  - If the password is wrong, or the account doesn't exist, the system rejects the login without saying which one was wrong (a basic security precaution).
- Once logged in, the customer stays "recognized" by the system for a period of time (currently 7 days) without needing to log in again on every visit.
- A customer must be logged in to do anything involving their own bag or orders. Browsing products does not require an account.

## 2. Browsing the Catalog

- A customer can **view all product categories** (e.g. "Shirts," "Hoodies").
- A customer can **view all products within a category**, including:
  - Product name, brand, description, images
  - Price, and the original price if it's discounted
  - Available sizes and how much stock is left in each size

## 3. Shopping Bag

- A customer can **add a product to their bag**, choosing one or more sizes and a quantity for each (e.g. 50 of size M, 30 of size L, in one action).
- If a requested quantity is more than what's currently in stock, the system rejects the request and tells the customer which size(s) don't have enough stock — nothing is added if any size fails this check.
- Adding the same product/size again **adds to** the existing quantity in the bag rather than creating a duplicate entry — the bag always reflects one running total per size.
- A customer can **view everything currently in their bag**.
- A customer can **remove an item from their bag**.
- Items sitting in the bag do **not** reserve stock — a customer building up a large order over several days doesn't lock that stock away from other buyers until they actually place the order.

## 4. Placing an Order

- A customer can **submit their bag as an order**, providing shipping details: name, email, delivery address, city, state, and pincode.
- At the moment of submission, the system:
  1. Checks stock is still available for every item in the bag.
  2. Reserves (deducts) that stock.
  3. Creates the order, with a status of **"pending approval"** — orders are not automatically confirmed, since there is currently no online payment step; a staff member reviews and approves each order manually (see Section 6).
  4. Empties the bag.
- If stock ran out for any single item between the time it was added to the bag and the time of submission, the **entire order submission fails** and nothing is created or reserved — the customer would need to try again with an adjusted quantity.
- Clicking "Place Order" more than once (e.g. an accidental double-click, or a slow connection causing a retry) will never create two orders from the same bag — only the first attempt succeeds, the rest are safely rejected.

## 5. Order History & Cancellation

- A customer can **view their past and current orders**, including:
  - Status (currently: pending approval)
  - Date placed
  - Shipping details submitted
  - Every item ordered: product, size, quantity, price
  - The total order value
- A customer can **cancel an individual item** on an order, but only while that order is still "pending approval" (i.e. before a staff member has acted on it). Cancelling:
  - Returns that item's quantity back to available stock.
  - Marks the item as cancelled — it stays on the order record rather than disappearing, so there's a record of what was cancelled and when.
  - Once an order has been approved or otherwise decided on, the system no longer allows the customer to cancel an item themselves — that would need to go through the admin/staff process instead.

## 6. Notifying Staff of New Orders

- Whenever a customer places an order, a **notification is sent to store staff** (currently via a Telegram message to one or more staff members), including:
  - The order number, customer's shipping details
  - Every item ordered, with size, quantity, and price
  - The total order value
  - A link to the page where staff can review and approve the order
- More than one staff member can be set up to receive these notifications at once.

---

## Explicitly out of scope (for now)

- **Online payment** is not implemented. Orders go into a manual "pending approval" state instead of being paid for and confirmed automatically.
- **Bulk/tiered pricing** (different price per unit depending on quantity ordered) is not implemented — price is always the product's listed price.
- **Approving or rejecting an order** is not done in this system — that happens in the separate admin (Go) system, which shares the same database.
