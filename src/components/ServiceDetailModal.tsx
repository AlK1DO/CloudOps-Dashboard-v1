import React, { useEffect } from 'react';
import {
  X,
  Server,
  HardDrive,
  Database,
  ShieldCheck,
  Share2,
  Zap,
  Tag,
  DollarSign,
  CheckCircle2,
  Globe,
  Layers,
  Clock,
} from 'lucide-react';
import { AwsService } from '../types/cloud';
import { StatusBadge } from './StatusBadge';

interface ServiceDetailModalProps {
  service: AwsService | null;
  onClose: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Computación':               return <Server className="w-6 h-6" />;
    case 'Almacenamiento':            return <HardDrive className="w-6 h-6" />;
    case 'Base de Datos':             return <Database className="w-6 h-6" />;
    case 'Seguridad':                 return <ShieldCheck className="w-6 h-6" />;
    case 'Redes y Entrega de Contenido': return <Share2 className="w-6 h-6" />;
    default:                          return <Zap className="w-6 h-6" />;
  }
};

const CATEGORY_COLOR: Record<string, string> = {
  'Computación':                    'bg-blue-600',
  'Almacenamiento':                 'bg-violet-600',
  'Base de Datos':                  'bg-rose-600',
  'Seguridad':                      'bg-[#16A34A]',
  'Redes y Entrega de Contenido':   'bg-amber-500',
};

// Información adicional por servicio
const EXTRA_INFO: Record<string, {
  useCases: string[];
  keyFeatures: string[];
  pricingModel: string;
  awsLink: string;
}> = {
  ec2: {
    useCases: ['Servidores web y aplicaciones', 'Backend de APIs REST', 'Procesamiento batch', 'Entornos de desarrollo y testing'],
    keyFeatures: ['Auto Scaling Groups', 'Elastic Load Balancing', 'Múltiples familias de instancias (t3, m5, c5)', 'Instancias Spot para reducir costos hasta 90%'],
    pricingModel: 'Por hora o segundo de uso. Opciones: On-Demand, Reserved (1-3 años), Spot y Savings Plans.',
    awsLink: 'https://aws.amazon.com/ec2/',
  },
  s3: {
    useCases: ['Almacenamiento de backups', 'Hosting de sitios estáticos', 'Data lake para analítica', 'Distribución de contenido con CloudFront'],
    keyFeatures: ['11 nueves de durabilidad (99.999999999%)', 'Versionado de objetos', 'Políticas de ciclo de vida', 'Cifrado SSE-S3 / SSE-KMS por defecto'],
    pricingModel: 'Por GB almacenado + solicitudes GET/PUT. Niveles: Standard, Infrequent Access, Glacier.',
    awsLink: 'https://aws.amazon.com/s3/',
  },
  rds: {
    useCases: ['Bases de datos relacionales gestionadas', 'Aplicaciones OLTP', 'E-commerce y ERP', 'Sistemas con Multi-AZ para alta disponibilidad'],
    keyFeatures: ['Soporte para PostgreSQL, MySQL, MariaDB, Oracle, SQL Server', 'Backups automáticos y point-in-time recovery', 'Réplicas de lectura', 'Multi-AZ para failover automático'],
    pricingModel: 'Por hora de instancia DB + almacenamiento GB/mes + transferencia de datos.',
    awsLink: 'https://aws.amazon.com/rds/',
  },
  iam: {
    useCases: ['Control de acceso granular a recursos AWS', 'Gestión de usuarios y equipos', 'Roles para servicios y aplicaciones', 'Integración con SSO corporativo'],
    keyFeatures: ['Políticas basadas en JSON', 'MFA (Autenticación Multifactor)', 'Roles temporales con STS', 'Principio de mínimo privilegio'],
    pricingModel: 'Gratuito — sin costo adicional por uso de IAM.',
    awsLink: 'https://aws.amazon.com/iam/',
  },
  vpc: {
    useCases: ['Aislamiento de red para recursos AWS', 'Subredes públicas y privadas', 'Conexión on-premise con VPN / Direct Connect', 'Segmentación por niveles (web, app, datos)'],
    keyFeatures: ['Subredes en múltiples AZs', 'Internet Gateway y NAT Gateway', 'Security Groups y Network ACLs', 'VPC Peering y Transit Gateway'],
    pricingModel: 'VPC gratuita. Se cobran NAT Gateway, endpoints, VPN y transferencia de datos.',
    awsLink: 'https://aws.amazon.com/vpc/',
  },
  route53: {
    useCases: ['Gestión de dominios DNS', 'Enrutamiento por latencia y geolocalización', 'Failover automático a región secundaria', 'Health checks de endpoints'],
    keyFeatures: ['SLA 100% de disponibilidad', 'Enrutamiento: Simple, Weighted, Latency, Failover, Geolocation', 'Integración nativa con CloudFront y ELB', 'Soporte DNSSEC'],
    pricingModel: '$0.50/mes por zona hospedada + $0.40/millón de consultas DNS.',
    awsLink: 'https://aws.amazon.com/route53/',
  },
  cloudfront: {
    useCases: ['Distribución global de contenido estático', 'Aceleración de APIs dinámicas', 'Streaming de video', 'Terminación SSL/TLS en el edge'],
    keyFeatures: ['Más de 450 puntos de presencia (Edge Locations)', 'WAF integrado para protección DDoS', 'Caché configurable por comportamiento', 'Soporte de HTTP/3 y TLS 1.3'],
    pricingModel: 'Por GB transferido desde edge + solicitudes HTTP/S. Sin costo fijo mensual.',
    awsLink: 'https://aws.amazon.com/cloudfront/',
  },
};

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ service, onClose }) => {
  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!service) return null;

  const extra = EXTRA_INFO[service.id];
  const bgColor = CATEGORY_COLOR[service.category] ?? 'bg-slate-600';
  const Icon = getCategoryIcon(service.category);

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-[9998] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${service.name}`}
    >
      {/* Panel del modal */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-[#E2E8F0] dark:border-slate-600">

        {/* Cabecera */}
        <div className={`${bgColor} px-6 py-5 flex items-start justify-between gap-4`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              {Icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white">{service.name}</h2>
                <StatusBadge status={service.status} size="sm" />
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Tag className="w-3.5 h-3.5 text-white/70" />
                <span className="text-sm text-white/80 font-medium">{service.category}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Descripción */}
          <div>
            <h3 className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Descripción
            </h3>
            <p className="text-sm text-[#1E293B] dark:text-slate-200 leading-relaxed">{service.description}</p>
          </div>

          {/* Función principal */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-[#E2E8F0] dark:border-slate-600">
            <h3 className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#2563EB]" /> Función Principal en la Arquitectura
            </h3>
            <p className="text-sm text-[#1E293B] dark:text-slate-200 leading-relaxed">{service.mainFunction}</p>
          </div>

          {extra && (
            <>
              {/* Casos de uso */}
              <div>
                <h3 className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> Casos de Uso Principales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {extra.useCases.map((uc, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                      <span className="text-[#1E293B] dark:text-slate-200">{uc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Características clave */}
              <div>
                <h3 className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#F59E0B]" /> Características Clave
                </h3>
                <ul className="space-y-1.5">
                  {extra.keyFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#1E293B] dark:text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0 mt-1.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modelo de precios */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Modelo de Precios
                </h3>
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">{extra.pricingModel}</p>
              </div>
            </>
          )}

          {/* Tarifa simulada */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-[#E2E8F0] dark:border-slate-600">
            <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Tarifa referencial de la simulación:</span>
            </div>
            <span className="text-xs font-bold text-[#1E293B] dark:text-slate-100">
              {service.hourlyRate > 0 ? `$${service.hourlyRate.toFixed(4)} USD / hora` : 'Sin costo base (gratuito)'}
            </span>
          </div>

          {/* Unidad de medida */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-[#E2E8F0] dark:border-slate-600">
            <span className="text-xs text-[#64748B] dark:text-slate-400">Unidad de medida:</span>
            <span className="text-xs font-semibold text-[#2563EB] font-mono">{service.unitType}</span>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between gap-3">
          <p className="text-[11px] text-[#64748B] dark:text-slate-400">
            Datos simulados con fines académicos · Cloud Foundations Semanas 5-6
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
