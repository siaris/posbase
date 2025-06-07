// src/components/Navbar.tsx
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useAuth } from '../contexts/AuthContext'
import Button from '@mui/material/Button'

export default function Navbar() {
    const { logout } = useAuth();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">POS App</Typography>
      </Toolbar>
      <Button color="inherit" onClick={logout}>
        Logout
        </Button>
    </AppBar>
  )
}
