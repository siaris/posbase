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
  
  type RegisterFormInputs = {
    email: string
    password: string
    confirmPassword: string
  }
  
  export default function Register(): React.JSX.Element {
    const { login } = useAuth()
    const navigate = useNavigate()
  
    const {
      register,
      handleSubmit,
      watch,
      formState: { errors }
    } = useForm<RegisterFormInputs>()
  
    const onSubmit = (data: RegisterFormInputs) => {
      // Simulasi register + auto login
      login(data.email,'newPassword') // Ganti dengan logika register yang sesuai
      navigate('/')
    }
  
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Register
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
  
            <TextField
              label="Konfirmasi Password"
              type="password"
              fullWidth
              margin="normal"
              {...register('confirmPassword', {
                validate: (value) =>
                  value === watch('password') || 'Konfirmasi password tidak cocok'
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
  
            <Box mt={3}>
              <Button variant="contained" color="primary" fullWidth type="submit">
                Register
              </Button>
            </Box>
          </form>
        </Paper>
        <Typography mt={2} variant="body2" align="center">
        Sudah punya akun? <a href="/login">Masuk</a>
        </Typography>
      </Container>
    )
  }
  