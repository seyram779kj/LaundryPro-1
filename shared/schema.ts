import { pgTable, text, serial, integer, timestamp, real, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model - shared between clients and providers
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  userType: text("user_type").notNull(), // "client" or "provider"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Address model
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  isDefault: boolean("is_default").default(false),
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
});

// Providers model - extends user information for providers
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  description: text("description"),
  serviceAreas: json("service_areas").$type<string[]>(),
  rating: real("rating"),
});

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  rating: true,
});

// Service types
export const serviceTypes = pgTable("service_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  pricePerUnit: real("price_per_unit").notNull(),
  unit: text("unit").notNull(), // e.g., "lb", "item"
  providerId: integer("provider_id").references(() => providers.id),
  isActive: boolean("is_active").default(true),
});

export const insertServiceTypeSchema = createInsertSchema(serviceTypes).omit({
  id: true,
});

// Orders model
export const orderStatuses = [
  "pending",
  "confirmed",
  "picked_up",
  "in_progress",
  "quality_check",
  "ready_for_delivery",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
] as const;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id),
  providerId: integer("provider_id").references(() => providers.id),
  serviceTypeId: integer("service_type_id").references(() => serviceTypes.id),
  status: text("status").$type<(typeof orderStatuses)[number]>().default("pending"),
  quantity: real("quantity").notNull(), // either weight or number of items
  specialInstructions: text("special_instructions"),
  pickupAddressId: integer("pickup_address_id").references(() => addresses.id),
  deliveryAddressId: integer("delivery_address_id").references(() => addresses.id),
  scheduledPickupTime: timestamp("scheduled_pickup_time"),
  scheduledDeliveryTime: timestamp("scheduled_delivery_time"),
  actualPickupTime: timestamp("actual_pickup_time"),
  actualDeliveryTime: timestamp("actual_delivery_time"),
  total: real("total"),
  tax: real("tax"),
  deliveryFee: real("delivery_fee"),
  orderNumber: text("order_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  actualPickupTime: true,
  actualDeliveryTime: true,
  updatedAt: true,
  createdAt: true,
  orderNumber: true
});

// Order status updates
export const orderStatusUpdates = pgTable("order_status_updates", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  status: text("status").$type<(typeof orderStatuses)[number]>().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderStatusUpdateSchema = createInsertSchema(orderStatusUpdates).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;

export type ServiceType = typeof serviceTypes.$inferSelect;
export type InsertServiceType = z.infer<typeof insertServiceTypeSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderStatusUpdate = typeof orderStatusUpdates.$inferSelect;
export type InsertOrderStatusUpdate = z.infer<typeof insertOrderStatusUpdateSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
