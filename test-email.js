const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bingobotconversa@gmail.com',
    pass: 'xamhxricnymzhvwr'
  }
});

transporter.sendMail({
  from: '"Bingo Botconversa" <bingobotconversa@gmail.com>',
  to: 'wilton@botconversa.com.br',
  subject: 'Teste - Recuperação de Senha Bingo',
  html: '<h2>Teste</h2><p>Se você recebeu este email, o envio está funcionando!</p>'
}).then(info => {
  console.log('EMAIL ENVIADO:', info.response);
}).catch(err => {
  console.error('ERRO:', err.message);
});
