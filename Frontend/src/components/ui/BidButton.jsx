// src/components/BidButton.jsx
import React, { useRef, useState } from "react";
import Lottie from "lottie-react";
import "animate.css";

import batSwing from "../../../animations/Hamerbid.json";

export default function BidButton({ onClick }) {
  const soundRef = useRef(new Audio("/sounds/bid-sound.mp3"));
  const playerRef = useRef(null);
  const [fallbackAnimate, setFallbackAnimate] = useState("");

  const handleBid = () => {
    // 1) Play sound
    soundRef.current.currentTime = 0;
    soundRef.current.play();

    // 2) Speed up & play the Lottie animation from frame 0
    if (playerRef.current && typeof playerRef.current.setSpeed === "function") {
      // Set playback speed to 2×
      playerRef.current.setSpeed(2);

      // Jump to frame 0 and play
      playerRef.current.goToAndPlay(0, true);
    } else {
      // Fallback to Animate.css “rubberBand”
      setFallbackAnimate("animate__animated animate__rubberBand");
      setTimeout(() => setFallbackAnimate(""), 800);
    }

    // 3) Call external bid logic if provided
    if (onClick) setTimeout(onClick, 300);
  };

  return (
    <button
      onClick={handleBid}
      className={` grid grid-cols-2
        relative w-full px-4 py-8 
        bg-gradient-to-r from-yellow-500 to-amber-600 
        rounded-xl text-black font-bold text-lg 
        overflow-hidden ${fallbackAnimate}
      `}
    >
      {/* Lottie animation behind the text */}
      <div className="absolute inset-8 flex items-center justify-center pointer-events-none">
        <Lottie
          lottieRef={playerRef}
          animationData={batSwing}
          autoplay={false}
          loop={false}
          speed={2}                  
          style={{ width: 120, height: 120, opacity: 0.7 }}
        />
      </div>

      {/* <span className="relative z-10">BID</span> */}
    </button>
  );
}
