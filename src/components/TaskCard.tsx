"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { GripVertical, Pencil, Trash2, Calendar } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  user_id: string;
  created_at?: string;
}

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  } catch (e) {
    return "";
  }
};

export function TaskCard({ task, isOverlay, onEdit, onDelete }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: "Task",
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 ring-primary/20 opacity-30 border-dashed",
        overlay: "ring-2 ring-primary shadow-xl scale-[1.02]",
      },
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative border border-border/60 bg-card hover:bg-accent/5 transition-all duration-200 shadow-sm hover:shadow-md hover:border-primary/30 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing",
        variants({
          dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
        })
      )}
    >
      <CardHeader className="px-3 py-2 flex flex-row items-center border-b border-border/50 bg-muted/20">
        <Button
          variant="ghost"
          {...attributes}
          {...listeners}
          className="p-1 text-muted-foreground hover:text-foreground h-auto cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </Button>

        <Badge
          variant="outline"
          className="ml-auto font-medium text-[10px] uppercase tracking-wider text-muted-foreground border-muted-foreground/35 bg-background/50"
        >
          Task
        </Badge>

        <div className="flex items-center gap-0.5 ml-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-background/80"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(task);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-background/80"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(Number(task.id));
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-4 text-sm text-foreground/90 font-normal leading-relaxed text-left whitespace-pre-wrap">
        {task.title}
      </CardContent>

      {task.created_at && (
        <CardFooter className="px-4 pb-3 pt-0 text-[10px] text-muted-foreground/80 flex items-center gap-1.5 justify-start">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span>Created {formatDate(task.created_at)}</span>
        </CardFooter>
      )}
    </Card>
  );
}
