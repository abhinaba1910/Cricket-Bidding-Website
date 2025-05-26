// import React, { useEffect } from 'react';
// import { useFormContext, Controller } from 'react-hook-form';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// export default function AuctionStep1Details({ onNext, imagePreview, setImagePreview }) {
//   const {
//     control,
//     register,
//     formState: { errors },
//     watch,
//   } = useFormContext();

//   useEffect(() => {
//     const subscription = watch((value, { name }) => {
//       if (name === 'auctionImage') {
//         const files = value.auctionImage;
//         if (files && files.length > 0) {
//           const file = files[0];
//           const reader = new FileReader();
//           reader.onloadend = () => setImagePreview(reader.result);
//           reader.readAsDataURL(file);
//         } else {
//           setImagePreview(null);
//         }
//       }
//     });
//     return () => subscription.unsubscribe();
//   }, [watch, setImagePreview]);

//   return (
//     <div style={{ maxWidth: 800, margin: 'auto', padding: '16px' }}>
//       {/* Auction Name */}
//       <div style={{ marginBottom: 16 }}>
//         <label htmlFor="auctionName" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
//           Auction Name
//         </label>
//         <input
//           id="auctionName"
//           type="text"
//           placeholder="e.g., Annual Charity Gala Auction"
//           {...register('auctionName')}
//           style={{ width: '100%', padding: 8, fontSize: 16, borderColor: errors.auctionName ? 'red' : '#ccc' }}
//         />
//         {errors.auctionName && (
//           <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{errors.auctionName.message}</div>
//         )}
//       </div>

//       {/* Short Name */}
//       <div style={{ marginBottom: 16 }}>
//         <label htmlFor="shortName" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
//           Short Name / Code
//         </label>
//         <input
//           id="shortName"
//           type="text"
//           placeholder="e.g., ACGA24"
//           {...register('shortName')}
//           style={{ width: '100%', padding: 8, fontSize: 16, borderColor: errors.shortName ? 'red' : '#ccc' }}
//         />
//         {errors.shortName && (
//           <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{errors.shortName.message}</div>
//         )}
//       </div>

//       {/* Image Upload */}
//       <div style={{ marginBottom: 16 }}>
//         <label htmlFor="auctionImage" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
//           Auction Image
//         </label>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//           {imagePreview ? (
//             <img
//               src={imagePreview}
//               alt="Auction preview"
//               style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc' }}
//               className='max-sm:hidden'
//             />
//           ) : (
//             <div
//               style={{
//                 width: 100,
//                 height: 100,
//                 backgroundColor: '#f0f0f0',
//                 border: '1px dashed #bbb',
//                 borderRadius: 8,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: '#888',
//                 fontSize: 24,
//                 userSelect: 'none',
//               }}
//             >
//               &#8682;
//             </div>
//           )}
//           <Controller
//             name="auctionImage"
//             control={control}
//             render={({ field }) => (
//               <input
//                 type="file"
//                 accept="image/png, image/jpeg, image/webp"
//                 onChange={(e) => field.onChange(e.target.files)}
//                 style={{ fontSize: 16 }}
//               />
//             )}
//           />
//         </div>
//         {errors.auctionImage && (
//           <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{errors.auctionImage.message}</div>
//         )}
//         <div
//           style={{
//             marginTop: 8,
//             fontSize: 14,
//             color: '#555',
//             backgroundColor: '#e6f0ff',
//             padding: 8,
//             borderRadius: 4,
//           }}
//         >
//           <strong>Image Guidelines:</strong> Accepted formats: JPG, PNG, WEBP. Max size: 5MB. Recommended aspect ratio: 1:1 or
//           4:3.
//         </div>
//       </div>
      

//       {/* Dates and Times */}
//       <div
//         style={{
//           display: 'flex',
//           gap: 16,
//           flexWrap: 'wrap',
//           marginBottom: 16,
//         }}
//       >
//         {/* Start Date */}
//         <div style={{ flex: 1, minWidth: 200 }}>
//           <label htmlFor="startDate" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
//             Start Date
//           </label>
//           <Controller
//             name="startDate"
//             control={control}
//             render={({ field }) => (
//               <DatePicker
//                 id="startDate"
//                 selected={field.value}
//                 onChange={field.onChange}
//                 minDate={new Date()}
//                 placeholderText="Pick a date"
//                 style={{
//                   width: '100%',
//                   padding: 8,
//                   fontSize: 16,
//                   borderColor: errors.startDate ? 'red' : '#ccc',
//                 }}
//               />
//             )}
//           />
//           {errors.startDate && (
//             <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{errors.startDate.message}</div>
//           )}
//         </div>

//         {/* Start Time */}
//         <div style={{ flex: 1, minWidth: 200 }}>
//           <label htmlFor="startTime" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
//             Start Time
//           </label>
//           <input
//             id="startTime"
//             type="time"
//             {...register('startTime')}
//             style={{ width: '100%', padding: 8, fontSize: 16, borderColor: errors.startTime ? 'red' : '#ccc' }}
//           />
//           {errors.startTime && (
//             <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{errors.startTime.message}</div>
//           )}
//         </div>
//       </div>

//       {/* Description */}
//       <div style={{ marginBottom: 16 }}>
//         <label htmlFor="description" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
//           Description
//         </label>
//         <textarea
//           id="description"
//           placeholder="Provide a detailed description of the auction..."
//           rows={5}
//           {...register('description')}
//           style={{ width: '100%', padding: 8, fontSize: 16, borderColor: errors.description ? 'red' : '#ccc', resize: 'vertical' }}
//         />
//         {errors.description && (
//           <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{errors.description.message}</div>
//         )}
//       </div>

//       {/* Next Button */}
//       {/* <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//         <button
//           type="button"
//           onClick={onNext}
//           style={{
//             backgroundColor: '#008080',
//             color: 'white',
//             border: 'none',
//             padding: '10px 20px',
//             fontSize: 16,
//             borderRadius: 4,
//             cursor: 'pointer',
//           }}
//         >
//           Save and Next &rarr;
//         </button>
//       </div> */}
//     </div>
//   );
// }






















import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function AuctionStep1Details({ onNext, imagePreview, setImagePreview }) {
  const {
    control,
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'auctionImage') {
        const files = value.auctionImage;
        if (files && files.length > 0) {
          const file = files[0];
          const reader = new FileReader();
          reader.onloadend = () => setImagePreview(reader.result);
          reader.readAsDataURL(file);
        } else {
          setImagePreview(null);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setImagePreview]);

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: '16px' }}>
      {/* Auction Name */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="auctionName" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
          Auction Name
        </label>
        <input
          id="auctionName"
          type="text"
          placeholder="e.g., Annual Charity Gala Auction"
          {...register('auctionName', { required: 'Auction name is required' })}
          style={{ width: '100%', padding: 8, fontSize: 16, borderColor: errors.auctionName ? 'red' : '#ccc' }}
        />
        {errors.auctionName && (
          <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{errors.auctionName.message}</div>
        )}
      </div>

      {/* Short Name */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="shortName" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
          Short Name / Code
        </label>
        <input
          id="shortName"
          type="text"
          placeholder="e.g., ACGA24"
          {...register('shortName', { required: 'Short name is required' })}
          style={{ width: '100%', padding: 8, fontSize: 16, borderColor: errors.shortName ? 'red' : '#ccc' }}
        />
        {errors.shortName && (
          <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{errors.shortName.message}</div>
        )}
      </div>

      {/* Image Upload */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="auctionImage" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
          Auction Image
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Auction preview"
              style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc' }}
              className='max-sm:hidden'
            />
          ) : (
            <div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#f0f0f0',
                border: '1px dashed #bbb',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888',
                fontSize: 24,
                userSelect: 'none',
              }}
            >
              &#8682;
            </div>
          )}
          <Controller
            name="auctionImage"
            control={control}
            rules={{ required: 'Auction image is required' }}
            render={({ field }) => (
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => field.onChange(e.target.files)}
                style={{ fontSize: 16 }}
              />
            )}
          />
        </div>
        {errors.auctionImage && (
          <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{errors.auctionImage.message}</div>
        )}
        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: '#555',
            backgroundColor: '#e6f0ff',
            padding: 8,
            borderRadius: 4,
          }}
        >
          <strong>Image Guidelines:</strong> Accepted formats: JPG, PNG, WEBP. Max size: 5MB. Recommended aspect ratio: 1:1 or
          4:3.
        </div>
      </div>

      {/* Dates and Times */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        {/* Start Date */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <label htmlFor="startDate" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
            Start Date
          </label>
          <Controller
            name="startDate"
            control={control}
            rules={{ required: 'Start date is required' }}
            render={({ field }) => (
              <DatePicker
                id="startDate"
                selected={field.value}
                onChange={field.onChange}
                minDate={new Date()}
                placeholderText="Pick a date"
                className="w-full p-2 text-base border rounded"
              />
            )}
          />
          {errors.startDate && (
            <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{errors.startDate.message}</div>
          )}
        </div>

        {/* Start Time */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <label htmlFor="startTime" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
            Start Time
          </label>
          <input
            id="startTime"
            type="time"
            {...register('startTime', { required: 'Start time is required' })}
            style={{ width: '100%', padding: 8, fontSize: 16, borderColor: errors.startTime ? 'red' : '#ccc' }}
          />
          {errors.startTime && (
            <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{errors.startTime.message}</div>
          )}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="description" style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>
          Description
        </label>
        <textarea
          id="description"
          placeholder="Provide a detailed description of the auction..."
          rows={5}
          {...register('description', { required: 'Description is required' })}
          style={{ width: '100%', padding: 8, fontSize: 16, borderColor: errors.description ? 'red' : '#ccc', resize: 'vertical' }}
        />
        {errors.description && (
          <div style={{ color: 'red', marginTop: 4, fontSize: 14 }}>{errors.description.message}</div>
        )}
      </div>

      {/* Next Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onNext}
          style={{
            backgroundColor: '#008080',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            fontSize: 16,
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Save and Next &rarr;
        </button>
      </div>
    </div>
  );
}

