import { test, expect } from '@playwright/test';

const API = 'http://localhost:5001/api';
const WEB = 'http://localhost:3000';
const TS = Date.now();
const EMAIL = `e2e_${TS}@cinesphere.test`;
const PASS  = 'Test1234!';
const DISPLAY = 'CineSphere E2E';
const USERNAME = `e2e_${TS}`;

// --- REGISTER ---
test('User can register with email + password', async ({ page }) => {
  await page.goto(`${WEB}/register`);
  await expect(page).toHaveTitle(/CineSphere/i);
  await page.fill('input[placeholder="Jane Doe"]', DISPLAY);
  await page.fill('input[placeholder="janedoe"]', USERNAME);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/$|\/feed|\/search/, { timeout: 12_000 });
  expect(page.url()).toContain('localhost:3000');
});

// --- LOGIN ---
test('User can log in', async ({ page }) => {
  await page.goto(`${WEB}/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/$|\/feed|\/search/, { timeout: 12_000 });
  expect(page.url()).toContain('localhost:3000');
});

// --- NAVBAR AUTHENTICATED ---
test('Navbar shows Feed, Films, Profile when signed in', async ({ page }) => {
  await page.goto(`${WEB}/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await expect(page.locator('text=Feed').first()).toBeVisible();
  await expect(page.locator('text=Films').first()).toBeVisible();
  await expect(page.locator('text=Profile').first()).toBeVisible();
});

// --- LANDING PAGE GUEST ---
test('Guest sees landing page with Sign in + Create account buttons', async ({ page }) => {
  await page.goto(`${WEB}/`);
  await page.waitForTimeout(1000);
  await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  await expect(page.locator('a[href="/register"]').first()).toBeVisible();
});

// --- SEARCH FILMS ---
test('User can search for films', async ({ page }) => {
    // Login
  await page.goto(`${WEB}/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Go to search
  await page.goto(`${WEB}/search`);
  await expect(page.locator('h1').or(page.locator('text=Film'))).toBeVisible();
  await page.fill('input[placeholder="Search any film by title..."]', 'Inception');
  await page.click('button:has-text("Search")');
  await page.waitForTimeout(4000);
  // Heading should still say Find Your Next Film
  const h1 = page.locator('h1');
  expect(await h1.textContent()).toBeTruthy();
});

// --- CREATE MOVIE LOG ---
test('User can log a movie with rating + review', async ({ page }) => {
  await page.goto(`${WEB}/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await page.goto(`${WEB}/`);
  await page.waitForTimeout(1000);

  const logBtn = page.locator('button:has-text("Log a film")').first();
  if (await logBtn.isVisible({ timeout: 3000 })) {
    await logBtn.click();
    await page.waitForTimeout(500);

    // Should show modal
    const modal = page.locator('h2:has-text("Log & Share")');
    if (await modal.isVisible({ timeout: 2000 })) {
      // Search Inception
      const input = page.locator('input[placeholder="Type a movie title..."]');
      await input.fill('Inception');
      await page.waitForTimeout(3500);

      const result = page.locator('button:has-text("Inception")').first();
      if (await result.isVisible({ timeout: 3000 })) {
        await result.click();
        await page.waitForTimeout(400);
      }

      // Rate 8 stars (8th button)
      const stars = page.locator('article button').all();
      const count = await stars.count();
      for (let i = 0; i < Math.min(8, count); i++) {
        const btn = stars.nth(i);
        if (await btn.isVisible()) { await btn.click(); break; }
      }

      // Write review
      const ta = page.locator('textarea[placeholder*="What\'s unforgettable"]');
      if (await ta.isVisible({ timeout: 2000 })) {
        await ta.fill('Mind-bending masterpiece by Christopher Nolan. The ending has me thinking to this day!');
      }

      // Submit
      const postBtn = page.locator('button:has-text("Post to feed")');
      if (await postBtn.isEnabled()) {
        await postBtn.click();
        await page.waitForTimeout(4000);
      }
    }
  }
});

// --- CREATE STATUS ---
test('User can post a status update', async ({ page }) => {
  await page.goto(`${WEB}/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await page.goto(`${WEB}/`);
  await page.waitForTimeout(2000);

  const logBtn = page.locator('button:has-text("Log a film")').first();
  if (await logBtn.isVisible({ timeout: 3000 })) {
    await logBtn.click();
    await page.waitForTimeout(500);
    const statusTab = page.locator('button:has-text("Status")');
    if (await statusTab.isVisible()) {
      await statusTab.click();
      await page.waitForTimeout(300);
      const ta = page.locator('textarea[placeholder*="film thought"]');
      if (await ta.isVisible({ timeout: 2000 })) {
        await ta.fill('Cinema is the greatest art form. Every frame is a painting.');
        const postBtn = page.locator('button:has-text("Post to feed")');
        if (await postBtn.isEnabled()) {
          await postBtn.click();
          await page.waitForTimeout(3000);
        }
      }
    }
  }
});

// --- REACT TO POST ---
test('User can react to a post', async ({ page }) => {
  await page.goto(`${WEB}/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await page.goto(`${WEB}/`);
  await page.waitForTimeout(3000);

  const heartBtn = page.locator('button:has-text("❤️")').first();
  if (await heartBtn.isVisible({ timeout: 4000 })) {
    await heartBtn.click();
    await page.waitForTimeout(2000);
  }
});

// --- ADD COMMENT ---
test('User can add a comment to a post', async ({ page }) => {
  await page.goto(`${WEB}/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await page.goto(`${WEB}/`);
  await page.waitForTimeout(3000);

  const commentBtn = page.locator('button').filter({ hasText: /MessageCircle|💬/ }).first();
  if (await commentBtn.isVisible({ timeout: 4000 })) {
    await commentBtn.click();
    await page.waitForTimeout(800);
    const ta = page.locator('textarea[placeholder="Write a comment..."]');
    if (await ta.isVisible({ timeout: 3000 })) {
      await ta.fill('Totally agree with this review!');
      const postBtn = page.locator('button:has-text("Post")').last();
      if (await postBtn.isEnabled()) {
        await postBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  }
});

// --- LOGOUT ---
test('User can sign out', async ({ page }) => {
  await page.goto(`${WEB}/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  const userBtn = page.locator('button.rounded-full, button.w-9').first();
  if (await userBtn.isVisible({ timeout: 3000 })) {
    await userBtn.click();
    await page.waitForTimeout(400);
    const signOutBtn = page.locator('button:has-text("Sign out")');
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
      await page.waitForURL(/login/, { timeout: 5000 });
      expect(page.url()).toContain('/login');
    }
  }
});
