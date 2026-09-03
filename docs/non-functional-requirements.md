# FitStore Core — Non-Functional Requirements

This document explains **how the system behaves** — its quality, safety, and reliability promises — rather than what features it has (see `functional-requirements.md` for that). It's written for anyone to read, no technical background needed.

---

## 1. Security

- **Passwords are never stored in readable form.** When a customer sets a password, the system scrambles it using one-way encryption before saving it. Nobody — not even someone with direct access to the database — can look up what a customer's actual password is, only whether an entered password matches.
- **Each customer can only see and manage their own information.** A logged-in customer cannot view or change another customer's bag or orders, even by guessing at IDs or URLs — every request is checked against who is actually logged in.
- **Logins expire.** Being logged in doesn't last forever — after a set period (currently 7 days), a customer needs to log in again. This limits how long a stolen or leaked login session could be misused.
- **Failed login attempts don't reveal which part was wrong.** If a login fails, the system says only "invalid email or password," never confirming whether the email exists at all — this makes it harder for someone to hunt for valid customer emails.
- **Sensitive configuration (passwords, API keys, database credentials) is kept out of the codebase itself**, stored separately as environment configuration, so it's never accidentally shared or published alongside the code.

## 2. Never Overselling Stock

- The system guarantees that **stock can never be promised to more customers than actually exists.** Even if many wholesale buyers try to order the same product/size at the exact same moment, the system checks and reserves stock as one uninterruptible step, so it's impossible for two orders to both succeed against the same units of stock.
- **Adding items to a shopping bag does not lock away stock.** A customer can browse and build up a large order over several days without preventing other customers from buying that same stock in the meantime. Stock is only actually reserved the moment an order is placed, not while it's just sitting in someone's bag.
- **Cancelling an order item correctly gives the stock back**, so it becomes available to other customers again — this only happens for orders that haven't yet been approved by staff.

## 3. No Duplicate Orders

- Placing an order twice by accident — a double-click, a slow connection causing a retry — is guaranteed to only ever create **one** order and reserve stock **once**. The system was specifically tested against this scenario (multiple order attempts fired at the same time) to confirm only the first succeeds.

## 4. Record-Keeping & Accountability

- When something is removed or cancelled (a category, a customer account, an order item), the system generally **does not permanently erase it** — it's marked as removed/cancelled but kept on record. This preserves a history for accountability, dispute resolution, and reporting, rather than silently losing information.
- Every order stores a permanent snapshot of the price at the time it was placed, so a later price change on a product never retroactively changes the total of an order that already happened.

## 5. Notifications Reach Staff Reliably

- When a new order comes in, staff are notified via Telegram (chosen after discovering that regular email delivery was unreliable from where this system is hosted — some hosting providers block traditional email-sending traffic as a security measure).
- More than one staff member can be registered to receive these notifications, so responsibility for reviewing new orders isn't dependent on a single person.
- If a notification fails to send for some reason, this does not affect the order itself — the order is always safely saved first; the notification is a best-effort convenience on top of that, not something the order depends on to exist.

## 6. Shared, Consistent Data with the Admin System

- This system and the internal staff admin system read and write the **same underlying data** (products, stock, categories, orders) — a wholesale buyer always sees the same up-to-date product and stock information that staff see on their side, with no separate copies that could drift out of sync.
- The two systems are built and maintained separately (this one in Node.js, the admin one in Go), but changes to shared information—like a product going out of stock—are reflected to both immediately, since there's only one shared source of truth.

## 7. Hosting & Availability

- The system is hosted on a cloud platform (Render), meaning it doesn't depend on any single physical computer or office location to stay running, and it's reachable over the internet at all times.
- The database is hosted separately (Neon), a managed cloud database service, rather than living on the same machine as the application — this keeps the data safe and available independently of the application's own uptime.

## 8. Built for Maintainability

- The system is built using widely-used, well-documented, actively maintained tools (Node.js, Express, Prisma) rather than obscure or custom-built technology — this means it's realistic for another developer to pick up, understand, and continue building on in the future, not dependent on one person's specialized knowledge.
- The codebase is organized so that each piece of functionality (login, browsing products, the bag, orders) lives in its own clearly-named, separated place, making it easier to find, fix, or extend any one part without risking the others.

---

## Known limitation, honestly stated

There is currently no automated payment processing — every order requires a staff member to manually review and approve it before it becomes a confirmed sale. This is a deliberate, temporary design choice while the business decides on a payment approach suited to wholesale ordering, not an oversight.
