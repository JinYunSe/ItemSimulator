import express from 'express';
import prisma from '../src/utils/prisma/index.js';
import joi from 'joi';

const ItemRouter = express.Router();

const checkItem = joi.object({
  itemName: joi.string().min(1).max(191).required(),
  addHealth: joi
    .number()
    .integer()
    .min(Number.MIN_SAFE_INTEGER)
    .max(Number.MAX_SAFE_INTEGER)
    .required(),
  addPower: joi
    .number()
    .integer()
    .min(Number.MIN_SAFE_INTEGER)
    .max(Number.MAX_SAFE_INTEGER)
    .required(),
});

const checkPrice = joi.object({
  price: joi.number().integer().min(0).max(Number.MAX_SAFE_INTEGER).required(),
});

const checkItemCode = joi.object({
  itemCode: joi.number().integer().min(1).max(Number.MAX_VALUE).required(),
});

// 아이템 만들기 API
ItemRouter.post('/item', async (req, res, next) => {
  try {
    const itemCode = req.body.itemCode;
    const itemCodeValidation = await checkItemCode.validateAsync({ itemCode });

    const isExist = await prisma.Items.findFirst({
      where: {
        itemCode: itemCodeValidation.itemCode,
      },
    });

    if (isExist && isExist.itemCode === itemCode)
      return res
        .status(401)
        .json({ message: '이미 존재하는 아이템 코드번호 입니다.' });

    const { itemName, itemStat, price } = req.body;
    const { health: addHealth, power: addPower } = itemStat;
    const itemInputValidation = await checkItem.validateAsync({
      itemName,
      addHealth,
      addPower,
    });
    const priceValidation = await checkPrice.validateAsync({ price });

    await prisma.Items.create({
      data: {
        itemCode: itemCodeValidation.itemCode,
        itemName: itemInputValidation.itemName,
        addHealth: itemInputValidation.addHealth,
        addPower: itemInputValidation.addPower,
        price: priceValidation.price,
      },
    });

    // 반환 결과 만들기
    const item = {
      item_code: itemCodeValidation.itemCode,
      item_name: itemInputValidation.itemName,
      item_stat: {
        health: itemInputValidation.addHealth,
        power: itemInputValidation.addPower,
      },
      item_price: priceValidation.price,
    };

    return res.status(200).json({ data: item });
  } catch (error) {
    next(error);
  }
});

// 아이템 수정 API
// ItemRouter.patch('/item/:itemCode', async (req, res, next) => {
//   try {
//     const { itemCode } = req.params;
//     const itemCodeValidation = await checkItemCode.validateAsync({ itemCode });

//     const isExist = await prisma.Items.findFirst({
//       where: {
//         itemCode: itemCodeValidation.itemCode,
//       },
//     });
//     if (!isExist)
//       return res
//         .status(404)
//         .json({ message: '변경할 아이템이 존재하지 않습니다.' });
//     const { itemName , itemStat } = req.body;
//     const { health: addHealth, power: addPower } = itemStat;
//     const itemInputValidation = await checkItem.validateAsync({
//       itemName,
//       addHealth,
//       addPower,
//     });

//     const updateItem = await prisma.Items.update({
//       where: {
//         itemCode: itemCodeValidation.itemCode,
//       },
//       data: {
//         addHealth: itemInputValidation.addHealth,
//         addPower: itemInputValidation.addPower,
//       },
//     });
//     return res.status(201).json({ data: updateItem });
//   } catch (error) {
//     next(error);
//   }
// });

// 전체 아이템 조회 API
// DB로 확인하기 위해 사용
ItemRouter.get('/item', async (req, res, next) => {
  let itemList = await prisma.Items.findMany({
    select: {
      itemId: true,
      itemCode: true,
      itemName: true,
      addHealth: true,
      addPower: true,
      price: true,
    },
  });

  // addHealth와 addPower를 item_stat으로 묶어준다.
  itemList = itemList.map((item) => ({
    item_id: item.itemId,
    item_code: item.itemCode,
    item_name: item.itemName,
    item_stat: {
      health: item.addHealth,
      power: item.addPower,
    },
    item_price: item.price,
  }));
  return res.status(201).json({ data: itemList });
});

// 특정 아이템 조회 API
// DB로 확인하기 위해 사용
ItemRouter.get('/item/:itemCode', async (req, res, next) => {
  try {
    const validation = await checkItemCode.validateAsync(req.params);
    const { itemCode } = validation;
    const item = await prisma.Items.findFirst({
      where: {
        itemCode,
      },
    });
    if (!item)
      return res
        .status(404)
        .json({ message: '찾고자 하는 아이템이 없습니다.' });

    return res.status(200).json({ data: item });
  } catch (error) {
    next(error);
  }
});

export default ItemRouter;
