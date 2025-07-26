import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter as Router } from 'react-router-dom'
import AuthProvider from './components/AuthProvider'
import { GoogleMapsProvider } from './contexts/GoogleMapsContext';
import AppContent from './components/AppContent';

function App() {
  return (
    <ChakraProvider>
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
