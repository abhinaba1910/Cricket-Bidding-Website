import React, { useState, useEffect } from "react";
import UserBiddngPortalDesktop from ".//UserBiddngPortalDesktop";
import UserBiddingDashboardMobile from ".//UserBiddingPortalMobile";

function UserBiddingRoute() {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768 // change “768” to your md‐breakpoint if needed
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile
    ? <UserBiddingDashboardMobile />
    : <UserBiddngPortalDesktop />;
}

export default UserBiddingRoute;
