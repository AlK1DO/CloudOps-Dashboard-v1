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
  generateConsultation: (customTitle?: string, overrideData?: Partial<ClientConsultation>) => Promise<ClientConsultation | null>;
  deleteConsultation: (consultationId: string) => Promise<void>;
  exportConsultationAsJSON: (consultation: ClientConsultation) => void;
  exportConsultationAsPrint: (consultation: ClientConsultation) => void;
  exportClientSummary: (client: ClientProfile) => void;
  deleteAuditLog: (id: string) => Promise<void>;
  clearAuditLogs: () => Promise<void>;
  logAuditEvent: (action: AuditLogEntry['action'], entityType: AuditLogEntry['entityType'], details: Record<string, any>, entityId?: string) => Promise<void>;
  showClientModal: boolean;
  setShowClientModal: (show: boolean) => void;
  refreshData: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const LS_ACTIVE_CLIENT_ID = 'cloudops_active_client_id_v2';

export const PERU_DISTRICTS: Record<string, { lat: number; lon: number; region: string }> = {
  'San Isidro': { lat: -12.0984, lon: -77.0353, region: 'Lima' },
  'Miraflores': { lat: -12.1211, lon: -77.0298, region: 'Lima' },
  'Santiago de Surco': { lat: -12.1456, lon: -76.9934, region: 'Lima' },
  'San Borja': { lat: -12.0969, lon: -77.0016, region: 'Lima' },
  'La Molina': { lat: -12.0838, lon: -76.9458, region: 'Lima' },
  'Cercado de Lima': { lat: -12.0460, lon: -77.0305, region: 'Lima' },
  'Jesús María': { lat: -12.0747, lon: -77.0494, region: 'Lima' },
  'Lince': { lat: -12.0831, lon: -77.0361, region: 'Lima' },
  'Magdalena del Mar': { lat: -12.0924, lon: -77.0694, region: 'Lima' },
  'Pueblo Libre': { lat: -12.0728, lon: -77.0628, region: 'Lima' },
  'San Miguel': { lat: -12.0792, lon: -77.0858, region: 'Lima' },
  'Surquillo': { lat: -12.1128, lon: -77.0206, region: 'Lima' },
  'Barranco': { lat: -12.1481, lon: -77.0206, region: 'Lima' },
  'Chorrillos': { lat: -12.1744, lon: -77.0175, region: 'Lima' },
  'Los Olivos': { lat: -11.9932, lon: -77.0706, region: 'Lima' },
  'San Martín de Porres': { lat: -12.0125, lon: -77.0872, region: 'Lima' },
  'Independencia': { lat: -11.9904, lon: -77.0543, region: 'Lima' },
  'Comas': { lat: -11.9328, lon: -77.0456, region: 'Lima' },
  'Puente Piedra': { lat: -11.8672, lon: -77.0769, region: 'Lima' },
  'Ate': { lat: -12.0256, lon: -76.9189, region: 'Lima' },
  'Santa Anita': { lat: -12.0467, lon: -76.9686, region: 'Lima' },
  'San Juan de Lurigancho': { lat: -11.9833, lon: -76.9997, region: 'Lima' },
  'San Juan de Miraflores': { lat: -12.1625, lon: -76.9744, region: 'Lima' },
  'Villa El Salvador': { lat: -12.2081, lon: -76.9367, region: 'Lima' },
  'Callao (Centro)': { lat: -12.0565, lon: -77.1181, region: 'Callao' },
  'Bellavista': { lat: -12.0628, lon: -77.1264, region: 'Callao' },
  'La Punta': { lat: -12.0714, lon: -77.1639, region: 'Callao' },
  'Arequipa': { lat: -16.4090, lon: -71.5375, region: 'Arequipa' },
  'Trujillo': { lat: -8.1159, lon: -79.0299, region: 'La Libertad' },
  'Chiclayo': { lat: -6.7714, lon: -79.8409, region: 'Lambayeque' },
  'Piura': { lat: -5.1945, lon: -80.6328, region: 'Piura' },
  'Cusco': { lat: -13.5319, lon: -71.9675, region: 'Cusco' },
  'Huancayo': { lat: -12.0651, lon: -75.2049, region: 'Junín' },
};

export function resolveDistrictCoordinates(districtName: string): { lat: number; lon: number; region: string } {
  if (!districtName) return { lat: -12.0460, lon: -77.0305, region: 'Lima' };
  const clean = districtName.trim().toLowerCase();
  for (const [dName, data] of Object.entries(PERU_DISTRICTS)) {
    const dLower = dName.toLowerCase();
    if (dLower === clean || clean.includes(dLower) || dLower.includes(clean)) {
      return data;
    }
  }
  return { lat: -12.0460, lon: -77.0305, region: 'Lima' };
}

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

  const [clients, setClients] = useState<ClientProfile[]>(() => {
    try {
      const raw = localStorage.getItem('cloudops_client_profiles_real_v2');
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter((c: any) => !c.id?.startsWith('test-') && !c.name?.toLowerCase().includes('test')) : [];
    } catch {
      return [];
    }
  });
  const [consultations, setConsultations] = useState<ClientConsultation[]>(() => {
    try {
      const raw = localStorage.getItem('cloudops_client_consultations_real_v2');
      if (raw) {
        const list = JSON.parse(raw) as ClientConsultation[];
        return Array.isArray(list) ? list.filter((c: any) => !c.id?.startsWith('test-') && !c.clientName?.toLowerCase().includes('test client') && c.clientName !== 'Test Client') : [];
      }
    } catch {}
    return [];
  });
  const [activeClient, setActiveClientState] = useState<ClientProfile | null>(() => {
    try {
      const savedId = localStorage.getItem(LS_ACTIVE_CLIENT_ID);
      const raw = localStorage.getItem('cloudops_client_profiles_real_v2');
      if (savedId && raw && !savedId.startsWith('test-')) {
        const list = JSON.parse(raw) as ClientProfile[];
        return list.find(c => c.id === savedId && !c.id.startsWith('test-') && !c.name?.toLowerCase().includes('test')) || null;
      }
    } catch {
      // Ignorar
    }
    return null;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [executionLocation, setLocationState] = useState<GeoExecutionLocation>(INITIAL_LOCATION);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const setActiveClient = useCallback((client: ClientProfile | null) => {
    setActiveClientState(client);
    if (client) {
      localStorage.setItem(LS_ACTIVE_CLIENT_ID, client.id);
    } else {
      localStorage.removeItem(LS_ACTIVE_CLIENT_ID);
    }
  }, []);

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

      if (fetchedClients.length > 0) {
        const savedId = localStorage.getItem(LS_ACTIVE_CLIENT_ID);
        const match = savedId ? fetchedClients.find(c => c.id === savedId) : null;
        if (match) {
          setActiveClientState(match);
        } else {
          setActiveClientState(prev => prev || fetchedClients[0]);
          localStorage.setItem(LS_ACTIVE_CLIENT_ID, fetchedClients[0].id);
        }
      }
    } catch (err) {
      console.error('Error refreshing client data', err);
    }
  }, [service]);

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
    const coords = resolveDistrictCoordinates(clientData.district || 'Cercado de Lima');
    const newClient: ClientProfile = {
      ...clientData,
      id: `cli-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      latitude: clientData.latitude || coords.lat,
      longitude: clientData.longitude || coords.lon,
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
      latitude: newClient.latitude,
      longitude: newClient.longitude,
    }, newClient.id);

    addToast('success', 'Perfil registrado en tiempo real', `Cliente ${newClient.name} (${newClient.company}) en ${newClient.district} guardado.`);
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
  const generateConsultation = async (
    customTitle?: string,
    overrideData?: Partial<ClientConsultation>
  ): Promise<ClientConsultation | null> => {
    if (!activeClient) {
      addToast('warning', 'Seleccione un usuario', 'Debe seleccionar o registrar un usuario para generar la consulta.');
      setShowClientModal(true);
      return null;
    }

    const latestProposal = proposals[0];
    const servicesPayload = overrideData?.servicesPayload ?? costItems.map(item => ({
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      category: item.category,
      quantity: item.quantity,
      monthlyCost: item.monthlyCost,
    }));

    const title = customTitle || overrideData?.title || (latestProposal ? `Consulta: ${latestProposal.solutionName}` : `Propuesta Cloud - ${activeClient.company}`);

    const clientCoords = resolveDistrictCoordinates(activeClient.district || executionLocation.district);
    const consultationLat = overrideData?.latitude ?? activeClient.latitude ?? clientCoords.lat ?? executionLocation.latitude;
    const consultationLon = overrideData?.longitude ?? activeClient.longitude ?? clientCoords.lon ?? executionLocation.longitude;
    const consultationDistrict = overrideData?.districtExecution ?? activeClient.district ?? executionLocation.district;
    const consultationRegion = overrideData?.architecturePayload?.executionRegion ?? activeClient.region ?? executionLocation.region;

    const newConsultation: ClientConsultation = {
      id: overrideData?.id || `cons-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientId: activeClient.id,
      clientName: `${activeClient.name} (${activeClient.company})`,
      clientDni: activeClient.dni,
      clientIp: activeClient.ip || executionLocation.ip,
      title,
      status: overrideData?.status || 'Presentada',
      estimatedMonthlyCost: overrideData?.estimatedMonthlyCost ?? totalMonthlyCost,
      estimatedAnnualCost: overrideData?.estimatedAnnualCost ?? totalAnnualCost,
      selectedRegion: overrideData?.selectedRegion ?? selectedRegion,
      districtExecution: consultationDistrict,
      latitude: consultationLat,
      longitude: consultationLon,
      servicesPayload,
      architecturePayload: {
        solutionName: overrideData?.architecturePayload?.solutionName || latestProposal?.solutionName || 'Solución Estándar AWS',
        applicationType: overrideData?.architecturePayload?.applicationType || latestProposal?.applicationType || 'General Cloud',
        description: overrideData?.architecturePayload?.description || latestProposal?.description || 'Despliegue calculado en CloudOps Dashboard',
        estimatedUsers: overrideData?.architecturePayload?.estimatedUsers || latestProposal?.estimatedUsers || 10000,
        availabilityLevel: overrideData?.architecturePayload?.availabilityLevel || latestProposal?.availabilityLevel || 'Alta Disponibilidad',
        migrationGoal: overrideData?.architecturePayload?.migrationGoal || latestProposal?.migrationGoal || 'Optimización de Costos y Resiliencia',
        executionRegion: consultationRegion,
        executionDistrict: consultationDistrict,
        capturedCoords: { lat: consultationLat, lon: consultationLon },
        clientDni: activeClient.dni,
        clientIp: activeClient.ip || executionLocation.ip,
        ...(overrideData?.architecturePayload || {}),
      },
      createdAt: overrideData?.createdAt || new Date().toISOString(),
    };

    await service.saveConsultation(newConsultation);
    setConsultations(prev => [newConsultation, ...prev.filter(c => c.id !== newConsultation.id)]);

    await logAuditEvent('Generación de Consulta', 'Consulta', {
      consultationId: newConsultation.id,
      title: newConsultation.title,
      client: activeClient.name,
      monthlyUSD: newConsultation.estimatedMonthlyCost,
      annualUSD: newConsultation.estimatedAnnualCost,
      district: consultationDistrict,
      region: consultationRegion,
      lat: consultationLat,
      lon: consultationLon,
    }, newConsultation.id);

    addToast('success', 'Consulta generada en tiempo real', `Consulta asignada a ${activeClient.name} en ${consultationDistrict}.`);
    return newConsultation;
  };

  const deleteConsultation = async (consultationId: string) => {
    await service.deleteConsultation(consultationId);
    setConsultations(prev => prev.filter(c => c.id !== consultationId));
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

  // Exportar Resumen Integral para el Cliente (Documento Ejecutivo Imprimible / PDF)
  const exportClientSummary = (client: ClientProfile) => {
    const printWindow = window.open('', '_blank', 'width=900,height=960');
    if (!printWindow) {
      addToast('warning', 'Ventana emergente bloqueada', 'Permita ventanas emergentes para ver y descargar el reporte del cliente.');
      return;
    }

    const isCurrentClient = client.id === activeClient?.id || !activeClient;
    const hasActiveDashboardServices = isCurrentClient && (costItems.length > 0 || proposals.length > 0);

    const clientCons = consultations.filter(c => c.clientId === client.id);

    // Si tiene arquitectura activa en el Dashboard, se incorpora para que el resumen jamás salga vacío
    const activeProposal = proposals[0];
    const activeMonthlyCost = hasActiveDashboardServices ? totalMonthlyCost : 0;
    const activeAnnualCost = hasActiveDashboardServices ? totalAnnualCost : 0;

    // Calcular el total de propuestas / consultas
    const totalCount = clientCons.length + (hasActiveDashboardServices ? 1 : 0);

    // Calcular la inversión mensual acumulada o actual
    const historicalInvested = clientCons.reduce((acc, c) => acc + c.estimatedMonthlyCost, 0);
    const totalInvested = clientCons.length > 0 ? (hasActiveDashboardServices ? historicalInvested + activeMonthlyCost : historicalInvested) : activeMonthlyCost;

    // HTML de la propuesta activa en dashboard si existe
    const activeDashboardHtml = hasActiveDashboardServices ? `
      <div style="margin-bottom: 24px; padding: 20px; border: 2px solid #2563eb; border-radius: 12px; background: #f8faff;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #2563eb; letter-spacing: 0.5px;">
              📐 Arquitectura Cloud Activa (Dashboard)
            </div>
            <strong style="font-size: 18px; color: #0f172a; display: block; margin-top: 2px;">
              ${activeProposal?.solutionName || `Dimensionamiento Cloud para ${client.company}`}
            </strong>
          </div>
          <span style="font-size: 12px; color: #1e40af; font-weight: bold; background: #dbeafe; padding: 4px 10px; border-radius: 9999px; border: 1px solid #bfdbfe;">
            En Sesión / Activa
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; font-size: 12px; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div><strong>Región AWS:</strong> ${selectedRegion}</div>
          <div><strong>Tipo de Aplicación:</strong> ${activeProposal?.applicationType || 'General Cloud'}</div>
          <div><strong>Nivel Disponibilidad:</strong> ${activeProposal?.availabilityLevel || 'Alta Disponibilidad (Multi-AZ)'}</div>
          <div style="grid-column: span 3; color: #475569; margin-top: 4px;">
            <strong>Objetivo de Migración:</strong> ${activeProposal?.migrationGoal || 'Optimización de Costos y Resiliencia'}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background: #1e293b; color: #ffffff;">
              <th style="padding: 8px 12px; text-align: left;">Servicio AWS</th>
              <th style="padding: 8px 12px; text-align: left;">Categoría</th>
              <th style="padding: 8px 12px; text-align: center;">Cantidad</th>
              <th style="padding: 8px 12px; text-align: right;">Costo Mensual</th>
            </tr>
          </thead>
          <tbody>
            ${costItems.map(s => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 12px; font-weight: 600; color: #0f172a;">${s.serviceName}</td>
                <td style="padding: 8px 12px; color: #64748b;">${s.category}</td>
                <td style="padding: 8px 12px; text-align: center;">${s.quantity}</td>
                <td style="padding: 8px 12px; text-align: right; color: #2563eb; font-weight: bold;">$${s.monthlyCost.toFixed(2)} USD</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 14px; font-size: 13px; font-weight: bold; color: #0f172a;">
          Inversión Mensual Estimada: <span style="color: #16a34a; font-size: 18px; margin-left: 6px;">$${activeMonthlyCost.toFixed(2)} USD</span>
          <span style="color: #64748b; font-size: 12px; font-weight: normal; margin-left: 10px;">| Presupuesto Anual Proyectado: $${activeAnnualCost.toFixed(2)} USD</span>
        </div>
      </div>
    ` : '';

    const historicalConsultationsHtml = clientCons.length > 0 ? clientCons.map(c => `
      <div style="margin-bottom: 20px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fafafa;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
          <strong style="font-size: 15px; color: #0f172a;">${c.title}</strong>
          <span style="font-size: 12px; color: #16a34a; font-weight: bold; background: #dcfce7; padding: 2px 8px; border-radius: 9999px;">${c.status}</span>
        </div>
        <div style="font-size: 12px; color: #475569; margin-bottom: 10px;">
          <span>📍 Distrito: ${c.districtExecution} (${c.selectedRegion})</span> · 
          <span>Fecha: ${new Date(c.createdAt).toLocaleDateString('es-PE')}</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px;">
          <thead>
            <tr style="background: #e2e8f0; color: #1e293b;">
              <th style="padding: 6px 10px; text-align: left;">Servicio AWS</th>
              <th style="padding: 6px 10px; text-align: left;">Categoría</th>
              <th style="padding: 6px 10px; text-align: center;">Cantidad</th>
              <th style="padding: 6px 10px; text-align: right;">Costo Mensual</th>
            </tr>
          </thead>
          <tbody>
            ${c.servicesPayload.map(s => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px 10px; font-weight: 600;">${s.serviceName}</td>
                <td style="padding: 6px 10px; color: #64748b;">${s.category}</td>
                <td style="padding: 6px 10px; text-align: center;">${s.quantity}</td>
                <td style="padding: 6px 10px; text-align: right; color: #2563eb; font-weight: bold;">$${s.monthlyCost.toFixed(2)} USD</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="text-align: right; margin-top: 10px; font-size: 13px; font-weight: bold; color: #0f172a;">
          Total Mensual: <span style="color: #16a34a; font-size: 15px;">$${c.estimatedMonthlyCost.toFixed(2)} USD</span> | Anual: $${c.estimatedAnnualCost.toFixed(2)} USD
        </div>
      </div>
    `).join('') : '';

    const emptyStateHtml = `
      <div style="padding: 24px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 8px; color: #64748b; font-size: 13px;">
        No hay consultas ni dimensionamientos archivados aún para este cliente. Puede agregar servicios desde Planificación Cloud o Costos y Economía para armar su propuesta.
      </div>
    `;

    const mainBodyHtml = (hasActiveDashboardServices || clientCons.length > 0)
      ? `${activeDashboardHtml}${clientCons.length > 0 ? `<div class="section-title">📁 Historial de Consultas de Auditoría Registradas (${clientCons.length})</div>${historicalConsultationsHtml}` : ''}`
      : emptyStateHtml;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resumen Ejecutivo de Cliente - ${client.name}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 40px; color: #1e293b; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
            .subtitle { color: #64748b; font-size: 13px; margin-top: 4px; }
            .meta-box { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 28px; }
            .meta-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 2px; }
            .meta-val { font-size: 14px; font-weight: 600; color: #0f172a; }
            .section-title { font-size: 16px; font-weight: 800; color: #0f172a; margin: 24px 0 12px 0; border-left: 4px solid #2563eb; padding-left: 10px; }
            .kpi-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
            .kpi-card { background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 10px; }
            .kpi-num { font-size: 24px; font-weight: 800; color: #1e40af; margin-top: 4px; }
            .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">☁️ CloudOps Dashboard — Resumen del Cliente</h1>
              <div class="subtitle">Expediente y Cotizaciones de Arquitectura Cloud AWS</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 12px; font-weight: bold; color: #2563eb; background: #eff6ff; padding: 6px 12px; border-radius: 9999px; border: 1px solid #bfdbfe;">
                CONFIDENCIAL
              </span>
            </div>
          </div>

          <div class="meta-box">
            <div>
              <div class="meta-label">Cliente / Contacto</div>
              <div class="meta-val">${client.name}</div>
            </div>
            <div>
              <div class="meta-label">DNI / RUC Documento</div>
              <div class="meta-val">${client.dni || 'No registrado'}</div>
            </div>
            <div>
              <div class="meta-label">Empresa / Razón Social</div>
              <div class="meta-val">${client.company}</div>
            </div>
            <div>
              <div class="meta-label">Teléfono</div>
              <div class="meta-val">${client.phone || 'Sin teléfono'}</div>
            </div>
            <div>
              <div class="meta-label">Correo Electrónico</div>
              <div class="meta-val">${client.email || 'Sin correo'}</div>
            </div>
            <div>
              <div class="meta-label">Ubicación / Distrito</div>
              <div class="meta-val">${client.district} (${client.region})</div>
            </div>
          </div>

          <div class="kpi-row">
            <div class="kpi-card">
              <div class="meta-label">Consultas y Propuestas Totales</div>
              <div class="kpi-num">${totalCount} ${totalCount === 1 ? 'registrada' : 'registrada(s)'}</div>
            </div>
            <div class="kpi-card" style="background: #f0fdf4; border-color: #bbf7d0;">
              <div class="meta-label" style="color: #166534;">Inversión Mensual Estimada</div>
              <div class="kpi-num" style="color: #15803d;">$${totalInvested.toFixed(2)} USD/mes</div>
            </div>
          </div>

          <div class="section-title">Detalle de Propuestas y Consultas de Arquitectura</div>
          ${mainBodyHtml}

          <div class="footer">
            Generado por CloudOps Dashboard el ${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · Ubicación: ${executionLocation.district}, ${executionLocation.region}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    logAuditEvent('Exportación de Propuesta', 'Usuario', {
      format: 'CLIENT_SUMMARY_PRINT',
      clientId: client.id,
      clientName: client.name,
    }, client.id);

    addToast('success', 'Resumen listo', `Se ha generado el resumen para ${client.name}.`);
  };

  // Borrar un evento de la bitácora
  const deleteAuditLog = async (id: string) => {
    await service.deleteAuditLog(id);
    setAuditLogs(prev => prev.filter(l => l.id !== id));
    addToast('info', 'Evento eliminado', 'El registro de auditoría fue eliminado.');
  };

  // Limpiar todos los eventos de la bitácora
  const clearAuditLogs = async () => {
    await service.clearAuditLogs();
    setAuditLogs([]);
    addToast('info', 'Bitácora vaciada', 'Se han eliminado todos los registros de auditoría.');
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
        exportClientSummary,
        deleteAuditLog,
        clearAuditLogs,
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
