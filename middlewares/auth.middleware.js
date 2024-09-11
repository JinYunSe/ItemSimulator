import jwt from "jsonwebtoken";
import prisma from "../src/utils/prisma/index.js";

export default async function (req, res, next) {
  try {
    // 쿠키가 아닌 해더의 authorization으로 Token을 전송한다.
    const authorization = req.headers.authorization;

    if (!authorization) throw new Error("토큰이 존재하지 않습니다.");

    //Token 방식과 Token 값을 분리
    const [tokenType, token] = authorization.split(" ");

    if (!token || tokenType !== process.env.TOKEN_TYPE)
      throw new Error("토큰 형식이 올바르지 않습니다.");

    //jwt를 이용해 token을 .env 파일 내에 있는 암호화 키로 복화화 및 검증한다.
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    //token의 주인을 확인한다.
    const userId = decodedToken.userId;

    const user = await prisma.Users.findFirst({
      where: { userId },
    });

    if (!user) {
      throw new Error("토큰 사용자가 존재하지 않습니다.");
    }

    // req.user에 사용자 정보를 저장합니다.
    req.user = user;

    //다음 작업 미들웨어를 호출합니다.
    next();
  } catch (error) {
    // 토큰이 만료되었거나, 조작되었을 때, 에러 메시지 출력합니다.
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
