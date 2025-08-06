# VoiceTodo - Smart Task Manager

## Overview

VoiceTodo is a mobile-optimized task management application that combines traditional to-do list functionality with voice recording capabilities. The application allows users to create tasks with voice notes, set reminders, and manage their productivity through an intuitive interface. Built as a Progressive Web App (PWA), it provides offline functionality and native-like mobile experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Radix UI components with shadcn/ui design system for consistent, accessible interface
- **Styling**: Tailwind CSS with custom design tokens and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **API Design**: RESTful API with structured error handling and logging middleware
- **Authentication**: Session-based authentication with HTTP-only cookies
- **Development Server**: Integrated Vite development server with hot module replacement

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Development Storage**: In-memory storage implementation for development/testing
- **Connection**: Neon Database serverless PostgreSQL for production

### Database Schema
- **Users Table**: Stores user credentials with UUID primary keys
- **Tasks Table**: Contains task details including title, completion status, priority levels, reminder dates, and voice note data
- **Sessions Table**: Manages user sessions with expiration tracking

### Authentication and Authorization
- **Single Account System**: Only one admin account (username: admin, password: admin123)
- **Session Management**: Server-side sessions stored in database with automatic expiration
- **Security**: HTTP-only cookies with secure flags in production
- **Route Protection**: Client-side route guards and server-side authentication middleware

### Voice Recording Integration
- **Browser API**: Web Audio API for voice recording functionality
- **Storage Format**: Base64 encoded audio data stored directly in database
- **Playback**: Native HTML5 Audio API for voice note playback
- **Duration Tracking**: Client-side duration calculation and formatting

### Progressive Web App Features
- **Service Worker**: Offline caching strategy with background sync capabilities
- **Web App Manifest**: Native app-like installation and appearance
- **Responsive Design**: Mobile-first design with touch-optimized interactions
- **Push Notifications**: Browser notification API for task reminders

### Development and Build Pipeline
- **Development**: Hot reload with Vite development server
- **Type Checking**: Comprehensive TypeScript configuration across client and server
- **Build Process**: Separate client and server builds with esbuild for server bundling
- **Path Aliases**: Configured import aliases for clean code organization

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for data fetching
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS with PostCSS for styling pipeline

### Database and ORM
- **Drizzle ORM**: Type-safe database queries and schema management
- **Neon Database**: Serverless PostgreSQL database hosting
- **Connection Pooling**: Built-in connection management through Neon serverless driver

### Development Tools
- **Build Tools**: Vite for frontend builds, esbuild for server bundling
- **TypeScript**: Full-stack type safety with shared types
- **Development Plugins**: Replit-specific plugins for error handling and debugging

### Audio and Media
- **Web APIs**: MediaRecorder API for voice recording, Audio API for playback
- **File Handling**: Base64 encoding for audio data storage and transmission

### Authentication and Session Management
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple
- **Security**: HTTP-only cookies with configurable security settings

### Utility Libraries
- **Date Handling**: date-fns for date manipulation and formatting
- **Form Validation**: Zod for runtime type validation and form schemas
- **Class Management**: clsx and class-variance-authority for conditional styling
- **Icon System**: Lucide React for consistent iconography