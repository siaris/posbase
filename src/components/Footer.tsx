import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function Footer(): React.JSX.Element {
  return (
    <Box component="footer" sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
      <Typography variant="body2" color="text.secondary">
        {new Date().getFullYear()} FPOS App. All rights reserved.
      </Typography>
    </Box>
  )
}
