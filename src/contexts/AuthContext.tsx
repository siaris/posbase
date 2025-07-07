import { createContext, useContext, useState, useEffect } from 'react'
import * as helper from '../utils/helper';
import axios from 'axios'

type AuthContextType = {
  user: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAwaiting?: boolean
  login_google: (token: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(helper.getCookieValue(`${window.location.hostname}:token`))
  let [isAwaiting, setisAwaiting] = useState<boolean>(false)
  isAwaiting = isAwaiting || false; // Ensure isAwaiting is always a boolean
  const client = axios.create({
        baseURL: import.meta.env.VITE_BE_HOST
    })

  useEffect(() => {
    const storedUser = helper.getCookieValue(`${window.location.hostname}:token`)
    if (storedUser) setUser(storedUser)
  }, [])

  const login = async (email: string, password: string) => {
    let rtr = false;
    // Ganti URL di bawah dengan endpoint backend autentikasi Anda
    setisAwaiting(true); // Set isAwaiting to true while waiting for the response
    await client.post('/account/login', { "email":email, "password":password }).then((response) => {
      if(response.data.status === 'success'){
        setLoginCookie(response.data.token)
        rtr = true;
      }
    })
    .catch ((error) => {
        console.log('Gagal login karena '+error);
    });
    setisAwaiting(false);
    return rtr;
    
  }

  const login_google = async (token: string ) => {
    let rtr = false;
    await client.post('/register',{google_token: token}).then((response) => {
      if(response.data.success === true){
        setLoginCookie(response.data.data.token)
        rtr = true;
      }
      alert('Berhasil mendaftar');
    })
    .catch ((error) => {
        alert('Gagal mendaftar');
    });
    return rtr;
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
