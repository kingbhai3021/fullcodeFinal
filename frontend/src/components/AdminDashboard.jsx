import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import API_URL from "../apiConfig";
import { useNavigate } from "react-router-dom";
import { User, CalendarCheck, CalendarX, Smartphone, MessageSquare, Database, Copy, X, Eye, EyeOff, Search, LogOut, Edit, Trash2, PlusCircle } from "lucide-react";

// Custom hook for copy-to-clipboard with feedback
function useCopyToClipboard() {
  const [copied, setCopied] = useState(null);
  const copy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 1500);
    }).catch(err => console.error("Copy failed", err));
  };
  return [copied, copy];
}

// Custom hook for fetching user data
function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/GetAllUsers`, { withCredentials: true });
      const now = new Date();
      const sorted = (res.data.users || []).sort((a, b) => {
        const aExpired = a.ValidUpto && new Date(a.ValidUpto) < now;
        const bExpired = b.ValidUpto && new Date(b.ValidUpto) < now;
        if (aExpired !== bExpired) return aExpired ? -1 : 1;
        return new Date(b.UpdatedAt) - new Date(a.UpdatedAt);
      });
      setUsers(sorted);
    } catch (err) {
      setError("Failed to fetch users. Please try again later.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, setUsers, loading, error, fetchUsers };
}

// Main Admin Dashboard Component
export default function AdminDashboard() {
  const { users, setUsers, loading: loadingUsers, error: usersError, fetchUsers } = useUsers();
  const [search, setSearch] = useState("");
  const [modalUser, setModalUser] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // 'view', 'edit', 'create'
  const [editedUser, setEditedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, copyToClipboard] = useCopyToClipboard();
  const navigate = useNavigate();

  const filteredUsers = useMemo(() =>
    users.filter(u => {
      const q = search.toLowerCase();
      return [u.username, u.phonenumber, u.role].some(field => field?.toLowerCase().includes(q));
    }),
    [users, search]
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin");
  };

  const openModal = (user, mode = "view") => {
    setModalUser(user);
    setModalMode(mode);
    if (mode === 'edit' || mode === 'create') {
      setEditedUser(user ? { ...user, ValidUpto: user.ValidUpto ? new Date(user.ValidUpto).toISOString().slice(0, 16) : '' } : { username: "", password: "", ValidUpto: "" });
    }
  };

  const closeModal = () => {
    setModalUser(null);
    setModalMode("view");
    setEditedUser(null);
    setShowPassword(false);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editedUser) return;

    const url = modalMode === 'create' ? `${API_URL}/CreateUser` : `${API_URL}/UpdateUser/${editedUser._id}`;
    const method = modalMode === 'create' ? 'post' : 'put';

    try {
      await axios[method](url, editedUser, { withCredentials: true });
      await fetchUsers(); // Re-fetch all users to get the most up-to-date list
      closeModal();
      alert(`User ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
    } catch (err) {
      alert(`Failed to ${modalMode} user.`);
    }
  };

  const handleDelete = async (_id) => {
    const userToDelete = users.find(u => u._id === _id);
    if (!userToDelete) return;

    const confirmation = prompt(`To delete the user "${userToDelete.username}", please type their username below:`);
    if (confirmation !== userToDelete.username) {
      alert("Username does not match. Deletion cancelled.");
      return;
    }

    try {
      await axios.delete(`${API_URL}/DeleteUser/${_id}`, { withCredentials: true });
      setUsers(users.filter(u => u._id !== _id));
      closeModal();
      alert("User deleted successfully!");
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button onClick={() => openModal(null, 'create')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md">
              <PlusCircle size={20} />
              Create User
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loadingUsers && <div className="text-center text-gray-500">Loading users...</div>}
        {usersError && <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{usersError}</div>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map(user => <UserCard key={user._id} user={user} onSelect={openModal} />)}
        </div>

        {modalUser && <UserModal />}
        {modalMode === 'create' && !modalUser && <UserModal isCreateMode={true} />}
      </main>
    </div>
  );

  function UserCard({ user, onSelect }) {
    const isExpired = user.ValidUpto && new Date(user.ValidUpto) < new Date();
    return (
      <div
        className={`bg-white rounded-xl shadow-lg border border-transparent hover:shadow-xl hover:border-indigo-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer flex flex-col ${isExpired ? 'opacity-60' : ''}`}
        onClick={() => onSelect(user, 'view')}
      >
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isExpired ? 'bg-red-100' : 'bg-indigo-100'}`}>
              <User className={` ${isExpired ? 'text-red-500' : 'text-indigo-500'}`} size={28} />
            </div>
            <div>
              <p className="font-bold text-lg text-gray-800">{user.username}</p>
              <p className="text-sm text-gray-500">{user.role || 'User'}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className={`flex items-center gap-2 p-1.5 rounded-md ${isExpired ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {isExpired ? <CalendarX size={16} /> : <CalendarCheck size={16} />}
              <span className="font-semibold">{isExpired ? 'Expired' : 'Active'}</span>
              <span className="ml-auto text-xs">{user.ValidUpto ? new Date(user.ValidUpto).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Smartphone size={16} />
              <span>Devices: <span className="font-medium">{user.TotalDevices || 0}</span></span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MessageSquare size={16} />
              <span>Messages: <span className="font-medium">{user.totalMessages || 0}</span></span>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-3 mt-auto rounded-b-xl flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); onSelect(user, 'edit'); }} className="flex-1 flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md font-semibold text-xs transition">
            <Edit size={14} /> Edit
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(user._id); }} className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md font-semibold text-xs transition">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    );
  }

  function UserModal({ isCreateMode = false }) {
    const user = isCreateMode ? null : modalUser;
    const mode = isCreateMode ? 'create' : modalMode;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-200 m-4">
          <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {mode === 'edit' ? 'Edit User' : mode === 'create' ? 'Create New User' : `User Details`}
          </h2>

          {mode === 'view' && user && (
            <div className="space-y-3">
              {Object.entries(user).map(([key, value]) => {
                if (['_id', 'password', 'username'].includes(key)) return null; // Handled separately
                return <InfoRow key={key} label={key} value={value} />;
              })}
              <InfoRow label="Username" value={user.username} isCopiable={true} />
              <InfoRow label="Password" value={user.password} isPassword={true} isCopiable={true} />
              <InfoRow label="ID" value={user._id} isCopiable={true} />
              <div className="flex gap-4 mt-6">
                <button onClick={() => setModalMode('edit')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition">Edit User</button>
                <button onClick={() => handleDelete(user._id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition">Delete User</button>
              </div>
            </div>
          )}

          {(mode === 'edit' || mode === 'create') && (
            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <InputField label="Username" name="username" value={editedUser.username} onChange={e => setEditedUser({ ...editedUser, username: e.target.value })} required />
              <InputField label="Password" name="password" type={showPassword ? "text" : "password"} value={editedUser.password} onChange={e => setEditedUser({ ...editedUser, password: e.target.value })} required>
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-10 text-gray-500">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </InputField>
              <InputField label="Valid Upto" name="ValidUpto" type="datetime-local" value={editedUser.ValidUpto} onChange={e => setEditedUser({ ...editedUser, ValidUpto: e.target.value })} required />
              
              <div className="flex gap-4 mt-4">
                <button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition">
                  {mode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
                <button type="button" onClick={closeModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  function InfoRow({ label, value, isPassword = false, isCopiable = false }) {
    const displayValue = isPassword ? (showPassword ? value : '••••••••') : (value ? String(value) : '-');
    return (
      <div className="flex items-start justify-between border-b border-gray-100 py-2">
        <span className="font-semibold text-gray-600 capitalize">{label.replace(/([A-Z])/g, ' $1')}:</span>
        <div className="flex items-center gap-2 max-w-[60%]">
          <span className="text-gray-800 break-all">{displayValue}</span>
          {isPassword && (
            <button onClick={() => setShowPassword(p => !p)} className="p-1 rounded hover:bg-gray-100 text-gray-500">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          {isCopiable && value && (
            <button onClick={() => copyToClipboard(value, label)} className="p-1 rounded hover:bg-gray-100 text-gray-500" title={`Copy ${label}`}>
              {copiedField === label ? <span className="text-green-500 text-xs">Copied!</span> : <Copy size={16} />}
            </button>
          )}
        </div>
      </div>
    );
  }

  function InputField({ label, name, type = "text", value, onChange, required, children }) {
    return (
      <div className="relative">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
        {children}
      </div>
    );
  }
}