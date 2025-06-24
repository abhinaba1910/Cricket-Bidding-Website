import React, { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
export default function AuctionStep3Players({
  onSubmit,
  onBack,
  selectedTeamIds,
  allPlayers,
}) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();

  const selectedPlayerValues = watch("selectedPlayers") || [];

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("all");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const skillFilterCategories = [
    "all",
    "Batsman (Right-handed)",
    "Batsman (Left-handed)",
    "Bowler (Pacer - Right Arm Fast)",
    "Bowler (Pacer - Left Arm Fast)",
    "Bowler (Pacer - Right Arm Medium)",
    "Bowler (Pacer - Left Arm Medium)",
    "Bowler (Spinner - Right Arm Off-Spin)",
    "Bowler (Spinner - Left Arm Off-Spin)",
    "Bowler (Spinner - Right Arm Leg-Spin)",
    "Bowler (Spinner - Left Arm Leg-Spin/Chinaman)",
    "All-rounder",
    "Wicket-keeper",
  ];

  // const filteredByTeam = selectedTeamIds.length
  //   ? allPlayers.filter(p => selectedTeamIds.includes(p.teamId))
  //   : allPlayers;

  const areAllDisplayedSelected = (field) =>
  displayedOptions.every((opt) => field.value.includes(opt.value));

const handleSelectAll = (field) => {
  const allIds = displayedOptions.map((opt) => opt.value);
  const currentlySelected = field.value;

  const newSelected = areAllDisplayedSelected(field)
    ? currentlySelected.filter((id) => !allIds.includes(id)) // Deselect all visible
    : Array.from(new Set([...currentlySelected, ...allIds])); // Select all visible

  field.onChange(newSelected);
};


  const filteredPlayers = allPlayers.filter((p) => {
    const gradeOK = selectedGrade === "all" || p.grade === selectedGrade;
    const skillOK =
      selectedSkill === "all" || (p.skills && p.skills.includes(selectedSkill));
    return gradeOK && skillOK;
  });

  const playerOptions = filteredPlayers.map((player) => ({
    value: player._id,
    label: player.name,
    playerPic: player.playerPic,
  }));

  console.log(playerOptions);
  const displayedOptions = playerOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePlayer = (field, playerId) => {
    const updated = field.value.includes(playerId)
      ? field.value.filter((id) => id !== playerId)
      : [...field.value, playerId];
    field.onChange(updated);
  };

  const styles = {
    container: {
      maxWidth: 600,
      margin: "auto",
      padding: 16,
      fontFamily: "sans-serif",
    },
    flexRow: { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 },
    flexCol: {
      flex: 1,
      minWidth: 150,
      display: "flex",
      flexDirection: "column",
    },
    label: { marginBottom: 6, fontWeight: "bold" },
    select: {
      padding: 8,
      fontSize: 16,
      borderRadius: 4,
      border: "1px solid #ccc",
    },
    input: {
      padding: 8,
      marginBottom: 12,
      fontSize: 16,
      borderRadius: 4,
      border: "1px solid #ccc",
    },
    playerList: {
      maxHeight: 300,
      overflowY: "auto",
      border: "1px solid #ccc",
      borderRadius: 4,
      padding: 8,
    },
    playerItem: { display: "flex", alignItems: "center", gap: 10, padding: 6 },
    playerImage: {
      width: 28,
      height: 28,
      borderRadius: "50%",
      objectFit: "cover",
    },
    checkbox: { width: 18, height: 18 },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#e0f7fa",
      color: "#00796b",
      padding: "2px 8px",
      borderRadius: 12,
      fontSize: 14,
    },
    button: {
      padding: "10px 20px",
      fontSize: 16,
      borderRadius: 4,
      border: "1px solid teal",
      backgroundColor: "white",
      color: "teal",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    errorText: { color: "red", marginTop: 6 },
    drawerOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.3)",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      zIndex: 1000,
    },
    drawerContent: {
      backgroundColor: "white",
      width: "100%",
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      padding: 16,
      maxHeight: "70vh",
      overflowY: "auto",
    },
    footerButtons: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 24,
      flexWrap: "wrap",
      gap: 16,
    },
  };

  const renderDrawer = (field) => {
    if (!drawerOpen) return null;
    return (
      <div style={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
        <div style={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
  <h2>Select Players</h2>
  <button
    type="button"
    onClick={() => handleSelectAll(field)}
    style={{
      fontSize: 14,
      padding: "4px 10px",
      borderRadius: 6,
      backgroundColor: "#f0f0f0",
      border: "1px solid #ccc",
      cursor: "pointer",
    }}
  >
    {areAllDisplayedSelected(field) ? "Deselect All" : "Select All"}
  </button>
</div>

          <input
            type="text"
            placeholder="Search players..."
            style={styles.input}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {displayedOptions.map((opt) => (
            <label key={opt.value} style={styles.playerItem}>
              <input
                type="checkbox"
                checked={field.value.includes(opt.value)}
                onChange={() => togglePlayer(field, opt.value)}
                style={styles.checkbox}
              />
              {opt.playerPic ? (
                <img
                  src={opt.playerPic}
                  alt={opt.label}
                  style={styles.playerImage}
                />
              ) : (
                <div
                  style={{ ...styles.playerImage, backgroundColor: "#ccc" }}
                />
              )}
              <span>{opt.label}</span>
            </label>
          ))}
          <button
            onClick={() => setDrawerOpen(false)}
            style={{ ...styles.button, marginTop: 16, width: "100%" }}
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.flexRow}>
        <div style={styles.flexCol}>
          <label htmlFor="gradeSelect" style={styles.label}>
            Filter by Grade
          </label>
          <select
            id="gradeSelect"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Grades</option>
            <option value="A+">Grade A+</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
          </select>
        </div>
        <div style={styles.flexCol}>
          <label htmlFor="skillSelect" style={styles.label}>
            Filter by Skill
          </label>
          <select
            id="skillSelect"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            style={styles.select}
          >
            {skillFilterCategories.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Controller
        name="selectedPlayers"
        control={control}
        defaultValue={[]}
        rules={{ required: "Please select at least one player" }}
        render={({ field }) => (
          <>
            {isMobile ? (
              <>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  style={{
                    ...styles.button,
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {field.value.length > 0 ? (
                      playerOptions
                        .filter((opt) => field.value.includes(opt.value))
                        .map((opt) => (
                          <span key={opt.value} style={styles.badge}>
                            {opt.playerPic ? (
                              <img
                                src={opt.playerPic}
                                alt={opt.label}
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 18,
                                  height: 18,
                                  backgroundColor: "#ccc",
                                  borderRadius: "50%",
                                }}
                              />
                            )}
                            {opt.label}
                          </span>
                        ))
                    ) : (
                      <span style={{ color: "#999" }}>
                        Click to select players...
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 18, marginLeft: 8 }}>▼</span>
                </button>
                {renderDrawer(field)}
              </>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
  <button
    type="button"
    onClick={() => handleSelectAll(field)}
    style={{
      fontSize: 14,
      padding: "6px 12px",
      borderRadius: 6,
      backgroundColor: "#f0f0f0",
      border: "1px solid #ccc",
      cursor: "pointer",
    }}
  >
    {areAllDisplayedSelected(field) ? "Deselect All" : "Select All"}
  </button>
</div>

              <div style={styles.playerList}>
                {playerOptions.length === 0 ? (
                  <div>No players available.</div>
                ) : (
                  playerOptions.map((opt) => (
                    <label key={opt.value} style={styles.playerItem}>
                      <input
                        type="checkbox"
                        checked={field.value.includes(opt.value)}
                        onChange={() => togglePlayer(field, opt.value)}
                        style={styles.checkbox}
                      />
                      {opt.playerPic ? (
                        <img
                          src={opt.playerPic}
                          alt={opt.label}
                          style={styles.playerImage}
                        />
                      ) : (
                        <div
                          style={{
                            ...styles.playerImage,
                            backgroundColor: "#ccc",
                          }}
                        />
                      )}
                      <span>{opt.label}</span>
                    </label>
                  ))
                )}
              </div>
              </div>
            )}
            {errors.selectedPlayers && (
              <div style={styles.errorText}>
                {errors.selectedPlayers.message}
              </div>
            )}
          </>
        )}
      />

      <div style={styles.footerButtons}>
        <button type="button" onClick={onBack} style={styles.button}>
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          style={{
            ...styles.button,
            backgroundColor: "teal",
            color: "white",
            border: "none",
          }}
        >
          ✓ Create Auction
        </button>
      </div>
    </div>
  );
}
