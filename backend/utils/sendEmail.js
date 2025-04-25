const nodemailer = require("nodemailer");

module.exports = async (userEmail, subject, htmlTemplate) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APP_EMAIL_ADDRESS,
        pass: process.env.APP_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.APP_EMAIL_ADDRESS,
      to: userEmail,
      subject,
      html: htmlTemplate,
    };

    const { response } = await transporter.sendMail(mailOptions);
    console.log(response);
  } catch (error) {
    console.log(error);
    throw new Error("Internal Server Error (nodemailer)!");
  }
};
