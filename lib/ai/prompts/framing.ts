// Keyword-based industry and service detection from free-text CRM fields.
// Returns vocabulary + framing hints injected into proposal section prompts.
// This adapts proposal language without requiring explicit enum values on leads.

type FramingPattern = [RegExp, string]

const INDUSTRY_PATTERNS: FramingPattern[] = [
  [
    /e.?comm|shopify|woocomm|online store|retail|d2c|dtc|marketplace|amazon|flipkart|inventory|sku/i,
    `Industry framing (e-commerce): Frame problems around order volume, inventory accuracy, and fulfilment speed. Preferred vocabulary: orders, SKUs, inventory levels, stock sync, fulfilment, Shopify, returns, product listings. Frame outcomes as orders processed automatically, stock errors eliminated, or fulfilment time reduced.`,
  ],
  [
    /healthcare|clinic|hospital|patient|medical|dental|doctor|pharmacy|health|appointment/i,
    `Industry framing (healthcare): Frame problems around patient experience, appointment load, and administrative overhead. Preferred vocabulary: patient intake, appointments, follow-ups, referrals, scheduling, care coordination. Do not make clinical claims. Focus on admin and communication efficiency.`,
  ],
  [
    /real.?estate|property|agent|broker|landlord|tenant|listing|rental|mortgage|letting/i,
    `Industry framing (real estate): Frame problems around lead response time, enquiry volume, and pipeline management. Preferred vocabulary: listings, property enquiries, viewings, landlords, tenants, follow-up, pipeline, lead response. Frame outcomes as enquiries handled faster, viewings booked automatically, or no leads missed.`,
  ],
  [
    /restaurant|cafe|food|hospitality|hotel|accommodation|reservation|booking|guest/i,
    `Industry framing (hospitality): Frame problems around booking volume, customer communication, and repeat business. Preferred vocabulary: reservations, bookings, walk-ins, guests, reviews, repeat customers. Frame outcomes as bookings automated, response time cut, or no-shows reduced.`,
  ],
  [
    /agency|marketing|creative|design|advertising|branding|PR|media|content creation/i,
    `Industry framing (agency): Frame problems around client communication overhead and delivery coordination. Preferred vocabulary: clients, deliverables, briefs, approvals, campaigns, reporting, account management. Frame outcomes as fewer manual status updates, faster approvals, or reporting automated.`,
  ],
  [
    /legal|law firm|solicitor|attorney|barrister|compliance|regulatory|paralegal/i,
    `Industry framing (legal/professional services): Frame problems around client intake, document handling, and billable time lost to admin. Preferred vocabulary: clients, matters, intake, documents, billing, deadlines, case management. Frame outcomes as intake automated, admin hours recovered, or client communication standardised.`,
  ],
  [
    /manufact|factory|production|supply chain|warehouse|logistics|distribution|B2B/i,
    `Industry framing (manufacturing/logistics): Frame problems around order processing, supplier communication, and operational bottlenecks. Preferred vocabulary: orders, suppliers, shipments, production, inventory, dispatch, fulfilment. Frame outcomes as processing time cut, errors eliminated, or visibility improved across the chain.`,
  ],
]

const SERVICE_PATTERNS: FramingPattern[] = [
  [
    /inbound.?voice|voice.?agent|AI.?recept|phone.?agent|call.?agent|answering.?service|missed.?call/i,
    `Service framing (inbound voice agent): This is a voice AI that handles inbound calls. Preferred vocabulary: AI receptionist, inbound calls, call handling, after-hours coverage, missed call recovery, call routing, voice agent. Frame outcomes as calls answered 24/7, missed calls recovered, or reception load reduced.`,
  ],
  [
    /outbound.?voice|outbound.?call|auto.?dial|follow.?up.?call|appointment.?reminder.?call/i,
    `Service framing (outbound voice agent): This is an automated outbound calling system. Preferred vocabulary: outbound calls, automated follow-up, appointment reminders, lead outreach, call volume, connection rate. Frame outcomes as follow-up calls automated, appointments booked, or manual dialling eliminated.`,
  ],
  [
    /whatsapp|whats.?app|messaging.?bot|chatbot|chat.?automat|conversational.?AI|wa.?automat/i,
    `Service framing (WhatsApp automation): This is a WhatsApp Business API deployment. Preferred vocabulary: WhatsApp, message flows, automated replies, conversation handling, opt-ins, broadcast messages, WhatsApp bot. Frame outcomes as enquiries answered instantly, leads engaged without manual effort, or response time reduced to seconds.`,
  ],
  [
    /lead.?qual|qualify|qualification|lead.?screen|lead.?scor|prospect.?filter/i,
    `Service framing (lead qualification): This is an automated lead qualification system. Preferred vocabulary: lead scoring, qualification criteria, CRM routing, sales handoff, disqualification, pipeline quality, warm leads. Frame outcomes as qualified leads delivered to sales, unqualified leads filtered automatically, or time-to-handoff cut.`,
  ],
  [
    /crm.?automat|pipeline.?automat|hubspot|salesforce|zoho|contact.?management|data.?sync/i,
    `Service framing (CRM automation): This is a CRM workflow and data pipeline project. Preferred vocabulary: CRM, pipeline, contacts, tasks, status updates, data sync, automation triggers, workflow rules. Frame outcomes as manual CRM entry eliminated, pipeline data always current, or sales team time freed for selling.`,
  ],
  [
    /full.?sales|sales.?system|end.?to.?end.?sales|sales.?automat|revenue.?automat/i,
    `Service framing (full sales system): This is an end-to-end sales automation build. Preferred vocabulary: lead capture, nurture sequence, qualification, follow-up automation, pipeline, close rate, sales workflow. Frame outcomes as leads handled end-to-end without manual work, or pipeline moving faster with less headcount.`,
  ],
  [
    /workflow.?automat|process.?automat|make|zapier|n8n|integrat|API.?connect/i,
    `Service framing (workflow/process automation): This is a workflow automation and integration project. Preferred vocabulary: workflow automation, integrations, triggers, data flow, API connections, manual steps eliminated, process logic. Frame outcomes as hours of manual work automated, error rate reduced, or systems finally connected.`,
  ],
]

export function buildIndustryFraming(industry: string | null): string | null {
  if (!industry?.trim()) return null
  for (const [pattern, framing] of INDUSTRY_PATTERNS) {
    if (pattern.test(industry)) return framing
  }
  return null
}

export function buildServiceFraming(service: string | null): string | null {
  if (!service?.trim()) return null
  for (const [pattern, framing] of SERVICE_PATTERNS) {
    if (pattern.test(service)) return framing
  }
  return null
}
