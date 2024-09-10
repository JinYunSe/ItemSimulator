export default (err, req, res, next) => {
  console.log(err);

  // Joi에서 발생한 에러로 유효성 검사에서 발생한 에러이면
  if (err.name === "ValidationError")
    return res
      .status(400)
      .json({ errorMessge: "데이터 형식이 올바르지 않습니다." });

  res.status(500).json({ errorMessage: "서버 내부 에러가 발생했습니다" });
};
