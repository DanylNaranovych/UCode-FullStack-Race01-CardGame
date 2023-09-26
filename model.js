const User = require('./models/user');
const nodemailer = require('nodemailer');

function registerUserAndSaveToDatabase(login, password, full_name, email_address, db, callback) {
  const newUser = new User(login, password, full_name, email_address, db);
  newUser.saveToDatabase((err, result) => {
    if (err) {
      console.error('Database error: ' + err);
      callback(err, null);
      return;
    }
    callback(null, 'User registered successfully');
  });
}

async function findUserByLoginAndPassword(login, password, db) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE login = ? AND password = ?';
    const values = [login, password];

    db.query(sql, values, (err, results) => {
      if (err) {
        console.error('Database error: ' + err);
        reject(err);
        return;
      }

      if (results.length === 0) {
        resolve(null);
      } else {
        const user = results[0];
        resolve(user);
      }
    });
  });
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: '', // Your email that will send emails
    pass: ''
  },
});

function sendPasswordReminderEmail(email, password) {
  const mailOptions = {
    from: '', // Your email that will send emails
    to: email,
    subject: 'Password Reminder',
    text: `Your password is: ${password}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email sending error: ' + error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = {
  registerUserAndSaveToDatabase,
  findUserByLoginAndPassword,
  sendPasswordReminderEmail
};
