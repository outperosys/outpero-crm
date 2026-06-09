# OUTPERO CRM — MASTER PRD

## Product Vision

Outpero CRM is a lightweight internal operating system for an AI automation agency.

The CRM should help:
- manage leads
- manage a reusable service catalog
- track follow-ups
- generate proposals
- generate invoices
- reduce manual work using AI

The system should prioritize:
- speed
- simplicity
- clean UI
- operational efficiency

This is NOT an enterprise CRM.

It is built for a lean 3-person team.

---

# Core Features

## Leads
- Lead management
- Pipeline tracking
- Notes
- Activities
- Tasks
- Follow-up tracking

## AI Features
- AI follow-up generation
- AI notes cleanup
- AI proposal writing
- AI summaries

## Proposals
- Proposal templates
- Proposal builder
- Reusable blocks
- Proposal PDF export

## Services
- Centralized service catalog
- Pricing defaults
- Delivery scope and deliverables
- Sales positioning
- AI instructions for proposal and follow-up generation

## Invoices
- Invoice builder
- Saved pricing components
- Invoice PDF export

---

# Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Prisma
- OpenAI API
- react-pdf
- TipTap Editor
- Vercel

---

# UI Philosophy

The CRM should feel:
- minimal
- fast
- calm
- modern
- uncluttered

Avoid:
- enterprise complexity
- unnecessary dashboards
- over-automation

---

# Main Sidebar

- Dashboard
- Leads
- Pipeline
- Follow-ups
- Services
- Proposals
- Invoices
- Clients
- Tasks
- Templates
- Settings

---

# Pipeline Stages

- New Lead
- Qualified
- Discovery Call
- Proposal Sent
- Follow-up
- Won
- Lost

---

# Lead Fields

- Lead Name
- Company Name
- Phone
- Email
- Source
- Service Interested
- Industry
- Team Size
- Social Profiles
- Existing Website
- Current Problem
- Current Tools
- Priority
- Urgency
- Pipeline Status
- Last Contacted
- Next Follow-up
- Notes
- Assigned To
- Proposal Sent
- Deal Value

---

# Development Rules

- Keep architecture modular
- Use server actions where possible
- Avoid unnecessary dependencies
- Do not overengineer
- AI should assist, not automate
- No WhatsApp integrations initially
- No auto-message sending initially

---

# Primary Goal

The CRM should optimize:
- follow-up consistency
- proposal speed
- lead organization
- invoice generation
- operational clarity


Future module:
Centralized Business Settings and Brand Context Layer for AI, templates, proposals, invoices, and communication consistency.

---

# Service Catalog

Services are the canonical source of truth for agency offers.

Each service should hold:
- core service information
- pricing defaults
- delivery timeline and deliverables
- implementation steps
- ideal client profile
- problems solved
- common objections
- AI context
- proposal instructions
- follow-up instructions
- proposal defaults
- invoice defaults
- internal notes

Future proposal generation should inject selected service context, deliverables, pricing posture, and proposal instructions.

Future invoice generation should select services to auto-fill descriptions, line items, default pricing, and deliverable notes.
