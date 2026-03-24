# Product Requirements Document

## Product Name

Tutoring Pricing Generator

## Document Purpose

This PRD describes the current product behavior, technical design, business rules, workflows, and implementation constraints for the Tutoring Pricing Generator codebase. It is intended to support maintenance, feature planning, and future expansion from a currently client-driven pricing tool into a more complete operational product.

## 1. Product Summary

### Problem

Tutoring staff need a fast, repeatable way to turn tutoring recommendations into polished, branded pricing sheets. Manual spreadsheet work or hand-built documents are slow, inconsistent, and hard to update when pricing assumptions change.

### Solution

Provide a guided internal web application that:

- captures tutoring recommendations and rate data
- applies standardized pricing and discount logic
- previews the recommendation in real time
- exports a parent-facing PDF in Tutoring Club branding

### Primary users

- tutoring center staff
- education directors
- franchise operators or administrators preparing pricing proposals

### Primary user outcome

Generate a pricing document in minutes without manually formatting tables, recalculating discounts, or recreating program timelines.

## 2. Product Goals

### Business goals

- standardize pricing presentation across users
- reduce manual calculation errors
- shorten proposal preparation time
- preserve brand consistency in external-facing documents

### User goals

- enter tutoring recommendations quickly
- compare payment structures clearly
- produce a clean PDF without external tools

### Technical goals

- keep business logic typed and shared
- allow future addition of persistence and API endpoints
- support low-friction local development and deployment

## 3. Non-Goals

- student or parent account management
- CRM integration
- document storage or retrieval
- approval workflows
- role-based permissions
- multi-tenant franchise administration
- audit history of generated pricing sheets

These may become future roadmap items, but they are not implemented in the current codebase.

## 4. Product Scope

### In scope now

- single-page internal web application
- manual entry of rate, weekly hours, subject recommendations, and discount values
- two pricing sheet variants
- live preview of recommendation summary
- client-side PDF generation

### Out of scope now

- server-side pricing computation
- backend persistence of pricing sheets
- API-based export service
- test automation
- analytics instrumentation

## 5. Current User Workflows

### Workflow A: Tiered pricing sheet

1. User opens the generator.
2. User selects `Tiered Pricing Sheet`.
3. User enters hourly tutoring rate.
4. User selects recommended weekly hours range.
5. User chooses subject hour allocations.
6. User selects one of four predefined package ranges.
7. App initializes default prepay, 12-month, 18-month, and 24-month discounts for the selected package set.
8. User optionally edits the per-package prepay, 12-month, 18-month, and 24-month discount values.
9. Live preview updates with:
   - total recommended hours
   - selected subjects
   - projected timeline by weekly pace
10. User generates a branded PDF.

### Workflow B: Payment plan pricing sheet

1. User opens the generator.
2. User selects `Payment Plan Pricing Sheet`.
3. User enters hourly tutoring rate.
4. User selects recommended weekly hours range.
5. User chooses subject hour allocations.
6. App initializes:
   - `prepayDiscounts.general = 20`
   - `interestDiscounts.general = 5`
7. User optionally edits those values.
8. Live preview updates.
9. User generates a branded PDF containing simplified payment-plan tables.

### Workflow C: PDF generation

1. User clicks `Generate PDF`.
2. UI validates presence of required high-level inputs.
3. PDF service recomputes pricing outputs from current form data.
4. The app renders the first page from styled HTML plus a canvas chart.
5. The app renders pricing tables using native PDF drawing APIs, including a consolidated tiered page-2 layout with side-by-side 12-, 18-, and 24-month financing tables.
6. Browser downloads the finished PDF file.

## 6. Functional Requirements

### FR-1 Pricing sheet selection

- The system must allow the user to choose between `tiered` and `payment-plan`.
- The selection must drive which fields and tables are displayed.

### FR-2 Basic pricing inputs

- The system must capture:
  - hourly tutoring rate
  - recommended weekly hours range
- The system must reject hourly rate values less than or equal to zero.

### FR-3 Subject recommendation inputs

- The system must support six subject categories:
  - Beginning Reading/Phonics
  - Reading
  - Writing
  - Math
  - TutorUp
  - Test Prep
- Each category must allow `0` to `400` hours.
- The UI must offer hour selections in increments of `16`, from `16` to `400`, plus `0`.

### FR-4 Tiered package selection

- The system must present exactly four tiered package-range presets:
  - `64,96,128,192`
  - `96,128,160,192`
  - `96,128,192,256`
  - `128,256,320,400`
- When a tiered range is selected, the system must seed package-specific default discounts.

### FR-5 Discount configuration

- The system must allow editing discount percentages from `0` to `100`.
- Tiered mode must expose per-package prepay, 12-month, 18-month, and 24-month financing discounts.
- Payment-plan mode must expose one general prepay discount and one general financing discount.

### FR-6 Live preview

- The system must display:
  - total recommended hours
  - all selected subjects with hours
  - estimated timeline options
- Preview values must update as the form changes.

### FR-7 Timeline calculation

- The system must calculate estimated completion months for each weekly pacing option.
- For `2-8`, the options must be `2, 3, 4, 6, 8`.
- For `4-16`, the options must be `4, 8, 10, 12`.
- Estimated months must be:
  - `ceil(totalHours / (hoursPerWeek * 4))`

### FR-8 Monthly tuition calculations

- The system must calculate monthly cost as:
  - `hoursPerWeek * 4 * hourlyRate`
- The system must show those results in both pricing modes.

### FR-9 Prepay calculations

- The system must calculate:
  - adjusted hourly rate
  - total cost
  - discount percent
  - savings
- For tiered mode, results must be shown per selected package.
- For payment-plan mode, results must be shown for total recommended hours.

### FR-10 Financing calculations

- Tiered mode must calculate financing options for:
  - 12 months
  - 18 months
  - 24 months
- Each tiered financing term must use its own configurable per-package discount map.
- Payment-plan mode must calculate monthly terms for:
  - 12 months at `0%`
  - 18 months at `0%`
  - 24 months at `0%`
  - 36 months at `5.99 - 19.99%`
  - 48 months at `6.99 - 19.99%`

### FR-11 PDF export

- The system must allow PDF export when required inputs are present.
- The exported PDF must use Tutoring Club branding and include the logo asset.
- The exported filename must vary by pricing mode.
- In tiered mode, the exported PDF must remain a 2-page document with all financing terms rendered together on page 2.

### FR-12 Error handling

- The system must disable PDF generation when required top-level inputs are missing.
- The PDF generator must throw an error if computed total hours are zero.
- UI sections should be isolated by error boundaries to avoid page-wide failure on local component errors.

## 7. Business Rules

### BR-1 Version options

- Valid versions are `tiered` and `payment-plan` only.

### BR-2 Weekly hours ranges

- Valid ranges are `2-8` and `4-16` only.

### BR-3 Subject totals

- Total recommended hours are the sum of all selected subject hours.

### BR-4 Discount defaults

- Tiered prepay defaults:
  - `64: 10`
  - `96: 15`
  - `128: 20`
  - `160: 25`
  - `192: 30`
  - `256: 35`
  - `320: 40`
  - `400: 40`
- Tiered 12-month financing defaults:
  - `64: 5`
  - `96: 10`
  - `128: 15`
  - `160: 20`
  - `192: 25`
  - `256: 30`
  - `320: 35`
  - `400: 35`
- Tiered 18-month financing defaults:
  - `64: 0`
  - `96: 5`
  - `128: 10`
  - `160: 15`
  - `192: 20`
  - `256: 25`
  - `320: 30`
  - `400: 30`
- Tiered 24-month financing defaults:
  - `64: 0`
  - `96: 0`
  - `128: 5`
  - `160: 10`
  - `192: 15`
  - `256: 20`
  - `320: 25`
  - `400: 25`
- Payment-plan defaults:
  - prepay `20`
  - financing `5`

### BR-5 Fees and messaging

Current PDF messaging includes:

- Monthly option:
  - testing fee `$75`
  - materials or registration fee `$100`
- Prepay and financing options:
  - no testing or materials/registration fees
  - flexible scheduling

These are presentation rules embedded in the PDF output and should be treated as business-copy requirements unless product owners change them.

## 8. UX Requirements

### Layout

- Desktop layout should present:
  - form on the left
  - live preview on the right
  - PDF action in the header
- Mobile layout should collapse to a single-column flow.

### Interaction model

- Form should reveal relevant configuration sections based on version selection.
- Live preview should remain visible without requiring navigation to another screen.
- Disabled export state should communicate incomplete setup implicitly through button state.

### Branding

- Primary brand color: `#0063a8`
- Secondary brand color: `#f26a31`
- The PDF should include official Tutoring Club logo artwork from local assets.

## 9. Technical Architecture

### Frontend

- Framework: React 18 with TypeScript
- Routing: Wouter
- State model:
  - React local state at page level
  - React Hook Form for form values
  - `useWatch` for derivation and synchronization
- Validation:
  - Zod schema in `shared/schema.ts`
  - `zodResolver` in `PricingForm`
- UI component system:
  - Tailwind CSS
  - shadcn/ui
  - Radix primitives

### Backend

- Runtime: Node.js with Express
- Current responsibility:
  - serve client in development and production
  - provide future API extension point
- Current limitation:
  - no implemented business API

### Build and serving

- Development:
  - `tsx server/index.ts`
  - Vite middleware mounted into Express
- Production:
  - Vite builds client assets into `dist/public`
  - esbuild bundles server into `dist/index.js`

### Shared code

- `shared/schema.ts` contains both:
  - pricing form schema
  - sample database schema for users

This is acceptable for a scaffold, but longer-term separation between pricing domain schemas and persistence schemas would improve maintainability.

## 10. Data Contracts

### Pricing form model

```ts
{
  version: "tiered" | "payment-plan";
  hourlyRate: number;
  weeklyHours: "2-8" | "4-16";
  beginningReading: number;
  reading: number;
  writing: number;
  math: number;
  tutorUp: number;
  testPrep: number;
  packageRange?: "64,96,128,192" | "96,128,160,192" | "96,128,192,256" | "128,256,320,400";
  prepayDiscounts: Record<string, number>;
  interestDiscounts: Record<string, number>;
  eighteenMonthDiscounts: Record<string, number>;
  twentyFourMonthDiscounts: Record<string, number>;
}
```

### Normalized page state

```ts
{
  version: string;
  hourlyRate: number;
  weeklyHours: string;
  subjects: {
    "Beginning Reading/Phonics": number;
    "Reading": number;
    "Writing": number;
    "Math": number;
    "TutorUp": number;
    "Test Prep": number;
  };
  packages: number[];
  prepayDiscounts: Record<string, number>;
  interestDiscounts: Record<string, number>;
  eighteenMonthDiscounts: Record<string, number>;
  twentyFourMonthDiscounts: Record<string, number>;
}
```

### Derived calculation models

- `TimelineOption`
- `MonthlyPaymentOption`
- `PrepayOption`
- `FinancingOption`

These are defined in `client/src/lib/pricingCalculations.ts`.

## 11. Integration and Infrastructure Requirements

### Current infrastructure requirements

- Node.js runtime
- npm dependency installation
- Express port `5000`

### Optional or future infrastructure

- PostgreSQL connection through `DATABASE_URL`
- Drizzle migrations for persisted domain entities
- API endpoints for document generation and storage

## 12. Non-Functional Requirements

### NFR-1 Reliability

- The app must continue functioning even if non-critical UI sections error, using component-level error boundaries.

### NFR-2 Performance

- Form updates should feel immediate on typical desktop hardware.
- PDF generation should complete entirely in-browser without page reload.

### NFR-3 Maintainability

- Business logic should remain typed and centralized.
- Shared validation should remain colocated with domain contracts or be moved into a clearly named domain module.

### NFR-4 Accessibility

- UI components should inherit baseline accessibility behavior from Radix primitives and semantic form controls.
- Additional accessibility review is still needed for full compliance.

### NFR-5 Portability

- The application must build and run locally and in a hosted Node environment.
- Production output must be self-contained in `dist/`.

## 13. Current Risks and Gaps

### Product risks

- Pricing logic is only enforced client-side, which limits auditability.
- No persistence means generated proposals cannot be retrieved or compared later.
- PDF layout quality depends on browser-side rendering and canvas capture.

### Engineering risks

- No automated tests for pricing calculations or PDF generation
- Multiple PDF-generation approaches in the repo may drift
- Global React Query configuration exists without active usage
- Backend schema and storage scaffolding can be mistaken for implemented functionality

### UX risks

- Form-level readiness and schema validation are not fully aligned
- Users can attempt generation with zero total hours and only receive the error at export time

## 14. Recommended Backlog

### High priority

- add unit tests for `pricingCalculations.ts`
- align form-valid state with business-valid state
- add explicit validation that at least one subject has non-zero hours before enabling export
- centralize pricing constants and fee copy

### Medium priority

- persist pricing sheet inputs and generated artifacts
- add server-side export endpoint
- add saved templates for common program types
- separate pricing-domain schema from user/database schema

### Lower priority

- add user accounts and permissions
- add PDF preview mode
- add analytics and usage reporting
- add localization or multi-brand support

## 15. Acceptance Criteria For Current Product

- A user can load the app locally and access the generator on port `5000`.
- A user can choose either pricing-sheet type and see relevant fields.
- A user can enter pricing and subject data and see live preview changes.
- A user can generate a downloadable PDF with branded output.
- Tiered mode produces package-based prepay and financing tables in a 2-page PDF layout.
- When the selected tiered package range includes `160`, the 24-month financing table includes a `160-hour` row.
- Payment-plan mode produces simplified payment-plan and prepay tables.

## 16. Open Questions

- Should total recommended hours be required to match one of the available package options in tiered mode?
- Are monthly-option fee labels meant to say `registration fee` or `materials fee` consistently across all outputs?
- Should payment-plan interest ranges be configurable instead of hard-coded?
- Should the server become the source of truth for pricing rules and generated documents?
