import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const promoSubscriptions = pgTable("promo_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),

  stripeCheckoutSessionId: text("stripe_checkout_session_id")
    .notNull()
    .unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeLatestInvoiceId: text("stripe_latest_invoice_id"),

  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  passHolderName: text("pass_holder_name"),

  promoType: text("promo_type").notNull(),

  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  trialStartAt: timestamp("trial_start_at", { withTimezone: true }).notNull(),
  trialEndAt: timestamp("trial_end_at", { withTimezone: true }).notNull(),
  paidStartAt: timestamp("paid_start_at", { withTimezone: true }).notNull(),
  paidEndAt: timestamp("paid_end_at", { withTimezone: true }).notNull(),
  cancelAt: timestamp("cancel_at", { withTimezone: true }).notNull(),

  billingStatus: text("billing_status").notNull().default("checkout_created"),
  accessStatus: text("access_status").notNull().default("pending"),

  passkitPassId: text("passkit_pass_id").unique(),
  smartLinkUrl: text("smart_link_url"),
  receiptUrl: text("receipt_url"),

  emailTrialSentAt: timestamp("email_trial_sent_at", { withTimezone: true }),
  emailPaidSentAt: timestamp("email_paid_sent_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const circle = pgTable("circle", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  mobile: text("mobile").notNull(),
  memberType: text("member_type").notNull(),
  venueName: text("venue_name"),
  perksPrivileges: text("perks_privileges"),

  passType: text("pass_type").notNull().default("complimentary"),
  passStatus: text("pass_status").notNull().default("active"),
  passkitPassId: text("passkit_pass_id").unique(),
  smartLinkUrl: text("smart_link_url"),
  validFrom: timestamp("valid_from", { withTimezone: true })
    .defaultNow()
    .notNull(),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  emailSentAt: timestamp("email_sent_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
