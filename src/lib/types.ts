// ============================================================================
// Habanero Consultant Dashboard — TypeScript Interfaces
// Mirrors the consultant-dashboard-spec.md data models
// ============================================================================

// --- Subscription & Organization ---

export type SubscriptionTier =
  | "free"
  | "homeOffice"
  | "homePro"
  | "consultant"
  | "consultantPro"
  | "enterprise";

export interface Organization {
  id: string;
  name: string;
  tier: SubscriptionTier;
  createdAt: string;
  branding: ConsultantBranding;
  sites: OrganizationSite[];
  users: OrganizationUser[];
}

export interface OrganizationSite {
  id: string;
  siteFingerprint: string;
  label: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  deviceIDs: string[];
  addedAt: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export type OrgUserRole = "viewer" | "analyst" | "admin";

export interface OrganizationUser {
  id: string;
  email: string;
  displayName: string;
  role: OrgUserRole;
  siteAccess: string[];
  addedAt: string;
  lastActiveAt?: string;
  avatarUrl?: string;
}

// --- Fleet Device (Agent) ---

export type HealthStatus = "healthy" | "fair" | "degraded" | "critical";

export interface FleetDevice {
  deviceID: string;
  hostname: string;
  siteFingerprint: string;
  lastSeen: string;
  lastDiagnosticSummary: string;
  healthScore: number;
  healthStatus: HealthStatus;
  alertsCount: number;
  tier: string;
  osVersion: string;
  ipAddress: string;
  gateway: string;
  ssid: string;
  chainTrace: string;
  chainBroken: boolean;
  criticalFindings: number;
  warningFindings: number;
  infoFindings: number;
  vpnActive: boolean;
  securityProducts: string[];
  registeredAt: string;
  online: boolean;
  lastSeenAgo: string;

  // Agent-specific fields
  agentVersion: string;
  cpuUsagePercent?: number;
  memoryUsagePercent?: number;
  diskUsagePercent?: number;
  lastConfigPush?: string;
  configVersion?: string;
  publicIP?: string;
}

// --- Support Tickets ---

export type TicketState =
  | "open"
  | "investigating"
  | "waitingOnClient"
  | "remediating"
  | "monitoring"
  | "resolved"
  | "closed";

export type TicketCategory =
  | "connectivity"
  | "performance"
  | "dns"
  | "security"
  | "wifi"
  | "hardware"
  | "isp"
  | "vpn"
  | "optimization"
  | "other";

export type TicketPriority = "critical" | "high" | "medium" | "low";

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  status: TicketState;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;

  consultantID: string;
  clientDeviceID: string;
  clientName: string;
  clientEmail?: string;
  siteFingerprint: string;
  siteName: string;

  diagnosticSnapshot: TicketDiagnosticSnapshot;
  monitorSnapshot?: TicketMonitorSnapshot;

  messages: TicketMessage[];

  analysisTicketID?: string;
  analysisResponse?: string;

  resolution?: TicketResolution;
  remediationSteps: RemediationStep[];

  priority: TicketPriority;
  category: TicketCategory;
  tags: string[];

  timeSpentMinutes: number;

  slaResponseDeadline?: string;
  slaResolutionDeadline?: string;
  slaResponseMet?: boolean;
  slaResolutionMet?: boolean;
}

export type MessageAuthorType = "consultant" | "client" | "system" | "ai";

export interface MessageAuthor {
  type: MessageAuthorType;
  name: string;
}

export type AttachmentType =
  | "diagnosticReport"
  | "monitorSession"
  | "screenshot"
  | "packetCapture"
  | "text";

export interface MessageAttachment {
  id: string;
  name: string;
  type: AttachmentType;
  url?: string;
  sizeBytes?: number;
}

export interface TicketMessage {
  id: string;
  timestamp: string;
  author: MessageAuthor;
  content: string;
  attachments: MessageAttachment[];
  isInternal: boolean;
}

export interface TicketResolution {
  resolvedAt: string;
  resolvedBy: string;
  rootCause: string;
  resolution: string;
  preventionAdvice?: string;
  clientSatisfaction?: number;
}

export interface RemediationStep {
  id: string;
  order: number;
  title: string;
  description: string;
  command?: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  requiresClientAction: boolean;
}

// --- Diagnostic Snapshots ---

export type FindingSeverity = "CRITICAL" | "WARNING" | "CORR" | "INFO";

export interface TicketDiagnosticSnapshot {
  chainTrace: string;
  chainBrokenAt?: string;
  chainBrokenReason?: string;
  overallStatus: string;
  findings: TicketFinding[];
  network: TicketNetworkState;
  securityProducts: string[];
  needsEscalation: boolean;
}

export interface TicketFinding {
  severity: FindingSeverity;
  layer: string;
  description: string;
  evidence: string;
  diagnosis: string;
  fix: string;
}

export interface TicketNetworkState {
  interface: string;
  ssid: string;
  rssi?: number;
  channel: string;
  ip: string;
  gateway: string;
  gatewayRTT?: number;
  canRoute: boolean;
  dnsWorks: boolean;
  vpnActive: boolean;
  ispName: string;
  ispASN: string;
}

export interface TicketMonitorSnapshot {
  sampleCount: number;
  gatewayRTTAvg?: number;
  gatewayRTTMax?: number;
  packetLossEvents: number;
  downloadSpeedAvg?: number;
  anomalies: string[];
}

// --- Alert System ---

export type AlertMetric =
  | "gateway_rtt_ms"
  | "packet_loss_pct"
  | "jitter_ms"
  | "health_score"
  | "critical_findings"
  | "warning_findings"
  | "download_mbps"
  | "dns_latency_ms"
  | "mesh_rtt_ms"
  | "mesh_packet_loss_pct"
  | "mesh_jitter_ms";

export type AlertOperator = ">" | "<" | ">=" | "<=" | "==";
export type AlertAction = "webhook" | "email" | "inApp";

export interface AlertRule {
  id: string;
  name: string;
  metric: AlertMetric;
  operator: AlertOperator;
  threshold: number;
  consecutiveRuns: number;
  action: AlertAction;
  enabled: boolean;
  siteFilter?: string;
  createdAt: string;
  lastTriggeredAt?: string;
}

export type AlertSeverity = "CRITICAL" | "WARNING" | "INFO";

export interface TriggeredAlert {
  id: string;
  ruleID: string;
  ruleName: string;
  deviceID: string;
  hostname: string;
  siteFingerprint: string;
  siteName?: string;
  metric: AlertMetric;
  value: number;
  threshold: number;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  severity: AlertSeverity;
}

// --- Fleet Health Summary ---

export interface FleetHealthSummary {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  averageHealthScore: number;
  minHealthScore: number;
  maxHealthScore: number;
  totalActiveAlerts: number;
  criticalDevices: number;
  degradedDevices: number;
  healthyDevices: number;
  chainBrokenDevices: number;
  siteBreakdown: SiteHealth[];
  generatedAt: string;
}

export interface SiteHealth {
  siteFingerprint: string;
  siteName: string;
  deviceCount: number;
  averageHealthScore: number;
  activeAlerts: number;
  criticalDevices: number;
}

// --- Consultant Branding ---

export type PortalTheme = "light" | "dark" | "auto";
export type PartnerBadge =
  | "none"
  | "designPartner"
  | "certified"
  | "preferred"
  | "elite";

export interface ConsultantBranding {
  id: string;
  companyName: string;
  companyTagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteURL?: string;

  vanityDomain?: string;
  vanityDomainVerified: boolean;

  logoURL?: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  backgroundColor: string;

  ticketCreatedTemplate?: string;
  ticketUpdatedTemplate?: string;
  ticketResolvedTemplate?: string;
  emailFooter?: string;

  reportHeader?: string;
  reportFooter?: string;
  includeHabaneroBranding: boolean;

  designPartner: boolean;
  partnerBadge: PartnerBadge;

  portalWelcomeMessage?: string;
  portalTheme: PortalTheme;
}

// --- Mesh Monitoring ---

export interface MeshPeer {
  agentID: string;
  siteFingerprint: string;
  publicIP: string;
  siteName: string;
  hostname: string;
  online: boolean;
  lastSeen: string;
}

export type MeshProtocol = "icmp" | "tcp443";

export interface MeshProbe {
  sourceAgent: string;
  targetAgent: string;
  sourceSite: string;
  targetSite: string;
  timestamp: string;
  rttMS: number;
  packetLoss: number;
  jitter: number;
  protocol: MeshProtocol;
  hopCount?: number;
  path?: MeshHop[];
}

export interface MeshHop {
  number: number;
  ip?: string;
  rttMS?: number;
  asn?: string;
  org?: string;
}

export interface MeshMatrix {
  organizationID: string;
  peers: MeshPeer[];
  latestProbes: Record<string, MeshProbe>;
  generatedAt: string;
}

export type MeshAlertMetric =
  | "mesh_rtt_ms"
  | "mesh_packet_loss_pct"
  | "mesh_jitter_ms";

export interface MeshAlertRule {
  id: string;
  name: string;
  sourceSite?: string;
  targetSite?: string;
  metric: MeshAlertMetric;
  operator: ">" | "<" | ">=" | "<=";
  threshold: number;
  durationMinutes: number;
  enabled: boolean;
  createdAt: string;
}

// --- SLA ---

export interface SLAPolicy {
  id: string;
  name: string;
  responseTimeMinutes: Record<string, number>;
  resolutionTimeMinutes: Record<string, number>;
  uptimeTargetPercent: number;
  businessHoursOnly: boolean;
  businessHoursStart: string;
  businessHoursEnd: string;
  businessDays: number[];
  timezone: string;
  appliedToSites: string[];
}

export interface SLAMetrics {
  period: string;
  siteFingerprint?: string;
  ticketsTotal: number;
  ticketsResolved: number;
  avgResponseMinutes: number;
  avgResolutionMinutes: number;
  responseTimeMet: number;
  responseTimeBreached: number;
  resolutionTimeMet: number;
  resolutionTimeBreached: number;
  responseCompliancePercent: number;
  resolutionCompliancePercent: number;
  uptimePercent: number;
}

// --- Revenue ---

export interface RevenueEntry {
  id: string;
  ticketID: string;
  ticketNumber: string;
  siteName: string;
  clientName: string;
  minutes: number;
  hourlyRate: number;
  total: number;
  date: string;
  notes?: string;
  invoiced: boolean;
  invoicedAt?: string;
}

export interface RevenueSummary {
  period: string;
  totalMinutes: number;
  totalRevenue: number;
  ticketCount: number;
  bySite: {
    siteName: string;
    minutes: number;
    revenue: number;
    ticketCount: number;
  }[];
  byCategory: {
    category: TicketCategory;
    minutes: number;
    revenue: number;
  }[];
}

// --- Reporting ---

export type ReportType =
  | "weekly_summary"
  | "monthly_summary"
  | "sla_compliance"
  | "trend_analysis";

export type ReportSchedule = "weekly" | "monthly";
export type ReportFormat = "email" | "pdf" | "both";

export interface ScheduledReport {
  id: string;
  name: string;
  type: ReportType;
  schedule: ReportSchedule;
  recipients: string[];
  siteFilter?: string[];
  format: ReportFormat;
  enabled: boolean;
  lastSentAt?: string;
  nextSendAt: string;
  createdAt: string;
}

export type HealthTrend = "improving" | "stable" | "declining";

export interface ReportData {
  id: string;
  type: string;
  period: { start: string; end: string };
  generatedAt: string;
  organization: string;
  sites: ReportSiteData[];
  summary: {
    avgHealthScore: number;
    healthScoreTrend: HealthTrend;
    ticketsOpened: number;
    ticketsResolved: number;
    avgResolutionHours: number;
    criticalIncidents: number;
    slaCompliancePercent: number;
    uptimePercent: number;
  };
}

export interface ReportSiteData {
  siteName: string;
  siteFingerprint: string;
  avgHealthScore: number;
  healthScoreSamples: { date: string; score: number }[];
  ticketsOpened: number;
  ticketsResolved: number;
  topFindings: { description: string; count: number; severity: string }[];
  agentUptime: number;
}

// --- Agent Configuration ---

export type LogLevel = "debug" | "info" | "warning" | "error";

export interface AgentConfig {
  agentID: string;
  version: string;
  diagnosticInterval: number;
  monitorInterval: number;
  meshEnabled: boolean;
  meshPingInterval: number;
  webhookURL?: string;
  modules: {
    iface: boolean;
    dhcp: boolean;
    vpn: boolean;
    captive: boolean;
    dns: boolean;
    curl: boolean;
    latency: boolean;
    trace: boolean;
    mtu: boolean;
    tls: boolean;
    ports: boolean;
    arp: boolean;
    bandwidth: boolean;
    pcap: boolean;
    security: boolean;
  };
  uploadEnabled: boolean;
  uploadInterval: number;
  logLevel: LogLevel;
  updatedAt: string;
  pushedAt?: string;
  acknowledgedAt?: string;
}

// --- API Response Wrappers ---

export interface ApiResponse<T> {
  data: T;
  ok: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  ok: boolean;
}
