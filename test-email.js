require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

resend.emails.send({
  from: 'Relationship Journey <notifications@uspath.app>',
  to: ['nguyenngocdai291@gmail.com'],
  subject: 'Test Verification',
  html: '<p>If you get this, Resend works perfectly.</p>'
}).then((data) => {
  console.log('Success:', data);
}).catch((err) => {
  console.error('Error:', err);
});
