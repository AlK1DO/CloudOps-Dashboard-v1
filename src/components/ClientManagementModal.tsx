import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Users, 
  Trash2, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Building2, 
  Phone, 
  MapPin, 
  Plus, 
  DollarSign,
  Search,
  Loader2
} from 'lucide-react';
import { useClient, PERU_DISTRICTS, resolveDistrictCoordinates } from '../context/ClientContext';
import { useCloud } from '../context/CloudContext';
import { useToast } from '../context/ToastContext';
import { lookupPeruIdentity, IdentityLookupResult } from '../services/identityService';

export const ClientManagementModal: React.FC = () => {
  const { 
    showClientModal, 
    setShowClientModal, 
    clients, 
    activeClient, 
    setActiveClient, 
    addClient, 
    deleteClient, 
    consultations,
    generateConsultation, 
    deleteConsultation,
    exportConsultationAsJSON, 
    exportConsultationAsPrint,
    exportClientSummary,
    executionLocation 
  } = useClient();

  const { totalMonthlyCost, totalAnnualCost, clearCloudData } = useCloud();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'consultations'>('list');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');

  const districtList = Object.keys(PERU_DISTRICTS);
  const [selectedPresetDistrict, setSelectedPresetDistrict] = useState<string>('San Isidro');
  const [isCustomDistrict, setIsCustomDistrict] = useState(false);

  const getInitialForm = () => {
    const coords = resolveDistrictCoordinates('San Isidro');
    return {
      name: '',
      dni: '',
      company: '',
      phone: '',
      email: '',
      region: coords.region,
      district: 'San Isidro',
      ip: executionLocation.ip || '181.176.209.235',
      notes: '',
    };
  };

  // Formulario nuevo cliente con ubicación del cliente
  const [formData, setFormData] = useState(getInitialForm);
  const [docQuery, setDocQuery] = useState('');
  const [isSearchingDoc, setIsSearchingDoc] = useState(false);
  const [docLookupResult, setDocLookupResult] = useState<IdentityLookupResult | null>(null);

  const handleLookupDoc = async () => {
    const clean = docQuery.replace(/\D/g, '').trim();
    if (clean.length !== 8 && clean.length !== 11) {
      addToast('warning', 'Documento no válido', 'Ingrese 8 dígitos para DNI o 11 dígitos para RUC.');
      return;
    }

    setIsSearchingDoc(true);
    try {
      const result = await lookupPeruIdentity(clean);
      setDocLookupResult(result);
      setSelectedPresetDistrict(result.district);
      setIsCustomDistrict(false);

      setFormData(prev => ({
        ...prev,
        dni: result.documentNumber,
        company: result.company || prev.company,
        name: result.name || prev.name,
        district: result.district,
        region: result.region,
        notes: result.address ? `Dirección Fiscal: ${result.address}. (${result.notes})` : prev.notes,
      }));

      addToast(
        'success',
        `${result.documentType} verificado ante SUNAT`,
        `${result.company} — Sede en ${result.district}`
      );
    } catch (err: any) {
      if (clean.length === 8) {
        setFormData(prev => ({ ...prev, dni: clean }));
        addToast(
          'info',
          'DNI registrado (RENIEC Privado)',
          'Por la Ley de Protección de Datos Personales (Ley N° 29733), la base de RENIEC es confidencial. Complete el Nombre del contacto y Distrito manualmente.'
        );
      } else {
        addToast('error', 'Consulta SUNAT', err?.message || 'No se pudo verificar el RUC con el padrón oficial.');
      }
    } finally {
      setIsSearchingDoc(false);
    }
  };

  const handlePresetDistrictChange = (dName: string) => {
    if (dName === '__custom__') {
      setIsCustomDistrict(true);
      return;
    }
    setIsCustomDistrict(false);
    setSelectedPresetDistrict(dName);
    const coords = resolveDistrictCoordinates(dName);
    setFormData(prev => ({
      ...prev,
      district: dName,
      region: coords.region,
    }));
  };

  const handleUseCurrentLocation = () => {
    setIsCustomDistrict(true);
    setFormData(prev => ({
      ...prev,
      district: executionLocation.district,
      region: executionLocation.region,
    }));
    addToast('info', 'Ubicación local aplicada', `${executionLocation.district}, ${executionLocation.region}`);
  };

  if (!showClientModal) return null;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.company.trim()) {
      addToast('warning', 'Campos obligatorios', 'Por favor ingrese el nombre y empresa del cliente.');
      return;
    }

    const coords = resolveDistrictCoordinates(formData.district);
    const newClient = await addClient({
      name: formData.name.trim(),
      dni: formData.dni.trim(),
      company: formData.company.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      region: formData.region.trim() || coords.region,
      district: formData.district.trim(),
      latitude: coords.lat,
      longitude: coords.lon,
      ip: formData.ip.trim() || executionLocation.ip || '181.176.209.235',
      notes: formData.notes.trim(),
      metadata: {
        dni: formData.dni.trim(),
        ip: formData.ip.trim() || executionLocation.ip || '181.176.209.235',
        latitude: coords.lat,
        longitude: coords.lon,
        registeredFromDistrict: executionLocation.district,
        initialEstimatedBudget: totalMonthlyCost,
      },
    });

    // Activar al cliente y limpiar datos anteriores para empezar en blanco según la necesidad del cliente
    setActiveClient(newClient);
    clearCloudData();

    setFormData(getInitialForm());
    setActiveTab('list');
    addToast('success', 'Cliente creado', `Perfil de ${newClient.name} (${newClient.company}) listo. Se ingresa con datos limpios para dimensionar su solución.`);
  };

  const handleGenerate = async () => {
    if (!activeClient) return;
    await generateConsultation(customTitle.trim() || undefined);
    setCustomTitle('');
    setActiveTab('consultations');
  };

  const activeClientConsultations = consultations.filter(
    c => activeClient && c.clientId === activeClient.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Gestión de Clientes & Consultas Cloud
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Perfiles de usuario semiestructurados en Supabase PostgreSQL
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowClientModal(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación del Modal */}
        <div className="flex border-b px-6 gap-2" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios ({clients.length})</span>
          </button>

          <button
            onClick={() => {
              setFormData(getInitialForm());
              setActiveTab('create');
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Perfil</span>
          </button>

          <button
            onClick={() => setActiveTab('consultations')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'consultations'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Consultas del Cliente ({activeClientConsultations.length})</span>
          </button>
        </div>

        {/* Contenido dinámico según la pestaña */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: LISTADO DE USUARIOS */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Directorio de Clientes
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Selecciona un usuario para vincularlo a la presentación y generar consultas personalizadas.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFormData(getInitialForm());
                    setActiveTab('create');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Perfil</span>
                </button>
              </div>

              {clients.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl" style={{ borderColor: 'var(--border)' }}>
                  <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>No hay usuarios registrados</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Crea un perfil para empezar a registrar consultas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clients.map((client) => {
                    const isActive = activeClient?.id === client.id;
                    const clientCons = consultations.filter(c => c.clientId === client.id);

                    return (
                      <div
                        key={client.id}
                        className={`card-base p-4 rounded-xl border relative transition-all ${
                          isActive 
                            ? 'ring-2 ring-blue-500 bg-blue-50/20 dark:bg-blue-950/20' 
                            : 'hover:border-slate-400 dark:hover:border-slate-600'
                        }`}
                        style={{ borderColor: isActive ? 'var(--color-primary)' : 'var(--border)' }}
                      >
                        {isActive && (
                          <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            <CheckCircle2 className="w-3 h-3" /> Perfil Activo
                          </span>
                        )}

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-blue-600 text-sm shrink-0">
                            {client.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                              {client.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                              <Building2 className="w-3.5 h-3.5" />
                              <span className="truncate">{client.company}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-blue-600 dark:text-blue-400">DNI:</span>
                            <span className="font-mono font-semibold">{client.dni || 'Sin DNI'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">IP:</span>
                            <span className="font-mono text-[11px] truncate">{client.ip || 'Detectada'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>{client.phone || 'Sin teléfono'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-red-500" />
                            <span>{client.district}, {client.region}</span>
                          </div>
                        </div>

                        {client.notes && (
                          <p className="mt-2 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                            {client.notes}
                          </p>
                        )}

                        {/* Acciones */}
                        <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-center gap-2">
                            {!isActive ? (
                              <button
                                onClick={() => setActiveClient(client)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 transition-colors"
                              >
                                Activar Perfil
                              </button>
                            ) : (
                              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                                {clientCons.length} {clientCons.length === 1 ? 'consulta' : 'consultas'}
                              </span>
                            )}

                            <button
                              onClick={() => exportClientSummary(client)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                              title="Exportar Resumen Integral para el Cliente"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Resumen</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {deleteConfirmId === client.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    deleteClient(client.id);
                                    setDeleteConfirmId(null);
                                  }}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-[11px] font-bold"
                                >
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px]"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(client.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                title="Borrar usuario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREAR PERFIL */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="text-center mb-4">
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Registrar Nuevo Cliente
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Almacenamiento en PostgreSQL (Supabase) con georreferenciación e IP en tiempo real.
                </p>
              </div>



              {/* Módulo de Búsqueda Rápida DNI / RUC */}
              <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/25 mb-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    <span>Consulta Registral SUNAT / RENIEC (Perú)</span>
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                    Autocompletado & Mapa
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2.5">
                  Ingrese <strong>RUC (11 dígitos)</strong> para extraer la Razón Social y Domicilio Fiscal exacto de la empresa, o <strong>DNI (8 dígitos)</strong> para consultar la persona de contacto y su distrito.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={11}
                      value={docQuery}
                      onChange={(e) => setDocQuery(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLookupDoc(); } }}
                      placeholder="Ej: 20100047218 (RUC) o 71234567 (DNI)"
                      className="w-full pl-3 pr-10 py-2 text-xs font-mono rounded-lg border focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900"
                    />
                    {docQuery.length > 0 && (
                      <span className="absolute right-2.5 top-2 text-[10px] font-bold text-slate-400">
                        {docQuery.length === 11 ? 'RUC' : docQuery.length === 8 ? 'DNI' : `${docQuery.length}d`}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleLookupDoc}
                    disabled={isSearchingDoc || (docQuery.length !== 8 && docQuery.length !== 11)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                  >
                    {isSearchingDoc ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Buscando...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Consultar</span>
                      </>
                    )}
                  </button>
                </div>
                {docLookupResult && (
                  <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>{docLookupResult.documentType} Validado:</strong> {docLookupResult.company || docLookupResult.name} · Estado: {docLookupResult.status} ({docLookupResult.condition})
                      {docLookupResult.address && <div className="text-slate-600 dark:text-slate-400 mt-0.5">📍 {docLookupResult.address}</div>}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    DNI o RUC del Cliente / Organización
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
                    placeholder="DNI (8 dígitos) o RUC (11 dígitos)"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Nombre del Cliente / Contacto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ingrese el nombre completo"
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Empresa / Razón Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Ingrese la empresa u organización"
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ingrese el teléfono de contacto"
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ingrese el correo electrónico"
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Distrito / Localidad del Cliente *
                      </label>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>🛰️ Usar ubicación de mi equipo ({executionLocation.district})</span>
                      </button>
                    </div>

                    <select
                      value={isCustomDistrict ? '__custom__' : selectedPresetDistrict}
                      onChange={(e) => handlePresetDistrictChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 mb-2"
                    >
                      <optgroup label="Lima Metropolitana (Principales Distritos)">
                        {districtList.slice(0, 24).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Callao">
                        {districtList.slice(24, 27).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Otras Regiones / Departamentos">
                        {districtList.slice(27).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </optgroup>
                      <option value="__custom__">✏️ Escribir otro distrito / dirección personalizada...</option>
                    </select>

                    {isCustomDistrict && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          required
                          value={formData.district}
                          onChange={(e) => {
                            const val = e.target.value;
                            const coords = resolveDistrictCoordinates(val);
                            setFormData(prev => ({
                              ...prev,
                              district: val,
                              region: coords.region,
                            }));
                          }}
                          placeholder="Escriba el distrito (ej. San Isidro, Surco...)"
                          className="w-full px-3 py-2 text-xs rounded-lg border focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          required
                          value={formData.region}
                          onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                          placeholder="Región / Departamento"
                          className="w-full px-3 py-2 text-xs rounded-lg border focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Requerimientos / Notas de la Solución
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Detalles sobre infraestructura, requerimientos u objetivos del cliente..."
                  className="w-full px-3 py-2 text-xs rounded-lg border focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tarjeta de ubicación geográfica asignada al cliente */}
              <div className="p-3.5 rounded-xl border bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
                      Ubicación Geográfica Asignada al Cliente
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      📍 {formData.district}, {formData.region} (GPS: {resolveDistrictCoordinates(formData.district).lat.toFixed(4)}, {resolveDistrictCoordinates(formData.district).lon.toFixed(4)})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">IP de Registro:</span>
                  <span className="px-2 py-0.5 rounded-md font-mono text-xs font-extrabold bg-white dark:bg-slate-900 border text-emerald-600 dark:text-emerald-400">
                    {formData.ip || executionLocation.ip || '181.176.209.235'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-xs rounded-lg border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  Guardar Perfil
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CONSULTAS DEL CLIENTE ACTIVO & GENERAR */}
          {activeTab === 'consultations' && (
            <div className="space-y-6">
              {/* Sección Generar Consulta */}
              <div className="card-base p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-800/40" style={{ borderColor: 'var(--border)' }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        Generar Consulta para: <span className="text-blue-600 dark:text-blue-400">{activeClient?.name || 'Ningún usuario seleccionado'}</span>
                      </h4>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Asocia el costo actual calculado (${totalMonthlyCost.toLocaleString()} USD/mes · ${totalAnnualCost.toLocaleString()} USD/año) y los servicios AWS configurados.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={!activeClient}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Generar Consulta Ahora</span>
                  </button>
                </div>

                <div className="mt-3">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Título personalizado de la propuesta (opcional)..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border"
                  />
                </div>
              </div>

              {/* Listado de Consultas Generadas */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Consultas Registradas ({activeClientConsultations.length})
                </h4>

                {activeClientConsultations.length === 0 ? (
                  <div className="text-center py-8 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
                    <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Este cliente no tiene consultas registradas aún. Haz clic en "Generar Consulta Ahora".
                    </p>
                  </div>
                ) : (
                  activeClientConsultations.map((cons) => (
                    <div 
                      key={cons.id}
                      className="card-base p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {cons.title}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {cons.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span>📅 {new Date(cons.createdAt).toLocaleDateString()}</span>
                          <span>📍 Distrito: {cons.districtExecution}</span>
                          <span>🌐 {cons.selectedRegion}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ${cons.estimatedMonthlyCost.toFixed(2)} USD/mes
                          </span>
                        </div>
                      </div>

                      {/* Botones de Exportar */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => exportConsultationAsPrint(cons)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                          title="Imprimir o guardar como PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>PDF / Imprimir</span>
                        </button>

                        <button
                          onClick={() => exportConsultationAsJSON(cons)}
                          className="flex items-center gap-1 px-3 py-1.5 border hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium transition-colors"
                          title="Exportar archivo JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>JSON</span>
                        </button>

                        <button
                          onClick={() => deleteConsultation(cons.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Eliminar consulta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};
