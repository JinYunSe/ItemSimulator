import express from "express";
import prisma from "../src/utils/prisma/index.js";
//import authMiddleware from "../middlewares/auth.middleware.js";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import joi from "joi";

const UsersRouter = express.Router();

const createSingUpSchema = joi.object({
  userId: joi
    .string()
    .min(1)
    .max(191)
    .pattern(/^[a-z0-9]+$/)
    .required(),
  password: joi.string().min(6).required(),
  passwordCheck: joi.string().min(6).required(),
  name: joi.string().required(),
});

UsersRouter.post("/sign-up", async (req, res, next) => {
  try {
    const validation = await createSingUpSchema.validateAsync(req.body);
    const { userId, password, passwordCheck, name } = validation;
    const isExistUser = await prisma.Users.findFirst({
      where: {
        userId,
      },
    });
    if (isExistUser)
      return res.status(409).json({ message: "이미 존재하는 이메일 입니다." });
    if (password !== passwordCheck)
      return res.status(400).json({ massage: "비밀번호가 일치하지 않습니다." });
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user, userInfo] = await prisma.$transaction(
      async tx => {
        // User 테이블에 값 넣기
        const user = await tx.Users.create({
          data: {
            userId,
            password: hashedPassword,
          },
        });

        // UserInfos 테이블에 값 넣기
        const userInfo = await tx.UserInfos.create({
          data: {
            userId: user.userId,
            //생성한 유저의 userId를 바탕으로 사용자 정보를 생성합니다.
            name,
          },
        });
        return [user, userInfo];
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );
    return res.status(201).json({ data: userInfo });
  } catch (error) {
    next(error);
  }
});

UsersRouter.post("/sign-in", async (req, res, next) => {
  const { email, password } = req.body;
});

export default UsersRouter;
