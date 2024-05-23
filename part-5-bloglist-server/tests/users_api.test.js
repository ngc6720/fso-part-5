const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const app = require("../app");
const supertest = require("supertest");
const api = supertest(app);
const helper = require("./test_helper");
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

describe("creating user", () => {
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.allUsers();

    const newUser = {
      username: "Ouioui",
      name: "Oui Oui",
      password: "voiturejaune",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.allUsers();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with statuscode 400 and message if username is missing", async () => {
    const usersAtStart = await helper.allUsers();

    const newUser = {
      username: "",
      name: "Superuser",
      password: "ghjkfdshjkl",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.allUsers();
    assert(
      result.body.error.includes("`username` and `password` are required")
    );

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails with statuscode 400 and message if password is missing", async () => {
    const usersAtStart = await helper.allUsers();

    const newUser = {
      username: "ghjkfdshjkl",
      name: "Superuser",
      password: "",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.allUsers();
    assert(
      result.body.error.includes("`username` and `password` are required")
    );

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails with statuscode 400 and message if password is less than 3 characters", async () => {
    const usersAtStart = await helper.allUsers();

    const newUser = {
      username: "Ouioui",
      name: "Ouioui",
      password: "ou",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.allUsers();
    assert(
      result.body.error.includes(
        "`username` and `password` must be at least 3 characters long"
      )
    );

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails with statuscode 400 and message if username already taken", async () => {
    const usersAtStart = await helper.allUsers();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "ghjkfdshjkl",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.allUsers();
    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

describe("getting users", () => {
  test("are returned as json", async () => {
    await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all users are returned", async () => {
    const { body: users } = await api.get("/api/users");
    assert.strictEqual(users.length, 1);
  });

  test("the unique identifier property of the users is named 'id'", async () => {
    const { body: users } = await api.get("/api/users");
    assert(Object.hasOwn(users[0], "id"));
  });
});
