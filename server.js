require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// File upload config
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/:page', (req, res) => {
  const filePath = path.join(__dirname, 'public', `${req.params.page}.html`);
  res.sendFile(filePath);
});


app.post('/job-submit', upload.array('file'), async (req, res) => {
  const { name, profession, email, phone, message } = req.body;

  const transporter = nodemailer.createTransport({
    host: 'send.one.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  

  const mailOptions = {
    from: '"averabemanning.se - jobba" <info@jonias.se>',
    to: 'info@averabemanning.se',
    replyTo: req.body.email,
    subject: `Ny ansökan från ${req.body.name}`,
    text: `
      Namn: ${req.body.name}
      Yrke: ${req.body.profession}
      E-post: ${req.body.email}
      Telefon: ${req.body.phone}
      Meddelande: ${req.body.message}
    `,
    attachments: req.files.map(file => ({
      filename: file.originalname,
      path: file.path
    }))
  };
  

  try {
    await transporter.sendMail(mailOptions);
    res.send("Tack för din ansökan!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Något gick fel.");
  }
});

app.post('/contact-submit', async (req, res) => {
  const { contactName, contactEmail, contactPhone, contactMessage } = req.body;

  if (!contactName || !contactEmail || !contactMessage) {
    return res.status(400).send("Alla fält måste fyllas i.");
  }

  const transporter = nodemailer.createTransport({
    host: 'send.one.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: '"averabemanning.se - kontakt" <info@jonias.se>',
    to: 'info@averabemanning.se',
    replyTo: contactEmail,
    subject: `Nytt meddelande från ${contactName}`,
    text: `
      Namn: ${contactName}
      E-post: ${contactEmail}
      Telefon: ${contactPhone}
      Meddelande: ${contactMessage}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send("Tack för din ansökan!");
  } catch (err) {
    console.error("Mailfel:", err);
    res.status(500).send("Något gick fel.");
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servern körs på http://localhost:${port}`);
});