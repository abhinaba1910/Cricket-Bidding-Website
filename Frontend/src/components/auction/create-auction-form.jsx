// import React, { useState, useEffect } from 'react';
// import { useForm, FormProvider } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { PartyPopper } from 'lucide-react'; // you can replace this with a simple emoji or SVG for full custom

// import StepIndicator from './step-indicator';
// import AuctionStep1Details from './auction-step-1-details';
// import AuctionStep2Teams from './auction-step-2-teams';
// import AuctionStep3Players from './auction-step-3-players';

// import {
//   auctionStep1Schema,
//   auctionStep2Schema,
//   auctionStep3Schema,
// } from '../../lib/schemas';

// // Mock data
// const mockTeams = [
//   { id: 'team1', name: 'Warriors of the North', logoUrl: 'https://placehold.co/40x40.png' },
//   { id: 'team2', name: 'Southern Stallions', logoUrl: 'https://placehold.co/40x40.png' },
//   { id: 'team3', name: 'Eastern Eagles', logoUrl: 'https://placehold.co/40x40.png' },
//   { id: 'team4', name: 'Western Wolves', logoUrl: 'https://placehold.co/40x40.png' },
//   { id: 'team5', name: 'Central Cyclones', logoUrl: 'https://placehold.co/40x40.png' },
// ];

// const mockPlayers = [
//   { id: 'player1', name: 'Alice "Ace" Anderson', teamId: 'team1', imageUrl: 'https://placehold.co/40x40.png', grade: 'A', skills: ['Batsman (Right-handed)', 'Wicket-keeper'] },
//   { id: 'player2', name: 'Bob "Blitz" Bronco', teamId: 'team1', imageUrl: 'https://placehold.co/40x40.png', grade: 'B', skills: ['Bowler (Pacer - Right Arm Fast)'] },
//   // add more players as needed
// ];

// const stepSchemas = [auctionStep1Schema, auctionStep2Schema, auctionStep3Schema];
// const stepTitles = ['Auction Details', 'Team Selection', 'Player Selection'];

// export default function CreateAuctionForm() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [toast, setToast] = useState(null);

//   const methods = useForm({
//     resolver: zodResolver(stepSchemas[currentStep - 1]),
//     mode: 'onTouched',
//     defaultValues: {
//       auctionName: '',
//       shortName: '',
//       auctionImage: undefined,
//       startDate: undefined,
//       startTime: '',
//       description: '',
//       selectedTeams: [],
//       selectedPlayers: [],
//     },
//   });

//   const { handleSubmit, trigger, watch, reset, getValues, clearErrors } = methods;
//   const selectedTeamIds = watch('selectedTeams');

//   const handleNext = async () => {
//     const valid = await trigger();
//     if (valid) {
//       if (currentStep < 3) setCurrentStep(s => s + 1);
//       else handleSubmit(onSubmit)();
//     } else {
//       setToast({ type: 'error', message: 'Fix errors before continuing' });
//       setTimeout(() => setToast(null), 3000);
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 1) setCurrentStep(s => s - 1);
//   };

//   const onSubmit = async (data) => {
//     await new Promise(r => setTimeout(r, 1000)); // simulate API
//     setToast({ type: 'success', message: 'Auction Created!' });
//     setCurrentStep(4);
//     setTimeout(() => setToast(null), 3000);
//   };

//   useEffect(() => {
//     clearErrors();
//   }, [currentStep, clearErrors]);

//   // Custom toast message component
//   const Toast = ({ type, message }) => (
//     <div
//       style={{
//         position: 'fixed',
//         top: 20,
//         right: 20,
//         padding: '10px 20px',
//         backgroundColor: type === 'error' ? '#f44336' : '#4caf50',
//         color: 'white',
//         borderRadius: 4,
//         zIndex: 1000,
//         fontWeight: 'bold',
//       }}
//     >
//       {message}
//     </div>
//   );

//   if (currentStep === 4) {
//     const name = getValues('auctionName');
//     return (
//       <div style={{
//         maxWidth: 400,
//         margin: 'auto',
//         padding: 24,
//         boxShadow: '0 0 10px rgba(0,0,0,0.1)',
//         textAlign: 'center',
//         borderRadius: 8,
//       }}>
//         <div style={{
//           marginBottom: 16,
//           padding: 12,
//           backgroundColor: '#d4edda',
//           borderRadius: '50%',
//           width: 72,
//           height: 72,
//           marginLeft: 'auto',
//           marginRight: 'auto',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           fontSize: 40,
//           color: '#155724',
//         }}>
//           🎉
//         </div>
//         <h2 style={{ marginBottom: 8 }}>Auction Created Successfully!</h2>
//         <p style={{ marginBottom: 24 }}>Your auction “{name}” is ready.</p>
//         <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
//           <button
//             onClick={() => {
//               reset();
//               setImagePreview(null);
//               setCurrentStep(1);
//             }}
//             style={{
//               padding: '10px 20px',
//               border: '1px solid #007bff',
//               backgroundColor: 'white',
//               color: '#007bff',
//               borderRadius: 4,
//               cursor: 'pointer',
//             }}
//           >
//             Create Another
//           </button>
//           <a
//             href="/auctions"
//             style={{
//               padding: '10px 20px',
//               backgroundColor: '#007bff',
//               color: 'white',
//               borderRadius: 4,
//               textDecoration: 'none',
//               display: 'inline-block',
//               cursor: 'pointer',
//             }}
//           >
//             View Auctions
//           </a>
//         </div>
//       </div>
//     );
//   }
 
//   return (
//     <FormProvider {...methods}>
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         style={{
//           maxWidth: 900,
//           margin: '20px auto',
//           padding: 24,
//           boxShadow: '0 0 20px rgba(0,0,0,0.1)',
//           borderRadius: 8,
//           backgroundColor: '#fff',
//           fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//         }}
//       >
//         <StepIndicator currentStep={currentStep} totalSteps={3} stepTitles={stepTitles} />

//         <div style={{ marginTop: 24 }}>
//           {currentStep === 1 && (
//             <AuctionStep1Details
//               onNext={handleNext}
//               imagePreview={imagePreview}
//               setImagePreview={setImagePreview}
//             />
//           )}
//           {currentStep === 2 && (
//             <AuctionStep2Teams
//               onNext={handleNext}
//               onBack={handleBack}
//               allTeams={mockTeams}
//             />
//           )}
//           {currentStep === 3 && (
//             <AuctionStep3Players
//               onBack={handleBack}
//               onSubmit={handleNext}
//               allPlayers={mockPlayers}
//               selectedTeamIds={selectedTeamIds}
//             />
//           )}
//         </div>
//         <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
//           {currentStep > 1 && (
//             <button
//               type="button"
//               onClick={handleBack}
//               style={{
//                 padding: '10px 20px',
//                 backgroundColor: 'transparent',
//                 border: '1px solid #007bff',
//                 borderRadius: 4,
//                 color: '#007bff',
//                 cursor: 'pointer',
//               }}
//             >
//               &larr; Back
//             </button>
//           )}
//           <button
//             type="button"
//             onClick={handleNext}
//             style={{
//               padding: '10px 20px',
//               backgroundColor: '#007bff',
//               border: 'none',
//               borderRadius: 4,
//               color: 'white',
//               cursor: 'pointer',
//               marginLeft: 'auto',
//             }}
//           >
//             {currentStep === 3 ? 'Create Auction' : 'Next'}
//           </button>
//         </div>

//         {toast && <Toast type={toast.type} message={toast.message} />}
//       </form>
//     </FormProvider>
//   );
// }










////////////////////////////////////////////////////////



import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import StepIndicator from './step-indicator';
import AuctionStep1Details from './auction-step-1-details';
import AuctionStep2Teams from './auction-step-2-teams';
import AuctionStep3Players from './auction-step-3-players';
import {
  auctionStep1Schema,
  auctionStep2Schema,
  auctionStep3Schema,
} from '../../lib/schemas';
import api from '../../userManagement/Api';

const stepSchemas = [auctionStep1Schema, auctionStep2Schema, auctionStep3Schema];
const stepTitles = ['Auction Details', 'Team Selection', 'Player Selection'];

export default function CreateAuctionForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  // 📌 Use *full schema* validation at the end (on final submission)
  const methods = useForm({
    mode: 'onTouched',
    defaultValues: {
      auctionName: '',
      shortName: '',
      auctionImage: undefined,
      startDate: '',
      startTime: '',
      description: '',
      selectedTeams: [],
      selectedPlayers: [],
    },
  });

  const {
    handleSubmit,
    trigger,
    watch,
    reset,
    getValues,
    setValue,
    clearErrors,
    formState: { errors }
  } = methods;

  const selectedTeamIds = watch('selectedTeams');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, playerRes] = await Promise.all([
          api.get('/get-teams'),
          api.get('/get-player'),
        ]);
        setTeams(teamRes.data);
        setPlayers(playerRes.data);
      } catch (err) {
        console.error('Fetching teams/players failed:', err);
        setToast({ type: 'error', message: 'Failed to load teams or players' });
      }
    };
    fetchData();
  }, []);

  const handleNext = async () => {
    const valid = await trigger();
    if (valid) {
      if (currentStep < 3) {
        setCurrentStep((s) => s + 1);
      } else {
        handleSubmit(onSubmit)(); // 💡 final submission
      }
    } else {
      setToast({ type: 'error', message: 'Fix errors before continuing' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('auctionName', data.auctionName);
      formData.append('shortName', data.shortName);
      // formData.append('startDate', data.startDate);
      const datePart = data.startDate.toISOString().split('T')[0];
    const isoDateTime = `${datePart}T${data.startTime}`;
    formData.append('startDate', new Date(isoDateTime).toISOString());
      formData.append('description', data.description);
      formData.append('selectedTeams', JSON.stringify(data.selectedTeams));
      formData.append('selectedPlayers', JSON.stringify(data.selectedPlayers));

      if (data.auctionImage && data.auctionImage.length > 0) {
        formData.append('auctionImage', data.auctionImage[0]);
      }

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      await api.post('/create-auction', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setToast({ type: 'success', message: 'Auction Created!' });
      setCurrentStep(4);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Create auction error:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.error || 'Failed to create auction',
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  useEffect(() => {
    clearErrors();
  }, [currentStep]);

  const Toast = ({ type, message }) => (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      padding: '10px 20px',
      backgroundColor: type === 'error' ? '#f44336' : '#4caf50',
      color: 'white',
      borderRadius: 4,
      zIndex: 1000,
      fontWeight: 'bold',
    }}>
      {message}
    </div>
  );

  if (currentStep === 4) {
    const name = getValues('auctionName');
    return (
      <div style={{
        maxWidth: 400,
        margin: 'auto',
        padding: 24,
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        borderRadius: 8,
      }}>
        <div style={{
          marginBottom: 16,
          padding: 12,
          backgroundColor: '#d4edda',
          borderRadius: '50%',
          width: 72,
          height: 72,
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 40,
          color: '#155724',
        }}>
          🎉
        </div>
        <h2 style={{ marginBottom: 8 }}>Auction Created Successfully!</h2>
        <p style={{ marginBottom: 24 }}>Your auction “{name}” is ready.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button
            onClick={() => {
              reset();
              setImagePreview(null);
              setCurrentStep(1);
            }}
            style={{
              padding: '10px 20px',
              border: '1px solid #007bff',
              backgroundColor: 'white',
              color: '#007bff',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Create Another
          </button>
          <a
            href="/auctions"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: 4,
              textDecoration: 'none',
              display: 'inline-block',
              cursor: 'pointer',
            }}
          >
            View Auctions
          </a>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          maxWidth: 900,
          margin: '20px auto',
          padding: 24,
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          borderRadius: 8,
          backgroundColor: '#fff',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <StepIndicator currentStep={currentStep} totalSteps={3} stepTitles={stepTitles} />

        <div style={{ marginTop: 24 }}>
          {currentStep === 1 && (
            <AuctionStep1Details
              onNext={handleNext}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
            />
          )}
          {currentStep === 2 && (
            <AuctionStep2Teams
              onNext={handleNext}
              onBack={handleBack}
              allTeams={teams}
            />
          )}
          {currentStep === 3 && (
            <AuctionStep3Players
              onBack={handleBack}
              onSubmit={handleNext}
              allPlayers={players}
              selectedTeamIds={selectedTeamIds}
            />
          )}
        </div>

        {/* <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                border: '1px solid #007bff',
                borderRadius: 4,
                color: '#007bff',
                cursor: 'pointer',
              }}
            >
              &larr; Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              border: 'none',
              borderRadius: 4,
              color: 'white',
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            {currentStep === 3 ? 'Create Auction' : 'Next'}
          </button>
        </div> */}

        {toast && <Toast type={toast.type} message={toast.message} />}
      </form>
    </FormProvider>
  );
}

