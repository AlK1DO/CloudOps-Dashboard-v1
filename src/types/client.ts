// Tipos para Clientes, Consultas Semiestructuradas, Auditoría y Geografía en Tiempo Real

export interface ClientProfile {
  id: string;
  name: string;
  dni?: string;
  company: string;
  phone: string;
  email: string;
  region: string;
  district: string;
  ip?: string;
  notes?: string;
  metadata?: Record<string, any>; // Semiestructurado JSONB
  createdAt: string;
}

export interface ClientConsultation {
  id: string;
  clientId: string;
  clientName: string;
  clientDni?: string;
  clientIp?: string;
  title: string;
  status: 'Borrador' | 'Presentada' | 'En Evaluación' | 'Aprobada';
  estimatedMonthlyCost: number;
  estimatedAnnualCost: number;
  selectedRegion: string;
  districtExecution: string;
  latitude: number;  // Coordenada real capturada al momento de la consulta
  longitude: number; // Coordenada real capturada al momento de la consulta
  servicesPayload: Array<{
    serviceId: string;
    serviceName: string;
    category: string;
    quantity: number;
    monthlyCost: number;
  }>; // Semiestructurado JSONB
  architecturePayload: {
    solutionName?: string;
    applicationType?: string;
    description?: string;
    estimatedUsers?: number;
    availabilityLevel?: string;
    migrationGoal?: string;
    awsRegionCode?: string;
    [key: string]: any;
  }; // Semiestructurado JSONB
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: 'Creación de Usuario' | 'Generación de Consulta' | 'Exportación de Propuesta' | 'Eliminación de Usuario' | 'Cambio de Región' | 'Acceso a Auditorio';
  entityType: 'Usuario' | 'Consulta' | 'Sistema';
  entityId?: string;
  userName: string;
  region: string;
  district: string;
  details: Record<string, any>; // Semiestructurado JSONB
  createdAt: string;
}

export interface GeoExecutionLocation {
  latitude: number;
  longitude: number;
  region: string;
  district: string;
  accuracyMeters?: number;
  source: 'gps' | 'network_ip' | 'reverse_geocoded' | 'manual';
  ip?: string;
  isLiveTracking?: boolean;
  updatedAt: string;
}
