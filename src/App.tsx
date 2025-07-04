import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import ProfileEditPage from './pages/ProfileEditPage'
import AuthProvider from './components/AuthProvider'
import RelationshipPage from "./pages/RelationshipPage.tsx";
import MemoriesWithRelationshipPage from './pages/MemoriesWithRelationshipPage'
import MyMemoriesPage from './pages/MyMemoriesPage'
import CreateMemoryPage from './pages/CreateMemoryPage'
import SharingMemoriesPage from './pages/SharingMemoriesPage';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <AuthProvider>
          <Box display="flex" flexDirection="column" minHeight="100vh" bg="gray.50">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<ProfileEditPage />} />
              <Route path="/relationship" element={<RelationshipPage />} />
              <Route path="/memories-with-relationship" element={<MemoriesWithRelationshipPage />} />
              <Route path="/my-memories" element={<MyMemoriesPage />} />
              <Route path="/create-memory" element={<CreateMemoryPage />} />
              <Route path="/sharing-memories" element={<SharingMemoriesPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
            </Routes>
          </Box>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  )
}

export default App
