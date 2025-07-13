import Cookies from 'js-cookie';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { redirect } from 'next/navigation';
import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  email: string;
}

interface CustomJwtPayload extends JwtPayload {
  id?: string;
  username?: string;
  email?: string; 
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (accessToken: string) => void;
  logout: () => void;
  checkAuthStatus: () => void;
}

export const useSession = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  login: (newAccessToken) => {
    try {
      const decodedToken = jwtDecode<CustomJwtPayload>(newAccessToken);
      
      const userData: User = {
        id: decodedToken.id || 'ID não fornecido',
        username: decodedToken.username || 'Username não fornecido',
        email: decodedToken.email || 'Email não fornecido',
      };

      set({
        user: userData,
        accessToken: newAccessToken,
        isLoading: false,
      });
    } catch (error) {
      console.error("Erro ao decodificar token no login:", error);
      set({ user: null, accessToken: null, isLoading: false });
    }
  },

  logout: () => {
    Cookies.remove('Bearer');
    Cookies.remove('Refresh');
    set({ user: null, accessToken: null, isLoading: false });
    redirect('/login')
  },

  checkAuthStatus: () => {
    set({ isLoading: true });
    const tokenFromCookie = Cookies.get('Bearer');

    if (tokenFromCookie) {
      try {
        const decodedToken = jwtDecode<CustomJwtPayload>(tokenFromCookie);
        if (decodedToken.exp && decodedToken.exp * 1000 > Date.now()) {
          const userData: User = {
            id: decodedToken.id || 'ID não fornecido',
            username: decodedToken.username || 'Username não fornecido',
            email: decodedToken.email || 'Email não fornecido',
          };
          set({
            user: userData,
            accessToken: tokenFromCookie,
            isLoading: false,
          });
        } else {
          Cookies.remove('Bearer');
          Cookies.remove('Refresh');
          set({ user: null, accessToken: null, isLoading: false });
        }
      } catch (error) {
        console.error("Erro ao decodificar token do cookie:", error);
        Cookies.remove('Bearer');
        Cookies.remove('Refresh');
        set({ user: null, accessToken: null, isLoading: false });
      }
    } else {
      set({ user: null, accessToken: null, isLoading: false });
    }
  },
}));