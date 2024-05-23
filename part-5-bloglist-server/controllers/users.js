const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response, next) => {
  try {
    const users = await User.find({}).populate("blogs", {
      url: 1,
      title: 1,
      author: 1,
    });
    response.json(users);
  } catch (err) {
    next(err);
  }
});

usersRouter.post("/", async (req, res, next) => {
  const { username, name, password } = req.body;
  const saltRounds = 10;

  try {
    if (!username || !password) {
      throw new Error("`username` and `password` are required", {
        cause: "UsernameOrPasswordMissing",
      });
    }

    if (username.length < 3 || password.length < 3) {
      throw new Error(
        "`username` and `password` must be at least 3 characters long",
        {
          cause: "UsernameOrPasswordTooShort",
        }
      );
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    next(err);
  }
});

module.exports = usersRouter;
