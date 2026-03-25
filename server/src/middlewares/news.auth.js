module.exports = (req, res, next) => {
  const configuredPassword = process.env.NEWS_ADMIN_PASSWORD;

  if (!configuredPassword) {
    return res.status(500).json({
      status: "error",
      message:
        "NEWS_ADMIN_PASSWORD is not configured. Cannot authorize update/delete.",
    });
  }

  const incomingPassword =
    req.headers["x-news-password"] || req.body?.password || req.query?.password;

  if (!incomingPassword || incomingPassword !== configuredPassword) {
    return res.status(401).json({
      status: "fail",
      message: "Unauthorized. Invalid password.",
    });
  }

  next();
};
