import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper
  } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useState } from 'react'
  
  type LoginFormInputs = {
    email: string
    password: string
  }
  
  export default function Login(): React.JSX.Element {
    const {
      register,
      handleSubmit,
      formState: { errors }
    } = useForm<LoginFormInputs>()
    const auth = useAuth()
    const navigate = useNavigate()
    const onSubmit = (data: LoginFormInputs) => {
      setisDisabled(true);  
      auth.login(data.email, data.password)
        navigate('/')
    }
    const client = axios.create({
        baseURL: import.meta.env.VITE_BE_HOST
    })
    const [isDisabled, setisDisabled] = useState<boolean>(auth.isAwaiting || false);
  
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Login
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              {...register('email', {
                required: 'Email wajib diisi',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Format email tidak valid'
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
  
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              {...register('password', {
                required: 'Password wajib diisi',
                minLength: {
                  value: 6,
                  message: 'Password minimal 6 karakter'
                }
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
  
            <Box mt={3}>
              <Button variant="contained" color="primary" fullWidth type="submit" disabled={isDisabled}>
                Login
              </Button>
            </Box>
            <Box mt={2} textAlign="center"
            sx={{pointerEvents: isDisabled ? 'none' : 'auto',
              opacity: isDisabled ? 0.5 : 1,
            }}
            >
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setisDisabled(true);
                  if (credentialResponse.credential) {
                    const decoded = jwtDecode<any>(credentialResponse.credential)
                    if (decoded.email_verified === true) {
                      //regist3r
                      await client.post('/account/regist3r',{token: credentialResponse.credential}).then((response) => {
                                  alert('Berhasil mendaftar');
                                  console.log(response.data);
                                  if(response.data.status === 'success') 
                                    auth.login_google({
                                      token:response.data.token,
                                      email: decoded.email,
                                  })
                              }).catch ((error) => {
                                  alert('Gagal mendaftar karena '+error);
                              });

                    }
                    setisDisabled(false);
                    // console.log(decoded);
                    // const existing = localStorage.getItem('user')
                    
                    // if (!existing) {
                    //   console.log(decoded,'Register akun baru dari Google:', decoded.email)
                    //   // Di sini kamu bisa kirim data ke backend juga
                    // }



                    // auth.login(decoded.email) // atau decoded.name, dst

                    // navigate('/');
                    alert('Login berhasil dengan google');
                  }
                }}
                onError={() => {
                  console.log('Login gagal');
                  alert('Login gagal');
                  const button = document.querySelector('button[type="submit"]') as HTMLButtonElement
                  if (button) button.disabled = false
                }}
              />
            </Box>
          </form>
        </Paper>
        
        <Typography mt={2} variant="body2" align="center">
          Belum punya akun? <a href="/register">Daftar</a>
        </Typography>
        
      </Container>
    )
  }
  