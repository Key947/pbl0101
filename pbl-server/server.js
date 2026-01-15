const express = require("express");
const sqlite = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Init DB
const db = new sqlite.Database(path.join(__dirname, "pbl.db"));

// Create tables
db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT,
    password TEXT,
    is_admin INTEGER DEFAULT 0
)`);

db.run(`CREATE TABLE IF NOT EXISTS posts(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    content TEXT,
    datetime TEXT
)`);

// Simple health check
app.get("/", (req, res) => res.send({ ok: true }));

// Register
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;
    if(!username || !email || !password) return res.status(400).json({ error: "Missing fields" });
    const hash = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO users(username,email,password) VALUES(?,?,?)`,
        [username, email, hash],
        function(err) {
            if (err) return res.status(400).json({ error: "Username already taken or invalid" });
            res.json({ success: true });
        }
    );
});

// Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if(!username || !password) return res.status(400).json({ error: "Missing fields" });

    db.get(`SELECT * FROM users WHERE username=?`, [username], (err, user) => {
        if (err) return res.status(500).json({ error: "DB error" });
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!bcrypt.compareSync(password, user.password))
            return res.status(401).json({ error: "Wrong password" });

        // Simple token; in production use env secret
        const token = jwt.sign({ username: user.username, is_admin: user.is_admin }, "secret123", { expiresIn: "7d" });
        res.json({ token, username: user.username, is_admin: user.is_admin });
    });
});

// Post
app.post("/post", (req, res) => {
    const { username, content } = req.body;
    if(!username || !content) return res.status(400).json({ error: "Missing fields" });
    const datetime = new Date().toISOString();
    db.run(
        `INSERT INTO posts(username, content, datetime) VALUES(?,?,?)`,
        [username, content, datetime],
        function(err) {
            if(err) return res.status(500).json({ error: "DB error" });
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Get profile posts
app.get("/profile/:username", (req, res) => {
    const username = req.params.username;
    db.all(`SELECT * FROM posts WHERE username=? ORDER BY datetime DESC`, [username], (err, posts) => {
        if(err) return res.status(500).json({ error: "DB error" });
        res.json({ posts });
    });
});

// Admin dashboard
app.get("/admin", (req, res) => {
    db.all(`SELECT id, username, email, is_admin FROM users`, [], (err, users) => {
        if(err) return res.status(500).json({ error: "DB error" });
        db.all(`SELECT * FROM posts ORDER BY datetime DESC`, [], (err2, posts) => {
            if(err2) return res.status(500).json({ error: "DB error" });
            res.json({ users, posts });
        });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
