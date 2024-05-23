var _ = require("lodash");

const totalLikes = (blogs) => blogs.reduce((a, b) => a + b.likes, 0);

const favoriteBlog = (blogs) =>
  blogs.reduce((a, b) => (b.likes > a.likes ? b : a));

const mostBlogs = (blogs) => {
  const counts = _.countBy(blogs, "author");
  const max = _.maxBy(Object.entries(counts), (o) => o[1]);
  return { author: max[0], blogs: max[1] };
};

const mostLikes = (blogs) => {
  const max = _.maxBy(blogs, "likes");
  return {
    author: max.author,
    likes: blogs.reduce(
      (a, b) => (b.author === max.author ? a + b.likes : a),
      0
    ),
  };
};

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
