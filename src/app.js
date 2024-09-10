import express from "express";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import expressMySQLSession from "express-mysql-session";
import UsersRouter from "../routers/user.router.js";
import LogMiddleware from "../middlewares/log.middleware.js";
import ErrorHandingMiddleware from "../middlewares/errorhanding.middleware.js";
import dotenv from "dotenv";

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

app.use(LogMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use("/api", [UsersRouter]);

app.use(ErrorHandingMiddleware);
app.listen(PORT, () => {
  console.log(PORT + "로 서버가 열렸습니다");
});
