export type Priority = "Alta" | "Media" | "Baja";
export interface Project {
  id: string;
  name: string;
  category: string;
  priority: Priority;
  status: string;
  version: string;
  url: string;
  github: string;
  notes: string;
  next: string;
  updatedAt: number;
}
export interface Task {
  id: string;
  projectId: string;
  title: string;
  priority: Priority;
  status: "Pendiente" | "En curso" | "Terminado";
  updatedAt: number;
}
export interface Session {
  id: string;
  projectId: string;
  startedAt: number;
  runningSince: number | null;
  accumulatedMs: number;
  endedAt: number | null;
  updatedAt: number;
}
export interface Prompt {
  id: string;
  title: string;
  text: string;
  updatedAt: number;
}
export interface Workspace {
  schema: 5;
  projects: Project[];
  tasks: Task[];
  sessions: Session[];
  prompts: Prompt[];
}
export type Collection = "projects" | "tasks" | "sessions" | "prompts";
export type Entity = Project | Task | Session | Prompt;
export const emptyWorkspace = (): Workspace => ({
  schema: 5,
  projects: [],
  tasks: [],
  sessions: [],
  prompts: [],
});
export const uid = () => crypto.randomUUID();
