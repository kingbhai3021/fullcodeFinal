import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import API_URL from "../apiConfig"; // Assuming you have this file
import { useNavigate } from "react-router-dom";
import {
  User,
  CalendarCheck,
  CalendarX,
  Smartphone,
  MessageSquare,
  Copy,
  X,
  Eye,
  EyeOff,
  Search,
  LogOut,
  Edit,
  Trash2,
  PlusCircle,
} from "lucide-react";

// Custom hook for copy-to-clipboard with feedback
function useCopyToClipboard() {
  const [copied, setCopied] = useState(null);
  const copy = (text, field) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(field);
        setTimeout(() => setCopied(null), 1500);
      })
      .catch((err) => console.error("Copy failed", err));
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
      const res = await axios.get(`${API_URL}/GetAllUsers`, {
        withCredentials: true,
      });
      const now = new Date();
      // Sorts users: Expired users appear first, then sorted by most recently updated
      const sorted = (res.data.users || []).sort((a, b) => {
        const aExpired = a.ValidUpto && new Date(a.ValidUpto) < now;
        const bExpired = b.ValidUpto && new Date(b.ValidUpto) < now;
        if (aExpired !== bExpired) return aExpired ? -1 : 1; // Expired first
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
  const {
    users,
    setUsers,
    loading: loadingUsers,
    error: usersError,
    fetchUsers,
  } = useUsers();
  const [search, setSearch] = useState("");
  const [modalUser, setModalUser] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // 'view', 'edit', 'create'
  const [editedUser, setEditedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, copyToClipboard] = useCopyToClipboard();
  const navigate = useNavigate();

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const q = search.toLowerCase();
        return [u.username, u.phonenumber, u.role].some((field) =>
          field?.toLowerCase().includes(q)
        );
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
    if (mode === "edit" || mode === "create") {
      setEditedUser(
        user
          ? {
              ...user,
              ValidUpto: user.ValidUpto
                ? new Date(user.ValidUpto).toISOString().slice(0, 16)
                : "",
            }
          : { username: "", password: "", ValidUpto: "" }
      );
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

    // Ensure ValidUpto is sent in a format the backend expects (ISO string)
    const userData = {
      ...editedUser,
      ValidUpto: editedUser.ValidUpto
        ? new Date(editedUser.ValidUpto).toISOString()
        : null,
    };

    const url =
      modalMode === "create"
        ? `${API_URL}/CreateUser`
        : `${API_URL}/UpdateUser/${editedUser._id}`;
    const method = modalMode === "create" ? "post" : "put";

    try {
      await axios[method](url, userData, { withCredentials: true });
      await fetchUsers(); // Re-fetch all users to get the most up-to-date list
      closeModal();
      alert(`User ${modalMode === "create" ? "created" : "updated"} successfully!`);
    } catch (err) {
      console.error("Failed to save user:", err);
      alert(`Failed to ${modalMode} user. Check console for details.`);
    }
  };

  const handleDelete = async (_id) => {
    const userToDelete = users.find((u) => u._id === _id);
    if (!userToDelete) return;

    const confirmation = prompt(
      `To delete the user "${userToDelete.username}", please type their username below:`
    );
    if (confirmation !== userToDelete.username) {
      alert("Username does not match. Deletion cancelled.");
      return;
    }

    try {
      await axios.delete(`${API_URL}/DeleteUser/${_id}`, {
        withCredentials: true,
      });
      setUsers(users.filter((u) => u._id !== _id));
      closeModal();
      alert("User deleted successfully!");
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* --- REFACTORED HEADER --- */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-indigo-600 text-center sm:text-left">
            Admin Dashboard
          </h1>

          {/* Container for search and buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Button Group */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => openModal(null, "create")}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md"
              >
                <PlusCircle size={20} />
                <span>Create User</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* --- END REFACTORED HEADER --- */}

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loadingUsers && (
          <div className="text-center text-lg text-gray-600 py-10">
            Loading users...
          </div>
        )}
        {usersError && (
          <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg shadow-md">
            {usersError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {!loadingUsers &&
            filteredUsers.length === 0 &&
            (search ? (
              <p className="text-gray-500 col-span-full text-center">
                No users found matching "{search}".
              </p>
            ) : (
              <p className="text-gray-500 col-span-full text-center">
                No users found.
              </p>
            ))}
          {filteredUsers.map((user) => (
            <UserCard 
              key={user._id} 
              user={user} 
              onSelect={openModal} 
              onDelete={handleDelete}  // <-- ADD THIS PROP
            />
          ))}
        </div>

        {(modalUser || modalMode === 'create') && (
          <UserModal 
            user={modalUser}
            mode={modalMode}
            onClose={closeModal}
            onSave={handleSaveUser}
            onDelete={handleDelete}
            onSetMode={setModalMode}
            editedUser={editedUser}
            setEditedUser={setEditedUser}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            copiedField={copiedField}
            copyToClipboard={copyToClipboard}
          />
        )}
      </main>
    </div>
  );
}

function UserCard({ user, onSelect, onDelete }) {
  const isExpired = user.ValidUpto && new Date(user.ValidUpto) < new Date();
  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-indigo-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer flex flex-col ${
        isExpired ? "opacity-70 bg-gray-50" : ""
      }`}
      onClick={() => onSelect(user, "view")}
    >
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isExpired ? "bg-red-100" : "bg-indigo-100"
            }`}
          >
            <User
              className={` ${isExpired ? "text-red-500" : "text-indigo-500"}`}
              size={32}
            />
          </div>
          <div>
            <p className="font-bold text-xl text-gray-900 truncate">
              {user.username}
            </p>
            <p className="text-sm text-gray-500">{user.role || "User"}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div
            className={`flex items-center gap-2 p-2 rounded-md ${
              isExpired
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isExpired ? <CalendarX size={16} /> : <CalendarCheck size={16} />}
            <span className="font-semibold">{isExpired ? "Expired" : "Active"}</span>
            <span className="ml-auto text-xs font-medium">
              {user.ValidUpto
                ? new Date(user.ValidUpto).toLocaleDateString()
                : "No Expiry"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 pt-2">
            <Smartphone size={16} />
            <span>
              Devices:{" "}
              <span className="font-medium text-gray-800">
                {user.TotalDevices || 0}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MessageSquare size={16} />
            <span>
              Messages:{" "}
              <span className="font-medium text-gray-800">
                {user.totalMessages || 0}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-3 mt-auto rounded-b-xl flex gap-2 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(user, "edit");
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md font-semibold text-xs transition"
        >
          <Edit size={14} /> Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(user._id);
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md font-semibold text-xs transition"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}

function UserModal({
  user,
  mode,
  onClose,
  onSave,
  onDelete,
  onSetMode,
  editedUser,
  setEditedUser,
  showPassword,
  setShowPassword,
  copiedField,
  copyToClipboard,
}) {
  const title =
    mode === "edit"
      ? "Edit User"
      : mode === "create"
      ? "Create New User"
      : `User Details`;

  // Format the ValidUpto for the datetime-local input
  useEffect(() => {
    if (mode === 'edit' && user) {
      setEditedUser({
        ...user,
        ValidUpto: user.ValidUpto ? new Date(user.ValidUpto).toISOString().slice(0, 16) : "",
      });
    } else if (mode === 'create') {
      // Set a default expiry, e.g., 30 days from now
      const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
      setEditedUser({ username: "", password: "", ValidUpto: defaultExpiry });
    }
  }, [mode, user, setEditedUser]);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      {/* - Kept p-4 and max-w-xs
        - All changes are *inside* this div
      */}
      <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-xs relative border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Reduced margin-bottom from mb-4 to mb-3 */}
        <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">
          {title}
        </h2>

        {mode === "view" && user && (
          /* Reduced space-y from 2 to 1.5 */
          <div className="space-y-1.5">
            {Object.entries(user).map(([key, value]) => {
              if (["_id", "password", "username", "ValidUpto"].includes(key)) return null; // Handled separately
              return <InfoRow key={key} label={key} value={value} />;
            })}
            <InfoRow label="Username" value={user.username} isCopiable={true} copyFn={copyToClipboard} copied={copiedField === "Username"} />
            <InfoRow label="Password" value={user.password} isPassword={true} isCopiable={true} show={showPassword} setShow={setShowPassword} copyFn={copyToClipboard} copied={copiedField === "Password"} />
            <InfoRow label="Valid Upto" value={user.ValidUpto ? new Date(user.ValidUpto).toLocaleString() : 'N/A'} />
            <InfoRow label="ID" value={user._id} isCopiable={true} copyFn={copyToClipboard} copied={copiedField === "ID"} />
            
            {/* Reduced margin-top (mt-6 to mt-4) and gap (gap-3 to gap-2) */}
            <div className="flex flex-col gap-2 pt-3"> {/* Added pt-3 to separate from info rows */}
              <button
                onClick={() => onSetMode("edit")}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md"
              >
                <Edit size={18} /> Edit User
              </button>
              <button
                onClick={() => onDelete(user._id)}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md"
              >
                <Trash2 size={18} /> Delete User
              </button>
            </div>
          </div>
        )}

        {(mode === "edit" || mode === "create") && editedUser && (
          /* Reduced gap from 4 to 3 */
          <form onSubmit={onSave} className="flex flex-col gap-3">
            <InputField
              label="Username"
              name="username"
              value={editedUser.username}
              onChange={(e) =>
                setEditedUser({ ...editedUser, username: e.target.value })
              }
              required
            />
            <InputField
              label={mode === 'create' ? "Password" : "New Password (optional)"}
              name="password"
              type={showPassword ? "text" : "password"}
              value={editedUser.password}
              onChange={(e) =>
                setEditedUser({ ...editedUser, password: e.target.value })
              }
              required={mode === 'create'} // Only required when creating a new user
              placeholder={mode === 'edit' ? "Leave blank to keep current" : ""}
            >
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                /* Positioned button relative to input field height */
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </InputField>
            <InputField
              label="Valid Upto"
              name="ValidUpto"
              type="datetime-local"
              value={editedUser.ValidUpto}
              onChange={(e) =>
                setEditedUser({ ...editedUser, ValidUpto: e.target.value })
              }
              required
            />

            {/* Reduced margin-top (mt-4 to mt-3) and gap (gap-3 to gap-2) */}
            <div className="flex flex-col gap-2 mt-3">
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md"
              >
                {mode === "create" ? "Create User" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, isPassword = false, isCopiable = false, show, setShow, copyFn, copied }) {
  const displayValue = isPassword ? (show ? value : '••••••••') : (value ? String(value) : '-');
  const onCopy = () => {
    if (isCopiable && value && copyFn) {
      copyFn(value, label);
    }
  };

  return (
    /* Reduced vertical padding from py-3 to py-2 */
    <div className="flex items-start justify-between border-b border-gray-100 py-2">
      <span className="font-semibold text-gray-600 capitalize flex-shrink-0 pr-4">
        {label.replace(/([A-Z])/g, ' $1')}:
      </span>
      <div className="flex items-center gap-2 max-w-[65%] sm:max-w-[60%]">
        <span className="text-gray-800 break-all font-medium text-sm">{displayValue}</span> {/* Added text-sm */}
        {isPassword && (
          <button
            onClick={() => setShow((p) => !p)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {isCopiable && value && (
          <button
            onClick={onCopy}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
            title={`Copy ${label}`}
          >
            {copied ? (
              <span className="text-green-500 text-xs font-bold">Copied!</span>
            ) : (
              <Copy size={16} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}


function InputField({ label, name, type = "text", value, onChange, required, children, placeholder }) {
  return (
    <div className="relative">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
      />
      {children}
    </div>
  );
}