import { useState } from "react";

const CreateBlogForm = ({ handleCreateBlog }) => {
  const [inputTitle, setInputTitle] = useState("");
  const [inputAuthor, setInputAuthor] = useState("");
  const [inputUrl, setInputUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreateBlog({
      title: inputTitle,
      author: inputAuthor,
      url: inputUrl,
    });
    setInputTitle("");
    setInputAuthor("");
    setInputUrl("");
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h3>Create new blog</h3>
        <div>
          <label>
            title
            <input
              type="text"
              value={inputTitle}
              name="title"
              onChange={({ target }) => setInputTitle(target.value)}
              autoComplete="off"
              required
            />
          </label>
        </div>
        <div>
          <label>
            author
            <input
              type="text"
              value={inputAuthor}
              name="author"
              onChange={({ target }) => setInputAuthor(target.value)}
              autoComplete="off"
            />
          </label>
        </div>
        <div>
          <label>
            url
            <input
              type="text"
              value={inputUrl}
              name="url"
              onChange={({ target }) => setInputUrl(target.value)}
              autoComplete="off"
              required
            />
          </label>
        </div>
        <button>create</button>
      </form>
    </>
  );
};

export default CreateBlogForm;
