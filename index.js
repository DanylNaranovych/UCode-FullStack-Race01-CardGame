const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const User = require('./models/user')
const { connectToDatabase } = require('./db');
const path = require('path');
const { findUserByLoginAndPassword, sendPasswordReminderEmail, registerUserAndSaveToDatabase } = require('./model');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.static('scripts'));
app.use('/avatars', express.static('avatars'));
app.use(express.static('node_modules'));

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationPath = path.join('avatars', '/');
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.originalname;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });


const sessionMiddleware = session({
  secret: 'armagedon',
  resave: true,
  saveUninitialized: true
});

app.use(sessionMiddleware);

io.use((socket, next) => {
  const req = socket.handshake;
  const res = {};

  sessionMiddleware(req, res, next);
});

io.on('connection', (socket) => {
  console.log('connected to socket server');
      const req = socket.handshake;
  socket.on('create-room', (roomName) => {
    const room = {
        name: roomName,
        creator: req.session.user.login,
        players: [req.session.user.login],
        ready: 0,
    };
    rooms.push(room);
    socket.emit('room-created', room);
  });

  socket.on('send-damage', (sendDamage, login, roomId) => {
    const room = rooms.find((r) => r.name === roomId);
    let damaged;

    for (const player of room.players) {
      if (player !== login) {
          damaged = player;
      }
    }

    // io.emit('get-damage', sendDamage, damaged);
    io.emit('get-damage', sendDamage.damage, sendDamage.enemyCard, damaged);
  });

  socket.on("send-player-damage", (sender, damage) => {
    io.emit("get-player-damage", sender, damage);
  });

  socket.on("send-remainig-hp", (remainingHp, sender) => {
    io.emit("get-remainig-hp", remainingHp, sender);
  });

  socket.on("send-enemy-card-damaged", (damage, damagedCardId, damagedPlayer) => {
    io.emit("get-enemy-card-damaged", damage, damagedCardId, damagedPlayer);
  });

  socket.on("send-login", () => {
    io.emit("get-login", (req.session.user.login));
  });

  socket.on("end-game", (loser) => {
    io.emit("game-ended", loser);
  });

  socket.on('get-room', (roomid) => {
    const room = rooms.find((r) => r.name === roomid);
    if (room) {
      socket.emit('get-room-response', room);
    } else {
      socket.emit('get-room-response', null);
    }
  });

  socket.on('find-room', () => {
    io.emit('send-rooms', rooms);
  });

    socket.on('join-room', (roomName) => {
        const room = rooms.find((r) => r.name === roomName);
        if (room) {
            room.players.push(req.session.user.login);
            socket.join(roomName);

            io.emit('room-created', room);
            io.to(roomName).emit('send-players', room.players);
        } else {
            socket.emit('room-not-found', roomName);
        }
    });

    socket.on('get-players', (room) => {
      const temp = rooms.find((r) => r.name === room);
      if (temp) {
        socket.emit('send-players', (temp.players));
      } else {
        socket.emit('send-players', null);
      }
    });

    socket.on('player-ready', (room) => {
      const temp = rooms.find((r) => r.name === room);
      if (temp) {
        let playerFound = false;
          for (const player of temp.players) {
            if (player === req.session.user.login) {
                playerFound = true;
                break;
            }
        }
          if (playerFound) {
            temp.ready++;
            io.emit('ready', (req.session.user.login));
              const readyPlayers = temp.ready;
              if (readyPlayers <= 2) {
                  socket.emit('start-game', room, req.session.user.login);
              }
              if (readyPlayers == 2) {
                io.emit("timer-duration-ready", 4);
                setTimeout(() => io.emit("players-ready"), 5000);
              }
          }
      }
  });

  socket.on("send-enemy", (sender, roomId) => {
    const room = rooms.find((r) => r.name === roomId);
    let enemy = null;

    for (const player of room.players) {
      if (player !== sender) {
          enemy = player;
      }
    }

    io.emit("get-enemy", enemy, sender);
  });

  socket.on("put-card", (enemyCardId, sender) => {
    getEnemyCard(db, enemyCardId).then((enemyCard) => {
      if (enemyCard) {
        io.emit("load-enemy-card", enemyCard, sender);
      }
    });
  });

  async function getEnemyCard(db, enemyCardId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM ucode_web.cards WHERE id=${enemyCardId}`;
      let card;
      const values = [card];
  
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

  socket.on('get-card', (login) => {
    getRandomCard(db)
    .then((randomCard) => {
      if (randomCard) {
        io.emit('randomCard', randomCard, login);
      }
    });
  });

  async function getRandomCard(db) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM ucode_web.cards ORDER BY RAND() LIMIT 1;';
      let card;
      const values = [card];
  
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

  async function findPathByName(name, db) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT avatar_path FROM ucode_web.users WHERE login = ?`;
      const values = [name];
  
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

  socket.on('get_path_by_name_enemy', (name) => {
    findPathByName(name, db)
    .then((path) => {
      if (path) {
        socket.emit('send-path_enemy', path.avatar_path);
      }
    });
  });

  socket.on('get_path_by_name_my', (name) => {
    findPathByName(name, db)
    .then((path) => {
      if (path) {
        socket.emit('send-path_my', path.avatar_path);
      }
    });
  });

  socket.on("first-step", (roomId) => {
    const room = rooms.find((r) => r.name === roomId);
    const randomIndex = Math.floor(Math.random() * 2);
    io.emit("first-step-result", room.players[randomIndex]);
  });

  socket.on("start-game", () => {
    let mana = 2;
    socket.emit('game-started', mana);
  });

  socket.on('start-turn-timer', (seconds, roomId) => {
    const room = rooms.find((r) => r.name === roomId);
    const timerDuration = seconds * 1000;

    io.emit("timer-duration", timerDuration, roomId);
    
    setTimeout(() => {
      room.players.forEach(player => {
        io.emit("turn-timeout", player);
      });
    }, timerDuration);
  });

  socket.on('disconnect', () => {
      console.log('disconnected from socket server');
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/main-menu.html');
});

let db;
const rooms = [];

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

  const userId = req.session.user.login;

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

app.get('/lobby', (req, res) => {
  res.sendFile(__dirname + '/views/lobby.html');
});

app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
  const username = req.session.user.login; 
  const avatarPath = req.file.filename;
  const updateQuery = 'UPDATE ucode_web.users SET avatar_path = ? WHERE login = ?';

  db.query(updateQuery, [avatarPath, username], (err, result) => {
    if (err) {
      console.error('Ошибка при обновлении аватара в базе данных', err);
      return res.status(500).json({ message: 'Ошибка при обновлении аватара' });
    }

    res.sendFile(__dirname + '/views/main-menu.html');
  });
});


server.listen(3000, () => {
  console.log('Server is running on port 3000');
});