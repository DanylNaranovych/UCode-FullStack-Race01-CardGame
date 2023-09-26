const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { findUserByLoginAndPassword, sendPasswordReminderEmail, registerUserAndSaveToDatabase } = require('./model');
const { connectToDatabase } = require('./db');
const User = require('./models/user')
  
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.static('scripts'));
app.use(express.static('avatars'));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/main-menu.html');
});

let db;

async function initializeDatabase() {
  try {
    db = await connectToDatabase();
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

initializeDatabase();

app.get('/registration', (req, res) => {
  res.sendFile(__dirname + '/views/registration.html');
});

app.get('/registered', (req, res) => {
  res.sendFile(__dirname + '/views/registered.html');
});


app.post('/register', async (req, res) => {
  const { login, password, confirm_password, full_name, email_address} = req.body;

  if (password !== confirm_password) {
    res.status(400).json({ error: 'Passwords do not match' });
    return;
  }

  try {
    await registerUserAndSaveToDatabase(login, password, full_name, email_address, db, (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      res.redirect('/registered');
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/login', async (req, res) => {
  const { login, password } = req.body;

  try {
    let user = new User();
    user = await findUserByLoginAndPassword(login, password, db);
    if (user) {
      req.session.loggedIn = true;
      req.session.user = user;
      res.sendFile(__dirname + '/views/main-menu.html');
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(__dirname + '/views/forgot-password.html');
});


app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = new User();

  async function initializeDatabase() {
    try {
      db = await connectToDatabase();
    } catch (err) {
      console.error('Error initializing database:', err);
      process.exit(1);
    }
  }
  
  initializeDatabase();
  await user.findUserByEmail(email, db, (err, user) => {
    if (user) {
      sendPasswordReminderEmail(email, user.password);
      res.status(200).json({ message: 'Password reminder sent to your email.' });
    } else {
      res.status(400).json({ error: 'Email not found.' });
    }
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});


app.get('/user-status', (req, res) => {
  if (req.session.loggedIn) {
      res.sendFile(__dirname + '/views/main-menu.html');
  } else {
      res.sendStatus(401);
  }
});

app.get('/user-info', (req, res) => {
  if (!req.session.loggedIn) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
}

  const userId = req.session.user.full_name;

  db.query('SELECT login, avatar_path FROM ucode_web.users WHERE login = ?', [userId], (error, results) => {
    if (error) {
      console.error('Ошибка запроса к базе данных:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      const userData = results[0];
      res.json(userData);
    }
  });
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});