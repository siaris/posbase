import { createContext, useContext, useState, useEffect } from 'react'
import * as helper from '../utils/helper';
import axios from 'axios'

type AuthContextType = {
  user: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAwaiting?: boolean
  login_google: (token: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  let [isAwaiting, setisAwaiting] = useState<boolean>(false)
  isAwaiting = isAwaiting || false; // Ensure isAwaiting is always a boolean
  const client = axios.create({
        baseURL: import.meta.env.VITE_BE_HOST
    })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(storedUser)
  }, [])

  const login = async (email: string, password: string) => {
    // Ganti URL di bawah dengan endpoint backend autentikasi Anda
    setisAwaiting(true); // Set isAwaiting to true while waiting for the response
    const response = await client.post('/account/login', { "email":email, "password":password });
    setisAwaiting(false);

    if (!response || response.status !== 200) {
      throw new Error('Login gagal');
    }

    // Misal backend mengembalikan data user
    // const data = await response;
    // setUser(data);
    // localStorage.setItem('user', '');
    // Simpan token jika perlu: localStorage.setItem('token', data.token);
  }

  const login_google = async (token: string ) => {
    await client.post('/account/regist3r',{token: token}).then((response) => {
      alert('Berhasil mendaftar');
      console.log(response.data);
      if(response.data.status === 'success') 
        setLoginCookie(
          response.data.token
        )
    })
    .catch ((error) => {
        alert('Gagal mendaftar karena '+error);
    });
    // You can also store the token if needed, e.g. localStorage.setItem('token', token)
  }

  const setLoginCookie = (token: string) => {
    helper.setCookieWithExpiration(window.location.hostname+':token',token,3600);
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, login_google, isAwaiting: false }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
