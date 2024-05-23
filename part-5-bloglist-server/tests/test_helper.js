const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
  {
    title: "Pasta alla gricia",
    author: "Riri",
    url: "https://www.recipesfromitaly.com/pasta-alla-gricia/",
    likes: 4,
  },
  {
    title: "Korvapuusti",
    author: "Fifi",
    url: "https://www.thespruceeats.com/finnish-cinnamon-pastries-korvapuusti-2952710",
    likes: 8,
  },
];

const allBlogs = async () => {
  const blogs = await Blog.find({});
  return blogs.map((o) => o.toJSON());
};

const allUsers = async () => {
  const users = await User.find({});
  return users.map((o) => o.toJSON());
};

const nonExistingId = async () => {
  const blog = new Blog({ title: "willremovethissoon" });
  await blog.save();
  await blog.deleteOne();
  return blog._id.toString();
};

module.exports = {
  initialBlogs,
  allBlogs,
  allUsers,
  nonExistingId,
};
