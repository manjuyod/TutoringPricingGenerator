import { pgTable, text, serial } from "drizzle-orm/pg-core";
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

const pricingVersions = ["tiered", "payment-plan"] as const;
const weeklyHourRanges = ["2-8", "4-16"] as const;
const packageRanges = ["64,96,128,192", "96,128,160,192", "96,128,192,256", "128,256,320,400"] as const;

// Pricing form schema
export const pricingFormSchema = z.object({
  version: z.enum(pricingVersions, {
    error: "Please select a pricing sheet version",
  }),
  hourlyRate: z.number().min(0.01, "Hourly rate must be greater than 0"),
  weeklyHours: z.enum(weeklyHourRanges, {
    error: "Please select a weekly hours range",
  }),
  beginningReading: z.number().min(0).max(400),
  reading: z.number().min(0).max(400),
  writing: z.number().min(0).max(400),
  math: z.number().min(0).max(400),
  tutorUp: z.number().min(0).max(400),
  testPrep: z.number().min(0).max(400),
  packageRange: z.enum(packageRanges, {
    error: "Please select a package range",
  }).optional(),
  prepayDiscounts: z.record(z.string(), z.number().min(0).max(100)),
  interestDiscounts: z.record(z.string(), z.number().min(0).max(100)),
  eighteenMonthDiscounts: z.record(z.string(), z.number().min(0).max(100)),
  twentyFourMonthDiscounts: z.record(z.string(), z.number().min(0).max(100)),
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

export const defaultEighteenMonthDiscounts = {
  "64": 0,
  "96": 5,
  "128": 10,
  "160": 15,
  "192": 20,
  "256": 25,
  "320": 30,
  "400": 30,
};

export const defaultTwentyFourMonthDiscounts = {
  "64": 0,
  "96": 0,
  "128": 5,
  "160": 10,
  "192": 15,
  "256": 20,
  "320": 25,
  "400": 25,
};
