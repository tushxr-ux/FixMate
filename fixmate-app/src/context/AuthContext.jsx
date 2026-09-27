import { createContext, useContext, useState, useCallback } from 'react';
import { currentUser, login as storeLogin, logout as storeLogout, signup as storeSignup } from '../store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => currentUser());

  const login = useCallback((email, password) => {
    const u = storeLogin(email, password);
    if (u) setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    storeLogout();
    setUser(null);
  }, []);

  const signup = useCallback((data) => {
    const result = storeSignup(data);
    if (result.user) setUser(result.user);
    return result;
  }, []);

  const refresh = useCallback(() => setUser(currentUser()), []);

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
