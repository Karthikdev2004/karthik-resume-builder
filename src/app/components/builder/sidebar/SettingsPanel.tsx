import React from "react";
import { Settings, Check, Sliders, FileCode } from "lucide-react";
import { LatexProject, EditorSettings } from "@/lib/projectState";

interface SettingsPanelProps {
  project: LatexProject;
  onUpdateSettings: (settings: EditorSettings) => void;
  onSelectMainFile: (fileId: string) => void;
}

export function SettingsPanel({
  project,
  onUpdateSettings,
  onSelectMainFile,
}: SettingsPanelProps) {
  const settings = project.settings;

  const update = (partial: Partial<EditorSettings>) => {
    onUpdateSettings({ ...settings, ...partial });
  };

  const texFiles = project.files.filter((f) => f.type === "file" && f.name.endsWith(".tex"));

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-200 text-xs select-none">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#233045] flex items-center justify-between shrink-0 bg-[#111827]">
        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-300">
          <Settings className="h-3.5 w-3.5 text-emerald-400" />
          <span>Editor & project settings</span>
        </div>
      </div>

      {/* Settings Options Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Main Root File Selection */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-medium">Main document file (Root)</label>
          <p className="text-[11px] text-slate-500">The file containing \documentclass compiled first.</p>
          <select
            value={project.mainFileId}
            onChange={(e) => onSelectMainFile(e.target.value)}
            className="w-full bg-[#111724] border border-[#263750] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          >
            {texFiles.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} {f.id === project.mainFileId ? "(Root)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Compiler Engine */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-medium">LaTeX compiler engine</label>
          <select
            value={settings.compiler}
            onChange={(e) => update({ compiler: e.target.value as any })}
            className="w-full bg-[#111724] border border-[#263750] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="pdflatex">pdfLaTeX (Recommended / Fast)</option>
            <option value="xelatex">XeLaTeX (Advanced Unicode)</option>
            <option value="lualatex">LuaLaTeX</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-medium">Editor font size</label>
          <div className="grid grid-cols-4 gap-1.5">
            {[11, 12, 13, 14].map((size) => (
              <button
                key={size}
                onClick={() => update({ fontSize: size })}
                className={`py-1 rounded text-xs font-mono font-medium transition-colors ${
                  settings.fontSize === size
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-[#141b27] text-slate-300 hover:bg-[#1d2738]"
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>

        {/* Tab Size */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-medium">Tab indentation</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[2, 4].map((tab) => (
              <button
                key={tab}
                onClick={() => update({ tabSize: tab })}
                className={`py-1 rounded text-xs font-mono font-medium transition-colors ${
                  settings.tabSize === tab
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-[#141b27] text-slate-300 hover:bg-[#1d2738]"
                }`}
              >
                {tab} Spaces
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2 border-t border-[#233045]">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-slate-300 group-hover:text-white">Show line numbers</span>
            <input
              type="checkbox"
              checked={settings.lineNumbers}
              onChange={(e) => update({ lineNumbers: e.target.checked })}
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-slate-300 group-hover:text-white">Word wrap</span>
            <input
              type="checkbox"
              checked={settings.wordWrap}
              onChange={(e) => update({ wordWrap: e.target.checked })}
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-slate-300 group-hover:text-white">Auto-save changes</span>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => update({ autoSave: e.target.checked })}
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-slate-300 group-hover:text-white">Recompile on save (Ctrl+S)</span>
            <input
              type="checkbox"
              checked={settings.compileOnSave}
              onChange={(e) => update({ compileOnSave: e.target.checked })}
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
