import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="bg-spotify-base p-10 rounded-lg shadow-2xl w-full max-w-md mt-10">
                <h1 className="text-3xl font-bold text-center mb-8 flex items-center justify-center space-x-2">
                    <span className="text-spotify-green">🎵</span>
                    <span>MusicCatalog</span>
                </h1>
                
                <h2 className="text-xl font-bold mb-6 text-center">Log in to MusicCatalog</h2>
                
                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Email address</label>
                        <input 
                            type="email" 
                            className="w-full p-3 rounded bg-spotify-light border border-gray-600 focus:outline-none focus:border-white transition"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Password</label>
                        <input 
                            type="password" 
                            className="w-full p-3 rounded bg-spotify-light border border-gray-600 focus:outline-none focus:border-white transition"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="w-full bg-spotify-green hover:bg-green-400 text-black font-bold py-3 rounded-full transition transform hover:scale-105 mt-6">
                        Log In
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <span className="text-gray-400">Don't have an account? </span>
                    <Link to="/register" className="text-white hover:text-spotify-green font-bold underline transition">Sign up for free</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
