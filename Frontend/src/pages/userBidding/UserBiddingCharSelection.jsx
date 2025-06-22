import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Api from "../../userManagement/Api";



// const placeholderAvatars = [
//   { id: "avatar1", src: "/avatars/avatar1.png", alt: "Avatar 1" },
//   { id: "avatar2", src: "/avatars/avatar2.png", alt: "Avatar 2" },
//   { id: "avatar3", src: "/avatars/avatar3.png", alt: "Avatar 3" },
//   { id: "avatar4", src: "/avatars/avatar4.png", alt: "Avatar 4" },
//   { id: "avatar5", src: "/avatars/avatar5.png", alt: "Avatar 5" },
// ];
const placeholderAvatars = [
  // {
  //   id: "avatar1",
  //   // this thumbnail could still be a PNG for the grid if you like…
  //   thumbnail: "/avatars/avatar1-thumb.png",
  //   // …but the .src you send (avatarUrl) should be your glb:
  //   src: "/models/char1.glb",
  //   alt: "Bidder1",
  // },
  // {
  //   id: "avatar2",
  //   thumbnail: "/avatars/avatar2-thumb.png",
  //   src: "/models/char2.glb",
  //   alt: "Bidder2",
  // },
  // {
  //   id: "avatar3",
  //   thumbnail: "/avatars/avatar2-thumb.png",
  //   src: "/models/char3.glb",
  //   alt: "Bidder3",
  // },
  {
    id: "avatar4",
    thumbnail: "/models/avatarImages/bidder4.png",
    src: "/models/char4.glb",
    alt: "Bidder4",
  },
  {
    id: "avatar5",
    thumbnail: "/models/avatarImages/bidder5.png",
    src: "/models/char5.glb",
    alt: "Bidder5",
  },
  {
    id: "avatar6",
    thumbnail: "/models/avatarImages/bidder6.png",
    src: "/models/char6.glb",
    alt: "Bidder6",
  },
  {
    id: "avatar7",
    thumbnail: "/models/avatarImages/bidder7.png",
    src: "/models/char7.glb",
    alt: "Bidder7",
  },
  {
    id: "avatar8",
    thumbnail: "/models/avatarImages/bidder8.png",
    src: "/models/char8.glb",
    alt: "Bidder8",
  },
  {
    id: "avatar9",
    thumbnail: "/models/avatarImages/bidder9.png",
    src: "/models/char9.glb",
    alt: "Bidder9",
  },
  {
    id: "avatar10",
    thumbnail: "/models/avatarImages/bidder10.png",
    src: "/models/char10.glb",
    alt: "Bidder10",
  },
  {
    id: "avatar11",
    thumbnail: "/models/avatarImages/bidder11.png",
    src: "/models/char11.glb",
    alt: "Bidder11",
  },
  {
    id: "avatar12",
    thumbnail: "/models/avatarImages/bidder12.png",
    src: "/models/char12.glb",
    alt: "Bidder12",
  },
  {
    id: "avatar13",
    thumbnail: "/models/avatarImages/bidder13.png",
    src: "/models/char13.glb",
    alt: "Bidder13",
  },
  {
    id: "avatar14",
    thumbnail: "/models/avatarImages/bidder14.png",
    src: "/models/char14.glb",
    alt: "Bidder14",
  },
  {
    id: "avatar15",
    thumbnail: "/models/avatarImages/bidder15.png",
    src: "/models/char15.glb",
    alt: "Bidder15",
  },
  {
    id: "avatar16",
    thumbnail: "/models/avatarImages/bidder16.png",
    src: "/models/char16.glb",
    alt: "Bidder16",
  },
  {
    id: "avatar17",
    thumbnail: "/models/avatarImages/bidder17.png",
    src: "/models/char17.glb",
    alt: "Bidder17",
  },
  // …etc
];

export default function UserBiddingCharSelection() {
  const { id } = useParams(); // auctionId
  const navigate = useNavigate();
  console.log(id);

  const [teams, setTeams] = useState([]);
  const [avatars, setAvatars] = useState(placeholderAvatars);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await Api.get(`/join-auction/${id}/teams`);
        setTeams(res.data.teams);
        if(res.data.alreadyManager){
          navigate(`/user-bidding-portal/${id}`);
        }
        console.log(res.data);
      } catch (err) {
        toast.error("Failed to fetch teams", err);
        setError("Could not load teams. Please try again.");
      }
    };

    fetchTeams();
    setAvatars(placeholderAvatars);
  }, [id]);

  const handleJoin = async () => {
    if (!selectedTeam || !selectedAvatar) {
      setError("Please select both a team and an avatar.");
      return;
    }
    try {
      await Api.post(`/join-auction/${id}/confirm`, {
        teamId: selectedTeam,
        avatarUrl: avatars.find(a => a.id === selectedAvatar).src,
      });
      navigate(`/user-bidding-portal/${id}`);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to join. Please try again.";
      if (message === "You have already selected a team and avatar.") {
        toast.success(message);
        navigate(`/user-bidding-portal/${id}`);
      } else {
        setError(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <h1 className="text-2xl font-bold mb-6">Join Auction #{id}</h1>

      <div className="space-y-8">
        {/* Step 1: Select Team */}
        <div>
          <h2 className="text-xl font-semibold mb-4">1. Select Your Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => {
                  setSelectedTeam(team.id);
                  setError("");
                }}
                className={`p-3 rounded-xl border flex flex-col items-center shadow-sm transition
          ${
            selectedTeam === team.id
              ? "border-teal-600 bg-teal-100"
              : "border-gray-300 bg-white hover:bg-gray-100"
          }`}
              >
                <img
                  src={team.logoUrl}
                  alt={team.name}
                  className="w-16 h-16 object-contain mb-2"
                />
                <div className="text-sm font-semibold text-center">
                  {team.shortName}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Avatar */}
        <div>
          <h2 className="text-xl font-semibold mb-4">2. Choose Your Avatar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {avatars.map((av) => (
              <button
                key={av.id}
                onClick={() => {
                  setSelectedAvatar(av.id);
                  setError("");
                }}
                className={`p-2 rounded-lg border overflow-hidden
                  ${
                    selectedAvatar === av.id
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-300 bg-white hover:bg-gray-100"
                  }`}
              >
                
                <img
                  src={av.thumbnail}
                  alt={av.alt}
                  className="w-full h-auto object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Final Join Button */}
      <div className="mt-8">
        <button
          onClick={handleJoin}
          disabled={!selectedTeam || !selectedAvatar}
          className={`w-full max-w-xs mx-auto px-6 py-3 rounded-lg text-white font-medium
            ${
              selectedTeam && selectedAvatar
                ? "bg-teal-600 hover:bg-teal-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          Join Auction
        </button>
      </div>
    </div>
  );
}
