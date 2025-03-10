import { test, expect } from '@playwright/test';
import imap from 'imap-simple';

// Fetch OTP from Gmail using IMAP
const getOTPFromGmailIMAP = async () => {
  const config = {
    imap: {
      user: 'processtauhidtestbilling@gmail.com',  // Replace with your Gmail address
      password: '......', // Generate an app password from Google account
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }, // Disable certificate validation
      authTimeout: 10000,
    },
  };

  const connection = await imap.connect(config);
  await connection.openBox('INBOX');

  const searchCriteria = ['UNSEEN', ['SUBJECT', 'Your OTP Code']];
  const fetchOptions = { bodies: ['TEXT'], markSeen: true };

  // Fetch unread messages with OTP subject
  const messages = await connection.search(searchCriteria, fetchOptions);

  if (!messages.length) {
    console.log('No OTP email found.');
    return null;
  }

  const emailBody = messages[0].parts[0].body;
  const otpMatch = emailBody.match(/\b\d{6}\b/); // OTP is assumed to be a 6-digit code
  return otpMatch ? otpMatch[0] : null;
};

// Playwright Test: Automate login and fetch OTP
test('test', async ({ page }) => {
  // Go to the login page
  await page.goto("https://accounts.pay2me.co/login");

  // Fill email and password fields
  await page.locator("//input[@id='email']").fill('processtauhidtestbilling@gmail.com');
  await page.locator("//input[@id='password']").fill('.....');  // Replace with actual password

  // Click 'Sign In' button
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for the OTP input field to appear
  console.log('Waiting for OTP input field...');

  // Wait for a short period to ensure the OTP email has time to arrive
  await page.waitForTimeout(5000); // Wait for 5 seconds for OTP email to arrive

  // Fetch OTP from Gmail
  const otp = await getOTPFromGmailIMAP();
  if (!otp) {
    throw new Error('OTP not received!');
  }

  console.log('OTP received:', otp);

  // Fill OTP in the OTP input field
  await page.locator('input[type="text"]').fill(otp);

  // Click the 'Verify' button to submit OTP
  await page.getByRole('button', { name: 'Verify' }).click();
  console.log("Verify button clicked!");
});
