import express from "express";
import prisma from "../src/utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import joi from "joi";

const CharacterRouter = express.Router();

const createCharacterSchema = joi.object({
  nickname: joi.string().min(1).max(191).required(),
});

// 케릭터 생성 API
CharacterRouter.post("/characters", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const validation = await createCharacterSchema.validateAsync(req.body);
    const { nickname } = validation;

    const isExisted = await prisma.Characters.findFirst({
      where: {
        nickname,
      },
    });
    if (isExisted)
      return res.status(409).json({ message: "이미 존재하는 닉네임 입니다." });

    const character = await prisma.Characters.create({
      data: {
        userId,
        nickname,
      },
    });

    const sendData = {
      message: `새로운 캐릭터 ${character.nickname}를 생성하셨습니다!`,
      data: { character_Id: character.characterId },
    };
    return res.status(201).json({ data: sendData });
  } catch (error) {
    next(error);
  }
});

export default CharacterRouter;
