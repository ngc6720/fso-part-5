import { useState } from "react";
import PropTypes from "prop-types";

const LoginForm = ({ handleLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin({
      username,
      password,
    });
    setUsername("");
    setPassword("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <label>
        username
        <input
          type="text"
          value={username}
          id="username"
          onChange={({ target }) => setUsername(target.value)}
          autoComplete="off"
        />
      </label>
      <label>
        password
        <input
          type="password"
          value={password}
          id="password"
          onChange={({ target }) => setPassword(target.value)}
          autoComplete="off"
        />
      </label>
      <button type="submit">login</button>
    </form>
  );
};

LoginForm.propTypes = {
  handleLogin: PropTypes.func.isRequired,
};

export default LoginForm;
