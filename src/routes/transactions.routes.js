import { Router } from "express";
import { getTransactions, newTransaction } from "../controllers/transactions.controller.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { schemaTransation } from "../schemas/transactions.schemas.js";

const transactionRouter = Router();

transactionRouter.post("/transation",validateSchema(schemaTransation), newTransaction);
transactionRouter.get("/transation", getTransactions);

export default transactionRouter;