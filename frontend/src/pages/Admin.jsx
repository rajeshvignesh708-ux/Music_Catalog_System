import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Admin = () => {
    const { user } = useContext(AuthContext);
    const [songs, setSongs] = useState([]);
    const [formData, setFormData] = useState({ title: '', artist: '', album: '', genre: '', duration: '', file_url: '', cover_url: '' });
    const [audioFile, setAudioFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [editingSongId, setEditingSongId] = useState(null);

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/songs');
            setSongs(res.data.songs || []);
        } catch (error) {
            console.error("Error fetching songs", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });
            if (audioFile) data.append('audio_file', audioFile);
            if (coverFile) data.append('cover_file', coverFile);

            if (editingSongId) {
                await axios.put(`http://localhost:5000/api/songs/${editingSongId}`, data, {
                    headers: { 
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert("Song updated successfully!");
            } else {
                await axios.post('http://localhost:5000/api/songs', data, {
                    headers: { 
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert("Song added successfully!");
            }

            fetchSongs();
            handleCancelEdit();
        } catch (error) {
            console.error("Error saving song", error);
            alert("Error saving song");
        }
    };

    const handleEditClick = (song) => {
        setEditingSongId(song.id);
        setFormData({
            title: song.title,
            artist: song.artist,
            album: song.album || '',
            genre: song.genre || '',
            duration: song.duration,
            file_url: song.file_url || '',
            cover_url: song.cover_url || ''
        });
        setAudioFile(null);
        setCoverFile(null);
        if (document.getElementById('audio-upload')) document.getElementById('audio-upload').value = '';
        if (document.getElementById('cover-upload')) document.getElementById('cover-upload').value = '';
        window.scrollTo(0, 0);
    };

    const handleCancelEdit = () => {
        setEditingSongId(null);
        setFormData({ title: '', artist: '', album: '', genre: '', duration: '', file_url: '', cover_url: '' });
        setAudioFile(null);
        setCoverFile(null);
        if (document.getElementById('audio-upload')) document.getElementById('audio-upload').value = '';
        if (document.getElementById('cover-upload')) document.getElementById('cover-upload').value = '';
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this song?')) {
            try {
                await axios.delete(`http://localhost:5000/api/songs/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                fetchSongs();
            } catch (error) {
                console.error("Error deleting song", error);
            }
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Admin Dashboard</h2>

            <div className="bg-spotify-light p-6 rounded-lg mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{editingSongId ? 'Edit Song' : 'Add New Song'}</h3>
                    {editingSongId && (
                        <button onClick={handleCancelEdit} className="text-gray-400 hover:text-white text-sm">Cancel Edit</button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="p-3 bg-gray-800 rounded text-white" required />
                    <input type="text" placeholder="Artist" value={formData.artist} onChange={e => setFormData({...formData, artist: e.target.value})} className="p-3 bg-gray-800 rounded text-white" required />
                    <input type="text" placeholder="Album" value={formData.album} onChange={e => setFormData({...formData, album: e.target.value})} className="p-3 bg-gray-800 rounded text-white" />
                    <input type="text" placeholder="Genre" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} className="p-3 bg-gray-800 rounded text-white" />
                    <input type="number" placeholder="Duration (seconds)" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="p-3 bg-gray-800 rounded text-white" required />
                    
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-400 mb-1">Upload Audio (.mp3) {editingSongId && '- Leave empty to keep existing'}</label>
                        <input id="audio-upload" type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files[0])} className="p-2 bg-gray-800 rounded text-white" required={!editingSongId && !formData.file_url} />
                    </div>
                    
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-400 mb-1">Upload Cover Art (Image) {editingSongId && '- Leave empty to keep existing'}</label>
                        <input id="cover-upload" type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} className="p-2 bg-gray-800 rounded text-white" />
                    </div>
                    
                    <button type="submit" className="md:col-span-2 bg-spotify-green hover:bg-green-400 text-black font-bold py-3 rounded transition mt-4">
                        {editingSongId ? 'Update Song' : 'Add Song'}
                    </button>
                </form>
            </div>

            <h3 className="text-xl font-bold mb-4">Manage Songs</h3>
            <div className="bg-spotify-light rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800 text-gray-400">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Artist</th>
                            <th className="p-4">Genre</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {songs.map(song => (
                            <tr key={song.id} className="border-t border-gray-800 hover:bg-gray-800">
                                <td className="p-4">{song.title}</td>
                                <td className="p-4">{song.artist}</td>
                                <td className="p-4">{song.genre}</td>
                                <td className="p-4 flex space-x-3">
                                    <button onClick={() => handleEditClick(song)} className="text-blue-500 hover:text-blue-400 font-bold">Edit</button>
                                    <button onClick={() => handleDelete(song.id)} className="text-red-500 hover:text-red-400 font-bold">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;
