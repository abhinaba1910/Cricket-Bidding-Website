// import React, { Suspense } from 'react';
// import { Canvas } from '@react-three/fiber';
// import ErrorBoundary from './ErrorBoundary';
// import Character from './Character';
// import BgImg from '../../assets/ipl-auction-2.jpg'


// export default function CharacterCard({
// modelPath,
// triggerEmote,
//   emotePaths = [
//     '/models/emotes/BidWon.glb',
//     '/models/emotes/HandRaise.glb',
//     '/models/emotes/LostBid.glb',
//     '/models/emotes/RTM.glb',
//     '/models/emotes/StandToSit.glb',
//   ],
//   labels = ['BidWon','HandRaise','LostBid','ReadytoMove','StandtoSit'],
  
// })

// {
//     if (!modelPath) {
//     return (
//       <div className="w-80 h-96 flex items-center justify-center bg-gray-100 rounded-xl">
//         <p className="text-gray-500">Loading character…</p>
//       </div>
//     );
//   }
//   return (
//     <div
//       className="w-80 h-96 rounded-xl overflow-hidden flex flex-col bg-cover bg-center"
//       style={{ backgroundImage: `url(${BgImg})` }}
//     >
//       {/* Optional transparent header (you can remove this entirely if you don't need a header) */}
//       <div className="px-4 py-3">
//         <h2 className="text-lg font-semibold">Team Manager</h2>
//       </div>

//       {/* 3D Canvas sits directly on top of your background image */}
//       <div className="flex-1 relative">
//         <ErrorBoundary>
//           <Canvas
//             camera={{ position: [0, 0.8, 2.5], fov: 70 }}
//             style={{ width: '100%', height: '100%' }}
//           >
//             <Suspense fallback={null}>
//             <ambientLight intensity={0.7} />
//             <directionalLight position={[3, 3, 3]} intensity={0.9} castShadow />
//             <directionalLight position={[-3, 2, -1]} intensity={0.4} color="#fbcfe8" />

//             {/* Ground plane */}
//             <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
//               <planeGeometry args={[5, 5]} />
//               <meshStandardMaterial color="#e5e7eb"
//               transparent={true}
//               opacity={0}
//                />
//             </mesh>
//             <Character
//               modelPath={modelPath}
//               emotePaths={emotePaths}
//               labels={labels}
//               triggerEmote={triggerEmote}
//             />
//             </Suspense>
//           </Canvas>
//         </ErrorBoundary>
//       </div>
//     </div>
//   );
// }
// src/Character.jsx
// src/CharacterCard.jsx
// src/CharacterCard.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import ErrorBoundary from './ErrorBoundary';
import Character from './Character';
import BgImg from '../../assets/ipl-auction-2.jpg';

// Imported image assets
import HandR from '../../assets/raise.png';
import Joy from '../../assets/joy.png';
import Happy from '../../assets/happy.png';
import Sad from '../../assets/sad.png';
import Sit from '../../assets/sit.png';

export default function CharacterCard({
  modelPath,
  triggerEmote,
  emotePaths = [
    '/models/emotes/BidWon.glb',
    '/models/emotes/HandRaise.glb',
    '/models/emotes/LostBid.glb',
    '/models/emotes/RTM.glb',
    '/models/emotes/StandToSit.glb',
  ],
  labels = ['BidWon', 'HandRaise', 'LostBid', 'ReadytoMove', 'StandtoSit'],
}) {
  if (!modelPath) {
    return (
      <div className="w-80 h-96 flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-gray-500">Loading character…</p>
      </div>
    );
  }

  // Create small React components for each image icon.
  // They accept `className` so Character can pass `w-5 h-5` etc.
  const BidWonIcon = ({ className }) => (
    <img src={Joy} alt="Bid Won" className={`${className} object-contain`} />
  );
  const HandRaiseIcon = ({ className }) => (
    <img src={HandR} alt="Hand Raise" className={`${className} object-contain`} />
  );
  const LostBidIcon = ({ className }) => (
    <img src={Sad} alt="Lost Bid" className={`${className} object-contain`} />
  );
  const ReadyToMoveIcon = ({ className }) => (
    <img src={Happy} alt="Ready to Move" className={`${className} object-contain`} />
  );
  const StandToSitIcon = ({ className }) => (
    <img src={Sit} alt="Stand to Sit" className={`${className} object-contain`} />
  );

  // Ensure icons array lines up with emotePaths/labels
  const icons = [
    BidWonIcon,      // for 'BidWon'
    HandRaiseIcon,   // for 'HandRaise'
    LostBidIcon,     // for 'LostBid'
    ReadyToMoveIcon, // for 'RTM' / 'ReadytoMove'
    StandToSitIcon,  // for 'StandToSit'
  ];

  return (
    <div
      className="w-80 h-96 rounded-xl overflow-hidden flex flex-col bg-cover bg-center"
      style={{ backgroundImage: `url(${BgImg})` }}
    >
      <div className="px-4 py-3">
        <h2 className="text-lg font-semibold">Team Manager</h2>
      </div>

      <div className="flex-1 relative">
        <ErrorBoundary>
          <Canvas
            camera={{ position: [0, 0.8, 2.5], fov: 70 }}
            style={{ width: '100%', height: '100%' }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[3, 3, 3]} intensity={0.9} castShadow />
              <directionalLight position={[-3, 2, -1]} intensity={0.4} color="#fbcfe8" />

              {/* Ground plane */}
              <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[5, 5]} />
                <meshStandardMaterial color="#e5e7eb" transparent opacity={0} />
              </mesh>

              <Character
                modelPath={modelPath}
                emotePaths={emotePaths}
                labels={labels}
                icons={icons}
                triggerEmote={triggerEmote}
              />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>
    </div>
  );
}
