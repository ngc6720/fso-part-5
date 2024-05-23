import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Blog from "./Blog";

const user = { id: "123", name: "Lou Lou", username: "Loulou" };
const blog = {
  id: "456",
  user: user,
  author: "Riri",
  title: "My Recipe",
  url: "www.youhou.you",
  likes: "0",
};

describe("<Blog />", () => {
  let container;
  const onLike = vi.fn();

  beforeEach(() => {
    container = render(
      <Blog user={user} blog={blog} handleLike={onLike}>
        {" "}
      </Blog>
    ).container;
  });

  test("renders by default the blog's title and author", () => {
    const title = screen.getByText(blog.title, { exact: false });
    const author = screen.getByText(blog.author, { exact: false });
    expect(title).toBeDefined();
    expect(author).toBeDefined();
  });

  test("does not render by default the blog's likes and url", () => {
    const url = screen.queryByText(blog.url, { exact: false });
    const likes = screen.queryByText(blog.likes, { exact: false });
    expect(url).toBeFalsy();
    expect(likes).toBeFalsy();
  });

  test("after expand button is clicked, likes and url are rendered ", async () => {
    const user = userEvent.setup();
    const button = container.querySelector(".toggle-expand");

    let url = screen.queryByText(blog.url, { exact: false });
    let likes = screen.queryByText(blog.likes, { exact: false });
    expect(url).toBeFalsy();
    expect(likes).toBeFalsy();
    expect(button.hasAttribute("aria-controls")).toBeTruthy();
    expect(button.getAttribute("aria-expanded")).toBe("false");

    await user.click(button);

    url = screen.getByText(blog.title, { exact: false });
    likes = screen.getByText(blog.author, { exact: false });
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(url).toBeDefined();
    expect(likes).toBeDefined();
  });

  test("when like button is clicked twice, its event handler is called twice ", async () => {
    const user = userEvent.setup();
    const buttonToggleExpand = container.querySelector(".toggle-expand");
    await user.click(buttonToggleExpand);
    const buttonLike = container.querySelector(".like");

    await user.click(buttonLike);
    await user.click(buttonLike);

    expect(onLike.mock.calls.length).toBe(2);
  });
});
