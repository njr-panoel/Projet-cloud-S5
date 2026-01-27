const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const config = {
  apiUrl: API_URL,
  endpoints: {
    auth: {
      login: `${API_URL}/auth/login`,
      register: `${API_URL}/auth/register`,
      me: `${API_URL}/auth/me`,
      profile: `${API_URL}/users/profile`,
    },
    signalements: {
      base: `${API_URL}/signalements`,
      byId: (id: string) => `${API_URL}/signalements/${id}`,
      mine: `${API_URL}/signalements/mine`,
      stats: `${API_URL}/signalements/stats`,
    },
    users: {
      base: `${API_URL}/users`,
      byId: (id: string) => `${API_URL}/users/${id}`,
      block: (id: string) => `${API_URL}/users/${id}/block`,
      unblock: (id: string) => `${API_URL}/users/${id}/unblock`,
      blocked: `${API_URL}/users/blocked`,
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
