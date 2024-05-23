const logger = require("../utils/logger");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const requestLogger = (req, res, next) => {
  logger.info("---");
  logger.info("Method:", req.method);
  logger.info("Path:  ", req.path);
  logger.info("Body:  ", req.body);
  logger.info("---");
  next();
};

const unknownRoute = (req, res) => {
  res.status(404).end();
};

const errorHandler = (err, req, res, next) => {
  logger.error(err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "token invalid" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "token expired",
    });
  }

  if (
    req.method === "POST" &&
    err.name === "MongoServerError" &&
    err.message.includes("E11000 duplicate key")
  ) {
    return res.status(400).json({ error: "expected `username` to be unique" });
  }

  if (
    ["UsernameOrPasswordMissing", "UsernameOrPasswordTooShort"].includes(
      err.cause
    )
  ) {
    return res.status(400).json({ error: err.message });
  }

  if (["PUT", "DELETE"].includes(req.method)) {
    return res.status(400).end();
  }

  next(err);
};

const tokenExtractor = (req, res, next) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    req.token = authorization.replace("Bearer ", "");
  }
  next();
};

const userExtractor = async (req, res, next) => {
  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    if (!decodedToken.id) {
      req.user = null;
      next();
    }
    const user = await User.findById(decodedToken.id);
    if (user) req.user = user;
    else req.user = null;
  } catch (err) {
    req.user = null;
  }

  next();
};

module.exports = {
  requestLogger,
  unknownRoute,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
