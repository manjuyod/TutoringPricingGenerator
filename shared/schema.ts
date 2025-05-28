import { pgTable, text, serial, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Pricing form schema
export const pricingFormSchema = z.object({
  hourlyRate: z.number().min(0.01, "Hourly rate must be greater than 0"),
  weeklyHours: z.enum(["2-8", "4-16"], {
    required_error: "Please select a weekly hours range",
  }),
  beginningReading: z.number().min(0).max(400),
  reading: z.number().min(0).max(400),
  writing: z.number().min(0).max(400),
  math: z.number().min(0).max(400),
  tutorUp: z.number().min(0).max(400),
  testPrep: z.number().min(0).max(400),
  packageRange: z.enum(["64,96,128,192", "96,128,160,192", "96,128,192,256", "128,256,320,400"], {
    required_error: "Please select a package range",
  }),
  prepayDiscounts: z.record(z.string(), z.number().min(0).max(100)),
  interestDiscounts: z.record(z.string(), z.number().min(0).max(100)),
});

export type PricingFormData = z.infer<typeof pricingFormSchema>;

// Default discount values
export const defaultPrepayDiscounts = {
  "64": 10,
  "96": 15,
  "128": 20,
  "160": 25,
  "192": 30,
  "256": 35,
  "320": 40,
  "400": 40,
};

export const defaultInterestDiscounts = {
  "64": 5,
  "96": 10,
  "128": 15,
  "160": 20,
  "192": 25,
  "256": 30,
  "320": 35,
  "400": 35,
};
