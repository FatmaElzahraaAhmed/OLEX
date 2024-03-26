const nodemailer = require('nodemailer');


async function sendEmail(dest,message,attachment=null){
 let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false, 
    auth: {
      user: process.env.senderEmail,
      pass: process.env.senderPass,
    }
  });

  let info = await transporter.sendMail({
    from: `Fred Foo 👻" <${process.env.senderEmail}>`,
    to: dest, 
    subject: "Hello ✔",
    text: "Hello world?", 
    html: message,
    attachments:attachment,
  });
}


module.exports = sendEmail;