import { Router } from "express";
import { signup, signin } from "../controllers/users.controller.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { schemaLogin, schemaRegister } from "../schemas/users.schemas.js";

const userRouter = Router()

userRouter.post('/signup', validateSchema(schemaRegister), signup);
userRouter.post("/signin", validateSchema(schemaLogin), signin);

export default userRouter;