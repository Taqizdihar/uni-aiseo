const { sendInvitationEmail } = require('./utils/email');

async function testEthereal() {
  try {
    console.log("Testing Ethereal Email sending...");
    await sendInvitationEmail("test@example.com", "SEO Analyst", "Local Workspace", "http://localhost:5173/invite/testtoken123");
    console.log("Test complete.");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    process.exit();
  }
}

testEthereal();
