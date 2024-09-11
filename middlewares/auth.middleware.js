import jwt from "jsonwebtoken";
import prisma from "../src/utils/prisma/index.js";

export default async function (req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) throw new Error("토큰이 존재하지 않습니다.");

    const [tokenType, token] = authorization.split(" ");

    if (!token || tokenType !== process.env.TOKEN_TYPE)
      throw new Error("토큰 형식이 올바르지 않습니다.");

    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.userId;

    const user = await prisma.Users.findFirst({
      where: { userId },
    });
    if (!user) {
      throw new Error("토큰 사용자가 존재하지 않습니다.");
    }

    // req.user에 사용자 정보를 저장합니다.
    req.user = user;

    next();
  } catch (error) {
    // 토큰이 만료되었거나, 조작되었을 때, 에러 메시지 출력
    switch (error.name) {
      case "TokenExpiredError":
        return res.status(401).json({ message: "토큰이 만료되었습니다." });
      case "JsonWebTokenError":
        return res.status(401).json({ message: "토큰이 조작되었습니다." });
      default:
        return res
          .status(401)
          .json({ message: error.message ?? "인증이 실패하였습니다." });
    }
  }
}
