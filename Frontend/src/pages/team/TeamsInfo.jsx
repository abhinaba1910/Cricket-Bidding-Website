// src/pages/TeamsInfo.jsx
import React, { useState, useMemo } from 'react'
import { FiSearch, FiEye, FiEdit, FiPlus } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import MobileStickyNav from '../../components/layout/MobileStickyNav'

// --- MOCK DATA (replace with your API data) ---
const mockTeams = [
  {
    id: '1',
    name: 'Mumbai Indians',
    shortName: 'MI',
    logo: 'https://placehold.co/80x80?text=MI',
    owner: 'Reliance Industries',
    purse: 90000000,
    playersCount: 18,
  },
  {
    id: '2',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    logo: 'https://placehold.co/80x80?text=CSK',
    owner: 'India Cements',
    purse: 85000000,
    playersCount: 20,
  },
  {
    id: '3',
    name: 'Royal Challengers Bangalore',
    shortName: 'RCB',
    logo: 'https://placehold.co/80x80?text=RCB',
    owner: 'United Spirits',
    purse: 78000000,
    playersCount: 19,
  },
  {
    id: '4',
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    logo: 'https://placehold.co/80x80?text=KKR',
    owner: 'Red Chillies Entertainment',
    purse: 82000000,
    playersCount: 21,
  },
  {
    id: '5',
    name: 'Delhi Capitals',
    shortName: 'DC',
    logo: 'https://placehold.co/80x80?text=DC',
    owner: 'GMR & JSW Group',
    purse: 89000000,
    playersCount: 17,
  },
]

// --- COMPONENT ---
export default function TeamsInfo() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return mockTeams.filter(
      t =>
        t.id.includes(search) ||
        t.name.toLowerCase().includes(term) ||
        t.shortName.toLowerCase().includes(term)
    )
  }, [search])

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-md:pb-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <div className="flex-1 md:flex-none flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring"
            />
          </div>
          <a
            href="/create-team"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            <FiPlus className="mr-2" /> Add Team
          </a>
        </div>
      </div>

      {/* Cards grid */}
      <AnimatePresence>
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {filtered.length > 0 ? (
            filtered.map(team => (
              <motion.div
                key={team.id}
                className="bg-white rounded-xl shadow p-6 flex flex-col"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
              >
                <img
                  src={team.logo}
                  alt={team.shortName}
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900 text-center">{team.name}</h3>
                <p className="text-sm text-gray-500 text-center mb-4">ID: {team.id}</p>
                <div className="text-sm text-gray-700 space-y-1 flex-1">
                  <p><strong>Short Name:</strong> {team.shortName}</p>
                  <p><strong>Owner:</strong> {team.owner}</p>
                  <p><strong>Purse:</strong> ₹{team.purse.toLocaleString()}</p>
                  <p><strong>Players:</strong> {team.playersCount}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <a
                    href={`/teams/${team.id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
                  >
                    <FiEye className="mr-1" /> View
                  </a>
                  <a
                    href={`/teams/${team.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                  >
                    <FiEdit className="mr-1" /> Edit
                  </a>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.p
              className="col-span-full text-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No teams match your search.
            </motion.p>
          )}
          <MobileStickyNav/>
        </motion.div>
      </AnimatePresence>
      
    </div>
  )
}
