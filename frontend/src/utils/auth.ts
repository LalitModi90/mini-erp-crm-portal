export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
  return { Authorization: `Bearer ${token || ''}` };
}

export function getAuthToken(): string {
  return localStorage.getItem('jwt_token') || localStorage.getItem('token') || '';
}