import { useState, useEffect, useRef, useMemo } from "react";
import loginService from "./services/login";
import blogService from "./services/blogs";
import Notification from "./components/Notification";
import Blog from "./components/Blog";
import LoginForm from "./components/LoginForm";
import CreateBlogForm from "./components/CreateBlogForm";
import Togglable from "./components/Togglable";

const App = () => {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);

  const blogsSortedByLikes = useMemo(
    () => blogs.toSorted((a, b) => b.likes - a.likes),
    [blogs]
  );

  const createBlogFormTogglableRef = useRef(null);

  const [notification, setNotification] = useState(null);
  const timerRef = useRef(null);

  const notify = (notif) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setNotification(notif);
    timerRef.current = setTimeout(() => setNotification(null), 5000);
  };

  // clear timeout on unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // auth
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogappUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  // display blogs on first mount
  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs));
  }, [user]);

  const handleLogin = async (loginObj) => {
    try {
      const user = await loginService.login(loginObj);
      window.localStorage.setItem("loggedBlogappUser", JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);

      notify({ type: "success", message: `Logged in as '${user.name}'` });
    } catch (exception) {
      notify({ type: "error", message: "Wrong credentials" });
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("loggedBlogappUser");
    setUser(null);
    blogService.setToken(null);
    notify({ type: "success", message: `Logged out successfully` });
  };

  const handleCreateBlog = async (blogObj) => {
    try {
      const newBlog = await blogService.create(blogObj);
      console.log(newBlog);
      setBlogs([...blogs, newBlog]);
      // createBlogFormTogglableRef.current.toggleVisibility();
      notify({ type: "success", message: "New blog created !" });
    } catch (e) {
      notify({ type: "error", message: "Could not create blog" });
    }
  };

  const handleLike = async (id, o) => {
    try {
      const blog = await blogService.update(id, o);
      const index = blogs.findIndex((b) => b.id === id);
      setBlogs([
        ...blogs.slice(0, index),
        blog,
        ...blogs.slice(index + 1, blogs.length),
      ]);
    } catch (e) {
      notify({ type: "error", message: "Error while updating blog" });
    }
  };

  const handleRemove = async (id) => {
    const index = blogs.findIndex((b) => b.id === id);
    const title = blogs[index].title;
    if (window.confirm(`Delete '${title}' ?`))
      try {
        await blogService.remove(id);
        setBlogs([
          ...blogs.slice(0, index),
          ...blogs.slice(index + 1, blogs.length),
        ]);
        notify({ type: "success", message: `Deleted '${title}' successfully` });
      } catch (e) {
        notify({ type: "error", message: "Error while deleting blog" });
      }
  };

  return (
    <main>
      <Notification notification={notification}></Notification>
      <h1>BlogsBlogsBlogs</h1>
      {user === null ? (
        <LoginForm handleLogin={handleLogin} />
      ) : (
        <>
          Logged in as {user.name}
          <button
            onClick={handleLogout}
            style={{ marginLeft: "0.5rem", marginBottom: "0.5rem" }}
          >
            log out
          </button>
          <Togglable
            ref={createBlogFormTogglableRef}
            buttonLabel="create new blog"
          >
            <CreateBlogForm handleCreateBlog={handleCreateBlog} />
          </Togglable>
        </>
      )}

      <h3 style={{ marginTop: "2rem" }}> The beautiful blogs</h3>
      <ul>
        {blogsSortedByLikes.map((blog) => (
          <Blog
            key={blog.id}
            user={user}
            blog={blog}
            handleLike={handleLike}
            handleRemove={handleRemove}
          />
        ))}
      </ul>
    </main>
  );
};

export default App;
