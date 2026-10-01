import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoExecutionLocation, ClientConsultation, ClientProfile } from '../types/client';
import { Crosshair, Building2, Maximize2 } from 'lucide-react';

interface InteractiveMapProps {
  location: GeoExecutionLocation;
  consultations: ClientConsultation[];
  activeClient?: ClientProfile | null;
  onSelectDistrict?: (district: string, region: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  location,
  consultations,
  activeClient,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const hasInitializedViewRef = useRef(false);
  const lastTargetClientIdRef = useRef<string | null>(null);

  // Inicialización del mapa una sola vez
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = activeClient?.latitude || location.latitude;
      const initialLon = activeClient?.longitude || location.longitude;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Invalidate size para asegurar renderizado completo en dispositivos móviles y túneles
      setTimeout(() => {
        map.invalidateSize();
      }, 250);

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

    // 1. Icono animado del nodo de ejecución en tiempo real (Dispositivo / Operador)
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
          <span style="display: inline-block; width: 8px; height: 8px; background: #2563eb; border-radius: 50%; box-shadow: 0 0 6px #2563eb;"></span>
          <strong style="color: #0f172a; font-size: 13px;">Tu Dispositivo (Operador)</strong>
        </div>
        <div style="font-size: 12px; color: #334155; line-height: 1.6;">
          <div><strong>Distrito:</strong> ${location.district}</div>
          <div><strong>Región:</strong> ${location.region}</div>
          <div><strong>Fuente:</strong> ${location.source === 'gps' ? '🛰️ GPS del Navegador' : '🌐 Red / ISP'}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-family: monospace;">
            Lat: ${location.latitude.toFixed(5)}, Lon: ${location.longitude.toFixed(5)}
          </div>
          <div style="margin-top: 8px; padding: 4px 8px; background: #eff6ff; color: #2563eb; border-radius: 6px; font-size: 10px; font-weight: bold; text-align: center;">
            📍 Estación de trabajo / Admin
          </div>
        </div>
      </div>
    `);

    executionMarker.bindTooltip(`
      <div style="font-family: inherit; font-size: 11px; font-weight: bold; color: #1e40af;">
        🛰️ Tu Dispositivo (${location.district})
      </div>
    `, { direction: 'top', offset: [0, -14] });

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

    // 2. PIN DESTACADO DEL CLIENTE ACTIVO (Si existe)
    if (activeClient && activeClient.latitude && activeClient.longitude) {
      const clientPinIcon = L.divIcon({
        className: 'active-client-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background: #0f172a; color: white; border: 2px solid #10b981; border-radius: 9999px; padding: 4px 10px; font-size: 11px; font-weight: 800; box-shadow: 0 4px 14px rgba(0,0,0,0.4); white-space: nowrap; display: flex; align-items: center; gap: 6px;">
              <span style="color: #10b981; font-size: 13px;">🏢</span>
              <span>${activeClient.company || activeClient.name}</span>
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #10b981;"></div>
          </div>
        `,
        iconSize: [140, 36],
        iconAnchor: [70, 36],
      });

      const clientMarker = L.marker([activeClient.latitude, activeClient.longitude], {
        icon: clientPinIcon,
        zIndexOffset: 1200,
      }).addTo(markersGroup);

      clientMarker.bindTooltip(`
        <div style="font-family: inherit; font-size: 11px; padding: 2px;">
          <strong style="color: #047857; font-size: 12px;">🏢 Sede: ${activeClient.company}</strong>
          <div style="color: #334155; font-size: 11px;">Contacto: ${activeClient.name} · ${activeClient.district}</div>
        </div>
      `, { direction: 'top', offset: [0, -32] });

      clientMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 230px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; background: #10B981; border-radius: 50%; box-shadow: 0 0 6px #10B981;"></span>
            <strong style="color: #0f172a; font-size: 13px;">Cliente Activo: ${activeClient.name}</strong>
          </div>
          <div style="font-size: 12px; color: #334155; line-height: 1.6;">
            <div><strong>Empresa:</strong> ${activeClient.company}</div>
            <div><strong>Distrito:</strong> ${activeClient.district}</div>
            <div><strong>Región:</strong> ${activeClient.region}</div>
            ${activeClient.phone ? `<div><strong>Teléfono:</strong> ${activeClient.phone}</div>` : ''}
            <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-family: monospace;">
              GPS: ${activeClient.latitude.toFixed(4)}, ${activeClient.longitude.toFixed(4)}
            </div>
            <div style="margin-top: 8px; padding: 4px 8px; background: #ecfdf5; color: #047857; border-radius: 6px; font-size: 10px; font-weight: bold; text-align: center;">
              📍 Sede del Cliente seleccionada para reunión
            </div>
          </div>
        </div>
      `);
    }

    // 3. Marcadores de consultas generadas
    consultations
      .filter(cons => !cons.id.startsWith('test-') && !cons.clientName?.toLowerCase().includes('test client') && cons.clientName !== 'Test Client')
      .forEach((cons) => {
      const lat = cons.latitude || location.latitude;
      const lon = cons.longitude || location.longitude;

      // Extraer nombre amigable de la empresa o cliente para la pastilla
      const rawName = cons.clientName || 'Cliente';
      const cleanName = rawName.includes('(')
        ? rawName.split('(')[1].replace(')', '').trim()
        : rawName.trim();
      const shortName = cleanName.length > 22 ? cleanName.substring(0, 20) + '...' : cleanName;

      const clientPinIcon = L.divIcon({
        className: 'real-consultation-pin',
        html: `
          <div style="cursor: pointer; background: #0F172A; color: white; border: 2px solid #3B82F6; border-radius: 9999px; padding: 4px 10px; font-size: 11px; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,0.45); white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; transform: translate(-50%, -50%); transition: transform 0.15s ease;">
            <span style="display: inline-block; width: 8px; height: 8px; background: #38BDF8; border-radius: 50%; box-shadow: 0 0 6px #38BDF8;"></span>
            <span style="color: #F8FAFC; font-weight: 800; font-size: 11px;">${shortName}</span>
            <span style="color: #64748B;">|</span>
            <span style="color: #34D399; font-weight: 800; font-size: 11px;">$${cons.estimatedMonthlyCost.toFixed(0)} USD</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const consMarker = L.marker([lat, lon], { icon: clientPinIcon, zIndexOffset: 800 }).addTo(markersGroup);

      // Tooltip informativo al pasar el mouse (Hover)
      consMarker.bindTooltip(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 4px; min-width: 190px;">
          <div style="font-weight: 800; color: #1e40af; font-size: 12px; display: flex; align-items: center; gap: 4px;">
            <span>🏢</span> <span>${cons.clientName}</span>
          </div>
          <div style="font-weight: 600; color: #0f172a; margin-top: 2px; font-size: 12px;">
            ${cons.title}
          </div>
          <div style="color: #64748b; font-size: 11px; margin-top: 4px;">
            📍 Distrito: <strong>${cons.districtExecution}</strong> (${cons.selectedRegion})
          </div>
          <div style="color: #15803d; font-weight: 800; font-size: 12px; margin-top: 3px;">
            Cotización: $${cons.estimatedMonthlyCost.toFixed(2)} USD/mes
          </div>
          <div style="color: #2563eb; font-size: 10px; margin-top: 4px; font-style: italic;">
            👉 Clic para ver desglose completo de servicios AWS
          </div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -14],
        opacity: 0.98,
      });

      // Popup completo al hacer clic
      consMarker.bindPopup(`
        <div style="padding: 6px; min-width: 240px; font-family: inherit;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 9999px;">
              Consulta Registrada
            </span>
            <span style="font-size: 11px; color: #16a34a; font-weight: bold;">${cons.status}</span>
          </div>
          <div style="font-weight: 800; color: #0f172a; font-size: 14px; margin: 4px 0 2px 0;">
            ${cons.clientName}
          </div>
          <div style="font-size: 12px; color: #475569; font-weight: 500;">
            ${cons.title}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px; line-height: 1.6;">
            <div>📍 Distrito: <strong>${cons.districtExecution}</strong> (${cons.selectedRegion})</div>
            <div>📅 Fecha: ${new Date(cons.createdAt).toLocaleDateString('es-PE')}</div>
            <div style="margin-top: 6px; padding: 6px 8px; background: #f0fdf4; border-radius: 6px; border: 1px solid #bbf7d0; color: #15803d; font-weight: 800; font-size: 13px;">
              Total: $${cons.estimatedMonthlyCost.toFixed(2)} USD / mes
            </div>
            ${cons.servicesPayload && cons.servicesPayload.length > 0 ? `
              <div style="margin-top: 6px; font-size: 10px; color: #64748b;">
                Servicios: ${cons.servicesPayload.map(s => s.serviceName).join(', ')}
              </div>
            ` : ''}
          </div>
        </div>
      `);
    });

    // Solo centrar la vista automáticamente al cargar por primera vez o si se selecciona un cliente nuevo
    const currentClientId = activeClient?.id || null;
    const isNewClient = currentClientId && currentClientId !== lastTargetClientIdRef.current;

    if (!hasInitializedViewRef.current || isNewClient) {
      hasInitializedViewRef.current = true;
      lastTargetClientIdRef.current = currentClientId;

      if (activeClient && activeClient.latitude && activeClient.longitude) {
        map.setView([activeClient.latitude, activeClient.longitude], 14, { animate: true });
      } else {
        map.setView([location.latitude, location.longitude], 13, { animate: true });
      }
    }
  }, [location, consultations, activeClient]);

  const handleCenterOnClient = () => {
    if (mapInstanceRef.current && activeClient?.latitude && activeClient?.longitude) {
      mapInstanceRef.current.setView([activeClient.latitude, activeClient.longitude], 15, { animate: true });
    }
  };

  const handleCenterOnLocation = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.latitude, location.longitude], 15, { animate: true });
    }
  };

  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const points: L.LatLngExpression[] = [
      [location.latitude, location.longitude]
    ];

    if (activeClient?.latitude && activeClient?.longitude) {
      points.push([activeClient.latitude, activeClient.longitude]);
    }

    consultations.forEach(c => {
      if (c.latitude && c.longitude) {
        points.push([c.latitude, c.longitude]);
      }
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    }
  };

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border shadow-inner" style={{ borderColor: 'var(--border)' }}>
      {/* Contenedor Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Botones flotantes para alternar foco */}
      <div className="absolute bottom-4 right-4 z-[400] flex flex-wrap items-center justify-end gap-2">
        <button
          onClick={handleFitAll}
          className="p-2.5 rounded-xl bg-slate-900/95 hover:bg-slate-900 text-white border border-slate-700 shadow-xl transition-all flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm"
          title="Ajustar zoom para ver todas las sedes y nodos en el mapa"
        >
          <Maximize2 className="w-4 h-4 text-amber-400" />
          <span>Ver Todas las Sedes</span>
        </button>

        {activeClient && activeClient.latitude && activeClient.longitude && (
          <button
            onClick={handleCenterOnClient}
            className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title={`Centrar en sede del cliente: ${activeClient.district}`}
          >
            <Building2 className="w-4 h-4" />
            <span>Ver Cliente ({activeClient.district})</span>
          </button>
        )}

        <button
          onClick={handleCenterOnLocation}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Centrar en mi ubicación actual"
        >
          <Crosshair className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Mi Dispositivo</span>
        </button>
      </div>
    </div>
  );
};
