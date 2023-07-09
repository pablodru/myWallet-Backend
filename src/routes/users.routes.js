import { Router } from "express";
import { signup, signin } from "../controllers/users.controller.js";

const userRouter = Router()

userRouter.post('/signup', signup);
userRouter.post("/signin", signin);

export default userRouter;