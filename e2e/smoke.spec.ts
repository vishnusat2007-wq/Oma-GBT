import { test, expect } from "@playwright/test";

test.describe("OmaGBT sign-in", () => {
  test("requires a username and password, and accepts the correct ones", async ({ page }) => {
    await page.goto("/home");
    // Login screen is shown.
    await expect(page.getByRole("heading", { name: "OmaGBT" })).toBeVisible();
    await expect(page.getByText(/Jesvitha/i)).toBeVisible();

    // Wrong credentials are rejected.
    await page.getByLabel("Username").fill("wrong");
    await page.getByLabel("Password", { exact: true }).fill("0000");
    await page.getByRole("button", { name: /Let me in/i }).click();
    await expect(page.getByText(/isn't right/i)).toBeVisible();

    // Correct credentials let Jesvitha in.
    await page.getByLabel("Username").fill("VlovesJ");
    await page.getByLabel("Password", { exact: true }).fill("105441");
    await page.getByRole("button", { name: /Let me in/i }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Jesvitha/i);
  });
});

test.describe("OmaGBT end-to-end (demo mode)", () => {
  // Pre-authenticate so feature tests skip the sign-in screen.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("omagbt.session", "1");
    });
  });

  test("home screen loads with a personalized greeting and rooms", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Jesvitha/i);
    await expect(page.getByRole("link", { name: /Chat/i }).first()).toBeVisible();
    await expect(page.getByText(/Demo mode/i).first()).toBeVisible();
  });

  test("chat: sending a message returns a companion reply", async ({ page }) => {
    await page.goto("/chat");
    const input = page.getByLabel("Type your message");
    await input.fill("hello there");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("hello there")).toBeVisible();
    await expect(page.getByText(/happy to see you|Hi /i).first()).toBeVisible({ timeout: 15000 });
  });

  test("arcade: play a full round of rock-paper-scissors", async ({ page }) => {
    await page.goto("/arcade");
    await page.getByText("Rock Paper Scissors").click();
    await expect(page.getByRole("heading", { name: /Rock/i })).toBeVisible();
    await page.getByRole("button", { name: "✊" }).click();
    await expect(page.getByText(/You win!|I got you!|It's a tie/i)).toBeVisible({ timeout: 10000 });
  });

  test("parent area is PIN protected", async ({ page }) => {
    await page.goto("/parent");
    await expect(page.getByRole("heading", { name: "Parents area" })).toBeVisible();
    await page.getByLabel("Parent PIN").fill("0000");
    await page.getByRole("button", { name: /Unlock/i }).click();
    await expect(page.getByText(/Incorrect PIN/i)).toBeVisible();
    await page.getByLabel("Parent PIN").fill("1234");
    await page.getByRole("button", { name: /Unlock/i }).click();
    await expect(page.getByRole("heading", { name: "Parent dashboard" })).toBeVisible();
  });
});
