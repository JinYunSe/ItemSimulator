import express from "express";
import prisma from "../src/utils/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const userRouter = express.Router();

export default userRouter;
