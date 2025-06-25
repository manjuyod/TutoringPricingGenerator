# Tutoring Club Pricing Generator

## Overview

This is a full-stack web application built for Tutoring Club that generates personalized academic game plans and pricing sheets. The application allows users to input tutoring parameters and generates professional PDF documents with pricing calculations and academic recommendations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Hook Form for form handling, TanStack Query for server state
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL support
- **Session Management**: In-memory storage with interface for database expansion

### UI Component System
- **Design System**: shadcn/ui with Radix UI primitives
- **Theme**: Custom Tutoring Club brand colors (TC Blue: #0063a8, TC Orange: #f26a31)
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Key Components

### Form Management
- **PricingForm**: Main form component using React Hook Form with Zod validation
- **Schema Validation**: Comprehensive form validation in `shared/schema.ts`
- **Real-time Validation**: Form validation feedback with error handling

### PDF Generation
- **Multiple Engines**: Both @react-pdf/renderer and jsPDF implementations
- **Professional Layout**: Branded PDF output with Tutoring Club styling
- **Dynamic Content**: Calculates pricing options, timelines, and recommendations

### Pricing Calculations
- **Subject Hours Tracking**: Supports 6 subject areas (Reading, Writing, Math, etc.)
- **Flexible Packages**: Configurable hour packages (64-400 hours)
- **Discount Systems**: Prepay discounts and interest-based financing options
- **Timeline Calculations**: Estimates completion time based on weekly hour commitments

### Live Preview System
- **Real-time Updates**: Form changes instantly reflected in preview
- **Subject Summary**: Shows selected subjects and allocated hours
- **Timeline Display**: Visual representation of estimated completion timeline

## Data Flow

1. **User Input**: Form captures hourly rate, weekly hours, subject allocations, and package preferences
2. **Validation**: Zod schema validates input data in real-time
3. **Calculations**: Pricing algorithms compute various payment options and timelines
4. **Preview**: Live preview updates to show current form state
5. **PDF Generation**: User can generate professional PDF documents
6. **Storage**: Form data can be persisted (storage interface ready for database)

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- Vite build system with TypeScript support
- Express.js for server-side API

### UI and Styling
- Tailwind CSS for utility-first styling
- Radix UI primitives for accessible components
- Lucide React for consistent iconography

### PDF Generation
- @react-pdf/renderer for React-based PDF creation
- jsPDF with html2canvas for HTML-to-PDF conversion
- Multiple fallback options for PDF generation

### Database and Validation
- Drizzle ORM for type-safe database operations
- PostgreSQL as the target database (via Neon serverless)
- Zod for runtime type validation and schema definition

### Development Tools
- TypeScript for type safety across the stack
- PostCSS for CSS processing
- ESLint configuration for code quality

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite HMR for instant development feedback
- **Database**: PostgreSQL 16 module in Replit environment
- **Port Configuration**: Development server on port 5000

### Production Build
- **Build Process**: Vite builds client, esbuild bundles server
- **Asset Optimization**: Automatic code splitting and optimization
- **Static Files**: Client assets served from `dist/public`

### Replit Deployment
- **Auto-scaling**: Configured for Replit's autoscale deployment target
- **Environment**: Node.js 20 runtime with PostgreSQL support
- **Build Command**: `npm run build` compiles both client and server
- **Start Command**: `npm run start` launches production server

### Database Configuration
- **ORM**: Drizzle configured for PostgreSQL dialect
- **Migrations**: Schema migrations stored in `./migrations`
- **Connection**: Environment variable `DATABASE_URL` for database connection

## Changelog
- June 25, 2025. Initial setup
- June 25, 2025. Fixed startup error by creating missing generatedAssets.ts file and integrated official Tutoring Club logo for PDF generation

## User Preferences

Preferred communication style: Simple, everyday language.