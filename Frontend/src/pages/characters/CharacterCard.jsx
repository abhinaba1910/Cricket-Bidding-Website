// src/CharacterCard.jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import ErrorBoundary from './ErrorBoundary';
import Character from './Character';

export default function CharacterCard() {
  return (
    <div className="w-80 h-96 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
      {/* Card header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Team Manager</h2>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100">
        <ErrorBoundary>
          <Canvas camera={{ position: [0, 0.8, 2.5], fov: 55 }} style={{ width: '100%', height: '100%' }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 3, 3]} intensity={0.9} castShadow />
            <directionalLight position={[-3, 2, -1]} intensity={0.4} color="#fbcfe8" />

            {/* Ground plane */}
            <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[5, 5]} />
              <meshStandardMaterial color="#e5e7eb" />
            </mesh>

            {/* Character + all six emotes */}
            {/* <Character
              modelPath="/models/char5.glb"
              emotePaths={[
                '/models/emotes/BidWon.glb',
                '/models/emotes/HandRaise.glb',
                '/models/emotes/LostBid.glb',
                '/models/emotes/RTM.glb',
                '/models/emotes/StandToSit.glb',
              ]}
              labels={[
                'Bid Won',
                'Hand Raise',
                'Lost Bid',
                'RTM',
                'Stand to Sit',
              ]}
            /> */}
            <Character
              modelPath="/models/char5.glb"
              emotePaths={[
                '/models/emotes/BidWon.glb',
                '/models/emotes/HandRaise.glb',
                '/models/emotes/LostBid.glb',
                '/models/emotes/RTM.glb',
                '/models/emotes/StandToSit.glb',
              ]}
              labels={[
                'Bid Won',
                'Hand Raise',
                'Lost Bid',
                'RTM',
                'Stand to Sit',
              ]}
            />

          </Canvas>
        </ErrorBoundary>
      </div>
    </div>
  );
}
