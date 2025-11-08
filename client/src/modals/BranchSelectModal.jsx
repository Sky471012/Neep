export default function BranchSelectModal({ branches = [], onSelect, onClose }) {
  
  const branchOptions = [
    { key: "realDataBase", name: "Kailash Puri", icon: <i className="bi bi-buildings-fill"></i>, className: 'all-batches' },
    { key: "realDataBaseOne", name: "Janakpuri", icon: <i className="bi bi-buildings-fill"></i>, className: 'all-students' },
    { key: "realDataBaseTwo", name: "Sadh Nagar", icon: <i className="bi bi-buildings-fill"></i>, className: 'all-teachers' },
    { key: "userDataBase", name: "Test Pradesh", icon: <i className="bi bi-buildings-fill"></i>, className: 'fee-tracking' },
  ];
  const existingBranchRaw = localStorage.getItem("branch");

  // Determine both the display name and the canonical key for the current branch
  const { currentBranchName, currentBranchKey } = (() => {
    if (!existingBranchRaw) return { currentBranchName: null, currentBranchKey: null };
    const match = branchOptions.find(
      (opt) => opt.key === existingBranchRaw || opt.name === existingBranchRaw
    );
    if (match) return { currentBranchName: match.name, currentBranchKey: match.key };
    // If stored value doesn't match any option's key or name, treat the raw value as name
    return { currentBranchName: existingBranchRaw, currentBranchKey: existingBranchRaw };
  })();

  // Normalize incoming branches prop (can be array of objects or strings) and filter
  const normalized = Array.isArray(branches)
    ? branches
        .map((b) => (typeof b === "string" ? b : b?.key || b?.name))
        .filter(Boolean)
    : [];

  const displayOptions = normalized.length
    ? branchOptions.filter(
        (opt) => normalized.includes(opt.key) || normalized.includes(opt.name)
      )
    : branchOptions;

  // Fallback: if filtering produced no matches but normalized had values, still show all
  const finalOptions = displayOptions.length === 0 && normalized.length ? branchOptions : displayOptions;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="adding-student-box">
          <h3  className="mb-3">Select Center</h3>
          <h5>Current Center: <span className="text-success">{currentBranchName}</span></h5>
          <ul
            className="branch-list mt-4 d-flex flex-row justify-content-space-around flex-wrap"
            style={{ justifyContent: "space-around" }}
          >
            {finalOptions.map((b) => {
              const isCurrent = currentBranchKey && b.key === currentBranchKey;
              return (
                <li key={b.key}>
                  <button
                    className={`dashboard-card ${b.className} ${isCurrent ? 'current-branch disabled' : ''}`}
                    onClick={() => !isCurrent && onSelect && onSelect(b.key)}
                    type="button"
                    disabled={isCurrent}
                    aria-current={isCurrent ? 'true' : undefined}
                    aria-disabled={isCurrent ? 'true' : undefined}
                    title={isCurrent ? 'Already selected' : undefined}
                  >
                    <div className="card-icon">{b.icon}</div>
                    <h3>{b.name}</h3>
                  </button>
                </li>
              );
            })}
          </ul>

          <button className="close-btn" onClick={onClose} type="button">
            ×
          </button>
        </div>
      </div>
    </div>
  );
}