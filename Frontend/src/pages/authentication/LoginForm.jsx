// import React, { useState } from 'react'
// import { Mail, Lock, User } from 'lucide-react'
// import Input from '../../components/ui/Input'
// import Button from '../../components/ui/Button'
// import { useAuth } from '../../context/AuthContext'
// import api from '../../userManagement/Api'
// import { useNavigate } from 'react-router-dom'

// function LoginForm({ onSuccess, onToggleForm }) {
//   // const { login, isLoading} = useAuth()
//   const [username, setUsername] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading,setLoading]=useState(false);
//   const [error,setError]=useState("");
//   const navigate=useNavigate();


//   const { login } = useAuth(); // Don't forget this!

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setLoading(true);
//   setError("");

//   try {
//     const response = await api.post('/login', { username, password });

//     if (response.data.token && response.data.role) {
//       localStorage.setItem('token', response.data.token);
//       localStorage.setItem('role', response.data.role);

//       await login({
//         username: response.data.username,
//         email: response.data.email,
//         role: response.data.role,
//       });

//       navigate('/add-temp-admin');
//     }
//     console.log(response.data);
//   } catch (err) {
//     setError(err.response?.data?.error || 'Login failed');
//   } finally {
//     setLoading(false);
//   }
// };
  
// {loading && (
//   <div className="text-blue-600 text-sm p-2 bg-blue-50 rounded-md">
//     Logging in...
//   </div>
// )}

// {error && (
//   <div className="text-error-600 text-sm p-2 bg-error-50 rounded-md">
//     {error}
//   </div>
// )}

//   return (
//     <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full mx-auto">
//       <div className="mb-6 text-center">
//         <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
//         <p className="text-gray-600 mt-1">Sign in to your account</p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Input
//           label="Username"
//           type="text"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           leftIcon={<User className="h-5 w-5" />}
//           placeholder="Enter your username"
//           required
//         />

//         <Input
//           label="Password"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           leftIcon={<Lock className="h-5 w-5" />}
//           placeholder="Enter your password"
//           required
//         />

        

//         <div className="flex items-center justify-between">
//           <div className="flex items-center">
//             <input
//               id="remember-me"
//               name="remember-me"
//               type="checkbox"
//               className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
//             />
//             <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
//               Remember me
//             </label>
//           </div>

//           <div className="text-sm">
//             <a
//               href="#forgot-password"
//               className="font-medium text-primary-600 hover:text-primary-500"
//             >
//               Forgot your password?
//             </a>
//           </div>
//         </div>

//         <Button type="submit" variant="primary" fullWidth size="lg">
//           Sign in
//         </Button>
//       </form>

//       <div className="mt-6 text-center">
//         <p className="text-sm text-gray-600">
//           Don't have an account?{' '}
//           <button
//             type="button"
//             onClick={onToggleForm}
//             className="font-medium text-primary-600 hover:text-primary-500"
//           >
//             Sign up
//           </button>
//         </p>
//       </div>

//       {/* <div className="mt-8">
//         <div className="relative">
//           <div className="absolute inset-0 flex items-center">
//             <div className="w-full border-t border-gray-300"></div>
//           </div>
//           <div className="relative flex justify-center text-sm">
//             <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
//           </div>
//         </div>

//         <div className="mt-4 grid grid-cols-2 gap-3">
//           <button
//             type="button"
//             onClick={() => {
//               setUsername('admin') // replace with your actual demo username
//               setPassword('password')
//             }}
//             className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
//           >
//             Admin Demo
//           </button>
//           <button
//             type="button"
//             onClick={() => {
//               setUsername('user') // replace with your actual demo username
//               setPassword('password')
//             }}
//             className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
//           >
//             User Demo
//           </button>
//         </div>
//       </div> */}
//     </div>
//   )
// }

// export default LoginForm;
import React, { useState } from 'react'
import { Lock, User } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import api from '../../userManagement/Api'

function LoginForm({ onSuccess, onToggleForm }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    try {
      const response = await api.post('/login', { username, password });
  
      const { token, user } = response.data;
      const { role, email, firstTime } = user;
  
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify({ username, email, role }));
  
      // If temp-admin and first login, redirect to set-password
      if (role === 'temp-admin' && firstTime) {
        window.location.href='/set-password';
      } else {
        window.location.href="/dashboard";
      }
  
      onSuccess?.(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-1">Sign in to your account</p>
      </div>

      {error && (
        <div className="text-error-600 text-sm p-2 bg-error-50 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<User className="h-5 w-5" />}
          placeholder="Enter your username"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-5 w-5" />}
          placeholder="Enter your password"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-900">Remember me</span>
          </label>

          <a
            href="#forgot-password"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginForm
