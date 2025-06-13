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
    const onSubmit = async (data: LoginFormInputs) => {
      setisDisabled(true);  
      let successLogin = await auth.login(data.email, data.password)
      if(successLogin === true){
        navigate('/');
        return;
      }
      setisDisabled(false);
      alert('login failed, wrong username or password');
      return;
    }
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
                  let successLogin = false;
                  setisDisabled(true);
                  if (credentialResponse.credential) {
                    const decoded = jwtDecode<any>(credentialResponse.credential)
                    if (decoded.email_verified === true) {
                      successLogin = await auth.login_google(credentialResponse.credential);
                    }
                    setisDisabled(false);
                    if(successLogin === true) navigate('/');
                  }
                }}
                onError={() => {
                  setisDisabled(false);
                  alert('Login gagal');
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
  