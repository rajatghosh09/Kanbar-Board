import { useEffect, useMemo, useRef, useState } from "react";
import {
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
  KeyboardSensor,
  type Announcements,
  type UniqueIdentifier,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { type Task } from "@/components/TaskCard";
import type { Column } from "@/components/BoardColumn";
import { hasDraggableData } from "@/components/utils";
import { coordinateGetter } from "@/components/multipleContainersKeyboardPreset";
import { supabaseClient } from "@/lib/supabaseclient";
import { useTaskStore } from "@/zustand/taskStore";
import { useBoardStore } from "@/zustand/boardStore";
import { toast } from "sonner";

export const defaultCols = [
  {
    id: "todo" as const,
    title: "Todo",
  },
  {
    id: "in-progress" as const,
    title: "In progress",
  },
  {
    id: "done" as const,
    title: "Done",
  },
] satisfies Column[];

export type status = (typeof defaultCols)[number]["id"];

export function useKanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(defaultCols);
  const pickedUpTaskColumn = useRef<status | null>(null);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [taskTitle, setTaskTitle] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [editingBoard, setEditingBoard] = useState<number | null>(null);
  const [editBoardName, setEditBoardName] = useState("");
  const [deleteBoardId, setDeleteBoardId] = useState<number | null>(null);
  
  const { tasks, setTasks, addTask } = useTaskStore();
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // boards state
  const [boardName, setBoardName] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<number | null>(null);

  const { boards, setBoards, addBoard, updateBoard, deleteBoard } = useBoardStore();

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    }),
  );

  function getDraggingTaskData(taskId: UniqueIdentifier, status: status) {
    const tasksInColumn = tasks.filter((task) => task.status === status);
    const taskPosition = tasksInColumn.findIndex((task) => task.id === taskId);
    const column = columns.find((col) => col.id === status);
    return {
      tasksInColumn,
      taskPosition,
      column,
    };
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;
      if (active.data.current?.type === "Column") {
        const startstatusx = columnsId.findIndex((id) => id === active.id);
        const startColumn = columns[startstatusx];
        return `Picked up Column ${startColumn?.title} at position: ${
          startstatusx + 1
        } of ${columnsId.length}`;
      } else if (active.data.current?.type === "Task") {
        pickedUpTaskColumn.current = active.data.current.task.status;
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          active.id,
          pickedUpTaskColumn.current,
        );
        return `Picked up Task ${
          active.data.current.task.title
        } at position: ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;

      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overstatusx = columnsId.findIndex((id) => id === over.id);
        return `Column ${active.data.current.column.title} was moved over ${
          over.data.current.column.title
        } at position ${overstatusx + 1} of ${columnsId.length}`;
      } else if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.status,
        );
        if (over.data.current.task.status !== pickedUpTaskColumn.current) {
          return `Task ${
            active.data.current.task.title
          } was moved over column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was moved over position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragEnd({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskColumn.current = null;
        return;
      }
      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overColumnPosition = columnsId.findIndex((id) => id === over.id);

        return `Column ${
          active.data.current.column.title
        } was dropped into position ${overColumnPosition + 1} of ${
          columnsId.length
        }`;
      } else if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.status,
        );
        if (over.data.current.task.status !== pickedUpTaskColumn.current) {
          return `Task was dropped into column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was dropped into position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
      pickedUpTaskColumn.current = null;
    },
    onDragCancel({ active }) {
      pickedUpTaskColumn.current = null;
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    },
  };

  // add task function
  const handleAddTask = async () => {
    if (!selectedBoard) {
      toast.error("Please select a board first");
      return;
    }

    if (!taskTitle.trim()) return;

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    const { data, error } = await supabaseClient
      .from("tasks")
      .insert({
        board_id: selectedBoard,
        title: taskTitle,
        status: "todo",
        user_id: user.id,
      })
      .select()
      .single();

    console.log("Selected Board:", selectedBoard);
    if (error) {
      toast.error(error.message);
      return;
    }

    addTask(data);
    setTaskTitle("");

    toast.success("Task Added");
  };

  // delete task function
  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;

    const { error } = await supabaseClient
      .from("tasks")
      .delete()
      .eq("id", deleteTaskId);

    if (error) {
      toast.error(error.message);
      return;
    }

    setTasks(tasks.filter((task) => task.id !== deleteTaskId));

    toast.success("Task deleted");

    setDeleteTaskId(null);
  };

  // edit task function
  const handleUpdateTask = async () => {
    if (!editingTask) return;

    const { error } = await supabaseClient
      .from("tasks")
      .update({
        title: editTitle,
      })
      .eq("id", editingTask.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setTasks(
      tasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              title: editTitle,
            }
          : task,
      ),
    );

    toast.success("Task updated");

    setEditingTask(null);
    setEditTitle("");
  };

  // fetch tasks from supabase db on mount
  useEffect(() => {
    const fetchBoards = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) return;

      const { data, error } = await supabaseClient
        .from("boards")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.log(error);
        return;
      }

      setBoards(data || []);

      if (data && data.length > 0) {
        setSelectedBoard(data[0].id);
      }
    };

    fetchBoards();
  }, [setBoards]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedBoard) return;

      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) return;

      const { data, error } = await supabaseClient
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("board_id", selectedBoard);

      if (error) {
        toast.error(error.message);
        return;
      }

      setTasks(data || []);
    };

    fetchTasks();
  }, [selectedBoard, setTasks]);

  // update task status in supabase db
  const updateTaskStatus = async (taskId: number, status: status) => {
    await supabaseClient.from("tasks").update({ status }).eq("id", taskId);
  };

  // fetch boards from supabase db
  const handleAddBoard = async () => {
    if (!boardName.trim()) return;

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    const { data, error } = await supabaseClient
      .from("boards")
      .insert({
        name: boardName,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    addBoard(data);

    setSelectedBoard(data.id);

    setBoardName("");
    toast.success("Board Created");
  };

  const handleUpdateBoard = async () => {
    if (!editingBoard) return;

    const { error } = await supabaseClient
      .from("boards")
      .update({
        name: editBoardName,
      })
      .eq("id", editingBoard);

    if (error) {
      toast.error(error.message);
      return;
    }

    updateBoard(editingBoard, editBoardName);

    toast.success("Board updated");

    setEditingBoard(null);
    setEditBoardName("");
  };

  const handleDeleteBoard = async () => {
    if (!deleteBoardId) return;

    const { error } = await supabaseClient
      .from("boards")
      .delete()
      .eq("id", deleteBoardId);

    if (error) {
      toast.error(error.message);
      return;
    }

    deleteBoard(deleteBoardId);

    if (selectedBoard === deleteBoardId) {
      setSelectedBoard(null);
      setTasks([]);
    }

    toast.success("Board deleted");

    setDeleteBoardId(null);
  };

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === "Column") {
      setActiveColumn(data.column);
      return;
    }

    if (data?.type === "Task") {
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    if (activeId === overId) return;

    const isActiveAColumn = activeData?.type === "Column";
    if (!isActiveAColumn) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === "Task";
    const isOverATask = overData?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        const activeTask = tasks[activeIndex];
        const overTask = tasks[overIndex];
        if (activeTask && overTask && activeTask.status !== overTask.status) {
          activeTask.status = overTask.status;

          updateTaskStatus(Number(activeTask.id), overTask.status);

          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = overData?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const activeTask = tasks[activeIndex];
        if (activeTask) {
          activeTask.status = overId as status;

          updateTaskStatus(Number(activeTask.id), overId as status);

          return [...tasks];
        }
        return tasks;
      });
    }
  }

  const openEditBoard = (id: number, name: string) => {
    setEditingBoard(id);
    setEditBoardName(name);
  };

  const openDeleteBoard = (id: number) => {
    setDeleteBoardId(id);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
  };

  const openDeleteTask = (id: number) => {
    setDeleteTaskId(id);
  };

  return {
    columns,
    setColumns,
    columnsId,
    taskTitle,
    setTaskTitle,
    editingTask,
    setEditingTask,
    editTitle,
    setEditTitle,
    deleteTaskId,
    setDeleteTaskId,
    editingBoard,
    setEditingBoard,
    editBoardName,
    setEditBoardName,
    deleteBoardId,
    setDeleteBoardId,
    tasks,
    setTasks,
    activeColumn,
    activeTask,
    boardName,
    setBoardName,
    selectedBoard,
    setSelectedBoard,
    boards,
    sensors,
    announcements,
    handleAddTask,
    handleDeleteTask,
    handleUpdateTask,
    handleAddBoard,
    handleUpdateBoard,
    handleDeleteBoard,
    onDragStart,
    onDragEnd,
    onDragOver,
    openEditBoard,
    openDeleteBoard,
    openEditTask,
    openDeleteTask,
  };
}
