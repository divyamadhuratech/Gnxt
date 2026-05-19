import express from "express";
import { createSupportTicket } from "../controllers/support.controller.js";

const router = express.Router();

router.post("/ticket", createSupportTicket);

export default router;
