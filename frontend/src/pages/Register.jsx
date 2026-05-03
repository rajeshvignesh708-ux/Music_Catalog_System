import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register(name, email, password);
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
                
                <h2 className="text-xl font-bold mb-6 text-center">Sign up for free to start listening.</h2>
                
                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">What's your email?</label>
                        <input 
                            type="email" 
                            className="w-full p-3 rounded bg-spotify-light border border-gray-600 focus:outline-none focus:border-white transition"
                            placeholder="Enter your email."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Create a password</label>
                        <input 
                            type="password" 
                            className="w-full p-3 rounded bg-spotify-light border border-gray-600 focus:outline-none focus:border-white transition"
                            placeholder="Create a password."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">What should we call you?</label>
                        <input 
                            type="text" 
                            className="w-full p-3 rounded bg-spotify-light border border-gray-600 focus:outline-none focus:border-white transition"
                            placeholder="Enter a profile name."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <p className="text-xs text-gray-400 mt-2">This appears on your profile.</p>
                    </div>
                    
                    <button type="submit" className="w-full bg-spotify-green hover:bg-green-400 text-black font-bold py-3 rounded-full transition transform hover:scale-105 mt-6">
                        Sign Up
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <span className="text-gray-400">Already have an account? </span>
                    <Link to="/login" className="text-white hover:text-spotify-green font-bold underline transition">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
