import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  createTodo,
  deleteTodo,
  getTodo,
  listTodos,
  updateTodo
} from "../controllers/todoController.js";

const router = Router();

router.use(auth);
router.get("/", listTodos);
router.post("/", createTodo);
router.get("/:id", getTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
