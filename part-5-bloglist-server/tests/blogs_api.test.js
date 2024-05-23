const { test, describe, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const app = require("../app");
const supertest = require("supertest");
const api = supertest(app);
const helper = require("./test_helper");
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

let token = "";

// initial db : one user has 2 blogs
beforeEach(async () => {
  await User.deleteMany({});
  const user = new User({ username: "root", password: "password" });
  await user.save();

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: 60 * 60,
  });

  await Blog.deleteMany({});
  await Promise.all(
    helper.initialBlogs.map((b) => {
      b.user = user._id;
      const blogObj = new Blog(b);
      return blogObj.save();
    })
  );
});

after(async () => {
  await mongoose.connection.close();
});

describe("getting blogs", () => {
  test("are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const { body: blogs } = await api.get("/api/blogs");
    assert.strictEqual(blogs.length, helper.initialBlogs.length);
  });

  test("the unique identifier property of the blog posts is named 'id'", async () => {
    const { body: blogs } = await api.get("/api/blogs");
    assert(Object.hasOwn(blogs[0], "id"));
  });
});

describe("addition of a blogpost", () => {
  test("success with valid data", async () => {
    const validBlogObject = {
      title: "Tom Ka Gai",
      author: "Loulou",
      url: "https://hot-thai-kitchen.com/tom-ka-gai/",
      likes: 0,
    };

    await api
      .post("/api/blogs")
      .set({ authorization: "Bearer " + token })
      .send(validBlogObject)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogs = await helper.allBlogs();
    assert.strictEqual(blogs.length, helper.initialBlogs.length + 1);
    assert.strictEqual(
      blogs.find((b) => b.title === validBlogObject.title).title,
      validBlogObject.title
    );
  });

  test("fails with statuscode 400 if data invalid", async () => {
    const invalidBlogObject = {
      author: "Loulou",
      likes: 0,
    };
    await api
      .post("/api/blogs")
      .set({ authorization: "Bearer " + token })
      .send(invalidBlogObject)
      .expect(400);
    const blogs = await helper.allBlogs();
    assert.strictEqual(blogs.length, helper.initialBlogs.length);
  });

  test("appends likes: 0 if likes property is missing", async () => {
    const missingLikesBlogObject = {
      title: "Tom Ka Gai",
      author: "Loulou",
      url: "https://hot-thai-kitchen.com/tom-ka-gai/",
    };

    await api
      .post("/api/blogs")
      .set({ authorization: "Bearer " + token })
      .send(missingLikesBlogObject);

    const blogs = await helper.allBlogs();
    assert.strictEqual(
      blogs.find((b) => b.title === missingLikesBlogObject.title).likes,
      0
    );
  });

  test("fails with statuscode 401 if token is invalid", async () => {
    const blogObject = {
      title: "Tom Ka Gai",
      author: "Loulou",
      url: "https://hot-thai-kitchen.com/tom-ka-gai/",
      likes: 0,
    };
    await api
      .post("/api/blogs")
      .set({ authorization: "Bearer wrongToken" })
      .send(blogObject)
      .expect(401);
    const blogs = await helper.allBlogs();
    assert.strictEqual(blogs.length, helper.initialBlogs.length);
  });
});

describe("deletion of a blogpost", () => {
  test("succeeds with statuscode 204 if id is valid", async () => {
    const blogsAtStart = await helper.allBlogs();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ authorization: "Bearer " + token })
      .expect(204);

    const blogsAtEnd = await helper.allBlogs();

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);

    const titles = blogsAtEnd.map((r) => r.title);
    assert(!titles.includes(blogToDelete.title));
  });

  test("fails with statuscode 400 if id does not exist", async () => {
    const validNonexistingId = await helper.nonExistingId();
    await api
      .delete(`/api/blogs/${validNonexistingId}`)
      .set({ authorization: "Bearer " + token })
      .expect(400);
  });

  test("fails with statuscode 400 id is invalid", async () => {
    const invalidId = "5a3d5da59070081a82a3445";
    await api
      .delete(`/api/blogs/${invalidId}`)
      .set({ authorization: "Bearer " + token })
      .expect(400);
  });

  test("fails with statuscode 401 if token is invalid", async () => {
    const blogsAtStart = await helper.allBlogs();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ authorization: "Bearer wrongToken" })
      .expect(401);
  });
});

describe("updating of a blogpost", () => {
  test("succeeds with statuscode 200", async () => {
    const blogsAtStart = await helper.allBlogs();
    const updateObject = { likes: 8 };
    const blogToUpdate = blogsAtStart[0];

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set({ authorization: "Bearer " + token })
      .send(updateObject)
      .expect(200);

    const blogsAtEnd = await helper.allBlogs();

    assert.strictEqual(
      blogsAtEnd.find((b) => b.title === blogToUpdate.title).likes,
      updateObject.likes
    );
  });

  test("fails with statuscode 400 if data is invalid", async () => {
    const blogsAtStart = await helper.allBlogs();
    const updateObject = { likes: "hgdfjslhkkg" };
    const blogToUpdate = blogsAtStart[0];

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set({ authorization: "Bearer " + token })
      .send(updateObject)
      .expect(400);

    const blogsAtEnd = await helper.allBlogs();

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
  });

  test("fails with statuscode 400 if id does not exist", async () => {
    const validNonexistingId = await helper.nonExistingId();
    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .set({ authorization: "Bearer " + token })
      .send({ likes: 8 })
      .expect(400);
  });

  test("fails with statuscode 400 id is invalid", async () => {
    const invalidId = "5a3d5da59070081a82a3445";
    await api
      .put(`/api/blogs/${invalidId}`)
      .set({ authorization: "Bearer " + token })
      .send({ likes: 8 })
      .expect(400);
  });
});
