import React, { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

export default function AuctionStep2Teams({ onNext, onBack, allTeams }) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();

  const selectedTeamValues = watch('selectedTeams') || [];
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const teamOptions = allTeams.map(team => ({
    value: team.id,
    label: team.name,
    icon: team.logoUrl ? (
      <img
        src={team.logoUrl}
        alt={team.name}
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          marginRight: 6,
          objectFit: 'cover',
        }}
      />
    ) : (
      <span
        style={{
          display: 'inline-block',
          width: 20,
          height: 20,
          marginRight: 6,
          backgroundColor: '#ccc',
          borderRadius: 4,
          textAlign: 'center',
          lineHeight: '20px',
          fontSize: 14,
        }}
      >
        👥
      </span>
    ),
  }));

  const filteredOptions = teamOptions.filter(opt =>
    opt.label?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  // Simple mobile detection (not perfect, for demo)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Loading skeleton for mobile if selectedTeamValues undefined
  if (isMobile && selectedTeamValues === undefined) {
    return (
      <div style={{ padding: 10 }}>
        <div style={{ backgroundColor: '#eee', height: 20, width: '40%', marginBottom: 12, borderRadius: 4 }} />
        <div style={{ backgroundColor: '#eee', height: 16, width: '60%', marginBottom: 12, borderRadius: 4 }} />
        <div style={{ backgroundColor: '#eee', height: 48, marginBottom: 12, borderRadius: 4 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ backgroundColor: '#eee', height: 40, width: 100, borderRadius: 4 }} />
          <div style={{ backgroundColor: '#eee', height: 40, width: 120, borderRadius: 4 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 12, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <label
          htmlFor="team-select"
          style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 16 }}
        >
          Select Teams for Auction
        </label>
        <div style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>
          Choose the teams that will be part of this auction.
        </div>

        <Controller
          name="selectedTeams"
          control={control}
          render={({ field }) => (
            <>
              {isMobile ? (
                <>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 4,
                      border: '1px solid #ccc',
                      background: '#fff',
                      textAlign: 'left',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      alignItems: 'center',
                      cursor: 'pointer',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
                      {selectedTeamValues.length > 0 ? (
                        teamOptions
                          .filter(opt => selectedTeamValues.includes(opt.value))
                          .map(opt => (
                            <span
                              key={opt.value}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#38a169',
                                color: 'white',
                                borderRadius: 12,
                                padding: '4px 10px',
                                fontSize: 12,
                              }}
                            >
                              {opt.icon}
                              {opt.label}
                            </span>
                          ))
                      ) : (
                        <span style={{ color: '#999' }}>Click to select teams...</span>
                      )}
                    </div>
                    <span style={{ marginLeft: 12, fontSize: 18 }}>▼</span>
                  </button>

                  {/* Mobile Modal */}
                  {isMobileMenuOpen && (
                    <div
                      style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        top: '30%',
                        backgroundColor: 'white',
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        boxShadow: '0 -4px 8px rgba(0,0,0,0.2)',
                        padding: 16,
                        zIndex: 1000,
                        overflowY: 'auto',
                      }}
                    >
                      <div style={{ marginBottom: 12 }}>
                        <input
                          type="text"
                          placeholder="Search for teams..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: 8,
                            borderRadius: 4,
                            border: '1px solid #ccc',
                            fontSize: 14,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          maxHeight: '50vh',
                          overflowY: 'auto',
                          borderTop: '1px solid #eee',
                          paddingTop: 8,
                        }}
                      >
                        {filteredOptions.length ? (
                          filteredOptions.map(opt => {
                            const checked = selectedTeamValues.includes(opt.value);
                            return (
                              <label
                                key={opt.value}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '6px 0',
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    const next = checked
                                      ? selectedTeamValues.filter(v => v !== opt.value)
                                      : [...selectedTeamValues, opt.value];
                                    field.onChange(next);
                                  }}
                                  style={{ marginRight: 8 }}
                                />
                                {opt.icon}
                                <span>{opt.label}</span>
                              </label>
                            );
                          })
                        ) : (
                          <div style={{ color: '#999', padding: 8 }}>No teams found.</div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          marginTop: 12,
                          width: '100%',
                          padding: 10,
                          borderRadius: 4,
                          border: 'none',
                          backgroundColor: '#38a169',
                          color: 'white',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: 16,
                        }}
                      >
                        Done
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    maxHeight: 300,
                    overflowY: 'auto',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    padding: 8,
                  }}
                >
                  {teamOptions.map(opt => {
                    const checked = selectedTeamValues.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '6px 0',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? selectedTeamValues.filter(v => v !== opt.value)
                              : [...selectedTeamValues, opt.value];
                            field.onChange(next);
                          }}
                          style={{ marginRight: 8 }}
                        />
                        {opt.icon}
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </>
          )}
        />
        {errors.selectedTeams && (
          <div style={{ marginTop: 4, color: 'red', fontSize: 12 }}>
            {errors.selectedTeams.message}
          </div>
        )}
      </div>

      {/* <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            padding: '10px 20px',
            borderRadius: 4,
            border: '1px solid #ccc',
            background: 'white',
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={onNext}
          style={{
            padding: '10px 20px',
            borderRadius: 4,
            border: 'none',
            backgroundColor: '#38a169',
            color: 'white',
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Save and Next →
        </button>
      </div> */}
    </div>
  );
}
