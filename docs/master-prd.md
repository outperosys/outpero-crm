# OUTPERO CRM — MASTER PRD

## Product Vision

Outpero CRM is a lightweight internal operating system for an AI automation agency.

The CRM should help:
- manage leads
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