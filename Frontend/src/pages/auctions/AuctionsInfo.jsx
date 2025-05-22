// src/pages/AuctionsInfo.jsx
import React, { useState, useMemo } from 'react'
import { FiPlus, FiEye, FiEdit, FiSearch } from 'react-icons/fi'

const auctions = [
  {
    id: '1',
    name: 'IPL Super Auction 2025',
    logo: 'https://placehold.co/60x60',
    date: '2025-03-15',
    time: '10:00 AM',
    players: 120,
    teams: 8,
    joinCode: 'IPL25',
    status: 'upcoming',
  },
  {
    id: '2',
    name: 'Summer Bash 2024',
    logo: 'https://placehold.co/60x60',
    date: '2024-07-10',
    time: '02:00 PM',
    players: 100,
    teams: 6,
    joinCode: 'SB2024',
    status: 'live',
  },
  {
    id: '3',
    name: 'Winter Classic 2023',
    logo: 'https://placehold.co/60x60',
    date: '2023-12-01',
    time: '01:00 PM',
    players: 90,
    teams: 5,
    joinCode: 'WC23',
    status: 'completed',
  },
  // …more
]

const TABS = [
  { key: 'upcoming',   label: 'Upcoming'   },
  { key: 'live',       label: 'Live'       },
  { key: 'completed',  label: 'Completed'  },
]

const statusMap = {
  upcoming:  { color: 'bg-blue-100 text-blue-800'   },
  live:      { color: 'bg-green-100 text-green-800' },
  completed: { color: 'bg-gray-100 text-gray-800'   },
}

export default function AuctionsInfo() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [search, setSearch]     = useState('')

  // filter by tab + search
  const filtered = useMemo(() => {
    return auctions
      .filter(a => a.status === activeTab)
      .filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.id.includes(search)
      )
  }, [activeTab, search])

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Auctions</h1>
        <div className="flex space-x-2 w-full md:w-auto">
          <div className="relative flex-1">
            <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg"
            />
          </div>
          <a
            href="/create-auction "
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded shadow hover:bg-teal-700 whitespace-nowrap max-md:hidden"
          >
            <FiPlus className="mr-2 max-md:hidden" /> Create Auction
            
          </a>
          <a
            href="/create-auction"
            className="md:hidden inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded shadow hover:bg-teal-700 whitespace-nowrap"
          >
            <FiPlus className="mr-2" />
            
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3  rounded-xl border-gray-200 max-md:text-sm max-md:px-2 max-md:py-2 shadow-lg  border-[2px] whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 shadow'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(a => (
            <div
              key={a.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row"
            >
              <img
                src={a.logo}
                alt=""
                className="w-14 h-14 rounded mr-4 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{a.name}</h3>
                    <p className="text-xs text-gray-500">ID: {a.id}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${statusMap[a.status].color}`}
                  >
                    {statusMap[a.status].color && TABS.find(t => t.key === a.status).label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {a.date} · {a.time}
                </p>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <p><strong>Players:</strong> {a.players}</p>
                  <p><strong>Teams:</strong> {a.teams}</p>
                  <p>
                    <strong>Join Code:</strong>{' '}
                    <code className="bg-gray-100 px-1 rounded">{a.joinCode}</code>
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 space-x-2">
                <a
                  href={`/auctions/${a.id}`}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                >
                  <FiEye className="mr-1" /> View
                </a>
                <a
                  href={`/auctions/${a.id}/edit`}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  <FiEdit className="mr-1" /> Edit
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No {activeTab} auctions found.</p>
      )}
    </div>
  )
}
