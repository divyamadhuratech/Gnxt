import express from "express";
import {
  getExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} from "../controllers/expense.controller.js";

const router = express.Router();

router.get("/summary", getExpenseSummary);   // must be before /:id
router.get("/", getExpenses);
router.post("/", createExpense);
router.get("/:id", getExpenseById);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
