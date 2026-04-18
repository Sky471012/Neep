import { useState } from "react";

export default function BranchSelectModal({ branches = [], onSelect, onClose }) {
  const [switching, setSwitching] = useState(null); // key of branch being switched to

  const branchOptions = [
    { key: "realDataBase", name: "Kailash Puri", icon: <i className="bi bi-buildings-fill"></i>, className: 'all-batches' },
    { key: "realDataBaseOne", name: "Janakpuri", icon: <i className="bi bi-buildings-fill"></i>, className: 'all-students' },
    { key: "realDataBaseTwo", name: "Sadh Nagar", icon: <i className="bi bi-buildings-fill"></i>, className: 'all-teachers' },
    { key: "userDataBase", name: "Test Pradesh", icon: <i className="bi bi-buildings-fill"></i>, className: 'fee-tracking' },
  ];
  const existingBranchRaw = localStorage.getItem("branch");

  const { currentBranchName, currentBranchKey } = (() => {
    if (!existingBranchRaw) return { currentBranchName: null, currentBranchKey: null };
    const match = branchOptions.find(
      (opt) => opt.key === existingBranchRaw || opt.name === existingBranchRaw
    );
    if (match) return { currentBranchName: match.name, currentBranchKey: match.key };
    return { currentBranchName: existingBranchRaw, currentBranchKey: existingBranchRaw };
  })();

  const normalized = Array.isArray(branches)
    ? branches.map((b) => (typeof b === "string" ? b : b?.key || b?.name)).filter(Boolean)
    : [];

  const displayOptions = normalized.length
    ? branchOptions.filter((opt) => normalized.includes(opt.key) || normalized.includes(opt.name))
    : branchOptions;

  const finalOptions = displayOptions.length === 0 && normalized.length ? branchOptions : displayOptions;

  const handleSelect = (b) => {
    if (switching || b.key === currentBranchKey) return;
    setSwitching(b.key);
    onSelect && onSelect(b.key);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="adding-student-box">
          <h3 className="mb-3">Select Center</h3>
          <h5>
            {switching
              ? <>Switching to: <span className="text-success">{finalOptions.find((b) => b.key === switching)?.name}</span></>
              : <>Current Center: <span className="text-success">{currentBranchName}</span></>
            }
          </h5>
          <ul
            className="branch-list mt-4 d-flex flex-row justify-content-space-around flex-wrap"
            style={{ justifyContent: "space-around" }}
          >
            {finalOptions.map((b) => {
              const isCurrent = currentBranchKey && b.key === currentBranchKey;
              const isSwitching = switching === b.key;
              const isDisabled = isCurrent || !!switching;
              return (
                <li key={b.key}>
                  <button
                    className={`dashboard-card ${b.className} ${isCurrent ? 'current-branch' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => handleSelect(b)}
                    type="button"
                    disabled={isDisabled}
                    style={{ opacity: isDisabled ? 0.45 : 1 }}
                  >
                    <div className="card-icon">{b.icon}</div>
                    <h3>{b.name}</h3>
                  </button>
                </li>
              );
            })}
          </ul>

          {!switching && (
            <button className="close-btn" onClick={onClose} type="button">
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
