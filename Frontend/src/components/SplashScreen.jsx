import React, { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (typeof onComplete === "function") {
        onComplete();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover"
      >
        <source src="/src/assets/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay content */}
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="text-center">
          <div className="animate-bounce">
            {/* <img
              src="/ipl-logo.png"
              alt="IPL Auction"
              className="mx-auto h-32 w-32"
            /> */}
          </div>
          <h1 className="text-4xl text-white font-bold mt-6 animate-pulse">
            Welcome to CricBid Auction!
          </h1>
          <p className="text-white mt-2 text-lg italic">
            "Build your dream team"
          </p>
        </div>
      </div>
    </div>
  );
}
