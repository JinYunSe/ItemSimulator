import express from "express";
import prisma from "../src/utils/prisma/index.js";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import joi from "joi";

const UsersRouter = express.Router();

const createSingUpSchema = joi.object({
  userId: joi
    .string()
    .min(1)
    .max(191)
    .pattern(/^[a-z0-9]+$/)
    .required(),
  password: joi.string().min(6).max(191).required(),
  passwordCheck: joi.string().min(6).max(191).required(),
  name: joi.string().min(1).required(),
});

// 회원가입 API
UsersRouter.post("/sign-up", async (req, res, next) => {
  try {
    const validation = await createSingUpSchema.validateAsync(req.body);
    const { userId, password, passwordCheck, name } = validation;
    const isExist = await prisma.Users.findFirst({
      where: {
        userId,
      },
    });
    if (isExist)
      return res.status(409).json({ message: "이미 존재하는 아이디 입니다." });
    if (password !== passwordCheck)
      return res.status(400).json({ massage: "비밀번호가 일치하지 않습니다." });
    const hashedPassword = await bcrypt.hash(password, 10);

    // 트랜잭션으로 아래의 과정 실행 중 오류 발생이 있으면 ROLLBACK
    // 정상 작동을 완료했다면 COMMIT
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
      // 격리성 레벨 설정
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );
    return res.status(201).json({ data: userInfo });
  } catch (error) {
    next(error);
  }
});

// 로그인 API
UsersRouter.post("/sign-in", async (req, res, next) => {
  const { userId, password } = req.body;

  const user = await prisma.Users.findFirst({
    where: {
      userId,
    },
  });

  if (!user)
    return res.status(404).json({ message: "아이디가 존재하지 않습니다." });
  else if (!(await bcrypt.compare(password, user.password)))
    return res.status(404).json({ message: "비밀번호를 일치하지 않습니다." });

  const token = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY);
  res.header(`${process.env.TOKEN_KEY}`, `${process.env.TOKEN_TYPE} ${token}`);
  return res.status(200).json({ message: "로그인 성공" });
});

// 회원 모두 조회 API
// DB 동작 유무 확인을 위해 구현
// UsersRouter.get("/singAll", async (req, res, next) => {
//   const userList = await prisma.Users.findMany({
//     select: {
//       userId: true,
//       password: true,
//       userInfos: {
//         select: {
//           name: true,
//         },
//       },
//       createdAt: true,
//     },
//   });
//   return res.status(200).json({ data: userList });
// });

// export default UsersRouter;
