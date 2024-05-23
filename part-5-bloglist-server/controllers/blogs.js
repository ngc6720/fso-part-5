const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await Blog.find({}).populate("user", {
      username: 1,
      name: 1,
    });
    res.json(blogs);
  } catch (err) {
    next(err);
  }
});

blogRouter.post("/", async (req, res, next) => {
  const newBlogObject = req.body;
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "token invalid" });

    const hasRequiredProps = (b) =>
      ["title", "url"].every((k) => Object.keys(b).includes(k));

    if (!hasRequiredProps(newBlogObject)) {
      return res.status(400).json({
        error: "blogpost `title` and `url` are required",
      });
    }

    if (!Object.hasOwn(newBlogObject, "likes")) newBlogObject.likes = 0;

    newBlogObject.user = user.id;

    const blog = new Blog(newBlogObject);
    const savedBlog = await blog.save();

    user.blogs = [...user.blogs, savedBlog._id];
    await user.save();

    await savedBlog.populate("user", {
      username: 1,
      name: 1,
    });

    res.status(201).json(savedBlog);
  } catch (err) {
    next(err);
  }
});

blogRouter.delete("/:id", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "token invalid" });

    const blogToDelete = await Blog.findById(req.params.id);

    if (blogToDelete.user.toString() !== user.id.toString()) {
      return res
        .status(401)
        .json({ error: "current user is not the creator of this blog" });
    }

    const result = await Blog.findByIdAndDelete(blogToDelete.id);
    if (!result) return res.status(400).end();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

blogRouter.put("/:id", async (req, res, next) => {
  // const user = req.user;
  // if (!user) return res.status(401).json({ error: "token invalid" });

  const blog = req.body;

  if (!blog.likes || typeof blog.likes !== "number") {
    return res.status(400).json({
      error: "property likes is invalid",
    });
  }

  try {
    const result = await Blog.findByIdAndUpdate(req.params.id, blog, {
      new: true,
      runValidators: true,
      context: "query",
    }).populate("user", {
      username: 1,
      name: 1,
    });
    if (result) res.json(result);
    else return res.status(400).end();
  } catch (err) {
    next(err);
  }
});

module.exports = blogRouter;
