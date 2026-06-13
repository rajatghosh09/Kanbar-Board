"use client";

import { Board } from "@/zustand/boardStore";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardSelectorProps {
  boards: Board[];
  selectedBoard: number | null;
  setSelectedBoard: (id: number) => void;
  onEdit: (id: number, name: string) => void;
  onDelete: (id: number) => void;
}

export default function BoardSelector({
  boards,
  selectedBoard,
  setSelectedBoard,
  onEdit,
  onDelete,
}: BoardSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      {boards.map((board) => {
        const isSelected = selectedBoard === board.id;
        return (
          <div
            key={board.id}
            className={cn(
              "group/board flex items-center gap-1 px-3 py-1 rounded-xl border transition-all duration-200 shadow-sm",
              isSelected
                ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10"
                : "bg-background hover:bg-accent/40 border-border/60 text-foreground"
            )}
          >
            <button
              onClick={() => setSelectedBoard(board.id)}
              className="text-xs font-semibold tracking-tight transition-colors text-left"
            >
              {board.name}
            </button>

            <div className="flex items-center gap-0.5 opacity-0 group-hover/board:opacity-100 transition-opacity duration-150 ml-1">
              <button
                type="button"
                onClick={() => onEdit(board.id, board.name)}
                className={cn(
                  "p-1 rounded-md transition-colors hover:bg-background/20",
                  isSelected
                    ? "text-primary-foreground/75 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Pencil className="h-3 w-3" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(board.id)}
                className={cn(
                  "p-1 rounded-md transition-colors hover:bg-background/20",
                  isSelected
                    ? "text-primary-foreground/75 hover:text-destructive-foreground"
                    : "text-muted-foreground hover:text-destructive"
                )}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
