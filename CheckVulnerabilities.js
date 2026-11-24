import express from "express";
import mysql from "mysql2";

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "testdb",
});

// SQL Injection
app.get("/user", (req, res) => {
  const query = "SELECT * FROM users WHERE id = " + req.query.id;

  db.query(query, (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.json(result);
  });
});

// Hardcoded credentials
const API_KEY = "sk_test_123456789";

// Missing input validation
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    res.send("Login successful");
  } else {
    res.status(401).send("Invalid credentials");
  }
});

app.listen(3000);