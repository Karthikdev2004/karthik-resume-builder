/**
 * Overleaf-Style Project State Management
 * Single source of truth for all project files, folders, settings, and snapshots.
 */

export type ProjectFileType = "file" | "folder";

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: ProjectFileType;
  content?: string;
  parentId?: string | null;
  isMain?: boolean;
  updatedAt?: number;
}

export interface ProjectSnapshot {
  id: string;
  timestamp: number;
  description: string;
  mainFileId: string;
  files: ProjectFile[];
}

export interface EditorSettings {
  fontSize: number; // e.g. 12, 13, 14
  tabSize: number; // 2, 4
  wordWrap: boolean;
  lineNumbers: boolean;
  theme: "dark" | "light";
  autoSave: boolean;
  compileOnSave: boolean;
  compiler: "pdflatex" | "xelatex" | "lualatex";
}

export interface LatexProject {
  id: string;
  name: string;
  mainFileId: string;
  activeFileId: string;
  openFileIds: string[];
  files: ProjectFile[];
  history: ProjectSnapshot[];
  settings: EditorSettings;
}

export const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 12,
  tabSize: 2,
  wordWrap: false,
  lineNumbers: true,
  theme: "dark",
  autoSave: true,
  compileOnSave: false,
  compiler: "pdflatex",
};

/**
 * Creates a unique random ID
 */
export function generateId(): string {
  return "id_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
}

/**
 * Computes the full path of a file given its parentId
 */
export function computePath(name: string, parentId: string | null | undefined, files: ProjectFile[]): string {
  if (!parentId) return name;
  const parent = files.find((f) => f.id === parentId);
  if (!parent) return name;
  return `${parent.path}/${name}`;
}

/**
 * Initializes a new project with a default main.tex
 */
export function createInitialProject(projectName: string, initialCode?: string): LatexProject {
  const mainId = generateId();
  const mainFile: ProjectFile = {
    id: mainId,
    name: "main.tex",
    path: "main.tex",
    type: "file",
    content: initialCode || `\\documentclass[a4paper,10pt]{article}\n\\begin{document}\nHello World\n\\end{document}\n`,
    parentId: null,
    isMain: true,
    updatedAt: Date.now(),
  };

  return {
    id: "proj_" + Math.random().toString(36).substring(2, 9),
    name: projectName || "Resume Project",
    mainFileId: mainId,
    activeFileId: mainId,
    openFileIds: [mainId],
    files: [mainFile],
    history: [
      {
        id: generateId(),
        timestamp: Date.now(),
        description: "Initial project creation",
        mainFileId: mainId,
        files: [mainFile],
      },
    ],
    settings: { ...DEFAULT_SETTINGS },
  };
}

/**
 * Persistence: Load project from localStorage or create default
 */
export function loadProject(storageKey: string, projectName: string, defaultCode?: string): LatexProject {
  try {
    const raw = localStorage.getItem(`latex_project_${storageKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.files) && parsed.files.length > 0) {
        // Ensure main file exists
        let mainFile = parsed.files.find((f: ProjectFile) => f.id === parsed.mainFileId && f.type === "file");
        if (!mainFile) {
          mainFile = parsed.files.find((f: ProjectFile) => f.name.endsWith(".tex") && f.type === "file") || parsed.files[0];
          parsed.mainFileId = mainFile.id;
        }
        if (!parsed.activeFileId) {
          parsed.activeFileId = parsed.mainFileId;
        }
        if (!Array.isArray(parsed.openFileIds) || parsed.openFileIds.length === 0) {
          parsed.openFileIds = [parsed.activeFileId];
        }
        if (!parsed.settings) {
          parsed.settings = { ...DEFAULT_SETTINGS };
        }
        if (!Array.isArray(parsed.history)) {
          parsed.history = [];
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error loading project from storage:", err);
  }
  return createInitialProject(projectName, defaultCode);
}

/**
 * Persistence: Save project to localStorage
 */
export function saveProject(storageKey: string, project: LatexProject): void {
  try {
    localStorage.setItem(`latex_project_${storageKey}`, JSON.stringify(project));
  } catch (err) {
    console.warn("Failed to persist project to localStorage:", err);
  }
}

/**
 * File tree CRUD helpers
 */
export function createFileInProject(
  project: LatexProject,
  name: string,
  parentId: string | null = null,
  content: string = ""
): LatexProject {
  const cleanName = name.trim();
  if (!cleanName) return project;

  const id = generateId();
  const path = computePath(cleanName, parentId, project.files);
  const newFile: ProjectFile = {
    id,
    name: cleanName,
    path,
    type: "file",
    content,
    parentId,
    isMain: false,
    updatedAt: Date.now(),
  };

  const newFiles = [...project.files, newFile];
  const newOpen = project.openFileIds.includes(id) ? project.openFileIds : [...project.openFileIds, id];

  return {
    ...project,
    files: newFiles,
    activeFileId: id,
    openFileIds: newOpen,
  };
}

export function createFolderInProject(
  project: LatexProject,
  name: string,
  parentId: string | null = null
): LatexProject {
  const cleanName = name.trim();
  if (!cleanName) return project;

  const id = generateId();
  const path = computePath(cleanName, parentId, project.files);
  const newFolder: ProjectFile = {
    id,
    name: cleanName,
    path,
    type: "folder",
    parentId,
    updatedAt: Date.now(),
  };

  return {
    ...project,
    files: [...project.files, newFolder],
  };
}

export function renameFileInProject(
  project: LatexProject,
  fileId: string,
  newName: string
): LatexProject {
  const cleanName = newName.trim();
  if (!cleanName) return project;

  const newFiles = project.files.map((f) => {
    if (f.id === fileId) {
      const newPath = computePath(cleanName, f.parentId, project.files);
      return { ...f, name: cleanName, path: newPath, updatedAt: Date.now() };
    }
    return f;
  });

  return {
    ...project,
    files: newFiles,
  };
}

export function deleteFileInProject(
  project: LatexProject,
  fileId: string
): LatexProject {
  // Disallow deleting the main file if it is the only tex file
  const file = project.files.find((f) => f.id === fileId);
  if (!file) return project;

  // Find all child ids if folder
  const idsToDelete = new Set<string>([fileId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of project.files) {
      if (f.parentId && idsToDelete.has(f.parentId) && !idsToDelete.has(f.id)) {
        idsToDelete.add(f.id);
        changed = true;
      }
    }
  }

  const remainingFiles = project.files.filter((f) => !idsToDelete.has(f.id));
  if (remainingFiles.length === 0) return project; // Do not empty project

  // Adjust main file if deleted
  let newMainId = project.mainFileId;
  if (idsToDelete.has(project.mainFileId)) {
    const nextTex = remainingFiles.find((f) => f.name.endsWith(".tex") && f.type === "file");
    newMainId = nextTex ? nextTex.id : remainingFiles[0].id;
  }

  // Adjust active file
  let newActiveId = project.activeFileId;
  if (idsToDelete.has(project.activeFileId)) {
    newActiveId = newMainId;
  }

  const newOpen = project.openFileIds.filter((id) => !idsToDelete.has(id));
  if (newOpen.length === 0) {
    newOpen.push(newActiveId);
  }

  return {
    ...project,
    mainFileId: newMainId,
    activeFileId: newActiveId,
    openFileIds: newOpen,
    files: remainingFiles,
  };
}

export function duplicateFileInProject(
  project: LatexProject,
  fileId: string
): LatexProject {
  const file = project.files.find((f) => f.id === fileId);
  if (!file || file.type === "folder") return project;

  const extMatch = file.name.match(/(\.[^.]+)$/);
  const ext = extMatch ? extMatch[1] : "";
  const baseName = ext ? file.name.slice(0, -ext.length) : file.name;
  const newName = `${baseName}_copy${ext}`;

  const newId = generateId();
  const newPath = computePath(newName, file.parentId, project.files);

  const duplicate: ProjectFile = {
    id: newId,
    name: newName,
    path: newPath,
    type: "file",
    content: file.content || "",
    parentId: file.parentId,
    isMain: false,
    updatedAt: Date.now(),
  };

  return {
    ...project,
    files: [...project.files, duplicate],
    activeFileId: newId,
    openFileIds: [...project.openFileIds, newId],
  };
}

export function setMainFileInProject(
  project: LatexProject,
  fileId: string
): LatexProject {
  const file = project.files.find((f) => f.id === fileId);
  if (!file || file.type === "folder") return project;

  const newFiles = project.files.map((f) => ({
    ...f,
    isMain: f.id === fileId,
  }));

  return {
    ...project,
    mainFileId: fileId,
    files: newFiles,
  };
}

export function updateFileContentInProject(
  project: LatexProject,
  fileId: string,
  content: string
): LatexProject {
  const newFiles = project.files.map((f) => {
    if (f.id === fileId) {
      return { ...f, content, updatedAt: Date.now() };
    }
    return f;
  });

  return {
    ...project,
    files: newFiles,
  };
}

export function createProjectSnapshot(
  project: LatexProject,
  description: string = "Snapshot"
): LatexProject {
  const snapshot: ProjectSnapshot = {
    id: generateId(),
    timestamp: Date.now(),
    description,
    mainFileId: project.mainFileId,
    files: JSON.parse(JSON.stringify(project.files)),
  };

  // Keep up to 30 snapshots
  const newHistory = [snapshot, ...project.history.slice(0, 29)];

  return {
    ...project,
    history: newHistory,
  };
}

export function restoreProjectSnapshot(
  project: LatexProject,
  snapshotId: string
): LatexProject {
  const snapshot = project.history.find((s) => s.id === snapshotId);
  if (!snapshot) return project;

  const restoredFiles: ProjectFile[] = JSON.parse(JSON.stringify(snapshot.files));
  const mainFile = restoredFiles.find((f) => f.id === snapshot.mainFileId) || restoredFiles[0];

  return {
    ...project,
    mainFileId: mainFile.id,
    activeFileId: mainFile.id,
    openFileIds: [mainFile.id],
    files: restoredFiles,
  };
}
