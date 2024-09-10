import express from 'express';
import prisma from '../src/utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import joi from 'joi';

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
CharacterRouter.post('/characters', authMiddleware, async (req, res, next) => {
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
      return res.status(409).json({ message: '이미 존재하는 닉네임 입니다.' });

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

// 케릭터 전체 조회 API
// DB 확인을 위해 구현
CharacterRouter.get(
  '/charactersALL',
  authMiddleware,
  async (req, res, next) => {
    const characterList = await prisma.Characters.findMany({
      select: {
        characterId: true,
        nickname: true,
        userId: true,
        health: true,
        power: true,
        money: true,
      },
      orderBy: {
        characterId: 'asc',
      },
    });
    console.log(characterList);
    return res.status(200).json({ data: characterList });
  }
);

//특정 케릭터 조회 API
CharacterRouter.get(
  '/characters/:characterId',
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
        },
      });
      if (character.userId !== userId) delete character.money; // 본인 케릭 아니면 삭제
      delete character.userId; // 개인정보? 생각해서 그냥 삭제 했습니다.
      return res.status(200).json({ data: character });
    } catch (error) {
      next(error);
    }
  }
);

// 케릭터 삭제 API
CharacterRouter.delete(
  '/characters/:characterId',
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

      if (!isExist || isExist.userId !== userId)
        return res
          .status(404)
          .json({ message: '캐릭터 조회에 실패하였습니다.' });

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
