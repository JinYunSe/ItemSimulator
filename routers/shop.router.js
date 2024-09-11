import exprss from "express";
import authMiddleware from "../middlewares/auth.middleware";
import prisma from "../src/utils/prisma/index.js";
import joi from "joi";

const shopRouter = exprss.Router();

shopRouter.post(
  "/characters/characterId/shop",
  authMiddleware,
  async (req, res, next) => "/characters/characterId/shop",
  authMiddleware,
  async (req, res, next) => {
    //   const { characterId } = req.params.character;
    //   const character = await prisma.Characters.findFirst({
    //     where: { character: +characterId },
    //     include: {
    //       inventory: {
    //         include: {
    //           items: true,
    //         },
    //       },
    //     },
    //     //include로 인벤토리와 함께 들고 옵니다.
    //   });
    //   if (!character)
    //     return res.status(404).json({ massage: "케릭터가 존재하지 않습니다." });
    //   const buyWantItems = req.body;
    //   const totalPrice = 0;
    //   buyWantItems.forEach(async item => {
    //     const temp = await prisma.items.findFirst({
    //       where: {
    //         itemCode: +item.itemCode,
    //       },
    //       select: {
    //         price: true,
    //         addHealth: true,
    //         addPower: true,
    //       },
    //     });
    //     if (!temp)
    //       return res
    //         .status(404)
    //         .json({ massage: "존재하지 않는 물품이 있습니다." });
    //     totalPrice += temp.price;
    //   });
    //   if (character.money < totalPrice)
    //     return res.status(401).json({ massage: "보유한 금액이 부족합니다" });
    //   buyWantItems.forEach(async item => {
    //     //if(character.inventory.items[])character.inventory.items.push(item)
    //   });
    return res.status(200).json({ message: "구현시도 중 입니다 ㅎㅎ;;" });
  }
);

export default shopRouter;
