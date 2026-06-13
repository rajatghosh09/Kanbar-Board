"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type Task } from "./TaskCard";

interface KanbanDialogsProps {
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  editTitle: string;
  setEditTitle: (title: string) => void;
  handleUpdateTask: () => Promise<void>;

  deleteTaskId: number | null;
  setDeleteTaskId: (id: number | null) => void;
  handleDeleteTask: () => Promise<void>;

  editingBoard: number | null;
  setEditingBoard: (id: number | null) => void;
  editBoardName: string;
  setEditBoardName: (name: string) => void;
  handleUpdateBoard: () => Promise<void>;

  deleteBoardId: number | null;
  setDeleteBoardId: (id: number | null) => void;
  handleDeleteBoard: () => Promise<void>;
}

export function KanbanDialogs({
  editingTask,
  setEditingTask,
  editTitle,
  setEditTitle,
  handleUpdateTask,
  deleteTaskId,
  setDeleteTaskId,
  handleDeleteTask,
  editingBoard,
  setEditingBoard,
  editBoardName,
  setEditBoardName,
  handleUpdateBoard,
  deleteBoardId,
  setDeleteBoardId,
  handleDeleteBoard,
}: KanbanDialogsProps) {
  return (
    <>
      {/* Edit Task Dialog */}
      <Dialog
        open={!!editingTask}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTask(null);
            setEditTitle("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>

          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Enter task title"
          />

          <Button className="w-full mt-4" onClick={handleUpdateTask}>
            Update Task
          </Button>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation */}
      <AlertDialog
        open={deleteTaskId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTaskId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={handleDeleteTask}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Board Dialog */}
      <Dialog
        open={editingBoard !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBoard(null);
            setEditBoardName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
          </DialogHeader>

          <Input
            value={editBoardName}
            onChange={(e) => setEditBoardName(e.target.value)}
          />

          <Button onClick={handleUpdateBoard}>Update Board</Button>
        </DialogContent>
      </Dialog>

      {/* Delete Board Confirmation */}
      <AlertDialog
        open={deleteBoardId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteBoardId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete the board.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={handleDeleteBoard}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
