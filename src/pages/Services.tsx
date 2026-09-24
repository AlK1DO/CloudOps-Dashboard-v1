import React, { useState, useMemo } from 'react';
import {
  Info,
  Search,
  Layers,
  X,
  Server,
  HardDrive,
  Database,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { AWS_SERVICES } from '../data/awsServices';
import { ServiceCard } from '../components/ServiceCard';
import { ServiceDetailModal } from '../components/ServiceDetailModal';
import { ServiceCategory, AwsService } from '../types/cloud';

type FilterCategory = 'Todos' | ServiceCategory;

const CATEGORY_OPTIONS: FilterCategory[] = [
  'Todos',
  'Computación',
  'Almacenamiento',
  'Base de Datos',
  'Seguridad',
  'Redes y Entrega de Contenido',
];

const CATEGORY_ICONS: Record<FilterCategory, React.ReactNode> = {
  Todos: <Layers className="w-4 h-4" />,
  Computación: <Server className="w-4 h-4" />,
  Almacenamiento: <HardDrive className="w-4 h-4" />,
  'Base de Datos': <Database className="w-4 h-4" />,
  Seguridad: <ShieldCheck className="w-4 h-4" />,
  'Redes y Entrega de Contenido': <Share2 className="w-4 h-4" />,
};

const CATEGORY_COLORS: Record<FilterCategory, string> = {
  Todos: 'bg-[#2563EB] text-white border-[#2563EB]',
  Computación: 'bg-blue-600 text-white border-blue-600',
  Almacenamiento: 'bg-violet-600 text-white border-violet-600',
  'Base de Datos': 'bg-rose-600 text-white border-rose-600',
  Seguridad: 'bg-[#16A34A] text-white border-[#16A34A]',
  'Redes y Entrega de Contenido': 'bg-amber-500 text-white border-amber-500',
};

const CATEGORY_INACTIVE: Record<FilterCategory, string> = {
  Todos: 'text-[#64748B] border-[#E2E8F0] hover:bg-slate-100',
  Computación: 'text-blue-600 border-blue-200 hover:bg-blue-50',
  Almacenamiento: 'text-violet-600 border-violet-200 hover:bg-violet-50',
  'Base de Datos': 'text-rose-600 border-rose-200 hover:bg-rose-50',
  Seguridad: 'text-[#16A34A] border-green-200 hover:bg-emerald-50',
  'Redes y Entrega de Contenido': 'text-amber-600 border-amber-200 hover:bg-amber-50',
};

export const Services: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('Todos');
  const [selectedService, setSelectedService] = useState<AwsService | null>(null);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return AWS_SERVICES.filter((s) => {
      const matchCategory = activeCategory === 'Todos' || s.category === activeCategory;
      const matchSearch =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term) ||
        s.mainFunction.toLowerCase().includes(term);
      return matchCategory && matchSearch;
    });
  }, [search, activeCategory]);

  const countByCategory = useMemo(() => {
    const map: Record<string, number> = { Todos: AWS_SERVICES.length };
    AWS_SERVICES.forEach((s) => {
      map[s.category] = (map[s.category] || 0) + 1;
    });
    return map;
  }, []);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="card-base p-6 border-l-4 border-l-[#2563EB]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1E293B]">
              Catálogo de Servicios AWS
            </h2>
            <p className="text-sm text-[#64748B] mt-1 max-w-3xl">
              Catálogo de los servicios utilizados en la solución. Cada servicio incluye categoría,
              descripción técnica, función principal y estado de utilización. Usa el buscador o
              filtra por categoría para encontrar lo que necesitas.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16A34A] shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>{AWS_SERVICES.length} Servicios · 5 Categorías</span>
          </div>
        </div>
      </div>

      {/* Buscador + Filtros */}
      <div className="card-base p-4 space-y-4">
        {/* Campo de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría o función… (ej. EC2, DNS, base de datos)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#E2E8F0] bg-slate-50 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#64748B] hover:text-[#1E293B] hover:bg-slate-200 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros por categoría */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((cat) => {
            const isActive = activeCategory === cat;
            const count = countByCategory[cat] ?? 0;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  isActive ? CATEGORY_COLORS[cat] : `bg-white ${CATEGORY_INACTIVE[cat]}`
                }`}
              >
                {CATEGORY_ICONS[cat]}
                <span>{cat}</span>
                <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${isActive ? 'bg-white/20' : 'bg-slate-100 text-[#64748B]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Resultado de la búsqueda */}
        {(search || activeCategory !== 'Todos') && (
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>
              Mostrando <strong className="text-[#1E293B]">{filtered.length}</strong> de {AWS_SERVICES.length} servicios
              {activeCategory !== 'Todos' && <> en <strong className="text-[#1E293B]">{activeCategory}</strong></>}
              {search && <> · búsqueda: <strong className="text-[#1E293B]">"{search}"</strong></>}
            </span>
            <button
              onClick={() => { setSearch(''); setActiveCategory('Todos'); }}
              className="text-[#2563EB] hover:underline font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Grid de tarjetas */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={(s) => setSelectedService(s)}
            />
          ))}
        </div>
      ) : (
        <div className="card-base p-12 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Search className="w-7 h-7 text-[#64748B]" />
          </div>
          <p className="text-sm font-semibold text-[#1E293B]">Sin resultados</p>
          <p className="text-xs text-[#64748B] max-w-xs">
            Ningún servicio coincide con "<strong>{search}</strong>"
            {activeCategory !== 'Todos' && <> en la categoría <strong>{activeCategory}</strong></>}.
            Prueba con otro término o limpia los filtros.
          </p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('Todos'); }}
            className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            Ver todos los servicios
          </button>
        </div>
      )}

      {/* Nota conceptual */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs text-[#1E293B] leading-relaxed">
          <strong className="font-semibold text-[#2563EB]">Fundamento Cloud: </strong>
          Los servicios mostrados cubren las 5 categorías fundamentales de AWS:{' '}
          <em>Computación</em> (EC2), <em>Almacenamiento</em> (S3),{' '}
          <em>Bases de Datos Relacionales</em> (RDS), <em>Seguridad e Identidad</em> (IAM), y{' '}
          <em>Redes y Distribución Global</em> (VPC, Route 53, CloudFront). Juntos conforman la
          arquitectura completa de la solución propuesta.
        </div>
      </div>

      {/* Modal de vista detallada */}
      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
};
