import { useState, useMemo } from "react";

const Blog = ({ user, blog, handleLike, handleRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const buttonLabel = useMemo(
    () => (isExpanded ? "hide" : "show"),
    [isExpanded]
  );

  const onLike = () =>
    handleLike(blog.id, {
      likes: blog.likes + 1,
    });

  const onRemove = () => {
    handleRemove(blog.id);
  };
  const blogStyle = {
    padding: "0.5rem",
    border: "solid",
    borderWidth: 1,
    margin: "0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
  };

  return (
    <li className="blog" style={blogStyle}>
      <div className="main-content" style={headerStyle}>
        <span>
          <span>{blog.title}</span>, by <span>{blog.author} </span>
        </span>
        <button
          className="toggle-expand"
          type="button"
          aria-expanded={isExpanded ? true : false}
          aria-controls={`expandable-${blog.id}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {buttonLabel}
        </button>
      </div>
      <div
        id={`expandable-${blog.id}`}
        className="expandable-content"
        style={isExpanded ? {} : { display: "none" }}
      >
        {isExpanded && (
          <>
            <a style={{ width: "fit-content" }} href={blog.url}>
              {blog.url}
            </a>
            <div>
              <span>Likes: {blog.likes}</span>
              <button className="like" onClick={onLike}>
                like
              </button>
            </div>
            <div>Added by {blog.user.name}</div>
            {user?.id && blog.user.id === user.id && (
              <button onClick={onRemove}>remove</button>
            )}
          </>
        )}
      </div>
    </li>
  );
};

export default Blog;
