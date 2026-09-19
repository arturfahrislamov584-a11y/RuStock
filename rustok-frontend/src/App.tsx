import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ContentDetail from './pages/ContentDetail';
import Generate from './pages/Generate';
import UploadPage from './pages/Upload';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthorDashboard from './pages/AuthorDashboard';
import VideoStocks from './pages/VideoStocks';
import Tools from './pages/Tools';
import { useStore } from './store/useStore';

export default function App() {
  const init = useStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<ContentDetail />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/author" element={<AuthorDashboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/videos" element={<VideoStocks />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
