// src/components/BidButton.jsx
import React, { useRef, useState } from "react";
import Lottie from "lottie-react";
import "animate.css";
import bidSound from "../../../sounds/bid-sound.mp3";
import batSwing from "../../../animations/Hamerbid.json";

export default function BidButton({ onClick }) {
  const soundRef = useRef(null);
  const playerRef = useRef(null);
  const [fallbackAnimate, setFallbackAnimate] = useState("");

  // Initialize sound once
  if (!soundRef.current) {
    soundRef.current = new Audio(bidSound);
  }

  const handleBid = () => {
    // 1) Play sound
    soundRef.current.currentTime = 0;
    soundRef.current.play();

    // 2) Speed up & play the Lottie animation from frame 0
    if (playerRef.current && typeof playerRef.current.setSpeed === "function") {
      playerRef.current.setSpeed(2);
      playerRef.current.goToAndPlay(0, true);
    } else {
      setFallbackAnimate("animate__animated animate__rubberBand");
      setTimeout(() => setFallbackAnimate(""), 800);
    }

    // 3) Call external bid logic if provided
    if (onClick) setTimeout(onClick, 300);
  };

  return (
    <button
      onClick={handleBid}
      className={`grid grid-cols-2 relative w-full px-4 py-8 
        bg-gradient-to-r from-yellow-500 to-amber-600 
        rounded-xl text-black font-bold text-lg 
        overflow-hidden ${fallbackAnimate}`}
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
      {/* Optional text */}
      {/* <span className="relative z-10">BID</span> */}
    </button>
  );
}
