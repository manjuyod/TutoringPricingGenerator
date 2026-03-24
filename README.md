# Tutoring Pricing Generator

## Overview

Tutoring Pricing Generator is a full-stack TypeScript application used to create branded Tutoring Club pricing sheets. The app lets a staff member enter a tutoring rate, recommended weekly hours, subject-specific hour allocations, pricing-sheet type, and discount settings, then generates a downloadable PDF for parent-facing use.

The current implementation is primarily a client-side workflow served through an Express host. The pricing logic and PDF generation run in the browser. The server exists mainly to host the app and provide room for future API and persistence work.

## Current Product Capabilities

- Supports two pricing sheet modes:
  - `tiered`: package-based pricing across predefined hour bundles
  - `payment-plan`: one recommended total-hour plan with monthly financing terms
- In `tiered` mode, exposes four editable discount groups per selected package:
  - Prepay
  - 12-month financing
  - 18-month financing
  - 24-month financing
- Collects subject recommendations across six program areas:
  - Beginning Reading/Phonics
  - Reading
  - Writing
  - Math
  - TutorUp
  - Test Prep
- Calculates:
  - total recommended hours
  - projected timeline by weekly tutoring pace
  - monthly tuition costs
  - prepay discounts and savings
  - financing discounts, totals, and monthly payment amounts
- Shows a live sidebar preview while the form is edited
- Generates branded PDF output using `jsPDF`, `html2canvas`, and `jspdf-autotable`

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Wouter
- Forms and validation: React Hook Form, Zod, `@hookform/resolvers`
- Styling: Tailwind CSS, shadcn/ui, Radix UI
- PDF generation: `jsPDF`, `html2canvas`, `jspdf-autotable`, `@react-pdf/renderer`
- Backend host: Express on Node.js
- Data layer scaffold: Drizzle ORM, PostgreSQL config, in-memory storage abstraction
- Tooling: ESLint, TypeScript, esbuild, cross-env

## Architecture

### Runtime model

- `server/index.ts` starts a single Express process on port `5000`
- In development, Express mounts Vite middleware from `server/vite.ts`
- In production, Express serves the Vite build from `dist/public`
- The browser hosts the actual product behavior:
  - form state
  - validation
  - pricing calculations
  - live preview
  - PDF generation

### Frontend structure

- `client/src/pages/pricing-generator.tsx`
  - top-level page layout
  - coordinates form, preview, and PDF action
- `client/src/components/PricingForm.tsx`
  - primary form UI
  - uses React Hook Form and Zod-backed validation
  - emits normalized form data upward on change
- `client/src/components/LivePreview.tsx`
  - displays total hours, selected subjects, and timeline projections
- `client/src/components/PDFGenerator.tsx`
  - triggers client-side PDF generation
- `client/src/lib/pricingCalculations.ts`
  - contains business calculations used by preview and PDF output
- `client/src/lib/htmlToPdfGenerator.ts`
  - main PDF pipeline used in the live app
- `client/src/lib/simplePdfGenerator.ts`
  - simpler alternative generator, not the primary active path
- `client/src/lib/pdfUtils.tsx`
  - React PDF document definition, currently not wired into the main UI flow

### Backend structure

- `server/routes.ts`
  - route registration placeholder
  - currently exposes no product-specific API endpoints
- `server/storage.ts`
  - `IStorage` abstraction and in-memory `MemStorage`
  - only user CRUD scaffold exists today
- `shared/schema.ts`
  - shared Zod schema for pricing-form validation
  - shared default discount maps
  - sample Drizzle `users` table

## User Workflow

### Primary workflow

1. Open the app at `/`
2. Choose a pricing sheet version:
   - `Tiered Pricing Sheet`
   - `Payment Plan Pricing Sheet`
3. Enter the hourly tutoring rate
4. Select the recommended weekly hours range:
   - `2-8`
   - `4-16`
5. Assign subject hours for any of the six supported subject categories
6. If using `tiered`, choose one predefined package range
7. Review or adjust the default tiered package discount values for prepay, 12-month, 18-month, and 24-month financing, or the general payment-plan discounts
8. Confirm the live preview:
   - total recommended hours
   - selected subject breakdown
   - estimated completion timeline
9. Generate the PDF

### Live data flow

1. Form values are managed by React Hook Form
2. `useWatch` subscriptions observe relevant fields
3. A `useEffect` in `PricingForm` determines whether the form is valid enough for downstream use
4. When valid, normalized data is emitted to the page container
5. The page container passes that data to:
   - `LivePreview` for on-screen calculations
   - `PDFGenerator` for export availability
6. When the user clicks Generate PDF, the app computes pricing outputs and renders a branded PDF in-browser

## Pricing Logic

All pricing logic currently lives in [`shared/schema.ts`](/c:/Users/17026/Documents/Code%20stuff/PricingSheetGenerator/TutoringPricingGenerator/shared/schema.ts) and [`client/src/lib/pricingCalculations.ts`](/c:/Users/17026/Documents/Code%20stuff/PricingSheetGenerator/TutoringPricingGenerator/client/src/lib/pricingCalculations.ts).

### Inputs

- `hourlyRate`
- `weeklyHours`
- subject hour counts
- package selection
- prepay discount map
- 12-month financing discount map
- 18-month financing discount map
- 24-month financing discount map

### Derived outputs

- `totalHours`
  - sum of all subject hour selections
- `selectedSubjects`
  - subject entries with hour counts greater than zero
- `timeline`
  - estimated months = `ceil(totalHours / (hoursPerWeek * 4))`
- `monthly payment options`
  - monthly cost = `hoursPerWeek * 4 * hourlyRate`
- `prepay options`
  - adjusted hourly rate = `hourlyRate * (1 - discountPercent / 100)`
  - total cost = `hours * adjustedHourlyRate`
  - savings = `(hours * hourlyRate) * (discountPercent / 100)`
- `financing options`
  - 12-month plan uses the configured 12-month financing discount map
  - 18-month plan uses the configured 18-month financing discount map
  - 24-month plan uses the configured 24-month financing discount map

### Default discount maps

Tiered packages are pre-populated from shared defaults:

- Prepay defaults:
  - `64: 10`
  - `96: 15`
  - `128: 20`
  - `160: 25`
  - `192: 30`
  - `256: 35`
  - `320: 40`
  - `400: 40`
- 12-month financing defaults:
  - `64: 5`
  - `96: 10`
  - `128: 15`
  - `160: 20`
  - `192: 25`
  - `256: 30`
  - `320: 35`
  - `400: 35`
- 18-month financing defaults:
  - `64: 0`
  - `96: 5`
  - `128: 10`
  - `160: 15`
  - `192: 20`
  - `256: 25`
  - `320: 30`
  - `400: 30`
- 24-month financing defaults:
  - `64: 0`
  - `96: 0`
  - `128: 5`
  - `160: 10`
  - `192: 15`
  - `256: 20`
  - `320: 25`
  - `400: 25`

For `payment-plan`, the UI currently initializes:

- `prepayDiscounts.general = 20`
- `interestDiscounts.general = 5`

## PDF Generation Workflow

The active PDF export path is `generateAdvancedPricingPDF` in [`client/src/lib/htmlToPdfGenerator.ts`](/c:/Users/17026/Documents/Code%20stuff/PricingSheetGenerator/TutoringPricingGenerator/client/src/lib/htmlToPdfGenerator.ts).

### Page generation flow

1. Validate required input data
2. Compute total hours, subject list, timeline, and payment options
3. Create a `jsPDF` document
4. Render page 1 as styled HTML off-screen
5. Draw the timeline chart on a temporary canvas
6. Convert the HTML page into a bitmap with `html2canvas`
7. Place the bitmap onto the PDF page
8. Build page 2 with native `jsPDF` drawing and `jspdf-autotable`
9. Save the PDF locally in the browser

### Output variants

- `payment-plan`
  - monthly tuition table
  - payment plan summary table
  - payment terms table
  - prepay option table
- `tiered`
  - monthly tuition table
  - prepay package table
  - side-by-side 0% interest tables for 12, 18, and 24 month terms on page 2
  - the 24-month table includes the `160-hour` row when the selected package range contains `160`

### Asset handling

- `client/src/lib/generatedAssets.ts` imports the Tutoring Club logo from `attached_assets`
- The HTML-based PDF page embeds that imported asset path

## Validation Rules

Defined in `shared/schema.ts`:

- `version` must be `tiered` or `payment-plan`
- `hourlyRate` must be greater than `0`
- `weeklyHours` must be `2-8` or `4-16`
- each subject hour field must be between `0` and `400`
- `packageRange` must be one of four predefined ranges when used
- all discount values must be between `0` and `100`

Note that the page-level “valid enough to generate” logic is lighter than full schema validation. The UI currently allows PDF generation once the hourly rate, weekly hours, and any required package range are present, even if all subject hour values are `0`; the PDF generator then throws an error if total hours remain `0`.

## Repository Layout

```text
.
|-- client/
|   `-- src/
|       |-- components/
|       |-- hooks/
|       |-- lib/
|       `-- pages/
|-- server/
|-- shared/
|-- attached_assets/
|-- dist/
|-- package.json
|-- tsconfig.json
|-- vite.config.ts
`-- drizzle.config.ts
```

## Local Development

### Prerequisites

- Node.js 20+ recommended
- npm

### Install

```bash
npm install
```

### Start development server

```bash
npm run dev
```

The app is served through Express on `http://localhost:5000`.

### Production build

```bash
npm run build
npm run start
```

### Static checks

```bash
npm run check
npm run lint
```

## Environment and Configuration

### Required today

- No runtime environment variables are required for the current pricing workflow

### Required for database tooling

- `DATABASE_URL`
  - required by `drizzle.config.ts`
  - only needed if you intend to use `npm run db:push`

## Scripts

- `npm run dev`
  - starts Express with `tsx` in development mode
- `npm run build`
  - builds the Vite client and bundles the Express server with esbuild
- `npm run start`
  - runs the production server from `dist/index.js`
- `npm run check`
  - TypeScript type-check
- `npm run lint`
  - ESLint across `.js`, `.ts`, and `.tsx`
- `npm run db:push`
  - pushes Drizzle schema changes to PostgreSQL

## Known Gaps and Technical Debt

- No automated test suite is present
- No pricing or PDF API exists; all core business logic runs client-side
- Server storage and user schema are scaffolded but unused by the product
- React Query is configured globally but not used by the pricing flow
- The repo includes multiple PDF-generation approaches, but only one is wired into the UI
- No browser-level PDF snapshot coverage exists for the tiered 2-page financing layout
- The generated `dist/` folder is present in the workspace and should be treated as build output

## Suggested Next Steps

- Add automated tests for pricing calculations and PDF data shaping
- Move pricing generation to a typed API if auditability or persistence becomes important
- Persist generated pricing sheets, user inputs, and version history
- Add input presets for common tutoring programs
- Add export preview or PDF snapshot testing to reduce formatting regressions
