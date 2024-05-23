import { expect } from "@playwright/test";

const loginWith = async (page, { username, password }) => {
  const form = await page.locator("form", { hasText: "usernamepassword" });
  await form.getByRole("textbox", { name: "username" }).fill(username);
  await form.getByRole("textbox", { name: "password" }).fill(password);
  await form.getByRole("button", { type: "submit" }).click();
};

const createBlog = async (page, { title, author, url }) => {
  const form = await page.locator("form", { hasText: "titleauthorurl" });
  await form.getByRole("textbox", { name: "title" }).fill(title);
  await form.getByRole("textbox", { name: "author" }).fill(author);
  await form.getByRole("textbox", { name: "url" }).fill(url);
  await form.getByRole("button", { type: "submit" }).click();
  await page.getByText(title).waitFor();
};

export { loginWith, createBlog };
