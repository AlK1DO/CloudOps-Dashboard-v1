import { AwsService, GlobalRegion, SecurityPillar, NetworkComponent, CloudProposal, CostCalculationItem } from '../types/cloud';

export const AWS_SERVICES: AwsService[] = [
  {
    id: 'ec2',
    name: 'Amazon EC2',
    category: 'Computación',
    description: 'Capacidad informática escalable en la nube de Amazon Web Services.',
    mainFunction: 'Alojamiento de servidores virtuales (instancias) para ejecutar aplicaciones con control total del SO.',
    status: 'Activo',
    hourlyRate: 0.0416, // t3.medium aprox ~$30/mes
    unitType: 'instancia (t3.medium)'
  },
  {
    id: 's3',
    name: 'Amazon S3',
    category: 'Almacenamiento',
    description: 'Servicio de almacenamiento de objetos líder con escalabilidad y seguridad industrial.',
    mainFunction: 'Almacenamiento seguro de archivos estáticos, backups, data lakes y multimedia con 99.999999999% de durabilidad.',
    status: 'Activo',
    hourlyRate: 0.0000315, // ~$0.023 por GB/mes -> ~$0.0000315 por GB/hora
    unitType: 'GB estándar'
  },
  {
    id: 'rds',
    name: 'Amazon RDS',
    category: 'Base de Datos',
    description: 'Servicio administrado de base de datos relacional (PostgreSQL, MySQL, MariaDB, Oracle).',
    mainFunction: 'Gestión automatizada de aprovisionamiento, backups, parches y alta disponibilidad multi-AZ de BD.',
    status: 'Activo',
    hourlyRate: 0.068, // db.t3.medium aprox
    unitType: 'instancia DB'
  },
  {
    id: 'iam',
    name: 'AWS IAM',
    category: 'Seguridad',
    description: 'Control de acceso granular y gestión de identidades a recursos y servicios de AWS.',
    mainFunction: 'Administración de usuarios, roles, políticas de privilegios mínimos y autenticación multifactor (MFA).',
    status: 'Activo',
    hourlyRate: 0.0, // IAM es gratuito
    unitType: 'servicio global'
  },
  {
    id: 'vpc',
    name: 'Amazon VPC',
    category: 'Redes y Entrega de Contenido',
    description: 'Red virtual aislada lógicamente dentro de la infraestructura global de AWS.',
    mainFunction: 'Aislamiento de red, subnets públicas/privadas, tablas de enrutamiento y grupos de seguridad.',
    status: 'Activo',
    hourlyRate: 0.015, // Costo de NAT Gateway/endpoints base
    unitType: 'VPC Gateway'
  },
  {
    id: 'route53',
    name: 'Amazon Route 53',
    category: 'Redes y Entrega de Contenido',
    description: 'Servicio web de Sistema de Nombres de Dominio (DNS) en la nube altamente escalable.',
    mainFunction: 'Traducción de nombres de dominio en direcciones IP y enrutamiento inteligente basado en latencia y salud.',
    status: 'Activo',
    hourlyRate: 0.0007, // Zona hospedada ~$0.50/mes
    unitType: 'zona DNS'
  },
  {
    id: 'cloudfront',
    name: 'Amazon CloudFront',
    category: 'Redes y Entrega de Contenido',
    description: 'Red de entrega de contenido (CDN) segura y de baja latencia a nivel global.',
    mainFunction: 'Distribución acelerada y en caché de contenido estático y dinámico a través de puntos de presencia (Edge).',
    status: 'Activo',
    hourlyRate: 0.0116, // Distribución base + transferencia
    unitType: 'distribución CDN'
  }
];

export const GLOBAL_REGIONS: GlobalRegion[] = [
  {
    id: 'us-east-1',
    regionCode: 'us-east-1',
    location: 'Norte de Virginia',
    country: 'Estados Unidos',
    availabilityZones: 6,
    deployedServices: ['Amazon EC2', 'Amazon S3', 'Amazon RDS', 'Amazon VPC', 'Route 53', 'CloudFront'],
    status: 'Operativo',
    latencyMs: 78
  },
  {
    id: 'us-west-2',
    regionCode: 'us-west-2',
    location: 'Oregón',
    country: 'Estados Unidos',
    availabilityZones: 4,
    deployedServices: ['Amazon EC2', 'Amazon S3', 'Amazon RDS', 'Amazon VPC'],
    status: 'Operativo',
    latencyMs: 95
  },
  {
    id: 'sa-east-1',
    regionCode: 'sa-east-1',
    location: 'São Paulo',
    country: 'Brasil',
    availabilityZones: 3,
    deployedServices: ['Amazon EC2', 'Amazon S3', 'Amazon RDS', 'Amazon VPC'],
    status: 'Operativo',
    latencyMs: 110
  },
  {
    id: 'eu-west-1',
    regionCode: 'eu-west-1',
    location: 'Irlanda',
    country: 'Europa',
    availabilityZones: 3,
    deployedServices: ['Amazon EC2', 'Amazon S3', 'Amazon RDS'],
    status: 'Operativo',
    latencyMs: 140
  }
];

export const SECURITY_PILLARS: SecurityPillar[] = [
  {
    id: 'sec-resp-shared',
    category: 'Responsabilidad Compartida',
    title: 'Modelo de Responsabilidad Compartida',
    description: 'Diferenciación estricta entre la seguridad DE la nube (AWS) y la seguridad EN la nube (Cliente).',
    status: 'correcto',
    details: 'AWS protege la infraestructura física, hardware, centros de datos y virtualización. El cliente gestiona el SO invitado, parches de apps, cifrado de datos y configuraciones de firewall.',
    awsResponsibility: 'Seguridad DE la nube: Hardware, racks, centros de datos, hosts de virtualización, cableado y servicios gestionados.',
    customerResponsibility: 'Seguridad EN la nube: Datos de clientes, administración de identidades (IAM), parches de SO de instancias EC2 y reglas de Security Groups.'
  },
  {
    id: 'sec-iam-mfa',
    category: 'IAM',
    title: 'Gestión de Acceso e Identidad (IAM)',
    description: 'Políticas de privilegios mínimos y uso estricto de autenticación multifactor.',
    status: 'correcto',
    details: '98% de los usuarios administrativos tienen MFA activado. No se utilizan credenciales raíz de la cuenta para tareas cotidianas.',
    customerResponsibility: 'Creación de roles temporales, rotación periódica de access keys y asignación de políticas de mínimo privilegio.'
  },
  {
    id: 'sec-account-prot',
    category: 'Protección de Cuentas',
    title: 'Protección y Aislamiento de Cuentas',
    description: 'Monitorización de accesos sospechosos y configuración de alertas de facturación.',
    status: 'revision',
    details: 'Alerta de presupuesto configurada al 80%. Se recomienda habilitar AWS Organizations con Service Control Policies (SCPs).',
    customerResponsibility: 'Configuración de presupuestos en AWS Budgets y monitorización de logs de acceso CloudTrail.'
  },
  {
    id: 'sec-data-enc',
    category: 'Protección de Datos',
    title: 'Cifrado en Tránsito y Reposo',
    description: 'Cifrado de datos en buckets S3 y volúmenes EBS mediante llaves administradas AWS KMS.',
    status: 'correcto',
    details: 'Cifrado TLS 1.3 forzado en CloudFront y Route 53. Todos los buckets S3 tienen encriptación por defecto SSE-S3/KMS habilitada.',
    customerResponsibility: 'Habilitar cifrado predeterminado en buckets y almacenamiento de bases de datos RDS.'
  },
  {
    id: 'sec-compliance',
    category: 'Cumplimiento',
    title: 'Auditoría y Cumplimiento Normativo',
    description: 'Alineación con estándares ISO 27001, SOC 2 y lineamientos de auditoría continua.',
    status: 'correcto',
    details: 'Logs de auditoría centralizados con AWS CloudTrail y retención configurada por 365 días en bucket seguro.',
    awsResponsibility: 'Certificaciones de centros de datos (ISO 27001, SOC 1/2/3, PCI DSS Nivel 1).'
  }
];

export const NETWORK_FLOW_COMPONENTS: NetworkComponent[] = [
  {
    id: 'net-1',
    step: 1,
    name: 'Tráfico de Usuarios (Internet)',
    type: 'INTERNET',
    category: 'Edge',
    description: 'Peticiones entrantes originadas por clientes y navegadores web a través de la red pública global.',
    cidrOrEndpoint: '0.0.0.0/0 (Internet Público)'
  },
  {
    id: 'net-2',
    step: 2,
    name: 'Amazon Route 53',
    type: 'Route 53',
    category: 'Edge',
    description: 'Servicio de DNS administrado que resuelve el dominio institucional y enruta hacia el punto de presencia más cercano.',
    cidrOrEndpoint: 'api.empresa-cloud.com'
  },
  {
    id: 'net-3',
    step: 3,
    name: 'Amazon CloudFront (CDN)',
    type: 'CloudFront',
    category: 'Edge',
    description: 'Distribución perimetral con caché distribuida y terminación SSL/TLS para acelerar tiempos de respuesta y proteger el origen.',
    cidrOrEndpoint: 'd123456abcdef8.cloudfront.net'
  },
  {
    id: 'net-4',
    step: 4,
    name: 'Virtual Private Cloud (VPC)',
    type: 'VPC',
    category: 'Network',
    description: 'Red virtual aislada con Internet Gateway (IGW), subredes públicas front-end y subredes privadas back-end protegidas.',
    cidrOrEndpoint: '10.0.0.0/16 (VPC CIDR)',
    securityGroup: 'sg-vpc-ingress (Puerto 80/443)'
  },
  {
    id: 'net-5',
    step: 5,
    name: 'Subred Privada: Instancias EC2',
    type: 'EC2',
    category: 'Compute',
    description: 'Servidores de aplicaciones ejecutando la lógica de negocio, accesibles únicamente a través de balanceador interno.',
    cidrOrEndpoint: '10.0.1.0/24 (Subnet Privada App)',
    securityGroup: 'sg-ec2-backend (Puerto 8080 desde ALB)'
  },
  {
    id: 'net-6',
    step: 6,
    name: 'Subred Privada: Base de Datos RDS',
    type: 'RDS',
    category: 'Database',
    description: 'Clúster de PostgreSQL en RDS Multi-AZ aislado sin acceso directo a Internet, accesible solo por las instancias EC2.',
    cidrOrEndpoint: '10.0.2.0/24 (Subnet Privada Datos)',
    securityGroup: 'sg-rds-db (Puerto 5432 solo desde sg-ec2-backend)'
  }
];

export const INITIAL_PROPOSALS: CloudProposal[] = [
  {
    id: 'prop-1',
    solutionName: 'Portal Corporativo CloudOps',
    applicationType: 'Web Empresarial',
    description: 'Plataforma centralizada de gestión de servicios y operaciones empresariales para clientes corporativos.',
    selectedRegion: 'us-east-1 (Norte de Virginia)',
    estimatedUsers: 25000,
    availabilityLevel: '99.95% (Alta Disponibilidad)',
    selectedServices: ['Amazon EC2', 'Amazon S3', 'Amazon RDS', 'Amazon VPC', 'Route 53', 'CloudFront'],
    migrationGoal: 'Migrar arquitectura on-premise obsoleta a la nube para mejorar resiliencia, escalabilidad y reducir costos operativos.',
    createdAt: '2026-09-15'
  }
];

export const INITIAL_COST_ITEMS: CostCalculationItem[] = [
  {
    id: 'cost-1',
    serviceId: 'ec2',
    serviceName: 'Amazon EC2 (t3.medium)',
    category: 'Computación',
    quantity: 4,
    estimatedHours: 730,
    hourlyCost: 0.0416,
    monthlyCost: 121.47,
    annualCost: 1457.64
  },
  {
    id: 'cost-2',
    serviceId: 'rds',
    serviceName: 'Amazon RDS (db.t3.medium)',
    category: 'Base de Datos',
    quantity: 2,
    estimatedHours: 730,
    hourlyCost: 0.068,
    monthlyCost: 99.28,
    annualCost: 1191.36
  },
  {
    id: 'cost-3',
    serviceId: 's3',
    serviceName: 'Amazon S3 (Almacenamiento Estándar)',
    category: 'Almacenamiento',
    quantity: 500, // 500 GB
    estimatedHours: 730,
    hourlyCost: 0.0,
    monthlyCost: 11.50,
    annualCost: 138.00
  },
  {
    id: 'cost-4',
    serviceId: 'cloudfront',
    serviceName: 'Amazon CloudFront (CDN)',
    category: 'Redes y Entrega de Contenido',
    quantity: 1,
    estimatedHours: 730,
    hourlyCost: 0.0116,
    monthlyCost: 8.50,
    annualCost: 102.00
  },
  {
    id: 'cost-5',
    serviceId: 'vpc',
    serviceName: 'Amazon VPC (NAT & Endpoints)',
    category: 'Redes y Entrega de Contenido',
    quantity: 1,
    estimatedHours: 730,
    hourlyCost: 0.015,
    monthlyCost: 10.95,
    annualCost: 131.40
  },
  {
    id: 'cost-6',
    serviceId: 'route53',
    serviceName: 'Amazon Route 53 (DNS Gestionado)',
    category: 'Redes y Entrega de Contenido',
    quantity: 2,
    estimatedHours: 730,
    hourlyCost: 0.0007,
    monthlyCost: 1.02,
    annualCost: 12.24
  }
];
