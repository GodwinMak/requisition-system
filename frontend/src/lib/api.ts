const API_BASE_URL = 'https://test.liquidmatics.co.tz/api';

export const api = {
  url: (path: string) => `${API_BASE_URL}${path}`,
  getHeaders: () => {
    const token = localStorage.getItem('ia_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  },
};
