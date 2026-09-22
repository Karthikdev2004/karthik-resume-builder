import React, { useState } from "react";
import { MessageSquare, Plus, Check, Trash2, User, Clock, CheckCircle2 } from "lucide-react";
import { LatexProject } from "@/lib/projectState";

interface CommentItem {
  id: string;
  author: string;
  text: string;
  lineNumber?: number;
  timestamp: number;
  resolved: boolean;
}

interface CommentsPanelProps {
  project: LatexProject;
  onNavigateLine?: (lineNumber: number) => void;
}

export function CommentsPanel({ project, onNavigateLine }: CommentsPanelProps) {
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: "comm-1",
      author: "Reviewer",
      text: "Highlight key impact metrics in the experience section.",
      lineNumber: 68,
      timestamp: Date.now() - 3600000,
      resolved: false,
    },
    {
      id: "comm-2",
      author: "ATS Coach",
      text: "Ensure all core skills from the job description are explicitly mentioned.",
      timestamp: Date.now() - 7200000,
      resolved: true,
    },
  ]);

  const [newCommentText, setNewCommentText] = useState("");
  const [newCommentLine, setNewCommentLine] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const parsedLine = newCommentLine.trim() ? parseInt(newCommentLine, 10) : undefined;
    const item: CommentItem = {
      id: `comm-${Date.now()}`,
      author: "You",
      text: newCommentText.trim(),
      lineNumber: isNaN(parsedLine as any) ? undefined : parsedLine,
      timestamp: Date.now(),
      resolved: false,
    };
    setComments((prev) => [item, ...prev]);
    setNewCommentText("");
    setNewCommentLine("");
    setIsAdding(false);
  };

  const handleToggleResolve = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c))
    );
  };

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const filteredComments = comments.filter((c) => {
    if (filter === "active") return !c.resolved;
    if (filter === "resolved") return c.resolved;
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-200 text-xs select-none bg-[#111827]">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#233045] flex items-center justify-between shrink-0 bg-[#121927]">
        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-200">
          <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
          <span>Comments & notes</span>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="text-[11px] bg-[#1a2638] hover:bg-emerald-600 hover:text-white px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="h-3 w-3" />
          <span>Add</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-1.5 border-b border-[#233045] flex items-center gap-2 bg-[#0e1420] text-[11px]">
        {(["all", "active", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`capitalize px-2 py-0.5 rounded transition-colors cursor-pointer ${
              filter === f
                ? "bg-[#1f2b3e] text-emerald-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Inline Adder */}
      {isAdding && (
        <div className="p-3 border-b border-[#233045] bg-[#141e2e] space-y-2">
          <textarea
            rows={2}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Write a comment or review note..."
            autoFocus
            className="w-full bg-[#0d131f] border border-[#263750] rounded p-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
          <div className="flex items-center justify-between">
            <input
              type="number"
              placeholder="Line # (optional)"
              value={newCommentLine}
              onChange={(e) => setNewCommentLine(e.target.value)}
              className="w-28 bg-[#0d131f] border border-[#263750] rounded px-2 py-1 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
            />
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 bg-[#1c2738] text-slate-300 hover:text-white rounded text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs cursor-pointer"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredComments.length === 0 ? (
          <div className="p-4 text-center text-slate-400">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-40 text-slate-400" />
            <p>No {filter !== "all" ? filter : ""} comments found.</p>
          </div>
        ) : (
          filteredComments.map((c) => (
            <div
              key={c.id}
              className={`p-2.5 rounded-lg border transition-colors ${
                c.resolved
                  ? "bg-[#131924]/60 border-[#1e2838] opacity-60"
                  : "bg-[#141e2e] border-[#25354c]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-200">
                  <User className="h-3 w-3 text-emerald-400" />
                  <span>{c.author}</span>
                  {c.lineNumber && (
                    <button
                      onClick={() => onNavigateLine?.(c.lineNumber!)}
                      className="text-[10px] bg-[#1c283c] hover:bg-emerald-600 hover:text-white text-emerald-300 px-1.5 py-0.2 rounded font-mono transition-colors"
                      title="Jump to code line"
                    >
                      Line {c.lineNumber}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleResolve(c.id)}
                    title={c.resolved ? "Mark Unresolved" : "Mark Resolved"}
                    className={`p-1 rounded cursor-pointer ${
                      c.resolved
                        ? "text-emerald-400 hover:bg-[#1a2638]"
                        : "text-slate-400 hover:text-emerald-400 hover:bg-[#1a2638]"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    title="Delete Comment"
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-[#1a2638] rounded cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">{c.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
