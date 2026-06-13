import { create } from "zustand";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  user_id: string;
  created_at?: string;
}

interface TaskStore {
  tasks: Task[];

  setTasks: (
    tasks: Task[] | ((prev: Task[]) => Task[])
  ) => void;

  addTask: (task: Task) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],

  setTasks: (tasks) =>
    set((state) => ({
      tasks:
        typeof tasks === "function"
          ? tasks(state.tasks)
          : tasks,
    })),

  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
}));