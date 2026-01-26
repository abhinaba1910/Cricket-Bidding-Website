// import React, { useState } from 'react';
// import {
//   CalendarClock,
//   UploadCloud,
//   CheckCircle,
//   ChevronLeft,
//   ChevronRight
// } from 'lucide-react';

// export default function CreateAuctionWizard() {
//   const [step, setStep] = useState(1);
//   const [details, setDetails] = useState({
//     name: '',
//     shortName: '',
//     logo: null,
//     startDate: '',
//     startTime: '',
//     description: ''
//   });
//   const [selectedTeams, setSelectedTeams] = useState([]);
//   const [selectedPlayers, setSelectedPlayers] = useState([]);

//   // Dummy data
//   const teams = [
//     { id: '1', name: 'Mumbai Indians' },
//     { id: '2', name: 'CSK' },
//     { id: '3', name: 'RCB' }
//   ];
//   const players = [
//     { id: '1', name: 'Virat Kohli' },
//     { id: '2', name: 'Jasprit Bumrah' },
//     { id: '3', name: 'Ben Stokes' }
//   ];

//   // Validation for step 1: all fields must be filled
//   const isStep1Valid =
//     details.name.trim() &&
//     details.shortName.trim() &&
//     details.logo &&
//     details.startDate &&
//     details.startTime &&
//     details.description.trim();

//   const next = () => {
//     if (step === 1 && !isStep1Valid) return;
//     setStep(s => Math.min(s + 1, 3));
//   };
//   const back = () => setStep(s => Math.max(s - 1, 1));

//   const createAuction = () => {
//     // Final submission logic
//     console.log({ details, selectedTeams, selectedPlayers });
//     alert('Auction created successfully!');
//   };

//   // Progress width
//   const widthClasses = { 1: 'w-1/3', 2: 'w-2/3', 3: 'w-full' }[step];

//   return (
//     <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
//       {/* Progress Bar */}
//       <div className="relative h-2 bg-gray-200">
//         <div className={`${widthClasses} h-2 bg-primary-600 transition-all duration-300`} />
//       </div>

//       <div className="p-6 space-y-6">
//         {/* Step Header */}
//         <div className="flex items-center justify-between">
//           <h2 className="text-xl font-semibold text-gray-800">Step {step} of 3</h2>
//           <div className="flex space-x-3">
//             {[1, 2, 3].map(i => (
//               <div
//                 key={i}
//                 className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
//                   step >= i
//                     ? 'border-primary-600 bg-primary-600 text-white'
//                     : 'border-gray-300 text-gray-400'
//                 }`}
//               >
//                 {step > i ? <CheckCircle className="w-5 h-5" /> : i}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Step Content */}
//         {step === 1 && (
//           <div className="space-y-5">
//             {/* Auction Name */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Auction Name</label>
//               <input
//                 type="text"
//                 value={details.name}
//                 onChange={e => setDetails({ ...details, name: e.target.value })}
//                 className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
//                 placeholder="IPL Super Auction 2025"
//               />
//             </div>

//             {/* Short Name */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Short Name</label>
//               <input
//                 type="text"
//                 value={details.shortName}
//                 onChange={e => setDetails({ ...details, shortName: e.target.value })}
//                 className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
//                 placeholder="IPL 2025"
//               />
//             </div>

//             {/* Upload Logo */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Upload Logo</label>
//               <label className="mt-1 flex items-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100">
//                 <UploadCloud className="w-5 h-5 text-gray-500 mr-2" />
//                 <span className="text-gray-600">
//                   {details.logo ? details.logo.name : 'Choose a logo...'}
//                 </span>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={e => setDetails({ ...details, logo: e.target.files[0] })}
//                 />
//               </label>
//             </div>

//             {/* Start Date & Time */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Start Date</label>
//                 <div className="relative mt-1">
//                   <CalendarClock className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
//                   <input
//                     type="date"
//                     value={details.startDate}
//                     onChange={e => setDetails({ ...details, startDate: e.target.value })}
//                     className="pl-10 pr-3 py-2 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Start Time</label>
//                 <input
//                   type="time"
//                   value={details.startTime}
//                   onChange={e => setDetails({ ...details, startTime: e.target.value })}
//                   className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
//                 />
//               </div>
//             </div>

//             {/* Description */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Description</label>
//               <textarea
//                 rows="3"
//                 value={details.description}
//                 onChange={e => setDetails({ ...details, description: e.target.value })}
//                 className="mt-1 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
//                 placeholder="Describe your auction..."
//               />
//             </div>
//           </div>
//         )}

//         {step === 2 && (
//           <div className="space-y-5">
//             <label className="block text-sm font-medium text-gray-700">Select Teams</label>
//             <select
//               multiple
//               value={selectedTeams}
//               onChange={e => setSelectedTeams(
//                 Array.from(e.target.selectedOptions, o => o.value)
//               )}
//               className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 h-40"
//             >
//               {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
//             </select>
//             <p className="text-sm text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
//           </div>
//         )}

//         {step === 3 && (
//           <div className="space-y-5">
//             <label className="block text-sm font-medium text-gray-700">Select Players</label>
//             <select
//               multiple
//               value={selectedPlayers}
//               onChange={e => setSelectedPlayers(
//                 Array.from(e.target.selectedOptions, o => o.value)
//               )}
//               className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 h-40"
//             >
//               {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
//             </select>
//             <p className="text-sm text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
//           </div>
//         )}

//         {/* Navigation Buttons */}
//         <div className="flex justify-between items-center pt-6 border-t border-gray-200">
//           <button
//             onClick={back}
//             className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
//           >
//             <ChevronLeft className="w-4 h-4 mr-1" />
//             {step > 1 ? 'Back' : 'Dashboard'}
//           </button>

//           <button
//             onClick={step < 3 ? next : createAuction}
//             disabled={step === 1 && !isStep1Valid}
//             className={`inline-flex items-center px-4 py-2 rounded-lg transition \${step === 1 && !isStep1Valid ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-primary-600  hover:bg-primary-700'}`}
//           >
//             {step < 3 ? (
//               <>
//                 Save & Next
//                 <ChevronRight className="w-4 h-4 ml-1" />
//               </>
//             ) : 'Create Auction'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
import React from 'react'
import { FiChevronLeft } from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'
import AuctioneerLogo from '../icons/auctioneer-logo'
import CreateAuctionForm from '../components/auction/create-auction-form'

export default function CreateAuctionPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    // If history length > 1, go back; else fallback to /dashboard
    if (window.history.length > 1 && location.key !== 'default') {
      navigate(-1)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f9f9] py-8 max-md:px-1 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="p-2 rounded border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
          >
            <FiChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <div className="flex items-center space-x-3">
            <AuctioneerLogo width={40} height={40} fill="#222" />
            <h1 className="text-3xl font-bold text-gray-800 max-md:text-2xl">
              Create New Auction
            </h1>
          </div>

          {/* Placeholder for symmetry */}
          <div className="w-10 h-10" />
        </header>

        {/* Main Content */}
        <CreateAuctionForm />

        {/* Footer */}
        <footer>
          <p className="mt-12 text-center text-sm text-gray-500 select-none">
            &copy; {new Date().getFullYear()} Auctioneer. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  )
}
