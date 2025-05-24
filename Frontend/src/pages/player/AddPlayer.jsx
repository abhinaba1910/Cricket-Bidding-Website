// import React, { useState } from 'react'
// import { useForm, Controller } from 'react-hook-form'
// import { FiChevronLeft } from 'react-icons/fi'

// export default function AddPlayer() {
//   const {
//     register,
//     control,
//     handleSubmit,
//     formState: { errors }
//   } = useForm()
//   const [preview, setPreview] = useState(null)

//   const onSubmit = data => {
//     console.log('Player data:', data)
//     // TODO: send to your API
//   }

//   const handleFileChange = (e, onChange) => {
//     const file = e.target.files?.[0]
//     onChange(file)
//     if (!file) {
//       setPreview(null)
//       return
//     }
//     const reader = new FileReader()
//     reader.onloadend = () => setPreview(reader.result)
//     reader.readAsDataURL(file)
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 max-md:px-0 md:px-8">
//       <div className="max-w-3xl mx-auto bg-white shadow rounded-lg">
//         {/* Header */}
//         <div className="flex items-center border-b px-6 py-4">
//           <a
//             href="/dashboard"
//             className="p-2 rounded hover:bg-gray-100 transition"
//             aria-label="Back to Dashboard"
//           >
//             <FiChevronLeft className="w-6 h-6 text-gray-700" />
//           </a>
//           <h1 className="ml-4 text-2xl font-bold text-gray-800">
//             Add Player for Bidding
//           </h1>
//         </div>

//         {/* Form */}
//         <div className="p-6 space-y-8">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

//             {/* Basic Information */}
//             <section>
//               <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
//               <div className="grid sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block font-medium mb-1">Full Name</label>
//                   <input
//                     {...register('name', { required: 'Full name is required' })}
//                     placeholder="e.g., Virat Kohli"
//                     className="w-full border px-3 py-2 rounded"
//                   />
//                   {errors.name && (
//                     <p className="text-red-600 text-sm mt-1">
//                       {errors.name.message}
//                     </p>
//                   )}
//                 </div>

//                 {/* Photo Upload */}
//                 <div className="sm:col-span-2">
//                   <label className="block font-medium mb-1">Photo / Profile Image</label>
//                   <Controller
//                     name="photoFile"
//                     control={control}
//                     rules={{ required: 'Profile image is required' }}
//                     render={({ field: { onChange } }) => (
//                       <div className="space-y-2">
//                         <div
//                           className="w-full h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer overflow-hidden"
//                           onClick={() => document.getElementById('photoInput').click()}
//                         >
//                           {preview ? (
//                             <img
//                               src={preview}
//                               alt="Preview"
//                               className="object-cover w-full h-full"
//                             />
//                           ) : (
//                             <span className="text-gray-400">Click to upload</span>
//                           )}
//                         </div>
//                         <input
//                           id="photoInput"
//                           type="file"
//                           accept="image/*"
//                           className="hidden"
//                           onChange={e => handleFileChange(e, onChange)}
//                         />
//                       </div>
//                     )}
//                   />
//                   {errors.photoFile && (
//                     <p className="text-red-600 text-sm mt-1">
//                       {errors.photoFile.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block font-medium mb-1">Country</label>
//                   <input
//                     {...register('country', { required: 'Country is required' })}
//                     placeholder="e.g., India"
//                     className="w-full border px-3 py-2 rounded"
//                   />
//                   {errors.country && (
//                     <p className="text-red-600 text-sm mt-1">
//                       {errors.country.message}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block font-medium mb-1">Date of Birth</label>
//                   <input
//                     {...register('dob', { required: 'Date of birth is required' })}
//                     type="date"
//                     className="w-full border px-3 py-2 rounded"
//                   />
//                   {errors.dob && (
//                     <p className="text-red-600 text-sm mt-1">
//                       {errors.dob.message}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </section>

//             {/* Player Type & Role */}
//             <section>
//               <h2 className="text-xl font-semibold mb-4">Player Type & Role</h2>
//               <div className="grid sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block font-medium mb-1">Primary Role</label>
//                   <select
//                     {...register('role', { required: 'Role is required' })}
//                     className="w-full border px-3 py-2 rounded"
//                   >
//                     <option value="">Select role...</option>
//                     <option value="Batsman">Batsman</option>
//                     <option value="Bowler">Bowler</option>
//                     <option value="All-Rounder">All-Rounder</option>
//                     <option value="Wicket-Keeper">Wicket-Keeper</option>
//                   </select>
//                   {errors.role && (
//                     <p className="text-red-600 text-sm mt-1">
//                       {errors.role.message}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block font-medium mb-1">Batting Style</label>
//                   <input
//                     {...register('battingStyle')}
//                     placeholder="e.g., Right-hand bat"
//                     className="w-full border px-3 py-2 rounded"
//                   />
//                 </div>
//                 <div>
//                   <label className="block font-medium mb-1">Bowling Style</label>
//                   <input
//                     {...register('bowlingStyle')}
//                     placeholder="e.g., Right-arm fast"
//                     className="w-full border px-3 py-2 rounded"
//                   />
//                 </div>
//               </div>
//             </section>

//             {/* Auction / Bidding Details */}
//             <section>
//               <h2 className="text-xl font-semibold mb-4">Auction / Bidding Details</h2>
//               <div className="grid sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block font-medium mb-1">Base Price</label>
//                   <input
//                     {...register('basePrice', {
//                       valueAsNumber: true,
//                       required: 'Base price is required'
//                     })}
//                     type="number"
//                     placeholder="e.g., 2000000"
//                     className="w-full border px-3 py-2 rounded"
//                   />
//                 </div>
//                 <div>
//                   <label className="block font-medium mb-1">Grade</label>
//                   <select
//                     {...register('grade')}
//                     className="w-full border px-3 py-2 rounded"
//                   >
//                     <option value="">Select grade...</option>
//                     <option value="A+">A+</option>
//                     <option value="A">A</option>
//                     <option value="B">B</option>
//                     <option value="C">C</option>
//                   </select>
//                 </div>
//             <div>
//               <label className="block font-medium mb-1">Points / Rating</label>
//               <input
//                 {...register('points', { valueAsNumber: true })}
//                 type="number"
//                 placeholder="e.g., 95"
//                 className="w-full border px-3 py-2 rounded"
//               />
//             </div>
//             <div>
//               <label className="block font-medium mb-1">Availability Status</label>
//               <select
//                 {...register('availability')}
//                 className="w-full border px-3 py-2 rounded"
//               >
//                 <option value="Available">Available</option>
//                 <option value="Sold">Sold</option>
//                 <option value="Retained">Retained</option>
//               </select>
//             </div>
//             <div>
//               <label className="block font-medium mb-1">Player ID (optional)</label>
//               <input
//                 {...register('playerId')}
//                 placeholder="Unique ID"
//                 className="w-full border px-3 py-2 rounded"
//               />
//             </div>
//           </div>
//         </section>

//         {/* Performance Stats */}
//         <section>
//           <h2 className="text-xl font-semibold mb-4">Performance Stats (optional)</h2>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block font-medium mb-1">Matches Played</label>
//               <input
//                 {...register('matchesPlayed', { valueAsNumber: true })}
//                 type="number"
//                 className="w-full border px-3 py-2 rounded"
//               />
//             </div>
//             <div>
//               <label className="block font-medium mb-1">Runs Scored</label>
//               <input
//                 {...register('runs', { valueAsNumber: true })}
//                 type="number"
//                 className="w-full border px-3 py-2 rounded"
//               />
//             </div>
//             <div>
//               <label className="block font-medium mb-1">Wickets Taken</label>
//               <input
//                 {...register('wickets', { valueAsNumber: true })}
//                 type="number"
//                 className="w-full border px-3 py-2 rounded"
//               />
//             </div>
//             <div>
//               <label className="block font-medium mb-1">Strike Rate / Economy</label>
//               <input
//                 {...register('strikeRate', { valueAsNumber: true })}
//                 type="number"
//                 step="0.01"
//                 placeholder="e.g., 130.41"
//                 className="w-full border px-3 py-2 rounded"
//               />
//             </div>
//             <div>
//               <label className="block font-medium mb-1">Last Season Team</label>
//               <input
//                 {...register('previousTeams')}
//                 placeholder="e.g., RCB"
//                 className="w-full border px-3 py-2 rounded"
//               />
//             </div>
//             <div className="flex items-center space-x-2 mt-2">
//               <input
//                 {...register('isCapped')}
//                 type="checkbox"
//                 id="isCapped"
//                 className="h-4 w-4"
//               />
//               <label htmlFor="isCapped" className="font-medium">
//                 International Experience
//               </label>
//             </div>
//             <div className="sm:col-span-2">
//               <label className="block font-medium mb-1">Bio / Notes</label>
//               <textarea
//                 {...register('bio')}
//                 rows={3}
//                 className="w-full border px-3 py-2 rounded"
//                 placeholder="Brief player bio..."
//               />
//             </div>
//           </div>
//         </section>

//         {/* Submit */}
//         <div className="text-right">
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
//               >
//                 Add Player
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }












//////////////////////////////////////////////////////////////////////////////





import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FiChevronLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import api from '../../userManagement/Api'

export default function AddPlayer() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async data => {
    try {
      setSubmitting(true)

      // Build FormData
      const formData = new FormData()
      for (const key in data) {
        if (key === 'photoFile') {
          formData.append('photoFile', data.photoFile)
        } else if (typeof data[key] === 'boolean') {
          formData.append(key, data[key].toString())
        } else if (data[key] != null) {
          formData.append(key, data[key])
        }
      }

      const res = await api.post('/add-player', formData)
      alert('Player added successfully!')
      reset()
      setPreview(null)
      navigate('/dashboard') // or wherever you want
    } catch (err) {
      console.error('Failed to add player:', err.response?.data || err.message)
      alert('Failed to add player.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = (e, onChange) => {
    const file = e.target.files?.[0]
    onChange(file)
    if (!file) return setPreview(null)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-md:px-0 md:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg">
        {/* Header */}
        <div className="flex items-center border-b px-6 py-4">
          <a
            href="/dashboard"
            className="p-2 rounded hover:bg-gray-100 transition"
            aria-label="Back to Dashboard"
          >
            <FiChevronLeft className="w-6 h-6 text-gray-700" />
          </a>
          <h1 className="ml-4 text-2xl font-bold text-gray-800">
            Add Player for Bidding
          </h1>
        </div>

        {/* Form */}
        <div className="p-6 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Full Name</label>
                  <input
                    {...register('name', { required: 'Full name is required' })}
                    placeholder="e.g., Virat Kohli"
                    className="w-full border px-3 py-2 rounded"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Photo Upload */}
                {/* <div className="sm:col-span-2">
                  <label className="block font-medium mb-1">Photo / Profile Image</label>
                  <Controller
                    name="photoFile"
                    control={control}
                    rules={{ required: 'Profile image is required' }}
                    render={({ field: { onChange } }) => (
                      <div className="space-y-2">
                        <div
                          className="w-full h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer overflow-hidden"
                          onClick={() => document.getElementById('photoInput').click()}
                        >
                          {preview ? (
                            <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-gray-400">Click to upload</span>
                          )}
                        </div>
                        <input
                          id="photoInput"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleFileChange(e, onChange)}
                        />
                      </div>
                    )}
                  />
                  {errors.photoFile && (
                    <p className="text-red-600 text-sm mt-1">{errors.photoFile.message}</p>
                  )}
                </div> */}

                <div>
                  <label className="block font-medium mb-1">Country</label>
                  <input
                    {...register('country', { required: 'Country is required' })}
                    placeholder="e.g., India"
                    className="w-full border px-3 py-2 rounded"
                  />
                  {errors.country && (
                    <p className="text-red-600 text-sm mt-1">{errors.country.message}</p>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-1">Date of Birth</label>
                  <input
                    {...register('dob', { required: 'Date of birth is required' })}
                    type="date"
                    className="w-full border px-3 py-2 rounded"
                  />
                  {errors.dob && (
                    <p className="text-red-600 text-sm mt-1">{errors.dob.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Role Section */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Player Type & Role</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Primary Role</label>
                  <select
                    {...register('role', { required: 'Role is required' })}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select role...</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicket-Keeper">Wicket-Keeper</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-1">Batting Style</label>
                  <input
                    {...register('battingStyle')}
                    placeholder="e.g., Right-hand bat"
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Bowling Style</label>
                  <input
                    {...register('bowlingStyle')}
                    placeholder="e.g., Right-arm fast"
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>
            </section>

            {/* Auction/Bidding Details */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Auction / Bidding Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Base Price</label>
                  <input
                    {...register('basePrice', {
                      valueAsNumber: true,
                      required: 'Base price is required'
                    })}
                    type="number"
                    placeholder="e.g., 2000000"
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Grade</label>
                  <select {...register('grade')} className="w-full border px-3 py-2 rounded">
                    <option value="">Select grade...</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Points / Rating</label>
                  <input
                    {...register('points', { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g., 95"
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Availability Status</label>
                  <select {...register('availability')} className="w-full border px-3 py-2 rounded">
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Retained">Retained</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Player ID (optional)</label>
                  <input
                    {...register('playerId')}
                    placeholder="Unique ID"
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>
            </section>

            {/* Performance */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Performance Stats (optional)</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input {...register('matchesPlayed', { valueAsNumber: true })} type="number" placeholder="Matches Played" className="w-full border px-3 py-2 rounded" />
                <input {...register('runs', { valueAsNumber: true })} type="number" placeholder="Runs" className="w-full border px-3 py-2 rounded" />
                <input {...register('wickets', { valueAsNumber: true })} type="number" placeholder="Wickets" className="w-full border px-3 py-2 rounded" />
                <input {...register('strikeRate', { valueAsNumber: true })} type="number" step="0.01" placeholder="Strike Rate" className="w-full border px-3 py-2 rounded" />
                <input {...register('previousTeams')} placeholder="Previous Teams" className="w-full border px-3 py-2 rounded" />
                <div className="flex items-center space-x-2 mt-2">
                  <input type="checkbox" {...register('isCapped')} className="h-4 w-4" />
                  <label className="font-medium">International Experience</label>
                </div>
                <textarea {...register('bio')} rows={3} placeholder="Player Bio" className="w-full border px-3 py-2 rounded sm:col-span-2" />
              </div>
            </section>

            <div className="text-right">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Add Player'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
