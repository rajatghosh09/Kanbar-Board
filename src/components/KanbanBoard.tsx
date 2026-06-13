"use client";

import { createPortal } from "react-dom";
import { BoardColumn, BoardContainer } from "./BoardColumn";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import AddBoard from "./AddBoard";
import BoardSelector from "./BoardSelector";
import { useKanbanBoard } from "@/hooks/useKanbanBoard";
import { KanbanDialogs } from "./KanbanDialogs";

export type { status } from "@/hooks/useKanbanBoard";

export function KanbanBoard() {
  const kanban = useKanbanBoard();

  return (
    <div className="flex flex-col gap-8">
      {/* Interactive Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-2xl shadow-sm">
        {/* Boards Section */}
        <div className="lg:col-span-7 flex flex-col gap-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Active Workspace Boards
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <BoardSelector
              boards={kanban.boards}
              selectedBoard={kanban.selectedBoard}
              setSelectedBoard={kanban.setSelectedBoard}
              onEdit={kanban.openEditBoard}
              onDelete={kanban.openDeleteBoard}
            />
            <AddBoard
              boardName={kanban.boardName}
              setBoardName={kanban.setBoardName}
              handleAddBoard={kanban.handleAddBoard}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block lg:col-span-1 border-r border-border/40 h-full justify-self-center my-1" />

        {/* Quick Task Addition */}
        <div className="lg:col-span-4 flex flex-col gap-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Add Task
          </span>
          <div className="flex gap-2">
            <Input
              placeholder="What needs to be done?"
              value={kanban.taskTitle}
              onChange={(e) => kanban.setTaskTitle(e.target.value)}
              className="bg-background/50 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl h-10 text-sm placeholder:text-muted-foreground/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  kanban.handleAddTask();
                }
              }}
            />
            <Button
              onClick={kanban.handleAddTask}
              className="h-10 rounded-xl px-4 font-semibold shadow-sm hover:shadow transition-all duration-200"
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Board Columns & DndContext */}
      <DndContext
        accessibility={{
          announcements: kanban.announcements,
        }}
        sensors={kanban.sensors}
        onDragStart={kanban.onDragStart}
        onDragEnd={kanban.onDragEnd}
        onDragOver={kanban.onDragOver}
      >
        <BoardContainer>
          <SortableContext items={kanban.columnsId}>
            {kanban.columns.map((col) => (
              <BoardColumn
                key={col.id}
                column={col}
                tasks={kanban.tasks.filter((task) => task.status === col.id)}
                onEdit={kanban.openEditTask}
                onDelete={kanban.openDeleteTask}
              />
            ))}
          </SortableContext>
        </BoardContainer>

        {typeof window !== "undefined" &&
          createPortal(
            <DragOverlay>
              {kanban.activeColumn && (
                <BoardColumn
                  isOverlay
                  column={kanban.activeColumn}
                  tasks={kanban.tasks.filter(
                    (task) => task.status === kanban.activeColumn!.id,
                  )}
                />
              )}
              {kanban.activeTask && (
                <TaskCard task={kanban.activeTask} isOverlay />
              )}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>

      <KanbanDialogs {...kanban} />
    </div>
  );
}
