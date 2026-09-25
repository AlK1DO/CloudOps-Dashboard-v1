import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseContextValue {
  supabase: SupabaseClient<any>;
  isConfigured: boolean;
  isConnected: boolean;
  connectionStatus: 'checking' | 'connected' | 'offline_fallback';
  checkConnection: () => Promise<boolean>;
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const isConfigured = Boolean(supabaseUrl && supabaseKey);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'offline_fallback'>('checking');

  const supabase = useMemo(() => {
    return createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }, [supabaseUrl, supabaseKey]);

  const checkConnection = async (): Promise<boolean> => {
    if (!isConfigured) {
      setConnectionStatus('offline_fallback');
      return false;
    }
    try {
      // Intentamos una llamada de sondeo
      const { error } = await supabase.from('client_profiles').select('id').limit(1);
      // Si responde (incluso con error de tabla no existente PGRST205), el servidor Supabase está online
      if (!error || error.code === 'PGRST205' || error.code === '42P01') {
        setConnectionStatus('connected');
        return true;
      }
      setConnectionStatus('offline_fallback');
      return false;
    } catch {
      setConnectionStatus('offline_fallback');
      return false;
    }
  };

  useEffect(() => {
    checkConnection();
  }, [supabase]);

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        isConfigured,
        isConnected: connectionStatus === 'connected',
        connectionStatus,
        checkConnection,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = (): SupabaseContextValue => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
