require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const DbConnection = require('./app/config/db');
const session = require('express-session');



const app = express();

DbConnection();

// view engine
app.set('view engine', 'ejs');
app.set('views', 'view');

app.use(session({
    secret: 'keyboardcat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

app.use(cookieParser());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// ── Root redirect ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

// ── Logout shorthand ──────────────────────────────────────────────────────────
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
});


// ── Routes ───────────────────────────────────────────────────────────────────
const authRouter       = require('./app/routes/authRouter');
const attendeeRouter   = require('./app/routes/attendeeRouter');
const organizerRouter  = require('./app/routes/organizerRouter');


app.use('/auth',        authRouter);
app.use('/attendee',    attendeeRouter);
app.use('/organizer',   organizerRouter);


// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ status: false, message: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: false, message: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 7000;
app.listen(port, () => {
    console.log(`server is running on port: http://localhost:${port}`);
});
