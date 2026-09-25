import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSupabase } from './SupabaseContext';
import { SupabaseService } from '../services/supabaseService';
import { ClientProfile, ClientConsultation, AuditLogEntry, GeoExecutionLocation } from '../types/client';
import { useCloud } from './CloudContext';
import { useToast } from './ToastContext';

interface ClientContextType {
  clients: ClientProfile[];
  consultations: ClientConsultation[];
  activeClient: ClientProfile | null;
  setActiveClient: (client: ClientProfile | null) => void;
  auditLogs: AuditLogEntry[];
  executionLocation: GeoExecutionLocation;
  setExecutionLocation: (loc: Partial<GeoExecutionLocation>) => void;
  detectLocation: () => Promise<void>;
  isDetectingLocation: boolean;
  addClient: (clientData: Omit<ClientProfile, 'id' | 'createdAt'>) => Promise<ClientProfile>;
  deleteClient: (clientId: string) => Promise<void>;
  generateConsultation: (customTitle?: string) => Promise<ClientConsultation | null>;
  deleteConsultation: (consultationId: string) => Promise<void>;
  exportConsultationAsJSON: (consultation: ClientConsultation) => void;
  exportConsultationAsPrint: (consultation: ClientConsultation) => void;
  logAuditEvent: (action: AuditLogEntry['action'], entityType: AuditLogEntry['entityType'], details: Record<string, any>, entityId?: string) => Promise<void>;
  showClientModal: boolean;
  setShowClientModal: (show: boolean) => void;
  refreshData: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

// Ubicación de arranque temporal mientras se resuelve la red o GPS real
const INITIAL_LOCATION: GeoExecutionLocation = {
  latitude: -12.0460,
  longitude: -77.0305,
  region: 'Lima',
  district: 'Cercado de Lima',
  accuracyMeters: 20,
  source: 'network_ip',
  isLiveTracking: true,
  updatedAt: new Date().toISOString(),
};

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { supabase } = useSupabase();
  const { costItems, totalMonthlyCost, totalAnnualCost, selectedRegion, proposals } = useCloud();
  const { addToast } = useToast();

  const service = useMemo(() => new SupabaseService(supabase), [supabase]);

  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [consultations, setConsultations] = useState<ClientConsultation[]>([]);
  const [activeClient, setActiveClient] = useState<ClientProfile | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [executionLocation, setLocationState] = useState<GeoExecutionLocation>(INITIAL_LOCATION);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Carga de datos reales desde Supabase / Local
  const refreshData = useCallback(async () => {
    try {
      const [fetchedClients, fetchedCons, fetchedLogs] = await Promise.all([
        service.fetchClients(),
        service.fetchConsultations(),
        service.fetchAuditLogs(),
      ]);
      setClients(fetchedClients);
      setConsultations(fetchedCons);
      setAuditLogs(fetchedLogs);

      if (fetchedClients.length > 0 && !activeClient) {
        setActiveClient(fetchedClients[0]);
      }
    } catch (err) {
      console.error('Error refreshing client data', err);
    }
  }, [service, activeClient]);

  // Carga inicial y suscripción a Supabase Realtime
  useEffect(() => {
    refreshData();

    // Suscripción Realtime a cambios en Postgres
    const channel = supabase
      .channel('cloudops-realtime-data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_profiles' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_consultations' }, () => {
        refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => {
        refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refreshData]);

  // Función de geocodificación inversa real con Nominatim
  const reverseGeocode = async (lat: number, lon: number): Promise<{ district: string; region: string }> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`, {
        headers: { 'User-Agent': 'CloudOps-Realtime-Geo/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const district = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || addr.county || addr.city || 'Distrito Local';
        const region = addr.state || addr.region || addr.city || 'Región';
        return { district, region };
      }
    } catch (e) {
      console.warn('Nominatim reverse geocode error:', e);
    }
    return { district: 'Distrito Local', region: 'Lima' };
  };

  // Detección automática en tiempo real: Red IP + GPS Watcher
  const detectLocation = useCallback(async () => {
    setIsDetectingLocation(true);

    // 1. Obtener ubicación en tiempo real vía IP pública (rápido y garantizado sin bloqueos)
    try {
      const ipRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
      if (ipRes.ok) {
        const geoData = await ipRes.json();
        const lat = parseFloat(geoData.latitude);
        const lon = parseFloat(geoData.longitude);

        if (!isNaN(lat) && !isNaN(lon)) {
          const { district, region } = await reverseGeocode(lat, lon);
          setLocationState({
            latitude: lat,
            longitude: lon,
            region: region || geoData.region || 'Lima',
            district: district || geoData.city || 'Lima Cercado',
            accuracyMeters: 500,
            source: 'network_ip',
            ip: geoData.ip,
            isLiveTracking: true,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.warn('IP Geo detection error:', err);
    } finally {
      setIsDetectingLocation(false);
    }

    // 2. Si el navegador soporta Geolocation API, activar seguimiento continuo (watchPosition)
    if (navigator.geolocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const { district, region } = await reverseGeocode(lat, lon);

          setLocationState(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon,
            region: region || prev.region,
            district: district || prev.district,
            accuracyMeters: Math.round(pos.coords.accuracy),
            source: 'gps',
            isLiveTracking: true,
            updatedAt: new Date().toISOString(),
          }));
        },
        (err) => {
          console.info('GPS Watcher: usando telemetría IP en tiempo real (', err.message, ')');
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );
    }
  }, []);

  // Iniciar detección en tiempo real al montar
  useEffect(() => {
    detectLocation();

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [detectLocation]);

  const setExecutionLocation = (loc: Partial<GeoExecutionLocation>) => {
    setLocationState(prev => ({
      ...prev,
      ...loc,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Registrar evento en bitácora en Supabase y local
  const logAuditEvent = async (
    action: AuditLogEntry['action'],
    entityType: AuditLogEntry['entityType'],
    details: Record<string, any>,
    entityId?: string
  ) => {
    const entry = await service.logEvent({
      action,
      entityType,
      entityId,
      userName: activeClient ? activeClient.name : 'Arquitecto Cloud (Admin)',
      region: executionLocation.region,
      district: executionLocation.district,
      details,
    });
    setAuditLogs(prev => [entry, ...prev.filter(l => l.id !== entry.id)]);
  };

  // Crear perfil de cliente
  const addClient = async (clientData: Omit<ClientProfile, 'id' | 'createdAt'>): Promise<ClientProfile> => {
    const newClient: ClientProfile = {
      ...clientData,
      id: `cli-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    await service.saveClient(newClient);
    setClients(prev => [newClient, ...prev.filter(c => c.id !== newClient.id)]);
    setActiveClient(newClient);

    await logAuditEvent('Creación de Usuario', 'Usuario', {
      name: newClient.name,
      company: newClient.company,
      region: newClient.region,
      district: newClient.district,
      phone: newClient.phone,
    }, newClient.id);

    addToast('success', 'Perfil registrado en tiempo real', `Cliente ${newClient.name} (${newClient.company}) guardado.`);
    return newClient;
  };

  // Eliminar perfil de cliente
  const deleteClient = async (clientId: string) => {
    const clientToDelete = clients.find(c => c.id === clientId);
    await service.deleteClient(clientId);

    setClients(prev => prev.filter(c => c.id !== clientId));
    setConsultations(prev => prev.filter(c => c.clientId !== clientId));

    if (activeClient?.id === clientId) {
      const remaining = clients.filter(c => c.id !== clientId);
      setActiveClient(remaining.length > 0 ? remaining[0] : null);
    }

    if (clientToDelete) {
      await logAuditEvent('Eliminación de Usuario', 'Usuario', {
        deletedClientId: clientId,
        name: clientToDelete.name,
        company: clientToDelete.company,
      }, clientId);
    }

    addToast('info', 'Usuario eliminado', 'El perfil y sus consultas asociadas han sido removidos.');
  };

  // Generar consulta para el cliente activo con coordenadas reales
  const generateConsultation = async (customTitle?: string): Promise<ClientConsultation | null> => {
    if (!activeClient) {
      addToast('warning', 'Seleccione un usuario', 'Debe seleccionar o registrar un usuario para generar la consulta.');
      setShowClientModal(true);
      return null;
    }

    const latestProposal = proposals[0];
    const servicesPayload = costItems.map(item => ({
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      category: item.category,
      quantity: item.quantity,
      monthlyCost: item.monthlyCost,
    }));

    const title = customTitle || (latestProposal ? `Consulta: ${latestProposal.solutionName}` : `Propuesta Cloud - ${activeClient.company}`);

    const newConsultation: ClientConsultation = {
      id: `cons-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientId: activeClient.id,
      clientName: `${activeClient.name} (${activeClient.company})`,
      clientDni: activeClient.dni,
      clientIp: activeClient.ip || executionLocation.ip,
      title,
      status: 'Presentada',
      estimatedMonthlyCost: totalMonthlyCost,
      estimatedAnnualCost: totalAnnualCost,
      selectedRegion,
      districtExecution: executionLocation.district,
      latitude: executionLocation.latitude,   // Coordenada REAL en vivo
      longitude: executionLocation.longitude, // Coordenada REAL en vivo
      servicesPayload,
      architecturePayload: {
        solutionName: latestProposal?.solutionName || 'Solución Estándar AWS',
        applicationType: latestProposal?.applicationType || 'General Cloud',
        description: latestProposal?.description || 'Despliegue calculado en CloudOps Dashboard',
        estimatedUsers: latestProposal?.estimatedUsers || 10000,
        availabilityLevel: latestProposal?.availabilityLevel || 'Alta Disponibilidad',
        migrationGoal: latestProposal?.migrationGoal || 'Optimización de Costos y Resiliencia',
        executionRegion: executionLocation.region,
        executionDistrict: executionLocation.district,
        capturedCoords: { lat: executionLocation.latitude, lon: executionLocation.longitude },
        clientDni: activeClient.dni,
        clientIp: activeClient.ip || executionLocation.ip,
      },
      createdAt: new Date().toISOString(),
    };

    await service.saveConsultation(newConsultation);
    setConsultations(prev => [newConsultation, ...prev.filter(c => c.id !== newConsultation.id)]);

    await logAuditEvent('Generación de Consulta', 'Consulta', {
      consultationId: newConsultation.id,
      title: newConsultation.title,
      client: activeClient.name,
      monthlyUSD: totalMonthlyCost,
      annualUSD: totalAnnualCost,
      district: executionLocation.district,
      region: executionLocation.region,
      lat: executionLocation.latitude,
      lon: executionLocation.longitude,
    }, newConsultation.id);

    addToast('success', 'Consulta generada en tiempo real', `Consulta asignada a ${activeClient.name} en ${executionLocation.district}.`);
    return newConsultation;
  };

  const deleteConsultation = async (consultationId: string) => {
    setConsultations(prev => prev.filter(c => c.id !== consultationId));
    try {
      await supabase.from('client_consultations').delete().eq('id', consultationId);
    } catch (e) {
      console.warn('Error deleting consultation', e);
    }
    addToast('info', 'Consulta eliminada', 'La consulta fue removida.');
  };

  // Exportar como JSON
  const exportConsultationAsJSON = (consultation: ClientConsultation) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(consultation, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `consulta-${consultation.id}-${consultation.clientName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logAuditEvent('Exportación de Propuesta', 'Consulta', {
      format: 'JSON',
      consultationId: consultation.id,
      clientName: consultation.clientName,
    }, consultation.id);

    addToast('success', 'Archivo exportado', 'El archivo JSON de la consulta se ha descargado.');
  };

  // Exportar como documento imprimible / PDF
  const exportConsultationAsPrint = (consultation: ClientConsultation) => {
    const printWindow = window.open('', '_blank', 'width=880,height=960');
    if (!printWindow) {
      addToast('warning', 'Ventana bloqueada', 'Permita ventanas emergentes para imprimir la propuesta.');
      return;
    }

    const servicesHtml = consultation.servicesPayload.map(s => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: 600; color: #1e293b;">${s.serviceName}</td>
        <td style="padding: 10px 14px; color: #64748b;">${s.category}</td>
        <td style="padding: 10px 14px; text-align: center; color: #1e293b;">${s.quantity}</td>
        <td style="padding: 10px 14px; text-align: right; font-weight: bold; color: #2563eb;">$${s.monthlyCost.toFixed(2)} USD</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte de Consulta Cloud - ${consultation.title}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 40px; color: #1e293b; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            .logo { font-size: 26px; font-weight: 800; color: #0f172a; }
            .badge { background: #eff6ff; color: #2563eb; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: bold; border: 1px solid #bfdbfe; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 28px 0; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .meta-item { font-size: 13px; }
            .meta-label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; margin-bottom: 3px; }
            .meta-value { color: #0f172a; font-weight: 700; font-size: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #0f172a; color: white; padding: 12px 14px; text-align: left; font-size: 12px; text-transform: uppercase; }
            .totals { margin-top: 30px; text-align: right; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .total-line { font-size: 16px; margin: 6px 0; color: #475569; }
            .total-highlight { font-size: 24px; font-weight: 800; color: #16a34a; }
            .footer { margin-top: 50px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">☁️ CloudOps Dashboard</div>
              <div style="color: #64748b; font-size: 13px; margin-top: 2px;">Propuesta y Consulta de Arquitectura AWS Cloud</div>
            </div>
            <div class="badge">${consultation.status}</div>
          </div>

          <div style="margin-top: 24px;">
            <h1 style="font-size: 22px; color: #0f172a; margin-bottom: 4px;">${consultation.title}</h1>
            <p style="color: #64748b; margin: 0; font-size: 14px;">Generado para: <strong>${consultation.clientName}</strong></p>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">ID de Consulta</div>
              <div class="meta-value">${consultation.id}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Fecha de Presentación</div>
              <div class="meta-value">${new Date(consultation.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Región AWS Evaluada</div>
              <div class="meta-value">${consultation.selectedRegion}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Ubicación de Atención y Ejecución</div>
              <div class="meta-value">Distrito: ${consultation.districtExecution} (${executionLocation.region}) · GPS: ${consultation.latitude.toFixed(4)}, ${consultation.longitude.toFixed(4)}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">DNI / Documento Identidad</div>
              <div class="meta-value">${consultation.clientDni || 'No registrado'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">IP Pública de Registro</div>
              <div class="meta-value">${consultation.clientIp || executionLocation.ip || '181.176.209.235'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Objetivo de Arquitectura</div>
              <div class="meta-value">${consultation.architecturePayload?.migrationGoal || 'Optimización Cloud'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Nivel de Disponibilidad Estimado</div>
              <div class="meta-value">${consultation.architecturePayload?.availabilityLevel || 'Alta Disponibilidad Multi-AZ'}</div>
            </div>
          </div>

          <h3 style="font-size: 16px; margin-top: 24px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
            Desglose de Servicios AWS y Estimación de Inversión
          </h3>

          <table>
            <thead>
              <tr>
                <th>Servicio AWS</th>
                <th>Categoría</th>
                <th style="text-align: center;">Cantidad</th>
                <th style="text-align: right;">Costo Mensual Estimado</th>
              </tr>
            </thead>
            <tbody>
              ${servicesHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-line">Estimación Mensual Base: <strong>$${consultation.estimatedMonthlyCost.toFixed(2)} USD</strong></div>
            <div class="total-line total-highlight">Presupuesto Anual Proyectado: $${consultation.estimatedAnnualCost.toFixed(2)} USD</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">* Estimaciones calculadas en tiempo real para ${consultation.districtExecution}.</div>
          </div>

          <div class="footer">
            Documento generado por CloudOps Dashboard · PostgreSQL Supabase en Tiempo Real · ${new Date().getFullYear()}
          </div>

          <div style="margin-top: 30px; text-align: center;" class="no-print">
            <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 12px 28px; font-size: 14px; font-weight: bold; border-radius: 8px; cursor: pointer;">
              🖨️ Imprimir / Guardar como PDF
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    logAuditEvent('Exportación de Propuesta', 'Consulta', {
      format: 'PDF_PRINT',
      consultationId: consultation.id,
      clientName: consultation.clientName,
    }, consultation.id);

    addToast('info', 'Documento listo', 'Se ha abierto la vista de impresión / exportación en PDF.');
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        consultations,
        activeClient,
        setActiveClient,
        auditLogs,
        executionLocation,
        setExecutionLocation,
        detectLocation,
        isDetectingLocation,
        addClient,
        deleteClient,
        generateConsultation,
        deleteConsultation,
        exportConsultationAsJSON,
        exportConsultationAsPrint,
        logAuditEvent,
        showClientModal,
        setShowClientModal,
        refreshData,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) throw new Error('useClient must be used within a ClientProvider');
  return context;
};
