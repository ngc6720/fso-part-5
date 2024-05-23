const { test, expect, describe, beforeEach } = require("@playwright/test");
import { loginWith, createBlog } from "./helper";

const userCred = {
  name: "Oui Oui",
  username: "ouioui",
  password: "123",
};

const blogData = {
  title: "A beautiful title",
  author: "A very good author",
  url: "www.youhouuu.youhouuu",
};

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("/api/testing/reset");
    await request.post("/api/users", {
      data: userCred,
    });
    await page.goto("/");
  });

  test("Login form is shown", async ({ page }) => {
    const form = await page.locator("form", { hasText: "usernamepassword" });
    await expect(form).toBeVisible();
    await expect(form.getByRole("textbox", { name: "username" })).toBeVisible();
    await expect(form.getByRole("textbox", { name: "password" })).toBeVisible();
    await expect(form.getByRole("button", { type: "submit" })).toBeVisible();
  });

  describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await loginWith(page, userCred);
      await expect(page.getByText(`Logged in`)).toBeVisible();
    });

    test("fails with wrong credentials", async ({ page }) => {
      await loginWith(page, { username: "ouioui", password: "wrongpassword" });
      await expect(page.getByText(`wrong credentials`)).toBeVisible();
    });
  });

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, userCred);
    });

    test("a new blog can be created", async ({ page }) => {
      await page.getByRole("button", { name: "create new blog" }).click();
      await createBlog(page, blogData);
      await expect(
        page.getByRole("list").getByRole("listitem", {
          hasText: `${blogData.author}${blogData.title}`,
        })
      ).toBeVisible();
    });
    describe("and there is a blog", () => {
      beforeEach(async ({ page }) => {
        await page.getByRole("button", { name: "create new blog" }).click();
        await createBlog(page, blogData);
      });
      test("a blog can be liked", async ({ page }) => {
        const blog = await page.getByRole("list").getByRole("listitem", {
          hasText: `${blogData.author}${blogData.title}`,
        });
        await blog.getByRole("button", { expanded: false }).click();
        await expect(blog.getByText("Likes:")).toHaveText("Likes: 0");
        await blog.getByRole("button", { name: "like" }).click();
        await expect(blog.getByText("Likes:")).toHaveText("Likes: 1");
      });

      test("the user who posted it can delete the blog", async ({ page }) => {
        page.once("dialog", async (dialog) => {
          await dialog.accept();
        });
        const blog = await page.getByRole("list").getByRole("listitem", {
          hasText: `${blogData.author}${blogData.title}`,
        });
        await blog.getByRole("button", { expanded: false }).click();
        await blog.getByRole("button", { name: "remove" }).click();
        await expect(page.getByText("deleted")).toBeVisible();
        await expect(
          page.getByRole("list").getByRole("listitem", {
            hasText: `${blogData.author}${blogData.title}`,
          })
        ).not.toBeVisible();
      });

      test("only the user who added the blog can see the remove button", async ({
        page,
        request,
      }) => {
        const otherUserCred = {
          name: "Lou Lou",
          username: "loulou",
          password: "321",
        };
        await request.post("/api/users", {
          data: otherUserCred,
        });
        await page.getByRole("button", { name: "log out" }).click();
        await loginWith(page, otherUserCred);
        const blog = await page.getByRole("list").getByRole("listitem", {
          hasText: `${blogData.author}${blogData.title}`,
        });
        await blog.getByRole("button", { expanded: false }).click();
        await expect(
          page.getByRole("button", { name: "remove" })
        ).not.toBeVisible();
      });
    });
    test("blogs list is rearranged according to likes descending order", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "create new blog" }).click();

      await createBlog(page, { title: "blog2", author: "bbb", url: "url" });
      await createBlog(page, { title: "blog3", author: "ccc", url: "url" });
      await createBlog(page, { title: "blog1", author: "aaa", url: "url" });

      await page
        .getByRole("listitem")
        .nth(0)
        .getByRole("button", { expanded: false })
        .click();
      await page
        .getByRole("listitem")
        .nth(1)
        .getByRole("button", { expanded: false })
        .click();
      await page
        .getByRole("listitem")
        .nth(2)
        .getByRole("button", { expanded: false })
        .click();

      await expect(
        page.getByRole("list").getByRole("listitem").nth(0).getByText("blog")
      ).toHaveText("blog2");
      await expect(
        page.getByRole("list").getByRole("listitem").nth(1).getByText("blog")
      ).toHaveText("blog3");
      await expect(
        page.getByRole("list").getByRole("listitem").nth(2).getByText("blog")
      ).toHaveText("blog1");

      await page
        .getByRole("listitem")
        .filter({ hasText: "blog2" })
        .getByRole("button", { name: "like" })
        .click();

      await expect(
        page
          .getByRole("listitem")
          .filter({ hasText: "blog2" })
          .getByText("Likes:")
      ).toHaveText("Likes: 1");

      await page
        .getByRole("listitem")
        .filter({ hasText: "blog2" })
        .getByRole("button", { name: "like" })
        .click();

      await expect(
        page
          .getByRole("listitem")
          .filter({ hasText: "blog2" })
          .getByText("Likes:")
      ).toHaveText("Likes: 2");

      await expect(
        page.getByRole("list").getByRole("listitem").nth(0).getByText("Likes:")
      ).toHaveText("Likes: 2");

      await expect(
        page.getByRole("list").getByRole("listitem").nth(0).getByText("blog")
      ).toHaveText("blog2");

      await page
        .getByRole("listitem")
        .filter({ hasText: "blog1" })
        .getByRole("button", { name: "like" })
        .click();

      await expect(
        page
          .getByRole("listitem")
          .filter({ hasText: "blog1" })
          .getByText("Likes:")
      ).toHaveText("Likes: 1");

      await page
        .getByRole("listitem")
        .filter({ hasText: "blog1" })
        .getByRole("button", { name: "like" })
        .click();

      await expect(
        page
          .getByRole("listitem")
          .filter({ hasText: "blog1" })
          .getByText("Likes:")
      ).toHaveText("Likes: 2");

      await page
        .getByRole("listitem")
        .filter({ hasText: "blog1" })
        .getByRole("button", { name: "like" })
        .click();

      await expect(
        page
          .getByRole("listitem")
          .filter({ hasText: "blog1" })
          .getByText("Likes:")
      ).toHaveText("Likes: 3");

      await expect(
        page.getByRole("list").getByRole("listitem").nth(0).getByText("blog")
      ).toHaveText("blog1");
      await expect(
        page.getByRole("list").getByRole("listitem").nth(1).getByText("blog")
      ).toHaveText("blog2");
      await expect(
        page.getByRole("list").getByRole("listitem").nth(2).getByText("blog")
      ).toHaveText("blog3");

      await page.reload();

      await expect(
        page.getByRole("list").getByRole("listitem").nth(0).getByText("blog")
      ).toHaveText("blog1");
      await expect(
        page.getByRole("list").getByRole("listitem").nth(1).getByText("blog")
      ).toHaveText("blog2");
      await expect(
        page.getByRole("list").getByRole("listitem").nth(2).getByText("blog")
      ).toHaveText("blog3");
    });
  });
});
