import React, { useState } from "react";
import { History, Plus, RotateCcw, Clock, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import {
  LatexProject,
  ProjectSnapshot,
  createProjectSnapshot,
  restoreProjectSnapshot,
} from "@/lib/projectState";

interface HistoryPanelProps {
  project: LatexProject;
  onUpdateProject: (updater: (prev: LatexProject) => LatexProject) => void;
}

export function HistoryPanel({ project, onUpdateProject }: HistoryPanelProps) {
  const [snapshotDesc, setSnapshotDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [snapshotToRestore, setSnapshotToRestore] = useState<ProjectSnapshot | null>(null);
  const [restoredNotice, setRestoredNotice] = useState(false);

  const handleCreateSnapshot = () => {
    const desc = snapshotDesc.trim() || `Manual checkpoint (${new Date().toLocaleTimeString()})`;
    onUpdateProject((prev) => createProjectSnapshot(prev, desc));
    setSnapshotDesc("");
    setIsCreating(false);
  };

  const handleConfirmRestore = () => {
    if (snapshotToRestore) {
      onUpdateProject((prev) => restoreProjectSnapshot(prev, snapshotToRestore.id));
      setSnapshotToRestore(null);
      setRestoredNotice(true);
      setTimeout(() => setRestoredNotice(false), 3000);
    }
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-200 text-xs select-none">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#233045] flex items-center justify-between shrink-0 bg-[#111827]">
        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-300">
          <History className="h-3.5 w-3.5 text-emerald-400" />
          <span>Version history</span>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="text-[11px] bg-[#1a2638] hover:bg-emerald-600 hover:text-white px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-colors"
        >
          <Plus className="h-3 w-3" />
          <span>Checkpoint</span>
        </button>
      </div>

      {/* Inline checkpoint creator */}
      {isCreating && (
        <div className="p-3 border-b border-[#233045] bg-[#151f2e] space-y-2">
          <label className="block text-[11px] text-slate-400">Snapshot Description:</label>
          <input
            type="text"
            value={snapshotDesc}
            onChange={(e) => setSnapshotDesc(e.target.value)}
            placeholder="e.g. Added experience section"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateSnapshot();
              if (e.key === "Escape") setIsCreating(false);
            }}
            className="w-full bg-[#0e1420] border border-[#24344c] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setIsCreating(false)}
              className="px-2 py-0.5 rounded text-slate-400 hover:text-white text-[11px]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSnapshot}
              className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[11px]"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Restored confirmation toast */}
      {restoredNotice && (
        <div className="mx-3 mt-2 p-2 bg-emerald-950/70 border border-emerald-500/50 rounded text-emerald-300 flex items-center gap-1.5 text-[11px]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Project restored successfully!</span>
        </div>
      )}

      {/* Snapshots list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {project.history.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs">
            No history snapshots recorded yet.
          </div>
        ) : (
          project.history.map((snapshot) => (
            <div
              key={snapshot.id}
              className="p-2.5 rounded bg-[#131b28] hover:bg-[#182335] border border-[#202d42] transition-colors space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-200 text-xs truncate">
                    {snapshot.description}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>{formatTime(snapshot.timestamp)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSnapshotToRestore(snapshot)}
                  title="Restore this snapshot"
                  className="px-2 py-1 bg-[#1d2a3d] hover:bg-emerald-600 hover:text-white text-slate-300 rounded text-[10px] font-medium flex items-center gap-1 transition-colors shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restore</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-500 font-mono">
                {snapshot.files.length} {snapshot.files.length === 1 ? "file" : "files"} saved
              </div>
            </div>
          ))
        )}
      </div>

      {/* Restore confirmation modal */}
      {snapshotToRestore && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#182335] border border-[#273852] rounded-lg max-w-sm w-full p-4 shadow-2xl text-slate-200 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
              <AlertCircle className="h-4 w-4" />
              <span>Restore Checkpoint</span>
            </div>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Are you sure you want to restore <strong className="text-white font-mono">"{snapshotToRestore.description}"</strong> from{" "}
              {formatTime(snapshotToRestore.timestamp)}? Current unsaved changes will be replaced.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSnapshotToRestore(null)}
                className="px-3 py-1.5 bg-[#202d44] hover:bg-[#2a3a56] text-slate-300 rounded font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition-colors"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
