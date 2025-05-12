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
  res.sendFile(__dirname + `/public/${req.params.page}.html`);
});

app.post('/job-submit', upload.array('file'), async (req, res) => {
  const { name, email, phone, profession, message } = req.body;

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
    from: '"averabemanning.se formulär" <info@jonias.se>', // Måste matcha inloggad SMTP-användare
    to: 'info@jonias.se',                             // Eller annan mottagare inom samma domän
    replyTo: req.body.email,                          // Svar skickas till användaren
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
  const { message, name, email, phone } = req.body;

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
    from: '"averabemanning.se formulär" <info@jonias.se>', // Måste matcha inloggad SMTP-användare
    to: 'info@jonias.se',                             // Eller annan mottagare inom samma domän
    replyTo: req.body.email,                          // Svar skickas till användaren
    subject: `Nytt meddelande från ${req.body.name}`,
    text: `
      Meddelande: ${req.body.message}
      Namn: ${req.body.name}
      E-post: ${req.body.email}
      Telefon: ${req.body.phone}
    `
  };
  

  try {
    await transporter.sendMail(mailOptions);
    res.send("Tack för din ansökan!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Något gick fel.");
  }
});

app.listen(port, () => {
  console.log(`Servern körs på http://localhost:${port}`);
});
