import { SupabaseClient } from '@supabase/supabase-js';
import { ClientProfile, ClientConsultation, AuditLogEntry } from '../types/client';

const LS_CLIENTS = 'cloudops_client_profiles_real_v2';
const LS_CONSULTATIONS = 'cloudops_client_consultations_real_v2';
const LS_AUDIT_LOGS = 'cloudops_audit_logs_real_v2';

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Error saving to localStorage', err);
  }
}

export class SupabaseService {
  private client: SupabaseClient<any>;

  constructor(client: SupabaseClient<any>) {
    this.client = client;
  }

  // ── Clientes ───────────────────────────────────────────────────────────────
  async fetchClients(): Promise<ClientProfile[]> {
    const local = readLS<ClientProfile[]>(LS_CLIENTS, []);
    try {
      const { data, error } = await this.client
        .from('client_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return local;
      }
      if (data) {
        const mapped: ClientProfile[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          dni: d.dni || d.metadata?.dni,
          company: d.company,
          phone: d.phone,
          email: d.email,
          region: d.region,
          district: d.district,
          ip: d.ip || d.metadata?.ip,
          notes: d.notes,
          metadata: d.metadata || {},
          createdAt: d.created_at,
        }));
        writeLS(LS_CLIENTS, mapped);
        return mapped;
      }
    } catch {
      // Ignorar error de red
    }
    return local;
  }

  async saveClient(client: ClientProfile): Promise<void> {
    const local = readLS<ClientProfile[]>(LS_CLIENTS, []);
    const updated = [client, ...local.filter(c => c.id !== client.id)];
    writeLS(LS_CLIENTS, updated);

    try {
      await this.client.from('client_profiles').upsert({
        id: client.id,
        name: client.name,
        dni: client.dni,
        company: client.company,
        phone: client.phone,
        email: client.email,
        region: client.region,
        district: client.district,
        ip: client.ip,
        notes: client.notes,
        metadata: {
          ...(client.metadata || {}),
          dni: client.dni,
          ip: client.ip,
        },
        created_at: client.createdAt,
      });
    } catch (err) {
      console.warn('Could not sync client to Supabase:', err);
    }
  }

  async deleteClient(clientId: string): Promise<void> {
    const local = readLS<ClientProfile[]>(LS_CLIENTS, []);
    const updated = local.filter(c => c.id !== clientId);
    writeLS(LS_CLIENTS, updated);

    const localCons = readLS<ClientConsultation[]>(LS_CONSULTATIONS, []);
    const updatedCons = localCons.filter(c => c.clientId !== clientId);
    writeLS(LS_CONSULTATIONS, updatedCons);

    try {
      await this.client.from('client_consultations').delete().eq('client_id', clientId);
      await this.client.from('client_profiles').delete().eq('id', clientId);
    } catch (err) {
      console.warn('Could not delete client from Supabase:', err);
    }
  }

  // ── Consultas ─────────────────────────────────────────────────────────────
  async fetchConsultations(): Promise<ClientConsultation[]> {
    const local = readLS<ClientConsultation[]>(LS_CONSULTATIONS, []);
    try {
      const { data, error } = await this.client
        .from('client_consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return local;
      }
      if (data) {
        const mapped: ClientConsultation[] = data.map((d: any) => ({
          id: d.id,
          clientId: d.client_id,
          clientName: d.client_name,
          clientDni: d.client_dni || d.architecture_payload?.clientDni,
          clientIp: d.client_ip || d.architecture_payload?.clientIp,
          title: d.title,
          status: d.status,
          estimatedMonthlyCost: Number(d.estimated_monthly_cost),
          estimatedAnnualCost: Number(d.estimated_annual_cost),
          selectedRegion: d.selected_region,
          districtExecution: d.district_execution,
          latitude: Number(d.latitude) || -12.0460,
          longitude: Number(d.longitude) || -77.0305,
          servicesPayload: d.services_payload || [],
          architecturePayload: d.architecture_payload || {},
          createdAt: d.created_at,
        }));
        writeLS(LS_CONSULTATIONS, mapped);
        return mapped;
      }
    } catch {
      // Ignorar error de red
    }
    return local;
  }

  async saveConsultation(consultation: ClientConsultation): Promise<void> {
    const local = readLS<ClientConsultation[]>(LS_CONSULTATIONS, []);
    const updated = [consultation, ...local.filter(c => c.id !== consultation.id)];
    writeLS(LS_CONSULTATIONS, updated);

    try {
      await this.client.from('client_consultations').upsert({
        id: consultation.id,
        client_id: consultation.clientId,
        client_name: consultation.clientName,
        client_dni: consultation.clientDni,
        client_ip: consultation.clientIp,
        title: consultation.title,
        status: consultation.status,
        estimated_monthly_cost: consultation.estimatedMonthlyCost,
        estimated_annual_cost: consultation.estimatedAnnualCost,
        selected_region: consultation.selectedRegion,
        district_execution: consultation.districtExecution,
        latitude: consultation.latitude,
        longitude: consultation.longitude,
        services_payload: consultation.servicesPayload,
        architecture_payload: {
          ...(consultation.architecturePayload || {}),
          clientDni: consultation.clientDni,
          clientIp: consultation.clientIp,
        },
        created_at: consultation.createdAt,
      });
    } catch (err) {
      console.warn('Could not sync consultation to Supabase:', err);
    }
  }

  // ── Auditoría / Bitácora ──────────────────────────────────────────────────
  async fetchAuditLogs(): Promise<AuditLogEntry[]> {
    const local = readLS<AuditLogEntry[]>(LS_AUDIT_LOGS, []);
    try {
      const { data, error } = await this.client
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(150);

      if (error) {
        return local;
      }
      if (data) {
        const mapped: AuditLogEntry[] = data.map((d: any) => ({
          id: d.id,
          action: d.action,
          entityType: d.entity_type,
          entityId: d.entity_id,
          userName: d.user_name,
          region: d.region,
          district: d.district,
          details: d.details || {},
          createdAt: d.created_at,
        }));
        writeLS(LS_AUDIT_LOGS, mapped);
        return mapped;
      }
    } catch {
      // Ignorar error de red
    }
    return local;
  }

  async logEvent(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry> {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    const local = readLS<AuditLogEntry[]>(LS_AUDIT_LOGS, []);
    const updated = [newEntry, ...local].slice(0, 200);
    writeLS(LS_AUDIT_LOGS, updated);

    try {
      await this.client.from('audit_logs').insert({
        id: newEntry.id,
        action: newEntry.action,
        entity_type: newEntry.entityType,
        entity_id: newEntry.entityId,
        user_name: newEntry.userName,
        region: newEntry.region,
        district: newEntry.district,
        details: newEntry.details,
        created_at: newEntry.createdAt,
      });
    } catch (err) {
      console.warn('Could not sync audit log to Supabase:', err);
    }

    return newEntry;
  }
}
