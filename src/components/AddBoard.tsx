"use client";

import { useState } from "react";
import { Plus, Check, X } from "lucide-react";

interface AddBoardProps {
  boardName: string;
  setBoardName: (value: string) => void;
  handleAddBoard: () => void;
}

export default function AddBoard({
  boardName,
  setBoardName,
  handleAddBoard,
}: AddBoardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = () => {
    if (boardName.trim()) {
      handleAddBoard();
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setBoardName("");
    setIsAdding(false);
  };

  return (
    <div className="flex items-center gap-1.5 transition-all duration-200">
      {isAdding ? (
        <div className="flex items-center gap-1 bg-background border border-border/60 pl-2 pr-1 py-1 rounded-xl shadow-sm">
          <input
            autoFocus
            type="text"
            placeholder="Board name..."
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="bg-transparent border-0 outline-none ring-0 text-xs font-semibold w-28 h-6 text-foreground placeholder:text-muted-foreground/60"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />

          <button
            type="button"
            onClick={handleSave}
            className="p-1 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
          >
            <Check className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="p-1 rounded-md text-muted-foreground hover:bg-accent transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-border/80 bg-background hover:bg-accent/40 text-muted-foreground hover:text-foreground text-xs font-semibold transition-all duration-200 shadow-sm"
        >
          <Plus className="h-3 w-3" />
          <span>New Board</span>
        </button>
      )}
    </div>
  );
}