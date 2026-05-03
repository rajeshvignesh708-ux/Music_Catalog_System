import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Topbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-16 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md sticky top-0 z-40 transition-colors">
            <div className="flex space-x-2">
                {/* Back/Forward buttons could go here */}
                <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/70">
                    <span className="text-white text-lg">&lt;</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/70">
                    <span className="text-white text-lg">&gt;</span>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full transition">
                                Dashboard
                            </Link>
                        )}
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-spotify-gray text-white font-bold" title={user.name}>
                            {user.name.charAt(0).toUpperCase()}
                        </button>
                        <button onClick={handleLogout} className="text-sm font-semibold text-gray-300 hover:text-white transition">
                            Log out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/register" className="text-gray-300 hover:text-white font-semibold transition tracking-wide text-sm">
                            Sign up
                        </Link>
                        <Link to="/login" className="bg-white text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition text-sm">
                            Log in
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Topbar;
