require("dotenv").config();
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const User = require("./models/user.js");

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

const sendEmail = (recipientName, recipientEmail, subject, content) => {
  //all parameters are strings
  const sentFrom = new Sender("mailer@tradeswipe-mit.com", "Tradeswipe");
  const recipients = [new Recipient(recipientEmail, recipientName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(subject)
    .setText(content);

  mailerSend.email
    .send(emailParams)
    .then(() => console.log("email sent!"))
    .catch(() => console.log("email not sent!"));
};

const dhallDict = {
  maseeh: "Maseeh",
  nv: "New Vassar",
  mcc: "McCormick",
  baker: "Baker",
  simmons: "Simmons",
  next: "Next House",
};

//match is a Mongoose doc
const sendMatchReminder = async (match) => {
  const subject = `Match Reminder`;

  const buyer = await User.findById(match.buyer_id);
  const seller = await User.findById(match.seller_id);

  if (buyer.email_notifs) {
    const buyer_content = `Reminder about your match on Tradeswipe! You are scheduled to receive a swipe from ${
      seller.name
    } at ${
      dhallDict[match.dhall]
    } within the next 30 minutes. Remember: As the swipe receiver, it is up to you to find the swipe donor based on their displayed directions.`;
    sendEmail(buyer.name, buyer.email, subject, buyer_content);
  }

  if (seller.email_notifs) {
    const seller_content = `Reminder about your match on Tradeswipe! You are scheduled to donate a swipe to ${
      buyer.name
    } at ${
      dhallDict[match.dhall]
    } within the next 30 minutes. Remember: As the swipe donor, you should update your directions in your Tradeswipe profile once you've arrived at the dining hall; it is up to the swipe receiver to find you.`;
    sendEmail(seller.name, seller.email, subject, seller_content);
  }
};

const getDateTime = (date) => {
  const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  //convert to Date type if necessary
  if (typeof date === "string") date = new Date(date);
  // Convert to EST timezone
  const estTime = new Date(date.toLocaleString("en-US", { timeZone: "America/New_York" }));

  // Extract components
  const month = estTime.getMonth() + 1; // getMonth() returns 0-11
  const day = estTime.getDate();
  const year = estTime.getFullYear() - 2000; //24
  const hours = estTime.getHours();
  const minutes = estTime.getMinutes();
  const dayOfWeek = week[estTime.getDay()];

  // Convert 24-hour format to 12-hour format and set AM/PM
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

  // Pad single digit minutes and seconds with a leading zero
  const paddedMinutes = minutes.toString().padStart(2, "0");

  // Format the date/time string
  return {
    date: `${dayOfWeek}, ${month}/${day}`,
    bareDate: `${month}/${day}`,
    time: `${formattedHours}:${paddedMinutes} ${ampm}`,
    dayOfWeek: dayOfWeek,
  };
};

const sendMatchNotif = async (match) => {
  const subject = `Match Notification`;
  const matchDate = getDateTime(match.date);

  const buyer = await User.findById(match.buyer_id);
  const seller = await User.findById(match.seller_id);

  if (buyer.email_notifs) {
    const buyer_content = `You have a new match on Tradeswipe! You are scheduled to receive a swipe from ${
      seller.name
    } at ${dhallDict[match.dhall]}, on ${matchDate.date} at ${
      matchDate.time
    }. As the swipe receiver, it is up to you to find the swipe donor based on their displayed directions, once it's time to meet.`;
    sendEmail(buyer.name, buyer.email, subject, buyer_content);
  }

  if (seller.email_notifs) {
    const seller_content = `You have a new match on Tradeswipe! You are scheduled to donate a swipe to ${
      buyer.name
    } at ${dhallDict[match.dhall]}, on ${matchDate.date} at ${
      matchDate.time
    }. As the swipe donor, you should update your directions in your Tradeswipe profile once it's time to meet; it is up to the swipe receiver to find you.`;
    sendEmail(seller.name, seller.email, subject, seller_content);
  }
};

const sendCancelNotif = async (match) => {
  const subject = `Match canceled!`;
  const matchDate = getDateTime(match.date);

  const buyer = await User.findById(match.buyer_id);
  const seller = await User.findById(match.seller_id);

  if (buyer.email_notifs) {
    const buyer_content = `One of your scheduled Tradeswipe matches has been canceled. In this match, you were scheduled to receive a swipe from  ${
      seller.name
    } at ${dhallDict[match.dhall]}, on ${matchDate.date} at ${matchDate.time}.`;
    sendEmail(buyer.name, buyer.email, subject, buyer_content);
  }

  if (seller.email_notifs) {
    const seller_content = `One of your scheduled Tradeswipe matches has been canceled. In this match, you were scheduled to donate a swipe to ${
      buyer.name
    } at ${dhallDict[match.dhall]}, on ${matchDate.date} at ${matchDate.time}.`;
    sendEmail(seller.name, seller.email, subject, seller_content);
  }
};

module.exports = {
  sendMatchReminder: sendMatchReminder,
  sendMatchNotif: sendMatchNotif,
  sendCancelNotif: sendCancelNotif,
};
