import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { useContext, useEffect } from 'react';

// Components
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Player from './components/Player';

// Pages
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import PlaylistView from './pages/PlaylistView';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

function AppContent() {
    const { user, loading } = useContext(AuthContext);
    const { pathname } = useLocation();

    // Force redirect to home on every page refresh (except login/register)
    useEffect(() => {
        if (!loading && user && pathname !== '/' && pathname !== '/login' && pathname !== '/register') {
            window.history.replaceState(null, '', '/');
        }
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-black text-white font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col relative bg-spotify-base">
                <Topbar />
                <div className="flex-1 overflow-y-auto pb-24">
                    <Routes>
                        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                        <Route path="/search" element={<PrivateRoute><Home searchMode={true} /></PrivateRoute>} />
                        <Route path="/library" element={<PrivateRoute><Home libraryMode={true} /></PrivateRoute>} />
                        <Route path="/playlist/:id" element={<PrivateRoute><PlaylistView /></PrivateRoute>} />
                        <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
                        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        {/* Fallback to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
                <div className="absolute bottom-0 w-full">
                    <Player />
                </div>
            </div>
        </div>
    );
}

function App() {
  return (
    <AuthProvider>
        <PlayerProvider>
            <Router>
                <AppContent />
            </Router>
        </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
