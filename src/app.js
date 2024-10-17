import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import UsersRouter from "../routers/user.router.js";
import characterRouter from "../routers/character.router.js";
import ItemRouter from "../routers/Item.router.js";

import LogMiddleware from "../middlewares/log.middleware.js";
import ErrorHandingMiddleware from "../middlewares/errorhanding.middleware.js";

//.env 파일을 사용해 개인정보나 핵심 정보가 노출되지 않도록 해준다.
dotenv.config();

const app = express();
const PORT = 3000;

// Client의 요청을 Log로 출력해준다.
app.use(LogMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use("/api", [UsersRouter, CharacterRouter, ItemRouter]);

// Client의 요청에 따른 Error가 발생할 경우 Error를 응답으로 제공해준다.
app.use(ErrorHandingMiddleware);
app.listen(PORT, () => {
  console.log(PORT + "로 서버가 열렸습니다");
});
