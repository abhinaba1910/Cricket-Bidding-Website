// // src/components/AdminProfilePage.jsx
// import React, { useState, useEffect } from 'react';

// export default function AdminProfilePage() {
//   const [editing, setEditing] = useState(false);
//   const [form, setForm] = useState({
//     name: 'Rohit Sharma',
//     email: 'rohit@iplauction.com',
//     role: 'Administrator',
//     password: '',
//     avatarUrl: '/default-avatar.png',
//     _avatarFile: null,  // will hold new file if uploaded
//   });

//   // 🔗 TODO: on mount, fetch profile from backend
//   useEffect(() => {
//     // Example:
//     // fetch('/api/admin/profile')
//     //   .then(res => res.json())
//     //   .then(data => setForm({ ...form, ...data }));
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === 'avatar') {
//       const file = files[0];
//       setForm(f => ({
//         ...f,
//         avatarUrl: URL.createObjectURL(file),
//         _avatarFile: file,
//       }));
//     } else {
//       setForm(f => ({ ...f, [name]: value }));
//     }
//   };

//   const handleSave = (e) => {
//     e.preventDefault();

//     // 🔗 TODO: send updated profile to backend
//     // const payload = new FormData();
//     // payload.append('name', form.name);
//     // payload.append('email', form.email);
//     // if (form.password) payload.append('password', form.password);
//     // if (form._avatarFile) payload.append('avatar', form._avatarFile);
//     // fetch('/api/admin/profile', { method: 'PUT', body: payload });

//     setEditing(false);
//   };

//   return (
//     <div className="min-h-screen p-4 md:p-8">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Profile</h1>
//       <div className="grid gap-6 md:grid-cols-3">

//         {/* Profile Card */}
//         <div className="col-span-1 bg-white shadow rounded-lg p-6 flex flex-col items-center">
//           <img
//             src={form.avatarUrl}
//             alt="Avatar"
//             className="w-32 h-32 rounded-full object-cover mb-4"
//           />
//           <h2 className="text-xl font-semibold text-gray-900">{form.name}</h2>
//           <p className="text-gray-600">{form.email}</p>
//           <span className="mt-2 inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
//             {form.role}
//           </span>
//           <button
//             onClick={() => setEditing(true)}
//             className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
//           >
//             Edit Profile
//           </button>
//         </div>

//         {/* Edit Form */}
//         {editing && (
//           <form
//             onSubmit={handleSave}
//             className="md:col-span-2 bg-white shadow rounded-lg p-6 space-y-4"
//           >
//             <h3 className="text-lg font-semibold text-gray-800">Edit Profile</h3>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Name
//               </label>
//               <input
//                 name="name"
//                 value={form.name}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded p-2"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Email
//               </label>
//               <input
//                 name="email"
//                 type="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded p-2"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Password
//               </label>
//               <input
//                 name="password"
//                 type="password"
//                 value={form.password}
//                 onChange={handleChange}
//                 placeholder="••••••••"
//                 className="w-full border border-gray-300 rounded p-2"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Avatar
//               </label>
//               <input
//                 name="avatar"
//                 type="file"
//                 accept="image/*"
//                 onChange={handleChange}
//                 className="w-full"
//               />
//             </div>

//             <div className="flex justify-end space-x-3">
//               <button
//                 type="button"
//                 onClick={() => setEditing(false)}
//                 className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
//               >
//                 Save Changes
//               </button>
//             </div>
//           </form>
//         )}

//         {/* Admin Actions */}
//         {/* <div className="md:col-span-3 lg:col-span-1 bg-white shadow rounded-lg p-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Actions</h3>
//           <ul className="space-y-3">
//             <li>
//               <a
//                 href="/admin/auctions"
//                 className="flex items-center p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded transition text-gray-800"
//               >
//                 📋 Manage Auctions
//               </a>
//             </li>
//             <li>
//               <a
//                 href="/admin/teams"
//                 className="flex items-center p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded transition text-gray-800"
//               >
//                 🏷️ Manage Teams
//               </a>
//             </li>
//             <li>
//               <a
//                 href="/admin/players"
//                 className="flex items-center p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded transition text-gray-800"
//               >
//                 🤹 Manage Players
//               </a>
//             </li>
//             <li>
//               <a
//                 href="/admin/settings"
//                 className="flex items-center p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded transition text-gray-800"
//               >
//                 ⚙️ Site Settings
//               </a>
//             </li>
//           </ul>
//         </div> */}

//       </div>
//     </div>
//   );
// }










// src/components/AdminProfilePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../userManagement/Api';
import toast from 'react-hot-toast';
import { LogOut } from 'lucide-react';
import MobileStickyNav from '../../components/layout/MobileStickyNav';
import { useNavigate } from 'react-router-dom'
export default function AdminProfilePage() {
  const navigate = useNavigate();

    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [editing, setEditing] = useState(false);
  const [userId, setUserId] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    avatarUrl: '/default-avatar.png',
    _avatarFile: null,
  });
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    navigate('/')
  }
  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/get-profile');
        console.log(res.data);
        const { _id, username, email, role, profilePic } = res.data;
        setForm(f => ({
          ...f,
          name: username,
          email,
          role,
          avatarUrl: profilePic || '/default-avatar.png',
        }));
        setUserId(_id);
      } catch (err) {
        console.error('Profile fetch error:', err);
        toast.error('Failed to fetch profile');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar') {
      const file = files[0];
      setForm(f => ({
        ...f,
        avatarUrl: URL.createObjectURL(file),
        _avatarFile: file,
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('email', form.email);
    if (form.password) payload.append('password', form.password);
    if (form._avatarFile) payload.append('avatar', form._avatarFile);

    try {
      const res = await api.put(`/update-profile/${userId}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updated = res.data;
      setForm(f => ({
        ...f,
        name: updated.username,
        email: updated.email,
        avatarUrl: updated.profilePic || '/default-avatar.png',
        password: '',
        _avatarFile: null,
      }));
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err?.response?.data?.error || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile Information</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="col-span-1 bg-white shadow rounded-lg p-6 flex flex-col items-center">
          <img
            src={form.avatarUrl}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900">{form.name}</h2>
          <p className="text-gray-600">{form.email}</p>
          <span className="mt-2 inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
            {form.role}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Edit Profile
          </button>
<div className="md:hidden bottom-16  p-4 left-0 w-full px-16">
  <button
    onClick={handleLogout}
    className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-2xl shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-red-400"
  >
    <LogOut className="h-5 w-5" />
    <span>Sign Out</span>
  </button>
</div>
        </div>

        {/* Edit Form */}
        {editing && (
          <form
            onSubmit={handleSave}
            className="md:col-span-2 bg-white shadow rounded-lg p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800">Edit Profile</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
              <input
                name="avatar"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
      <MobileStickyNav />
    </div>
  );
}
