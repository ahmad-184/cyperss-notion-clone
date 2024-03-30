import nodemailer from "nodemailer";

const USER = process.env.EMAILSENDER_ADDRESS;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: USER || "",
    pass: process.env.EMAILSENDER_PASS || "",
  },
});

export const emailSender = async ({
  clientEmail,
  html_template,
  subject,
}: {
  clientEmail: string;
  html_template: string;
  subject: string;
}) => {
  try {
    const options = {
      from: USER,
      to: clientEmail || "",
      subject: subject,
      html: html_template,
    };

    await transporter.sendMail(options).catch((err) => {
      console.log(err);
      throw new Error();
    });

    return {
      error: false,
    };
  } catch (err: any) {
    return {
      error: true,
      message: err.message || "Email sender fucked up",
    };
  }
};
