const { test, describe, after, before } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const app = require("../app");
const supertest = require("supertest");
const api = supertest(app);
const helper = require("./test_helper");
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const users = [
  { user: null, token: "" },
  { user: null, token: "" },
];

after(async () => {
  await mongoose.connection.close();
});

// blogs and users info when creating blogs before getting users and blogs
describe("populating user and blogs", async () => {
  // initial db : 2 users
  before(async () => {
    await User.deleteMany({});
    await Blog.deleteMany({});

    await Promise.all(
      users.map(async (_, i) => {
        const user = new User({ username: "root" + i, password: "password" });
        users[i].user = await user.save();

        const userForToken = {
          username: user.username,
          id: user._id,
        };

        users[i].token = jwt.sign(userForToken, process.env.SECRET, {
          expiresIn: 60 * 60,
        });
      })
    );
  });

  test("adding a blog appends the blog id to the user and the user id to the blog", async () => {
    const { body: blog } = await api
      .post("/api/blogs")
      .set({ authorization: "Bearer " + users[0].token })
      .send(helper.initialBlogs[0])
      .expect(201)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(blog.user, users[0].user.id);
    const user = await User.findById(users[0].user.id);
    assert.strictEqual(blog.id, user.blogs[0].toString());
  });

  test("blogs returned also contain the creator user's info", async () => {
    const { body: blogs } = await api.get("/api/blogs");
    assert(Object.hasOwn(blogs[0], "user"));
    const userObj = blogs[0].user;
    assert(Object.hasOwn(userObj, "id"));
    assert(Object.hasOwn(userObj, "username"));
  });

  test("blogs returned only contain the creator user's info", async () => {
    const { body: blogs } = await api.get("/api/blogs");
    assert(Object.hasOwn(blogs[0], "user"));
    assert.notStrictEqual(blogs[0].user.id, users[1].user.id);
  });

  test("users returned also contain the user's created blogs info", async () => {
    const { body: users } = await api.get("/api/users");
    assert(Object.hasOwn(users[0], "blogs"));
    const blogObj = users[0].blogs[0];
    assert(Object.hasOwn(blogObj, "url"));
    assert(Object.hasOwn(blogObj, "title"));
  });

  test("users returned only contain the user's created blogs info", async () => {
    const { body: users } = await api.get("/api/users");
    assert.strictEqual(users[1].blogs.length, 0);
  });
});
