import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import Onboarding from '../pages/Onboarding';
import Home from '../pages/Home';
import Chat from '../pages/Chat';
import Profile from '../pages/Profile';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/chat/:matchId" element={<Chat />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

