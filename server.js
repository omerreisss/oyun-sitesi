const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

const ADMIN_PASSWORD = "ruhi123"; // Admin şifresi

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Ana Sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Oda Sayfası
app.get('/room', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

// Admin Sayfası
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin Giriş Kontrolü
app.post('/admin-login', (req, res) => {
    const password = req.body.password;
    if (password === ADMIN_PASSWORD) {
        res.redirect('/admin-panel');
    } else {
        res.send('Şifre Hatalı!');
    }
});

// Admin Panel
app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Oda verisi
let rooms = {};

// Socket.io bağlantı
io.on('connection', socket => {
    console.log('Bir kullanıcı bağlandı.');

    socket.on('joinRoom', ({ username, room }) => {
        socket.join(room);
        if (!rooms[room]) {
            rooms[room] = [];
        }
        rooms[room].push({ id: socket.id, username });

        io.to(room).emit('message', { username: 'Sistem', text: `${username} odaya katıldı.` });
        io.emit('roomsUpdate', getRoomsData());
    });

    socket.on('chatMessage', ({ room, message, username }) => {
        io.to(room).emit('message', { username, text: message });
    });

    socket.on('disconnect', () => {
        for (const room in rooms) {
            rooms[room] = rooms[room].filter(u => u.id !== socket.id);
            if (rooms[room].length === 0) {
                delete rooms[room];
            }
        }
        io.emit('roomsUpdate', getRoomsData());
        console.log('Bir kullanıcı ayrıldı.');
    });
});

function getRoomsData() {
    const data = [];
    for (const room in rooms) {
        data.push({ room, count: rooms[room].length });
    }
    return data;
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});