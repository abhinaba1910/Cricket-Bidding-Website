import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
// English content
const contentEn = {
  title: 'Auction Page Guide',
  sections: [
    {
      title: 'Summary Stats',
      items: [
        {
          label: 'Last Sold Player',
          description:
            'Shows the name, role, base price, and final winning bid of the player just sold.',
        },
        {
          label: 'Top Bid Player',
          description:
            'Displays the player with the highest bid so far and the bidder’s team.',
        },
        {
          label: 'Player Card',
          description:
            'Tap a player’s name or avatar to see age, stats, recent form, and base price.',
        },
      ],
    },
    {
      title: 'Bidding Panel',
      items: [
        {
          label: 'Player List',
          description:
            'Scroll through all available players. Sold ones are greyed out, unsold remain active.',
        },
        {
          label: 'Bid Now Button',
          description:
            'Tap once to place your bid at the current Next Price. First tap wins and the bid is placed instantly.',
        },
        {
          label: 'Next Price',
          description:
            'Calculated as current highest bid plus the minimum increment.',
        },
        {
          label: 'Current Highest Bid',
          description:
            'Live display of the top bid and bidder’s team name.',
        },
        {
          label: 'RTM Option',
          description:
            'Right To Match lets you match another team’s final bid for a released player (admin approval required).',
        },
      ],
    },
    {
      title: 'Team Panel',
      items: [
        {
          label: 'Team Balance',
          description:
            'Your remaining budget; reduced immediately when you tap Bid Now.',
        },
        {
          label: 'Roster Summary',
          description:
            'Shows counts of batsmen, bowlers, and all-rounders in your squad.',
        },
        {
          label: 'Bid History',
          description:
            'Your last three bids, with timestamps and amounts.',
        },
        {
          label: 'Avatar & Emotes',
          description:
            'Your avatar and emote buttons to react during live bidding.',
        },
      ],
    },
  ],
  instructions: [
    'Tap “Bid Now” once. Your bid is placed immediately at the Next Price—first tap wins.',
    'Next Price updates automatically after each bid.',
    'You cannot bid twice in a row; bids must alternate between teams.',
    'Current Highest Bid shows the live leader and amount.',
    'Tap RTM on a released player to match their final bid (admin approval required).',
  ],
};

// Hindi content
const contentHi = {
  title: 'नीलामी पेज मार्गदर्शिका',
  sections: [
    {
      title: 'सारांश आँकड़े',
      items: [
        {
          label: 'आखिरी बिके खिलाड़ी',
          description:
            'अभी-अभी बिके खिलाड़ी का नाम, भूमिका, आधार मूल्य और अंतिम बोली दिखाता है।',
        },
        {
          label: 'शीर्ष बोली खिलाड़ी',
          description:
            'अब तक की सबसे ऊँची बोली और बोली लगाने वाली टीम दिखाता है।',
        },
        {
          label: 'खिलाड़ी कार्ड',
          description:
            'खिलाड़ी के नाम या अवतार पर टैप करके आयु, आँकड़े और आधार मूल्य देखें।',
        },
      ],
    },
    {
      title: 'बिडिंग पैनल',
      items: [
        {
          label: 'खिलाड़ियों की सूची',
          description:
            'सभी उपलब्ध खिलाड़ियों की लिस्ट स्क्रॉल करें। बिके खिलाड़ी ग्रे में दिखेंगे; अविके टैपेबल होंगे।',
        },
        {
          label: 'बिड नाउ बटन',
          description:
            'अगली कीमत पर बोली लगाने के लिए एक बार टैप करें—पहला टैप जीतता है और बोली तुरंत लग जाती है।',
        },
        {
          label: 'अगली कीमत',
          description:
            'वर्तमान शीर्ष बोली में न्यूनतम वृद्धि जोड़कर ऑटोमैटिक बनेगी।',
        },
        {
          label: 'वर्तमान उच्चतम बोली',
          description:
            'लाइन में सबसे ऊँची बोली और टीम का नाम लाइव दिखाता है।',
        },
        {
          label: 'RTM विकल्प',
          description:
            'राइट टू मैच से आप रिलीज़ खिलाड़ी की अंतिम बोली मैच कर सकते हैं (एडमिन अनुमति आवश्यक)।',
        },
      ],
    },
    {
      title: 'टीम पैनल',
      items: [
        {
          label: 'बैलेंस',
          description:
            'आपकी बची हुई बजट; “बिड नाउ” टैप करते ही घट जाएगी।',
        },
        {
          label: 'रॉस्टर सारांश',
          description:
            'बल्लेबाज, गेंदबाज और ऑल-राउंडर्स की संख्या दिखाता है।',
        },
        {
          label: 'बोली इतिहास',
          description:
            'पिछली तीन बोलियाँ, समय और राशि के साथ।',
        },
        {
          label: 'अवतार और इमोट्स',
          description:
            'आपका अवतार और इमोट बटन लाइव नीलामी में प्रतिक्रिया के लिए।',
        },
      ],
    },
  ],
  instructions: [
    '“बिड नाउ” पर एक बार टैप करें—पहला टैप जीतता है और बोली तुरंत लग जाती है।',
    'हर बोली के बाद अगली कीमत ऑटोमैटिक अपडेट होती है।',
    'आप लगातार दो बार बोली नहीं लगा सकते—बोलियाँ टीमों के बीच बारी-बारी से होनी चाहिए।',
    'वर्तमान उच्चतम बोली लाइव नेता और राशि दिखाती है।',
    'रिलीज़ किए गए खिलाड़ी पर RTM टैप करें ताकि उनकी अंतिम बोली मैच हो सके (एडमिन अनुमति आवश्यक)।',
  ],
};

export default function GuideLinesMultiLang() {
  const [lang, setLang] = useState('en');
  const content = lang === 'en' ? contentEn : contentHi;
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="bg-blue-50 min-h-screen p-4 md:p-8 lg:p-12 text-gray-800 relative">

      {/* 🔙 Sticky Back Button (Visible on All Screens) */}
      <div className="sticky top-4 z-50">
        <button
          onClick={() => navigate(`/user-bidding-portal/${id}`)}
          className="flex items-center space-x-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-md shadow-md"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">
            {lang === 'en' ? 'Back to Auction' : 'नीलामी पर वापस जाएँ'}
          </span>
        </button>
      </div>

      {/* 🌐 Language Toggle */}
      <div className="flex justify-end mt-4 mb-6">
        <button
          onClick={() => setLang('en')}
          className={`px-4 py-2 rounded-l-lg border ${
            lang === 'en' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLang('hi')}
          className={`px-4 py-2 rounded-r-lg border ${
            lang === 'hi' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
          }`}
        >
          हिन्दी
        </button>
      </div>

      {/* 🏷️ Title */}
      <h1 className="text-2xl md:text-4xl font-bold text-center text-blue-600 mb-10">
        {content.title}
      </h1>

      {/* 📌 Instructions First */}
      <section className="mb-12 bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-blue-700 mb-6">
          {lang === 'en' ? 'Working Instructions' : 'कार्य निर्देश'}
        </h2>
        <ol className="list-decimal list-inside space-y-5 text-gray-700">
          {content.instructions.map((instr, i) => (
            <li key={i}>{instr}</li>
          ))}
        </ol>
      </section>

      {/* 🧩 Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {content.sections.map((sec, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-blue-700 mb-4">
              {sec.title}
            </h2>
            <ul className="space-y-4">
              {sec.items.map((item, i) => (
                <li key={i}>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-gray-600 ml-4">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}