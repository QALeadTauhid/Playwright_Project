import { google } from 'googleapis';
import readlineSync from 'readline-sync';
import fs from 'fs';
import path from 'path';

// Path to your credentials.json file downloaded from Google Developer Console
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Scopes required to access Gmail
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// Token path to save the user’s OAuth2 credentials
const TOKEN_PATH = path.join(__dirname, 'token.json');

// Load client secrets from a local file.
const getClientSecret = async () => {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  return JSON.parse(content.toString());
};

// Authorize and get an OAuth2 client
const authorize = async () => {
  const credentials = await getClientSecret();
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token.toString()));
    return oAuth2Client;
  }

  // If no token, request authorization from the user
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url: ', authUrl);
  const code = readlineSync.question('Enter the code from that page here: ');

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log('Token stored to', TOKEN_PATH);
  return oAuth2Client;
};

// Fetch the OTP from Gmail (search for OTP emails)
const getOTPFromGmail = async () => {
  const auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth });

  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread subject:"Your OTP Code"',
  });

  if (!res.data.messages) {
    console.log('No OTP email found.');
    return null;
  }

  const messageId = res.data.messages[0].id;
  const msg = await gmail.users.messages.get({ userId: 'me', id: messageId });

  const emailBody = msg.data.snippet; // Extract email preview text
  const otpMatch = emailBody.match(/\b\d{6}\b/); // Match a 6-digit OTP code
  
  return otpMatch ? otpMatch[0] : null;
};

// Example usage in Playwright test
import { test } from '@playwright/test';

test('fetch OTP and login', async ({ page }) => {
  // Navigate to login page
  await page.goto('https://accounts.pay2me.co/login');
  
  // Fill in the login form
  await page.locator('input[name="email"]').fill('qaliveauth12354986@yopmail.com');
  await page.locator('input[name="password"]').fill('-----');
  await page.locator('button[type="submit"]').click();

  // Wait for OTP field and fetch OTP from Gmail
  const otp = await getOTPFromGmail();
  if (!otp) {
    throw new Error('OTP not received!');
  }

  console.log('OTP received:', otp);

  // Fill OTP and submit
  await page.locator('input[name="otp"]').fill(otp);
  await page.locator('button[type="submit"]').click();
});
