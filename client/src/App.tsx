import { Toaster } from 'sonner';
import AppRoutes from './routes';
import AuthInitializer from './components/AuthInitializer';
import './App.css';

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <AuthInitializer />
      <AppRoutes />
    </>
  );
}

export default App;
