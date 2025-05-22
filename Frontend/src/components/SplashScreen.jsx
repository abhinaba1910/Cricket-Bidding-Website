import React, { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
  const timer = setTimeout(() => {
    setShow(false);
    if (typeof onComplete === 'function') {
      onComplete();
    }
  }, 3000);

  return () => clearTimeout(timer);
}, [onComplete]);

  if (!show) return null;

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 to-yellow-500">
      <div className="text-center">
        <div className="animate-bounce">
          <img
            src="/ipl-logo.png" // Replace with your IPL logo or graphic
            alt="IPL Auction"
            className="mx-auto h-32 w-32"
          />
        </div>
        <h1 className="text-4xl text-white font-bold mt-6 animate-pulse">
          Welcome to IPL Auction!
        </h1>
        <p className="text-white mt-2 text-lg italic">
          "Build your dream team"
        </p>
      </div>
    </div>
  );
}
