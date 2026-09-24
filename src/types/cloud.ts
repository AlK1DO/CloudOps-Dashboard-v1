// Tipos de datos para CloudOps Dashboard

export type ServiceStatus = 'Activo' | 'Configurado' | 'Inactivo' | 'Recomendado';

export type ServiceCategory = 
  | 'Computación' 
  | 'Almacenamiento' 
  | 'Base de Datos' 
  | 'Seguridad' 
  | 'Redes y Entrega de Contenido';

export interface AwsService {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  mainFunction: string;
  status: ServiceStatus;
  hourlyRate: number; // Tasa por hora estimada para simulaciones de costos
  unitType: string; // ej. 'instancia', 'GB', 'solicitud'
}

export interface CloudProposal {
  id: string;
  solutionName: string;
  applicationType: string;
  description: string;
  selectedRegion: string;
  estimatedUsers: number;
  availabilityLevel: string;
  selectedServices: string[];
  migrationGoal: string;
  createdAt: string;
}

export interface CostCalculationItem {
  id: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  quantity: number;
  estimatedHours: number;
  hourlyCost: number;
  monthlyCost: number;
  annualCost: number;
}

export type RegionHealthStatus = 'Operativo' | 'Mantenimiento' | 'Degradado';

export interface GlobalRegion {
  id: string;
  regionCode: string;
  location: string;
  country: string;
  availabilityZones: number;
  deployedServices: string[];
  status: RegionHealthStatus;
  latencyMs: number;
  costMultiplier: number; // multiplicador de precio relativo a us-east-1 (base = 1.0)
}

export type SecurityStatusLevel = 'correcto' | 'revision' | 'problema';

export interface SecurityPillar {
  id: string;
  category: 'Responsabilidad Compartida' | 'IAM' | 'Protección de Cuentas' | 'Protección de Datos' | 'Cumplimiento';
  title: string;
  description: string;
  status: SecurityStatusLevel;
  details: string;
  awsResponsibility?: string;
  customerResponsibility?: string;
}

export interface NetworkComponent {
  id: string;
  step: number;
  name: string;
  type: 'INTERNET' | 'Route 53' | 'CloudFront' | 'VPC' | 'EC2' | 'RDS';
  category: 'Edge' | 'Network' | 'Compute' | 'Database';
  description: string;
  cidrOrEndpoint?: string;
  securityGroup?: string;
}
