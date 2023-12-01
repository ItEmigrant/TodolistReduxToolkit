import { TodolistDomainType, todolistsReducer, todoListsThunks } from "features/TodolistsList/model/todolists/todolists-reducer";
import { tasksReducer, TasksStateType } from "features/TodolistsList/model/tasks/tasks-reducer";
import { TodolistType } from "features/TodolistsList/api/todolists/todolistsApi.types";


test("ids should be equals", () => {
  const startTasksState: TasksStateType = {};
  const startTodolistsState: Array<TodolistDomainType> = [];

  let todolist: TodolistType = {
    title: "new todolist",
    id: "any id",
    addedDate: "",
    order: 0,
  };

  const action = todoListsThunks.addTodolist.fulfilled({ todolist }, "requestId", { title: todolist.title });

  const endTasksState = tasksReducer(startTasksState, action);
  const endTodolistsState = todolistsReducer(startTodolistsState, action);

  const keys = Object.keys(endTasksState);
  const idFromTasks = keys[0];
  const idFromTodolists = endTodolistsState[0].id;

  expect(idFromTasks).toBe(action.payload.todolist.id);
  expect(idFromTodolists).toBe(action.payload.todolist.id);
});
