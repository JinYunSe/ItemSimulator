import express from "express";
import prisma from "../src/utils/prisma/index.js";
import joi from "joi";

const ItemRouter = express.Router();

const checkItemInput = joi.object({
  itemName: joi.string().min(1).max(191),
  addHealth: joi
    .number()
    .integer()
    .min(Number.MIN_SAFE_INTEGER)
    .max(Number.MAX_SAFE_INTEGER),
  addPower: joi
    .number()
    .integer()
    .min(Number.MIN_SAFE_INTEGER)
    .max(Number.MAX_SAFE_INTEGER),
});

const checkPrice = joi.object({
  price: joi.number().integer().min(0).max(Number.MAX_SAFE_INTEGER).required(),
});

const checkItemCode = joi.object({
  itemCode: joi.number().integer().min(1).max(Number.MAX_VALUE).required(),
});

// 아이템 생성 API
ItemRouter.post("/item", async (req, res, next) => {
  try {
    const { item_code, item_name, item_stat = {}, item_price } = req.body;

    // itemCode 검증
    const { itemCode } = await checkItemCode.validateAsync({
      itemCode: item_code,
    });

    // 이미 존재하는 아이템인지 확인
    const isExist = await prisma.Items.findFirst({
      where: { itemCode },
    });
    if (isExist)
      return res
        .status(401)
        .json({ message: "이미 존재하는 아이템 코드번호입니다." });

    // 입력 데이터 검증
    const itemValidation = await checkItemInput.validateAsync({
      itemName: item_name,
      addHealth: item_stat.health || 0,
      addPower: item_stat.power || 0,
    });

    const { price } = await checkPrice.validateAsync({ price: item_price });

    // 아이템 생성
    const createdItem = await prisma.Items.create({
      data: {
        itemCode,
        ...itemValidation,
        price: price,
      },
    });

    // 반환 결과
    return res.status(200).json({
      data: {
        item_code: createdItem.itemCode,
        item_name: createdItem.itemName,
        item_stat: {
          health: createdItem.addHealth,
          power: createdItem.addPower,
        },
        item_price: createdItem.price,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 아이템 수정 API
ItemRouter.patch("/item/:itemCode", async (req, res, next) => {
  try {
    // itemCode 검증
    const { itemCode } = await checkItemCode.validateAsync({
      itemCode: req.params.itemCode,
    });

    // 아이템 존재 여부 확인
    const isExist = await prisma.Items.findFirst({
      where: {
        itemCode,
      },
    });
    if (!isExist)
      return res
        .status(404)
        .json({ message: "변경할 아이템이 존재하지 않습니다." });

    const { item_name, item_stat = {} } = req.body;

    // 입력 데이터 검증
    const itemValidation = await checkItemInput.validateAsync({
      itemName: item_name || isExist.itemName,
      addHealth: item_stat.health || 0,
      addPower: item_stat.power || 0,
    });

    // 아이템 업데이트
    const updateItem = await prisma.Items.update({
      where: {
        itemCode,
      },
      data: {
        ...itemValidation,
      },
    });

    //Client에게 제공할 JSON 형태 정보 제작
    const response = {
      item_code: updateItem.itemCode,
      item_name: updateItem.itemName || isExist.itemName,
      item_stat: {},
    };
    if (item_stat.health !== undefined)
      response.item_stat.health = updateItem.addHealth;
    if (item_stat.power !== undefined)
      response.item_stat.power = updateItem.addPower;

    return res.status(200).json({ data: response });
  } catch (error) {
    next(error);
  }
});

// 전체 아이템 조회 API
// DB로 확인하기 위해 사용
ItemRouter.get("/item", async (req, res, next) => {
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
  itemList = itemList.map(item => ({
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
ItemRouter.get("/item/:itemCode", async (req, res, next) => {
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
        .json({ message: "찾고자 하는 아이템이 없습니다." });

    //Client에게 제공할 JSON 형태 정보 제작
    const responseData = {
      item_code: item.itemCode,
      item_name: item.itemName,
      item_stat: {
        health: item.addHealth,
        power: item.addPower,
      },
      item_price: item.price,
    };
    return res.status(200).json({ data: responseData });
  } catch (error) {
    next(error);
  }
});

export default ItemRouter;
