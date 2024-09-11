import express from "express";
import prisma from "../src/utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import joi from "joi";
import { Prisma } from "@prisma/client";

const CharacterRouter = express.Router();

const checkCharacterNickName = joi.object({
  nickname: joi.string().min(1).max(191).required(),
});

const checkCharacterId = joi.object({
  characterId: joi
    .number()
    .integer()
    .min(1)
    .max(Number.MAX_SAFE_INTEGER)
    .required(),
});

// 케릭터 생성 API
CharacterRouter.post("/characters", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const validation = await checkCharacterNickName.validateAsync(req.body);
    const { nickname } = validation;

    const isExist = await prisma.Characters.findFirst({
      where: {
        nickname,
      },
    });
    if (isExist)
      return res.status(409).json({ message: "이미 존재하는 닉네임 입니다." });

    const [character, inventory] = await prisma.$transaction(
      async tx => {
        const character = await tx.Characters.create({
          data: {
            userId,
            nickname,
          },
        });

        const inventory = await tx.Inventory.create({
          data: {
            characterId: +character.characterId,
          },
        });
        return [character, inventory];
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );

    const sendData = {
      message: `새로운 캐릭터 ${character.nickname}를 생성하셨습니다!`,
    };
    return res.status(201).json({ data: sendData });
  } catch (error) {
    next(error);
  }
});

// 케릭터 전체 조회 API
// DB 확인을 위해 구현
CharacterRouter.get("/characters", authMiddleware, async (req, res, next) => {
  const characterList = await prisma.Characters.findMany({
    select: {
      characterId: true,
      nickname: true,
      userId: true,
      health: true,
      power: true,
      money: true,
      inventory: {
        select: {
          inventoryId: true,
        },
      },
    },
    orderBy: {
      characterId: "asc",
    },
  });
  console.log(characterList);
  return res.status(200).json({ data: characterList });
});

//특정 케릭터 조회 API
CharacterRouter.get(
  "/characters/:characterId",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      const validation = await checkCharacterId.validateAsync(req.params);
      const { characterId } = validation;

      const character = await prisma.Characters.findFirst({
        where: {
          characterId: +characterId,
        },
        select: {
          nickname: true,
          health: true,
          power: true,
          money: true,
          userId: true,
          inventory: {
            select: {
              inventoryId: true,
            },
          },
        },
      });

      if (!character)
        return res
          .status(404)
          .json({ message: "해당 케릭터가 존재하지 않습니다." });

      if (character.userId !== userId) {
        delete character.money; // 본인 케릭 아니면 삭제
        delete character.userId; // 개인정보? 생각해서 그냥 삭제 했습니다.
      }
      return res.status(200).json({ data: character });
    } catch (error) {
      next(error);
    }
  }
);

// 케릭터 삭제 API
CharacterRouter.delete(
  "/characters/:characterId",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      const validation = await checkCharacterId.validateAsync(req.params);
      const { characterId } = validation;

      const isExist = await prisma.Characters.findFirst({
        where: {
          characterId: +characterId,
        },
      });

      if (!isExist)
        return res
          .status(404)
          .json({ message: "해당 캐릭터가 존재하지 않습니다." });
      if (isExist.userId !== userId)
        return res
          .status(403)
          .json({ message: "해당 캐릭터를 삭제할 권한이 없습니다." });

      await prisma.Characters.delete({
        where: {
          characterId: +characterId,
          userId,
        },
      });
      return res
        .status(200)
        .json({ massage: `캐릭터 '${isExist.nickname}'를 삭제하였습니다.` });
    } catch (error) {
      next(error);
    }
  }
);

export default CharacterRouter;
