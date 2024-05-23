import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreateBlogForm from "./CreateBlogForm";

const userInputs = {
  title: "My Beautiful Title",
  author: "A very good author",
  url: "www.youhouuuuuuu.youuuuu",
};
describe("<Blog />", () => {
  test("when a blog is submitted, its event handler passed as a prop is called with the right values", async () => {
    const user = userEvent.setup();
    const handleCreateBlog = vi.fn();
    const { container } = render(
      <CreateBlogForm handleCreateBlog={handleCreateBlog}></CreateBlogForm>
    );

    const inputs = Array.from(container.querySelectorAll("input"));
    const inputTitle = inputs.find((i) => i.getAttribute("name") === "title");
    const inputAuthor = inputs.find((i) => i.getAttribute("name") === "author");
    const inputUrl = inputs.find((i) => i.getAttribute("name") === "url");
    const submitButton = container
      .querySelector("form")
      .querySelector("button");

    await user.type(inputTitle, userInputs.title);
    await user.type(inputAuthor, userInputs.author);
    await user.type(inputUrl, userInputs.url);
    await user.click(submitButton);

    const { title, author, url } = handleCreateBlog.mock.calls[0][0];

    expect(title).toBe(userInputs.title);
    expect(author).toBe(userInputs.author);
    expect(url).toBe(userInputs.url);
  });
});
