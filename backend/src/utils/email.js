const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const envoyerEmail = async (options) => {
  const mailOptions = {
    from: `Afrimercato <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

const envoyerEmailConfirmation = async (email, nom, token) => {
  const confirmationUrl = `http://localhost:3000/confirmation-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px; background: #1a73e8; color: white; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 30px; background: #1a73e8; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Afrimercato</h1>
        </div>
        <div class="content">
          <h2>Bienvenue ${nom} !</h2>
          <p>Merci de vous être inscrit sur Afrimercato. Pour activer votre compte, cliquez sur le bouton ci-dessous :</p>
          <p style="text-align: center;">
            <a href="${confirmationUrl}" class="button">Confirmer mon email</a>
          </p>
          <p>Ou copiez ce lien dans votre navigateur :</p>
          <p>${confirmationUrl}</p>
          <p><strong>Ce lien expire dans 48 heures.</strong></p>
        </div>
        <div class="footer">
          <p>© 2026 Afrimercato. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await envoyerEmail({
    email,
    subject: 'Confirmez votre adresse email - Afrimercato',
    html,
  });
};

module.exports = { envoyerEmailConfirmation };