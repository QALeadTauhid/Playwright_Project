import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://www.paytome.co/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Online Business and Invoice Management: PayToMe/);
});

// test('Click Get Started link', async ({ page }) => {
//     test.setTimeout(60000); // Extend timeout
//     await page.goto('https://www.paytome.co/', { timeout: 60000 });
//     await page.waitForLoadState('networkidle');
  
//     // Debug available links
//     const links = await page.getByRole('link').allInnerTexts();
//     console.log('Available links:', links);
  
//     // Wait for the link and click
//     const signInLink = await page.getByRole('link', { name: /pricing/ });
//     await signInLink.waitFor({ state: 'visible' });
//     await signInLink.scrollIntoViewIfNeeded();
//     await signInLink.click();
  
//     // Ensure navigation happens
//     await page.waitForLoadState('domcontentloaded');
//     await expect(page).toHaveURL(/login|signup|dashboard/);
//   });
  
test('test', async ({ page }) => {
    await page.goto("https://accounts.pay2me.co/login");

    await page.locator("//input[@id='email']").fill('qaliveauth12354986@yopmail.com');
    await page.locator("//input[@id='password']").fill('-----');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for OTP input field (adjust selector if needed)
    await page.waitForSelector('input[type="text"]', { timeout: 50000 });

    // Manually enter OTP
    console.log("Please enter OTP manually...");
    await page.waitForTimeout(10000); // 10 sec delay for manual OTP entry

    // Ensure Verify button is enabled
    await page.waitForFunction(() => {
        const btn = document.querySelector('button[type="submit"]');
        return btn && !btn.disabled;
    });

    await page.getByRole('button', { name: 'Verify' }).click();
    console.log("Verify button clicked!");
});
