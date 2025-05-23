// import React, { useCallback } from 'react'
// import { useDropzone } from 'react-dropzone'
// import { Upload, X } from 'lucide-react'
// import Avatar from '../../components/ui/Avatar'

// function AvatarUpload({ value, onChange, error }) {
//   const onDrop = useCallback((acceptedFiles) => {
//     const file = acceptedFiles[0]
//     if (file) {
//       // In a real app, we would upload to a storage service
//       // For demo, we'll use a data URL
//       const reader = new FileReader()
//       reader.onload = () => {
//         onChange(reader.result)
//       }
//       reader.readAsDataURL(file)
//     }
//   }, [onChange])

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: {
//       'image/*': ['.jpeg', '.jpg', '.png', '.gif']
//     },
//     maxFiles: 1,
//     multiple: false
//   })

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center space-x-4">
//         <Avatar
//           src={value}
//           size="xl"
//           alt="User avatar"
//           className="border-2 border-gray-200"
//         />

//         <div className="flex-1">
//           <div
//             {...getRootProps()}
//             className={`
//               border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
//               ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500'}
//             `}
//           >
//             <input {...getInputProps()} />
//             <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
//             <p className="text-sm text-gray-600">
//               {isDragActive
//                 ? 'Drop the image here'
//                 : 'Drag & drop an image here, or click to select'}
//             </p>
//             <p className="text-xs text-gray-500 mt-1">
//               PNG, JPG or GIF (max. 2MB)
//             </p>
//           </div>
//         </div>

//         {value && (
//           <button
//             type="button"
//             onClick={() => onChange('')}
//             className="p-2 text-gray-400 hover:text-gray-500"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         )}
//       </div>

//       {error && (
//         <p className="text-sm text-error-600">
//           {error}
//         </p>
//       )}
//     </div>
//   )
// }

// export default AvatarUpload



import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import Avatar from '../../components/ui/Avatar'

function AvatarUpload({ value, onChange, error }) {
  const [previewUrl, setPreviewUrl] = useState('')

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        setPreviewUrl(URL.createObjectURL(file)) // Show preview
        onChange(file) // Send the File object to parent (used in FormData)
      }
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    multiple: false
  })

  const handleRemove = () => {
    setPreviewUrl('')
    onChange(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-4">
        <Avatar
          src={previewUrl}
          size="xl"
          alt="User avatar"
          className="border-2 border-gray-200"
        />

        <div className="flex-1">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? 'Drop the image here'
                : 'Drag & drop an image here, or click to select'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG or GIF (max. 2MB)
            </p>
          </div>
        </div>

        {previewUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-error-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default AvatarUpload

