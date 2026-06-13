import { create } from "zustand";

export interface Board {
  id: number;
  name: string;
  user_id: string;
}

interface BoardStore {
  boards: Board[];
  setBoards: (boards: Board[]) => void;
  addBoard: (board: Board) => void;
  updateBoard: (id: number, name: string) => void;
  deleteBoard: (id: number) => void;
}

export const useBoardStore = create<BoardStore>((set) => ({
  boards: [],

  setBoards: (boards) =>
    set({
      boards,
    }),

  addBoard: (board) =>
    set((state) => ({
      boards: [...state.boards, board],
    })),
  updateBoard: (id, name) =>
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id === id ? { ...board, name } : board,
      ),
    })),

  deleteBoard: (id) =>
    set((state) => ({
      boards: state.boards.filter((board) => board.id !== id),
    })),
}));
