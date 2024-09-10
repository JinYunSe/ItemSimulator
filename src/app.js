import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import userRouter from "../Router/userRouter";

dotenv.config();

const app = express();
const PORT = 3000;

// MySQLStore를 Express-Session을 이용해 생성합니다.
const MySQLStore = expressMySQLSession(expressSession);
// MySQLStore를 이용해 세션 외부 스토리지를 선언합니다.
const sessionStore = new MySQLStore({
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  expiration: 1000 * 60 * 60 * 24,
  createDatabaseTable: true,
});

app.use(express.json());
app.use(cookieParser());
app.use("/api", [userRouter]);

app.listen(PORT, () => {
  console.log(PORT + "로 서버가 열렸습니다");
});
