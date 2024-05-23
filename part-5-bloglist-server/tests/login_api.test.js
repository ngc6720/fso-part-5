const { test, beforeEach, after, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const app = require("../app");
const supertest = require("supertest");
const api = supertest(app);
const User = require("../models/user");
const bcrypt = require("bcrypt");

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("sekret", 10);
  const user = new User({ username: "root", passwordHash });

  await user.save();
});

after(async () => {
  await mongoose.connection.close();
});

describe("login", () => {
  test("if valid credentialc return status 200 with token and username", async () => {
    const inputUsername = "root";
    const inputPassword = "sekret";

    const {
      body: { token, username },
    } = await api
      .post("/api/login")
      .send({ username: inputUsername, password: inputPassword })
      .expect(200)
      .expect("Content-Type", /application\/json/);
    assert.strictEqual(username, inputUsername);
    assert(token);
  });

  test("if invalid username return status 401 with message", async () => {
    const result = await api
      .post("/api/login")
      .send({ username: "ldjskhfjhqdfjkl", password: "sekret" })
      .expect(401)
      .expect("Content-Type", /application\/json/);

    assert(result.body.error.includes("invalid username or password"));
    assert(!result.body.token);
  });

  test("if invalid password return status 401 with message", async () => {
    const result = await api
      .post("/api/login")
      .send({ username: "root", password: "ldjskhfjhqdfjkl" })
      .expect(401)
      .expect("Content-Type", /application\/json/);

    assert(result.body.error.includes("invalid username or password"));
    assert(!result.body.token);
  });
});
