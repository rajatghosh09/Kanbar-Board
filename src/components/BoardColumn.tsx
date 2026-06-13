"use client";

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useDndContext, type UniqueIdentifier } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { Task, TaskCard } from "./TaskCard";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { GripVertical } from "lucide-react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

export interface Column {
  id: UniqueIdentifier;
  title: string;
}

export type ColumnType = "Column";

export interface ColumnDragData {
  type: ColumnType;
  column: Column;
}

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  isOverlay?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
}

export function BoardColumn({
  column,
  tasks,
  isOverlay,
  onEdit,
  onDelete,
}: BoardColumnProps) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    attributes: {
      roleDescription: `Column: ${column.title}`,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva(
    "h-[530px] max-h-[530px] w-[350px] max-w-full bg-muted/40 dark:bg-muted/10 backdrop-blur-sm flex flex-col flex-shrink-0 snap-center rounded-2xl border border-border/40 shadow-sm overflow-hidden",
    {
      variants: {
        dragging: {
          default: "border border-border/40",
          over: "ring-2 ring-primary/20 opacity-40 border-dashed",
          overlay: "ring-2 ring-primary shadow-lg scale-[1.01]",
        },
      },
    },
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="p-3 font-semibold border-b border-border/40 text-left flex flex-row items-center justify-between bg-muted/15">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            {...attributes}
            {...listeners}
            className="p-1 text-muted-foreground hover:text-foreground h-auto cursor-grab active:cursor-grabbing"
          >
            <span className="sr-only">{`Move column: ${column.title}`}</span>
            <GripVertical className="h-4 w-4" />
          </Button>

          <span className="font-semibold text-xs tracking-wider text-muted-foreground uppercase">
            {column.title}
          </span>
        </div>

        <Badge
          variant="secondary"
          className="font-medium text-[11px] rounded-full px-2 py-0.5 min-w-[20px] text-center justify-center bg-background border border-border/40 text-foreground"
        >
          {tasks.length}
        </Badge>
      </CardHeader>

      <ScrollArea className="flex-grow">
        <CardContent className="flex flex-col gap-3 p-3 min-h-[150px]">
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </SortableContext>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva("px-2 md:px-0 flex lg:justify-center pb-4", {
    variants: {
      dragging: {
        default: "snap-x snap-mandatory",
        active: "snap-none",
      },
    },
  });

  return (
    <ScrollArea
      className={variations({
        dragging: dndContext.active ? "active" : "default",
      })}
    >
      <div className="flex gap-4 items-center flex-row justify-center py-2">
        {children}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
