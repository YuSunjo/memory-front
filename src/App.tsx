import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter as Router } from 'react-router-dom'
import AuthProvider from './components/AuthProvider'
import { GoogleMapsProvider } from './contexts/GoogleMapsContext';
import AppContent from './components/AppContent';
import theme from './theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <GoogleMapsProvider>
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </GoogleMapsProvider>
    </ChakraProvider>
  )
}

export default App
