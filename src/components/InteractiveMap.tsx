import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoExecutionLocation, ClientConsultation } from '../types/client';
import { Crosshair, Radio } from 'lucide-react';

interface InteractiveMapProps {
  location: GeoExecutionLocation;
  consultations: ClientConsultation[];
  onSelectDistrict?: (district: string, region: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  location,
  consultations,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  // Inicialización del mapa una sola vez
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [location.latitude, location.longitude],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }
  }, []);

  // Actualización en tiempo real de marcadores y posición
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    // Limpiar marcadores anteriores
    markersGroup.clearLayers();

    // 1. Icono animado del nodo de ejecución en tiempo real
    const liveExecutionIcon = L.divIcon({
      className: 'live-gps-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 42px; height: 42px; background: rgba(37, 99, 235, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 26px; height: 26px; background: rgba(37, 99, 235, 0.5); border-radius: 50%;"></div>
          <div style="position: relative; width: 16px; height: 16px; background: #2563EB; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.4);"></div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const executionMarker = L.marker([location.latitude, location.longitude], {
      icon: liveExecutionIcon,
      zIndexOffset: 1000,
    }).addTo(markersGroup);

    executionMarker.bindPopup(`
      <div style="font-family: inherit; padding: 4px; min-width: 220px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #16a34a; border-radius: 50%; box-shadow: 0 0 6px #16a34a;"></span>
          <strong style="color: #0f172a; font-size: 13px;">Tu Dispositivo en Tiempo Real</strong>
        </div>
        <div style="font-size: 12px; color: #334155; line-height: 1.6;">
          <div><strong>Distrito:</strong> ${location.district}</div>
          <div><strong>Región:</strong> ${location.region}</div>
          <div><strong>Fuente:</strong> ${location.source === 'gps' ? '🛰️ GPS del Navegador' : '🌐 Red / ISP'}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-family: monospace;">
            Lat: ${location.latitude.toFixed(5)}, Lon: ${location.longitude.toFixed(5)}
          </div>
          <div style="margin-top: 8px; padding: 4px 8px; background: #eff6ff; color: #2563eb; border-radius: 6px; font-size: 10px; font-weight: bold; text-align: center;">
            📍 Sesión y consultas se emitirán desde este punto
          </div>
        </div>
      </div>
    `);

    // Círculo de cobertura/precisión
    const circleRadius = Math.max(100, Math.min(location.accuracyMeters || 200, 600));
    const accuracyCircle = L.circle([location.latitude, location.longitude], {
      color: '#2563EB',
      fillColor: '#3B82F6',
      fillOpacity: 0.12,
      radius: circleRadius,
      weight: 1.5,
    }).addTo(markersGroup);
    accuracyCircleRef.current = accuracyCircle;

    // 2. Marcadores REALES de consultas generadas en este nodo o por usuarios
    consultations.forEach((cons) => {
      // Usar coordenadas REALES guardadas en la consulta
      const lat = cons.latitude || location.latitude;
      const lon = cons.longitude || location.longitude;

      const clientPinIcon = L.divIcon({
        className: 'real-consultation-pin',
        html: `
          <div style="background: #0F172A; color: white; border: 2px solid #10B981; border-radius: 9999px; padding: 3px 10px; font-size: 11px; font-weight: 800; box-shadow: 0 4px 10px rgba(0,0,0,0.35); white-space: nowrap; display: flex; align-items: center; gap: 5px;">
            <span style="color: #10B981;">●</span> $${cons.estimatedMonthlyCost.toFixed(0)} USD
          </div>
        `,
        iconSize: [85, 28],
        iconAnchor: [42, 14],
      });

      const consMarker = L.marker([lat, lon], { icon: clientPinIcon }).addTo(markersGroup);
      consMarker.bindPopup(`
        <div style="padding: 4px; min-width: 220px; font-family: inherit;">
          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #10B981;">Consulta Registrada</div>
          <div style="font-weight: 700; color: #0f172a; font-size: 13px; margin: 2px 0;">${cons.clientName}</div>
          <div style="font-size: 12px; color: #475569;">${cons.title}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 6px; border-top: 1px solid #e2e8f0; pt: 4px;">
            <div>Distrito: <strong>${cons.districtExecution}</strong></div>
            <div>Fecha: ${new Date(cons.createdAt).toLocaleDateString()}</div>
            <div style="margin-top: 4px; color: #2563eb; font-weight: 800; font-size: 13px;">
              $${cons.estimatedMonthlyCost.toFixed(2)} USD / mes
            </div>
          </div>
        </div>
      `);
    });

    // Desplazar mapa suavemente a la nueva coordenada
    map.panTo([location.latitude, location.longitude], { animate: true });
  }, [location, consultations]);

  const handleCenterOnLocation = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.latitude, location.longitude], 15, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border shadow-inner" style={{ borderColor: 'var(--border)' }}>
      {/* Contenedor Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Tarjeta de Telemetría en Tiempo Real */}
      <div 
        className="absolute top-4 left-4 z-[400] card-base p-3.5 shadow-xl backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border max-w-xs transition-all"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Ubicación en Tiempo Real
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
            En vivo
          </span>
        </div>

        <div className="mt-2">
          <p className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {location.district}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Región: <span className="font-semibold text-blue-600 dark:text-blue-400">{location.region}</span>
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t space-y-1 text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <div className="flex justify-between font-mono">
            <span>Coordenadas:</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Fuente de datos:</span>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {location.source === 'gps' ? '🛰️ Satélite GPS' : '🌐 Red Directa'}
            </span>
          </div>
          {consultations.length > 0 ? (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
              <span>Consultas reales:</span>
              <span>{consultations.length} pines en mapa</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 italic pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
              Sin consultas aún. Genera una consulta para fijar un pin real.
            </div>
          )}
        </div>
      </div>

      {/* Botón flotante para recentrar en tiempo real */}
      <button
        onClick={handleCenterOnLocation}
        className="absolute bottom-4 right-4 z-[400] p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold"
        style={{ borderColor: 'var(--border)' }}
        title="Recentrar en mi ubicación actual"
      >
        <Crosshair className="w-4 h-4 text-blue-600" />
        <span>Recentrar</span>
      </button>
    </div>
  );
};
