export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const isOrganizer = () => {
  const user = getUser();
  return user?.role === 'organizer';
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }
}; 