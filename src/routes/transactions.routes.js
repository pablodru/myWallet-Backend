import { Router } from "express";
import { getTransactions, newTransaction } from "../controllers/transactions.controller.js";

const transactionRouter = Router();

transactionRouter.post("/transation", newTransaction);
transactionRouter.get("/transation", getTransactions);

export default transactionRouter;