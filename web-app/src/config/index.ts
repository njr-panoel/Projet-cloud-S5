const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const config = {
  apiUrl: API_URL,
  endpoints: {
    auth: {
      login: `${API_URL}/auth/login`,
      register: `${API_URL}/auth/register`,
      me: `${API_URL}/auth/me`,
      logout: `${API_URL}/auth/logout`,
    },
    signalements: {
      base: `${API_URL}/signalements`,
      byId: (id: number) => `${API_URL}/signalements/${id}`,
      byStatut: (statut: string) => `${API_URL}/signalements/statut/${statut}`,
      byType: (type: string) => `${API_URL}/signalements/type/${type}`,
      updateStatut: (id: number) => `${API_URL}/signalements/${id}/statut`,
      sync: (id: number) => `${API_URL}/signalements/${id}/sync`,
      unsynced: `${API_URL}/signalements/unsynced`,
    },
    users: {
      base: `${API_URL}/users`,
      byId: (id: number) => `${API_URL}/users/${id}`,
      byRole: (role: string) => `${API_URL}/users/role/${role}`,
      locked: `${API_URL}/users/locked`,
      unlock: (id: number) => `${API_URL}/users/unlock/${id}`,
      updateRole: (id: number) => `${API_URL}/users/${id}/role`,
    },
    sync: {
      push: `${API_URL}/sync/push`,
      pull: `${API_URL}/sync/pull`,
    },
  },
  map: {
    defaultCenter: [-18.8792, 47.5079] as [number, number], // Antananarivo
    defaultZoom: 13,
  },
};
