const express = require("express");
const path = require("path");
const morgan = require("morgan");
const app = express();
const port = process.env.PORT || 3000;
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "34.64.60.116", // Cloud SQL 인스턴스의 호스트 주소
  user: "gyutae", // 데이터베이스 사용자 이름
  password: "1234", // 데이터베이스 비밀번호
  database: "user_db", // 사용할 데이터베이스 이름
});

// 연결 테스트 (선택 사항)
db.getConnection()
  .then((connection) => {
    console.log("Database connected successfully!");
    connection.release();
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

app.use((req, res, next) => {
  console.log(res.getHeaders()); // 헤더 내용 확인
  res.removeHeader("Content-Security-Policy"); // 필요시 CSP 헤더 제거
  next();
});

// Logging middleware
app.use(morgan("combined"));

// Set the view engine to ejs
app.set("view engine", "ejs");

// Static file middleware with caching
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1d" }));

// Middleware to disable caching for dynamic content
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Redirect root to /main
app.get("/", (req, res) => {
  res.redirect("/main");
});

// Routes
app.get("/main", (req, res) => {
  res.render("main");
});

app.get("/product-list", (req, res) => {
  res.render("product-list");
});

app.get("/product-detail/:id", (req, res) => {
  const productId = req.params.id;
  res.render("product-detail", { productId: productId });
});

app.get("/events/:id", (req, res) => {
  const eventId = req.params.id;
  res.render("events", { eventId: eventId });
});

// 404 Error handler
app.use((req, res, next) => {
  res.status(404).render("404", { url: req.originalUrl });
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500", { error: err });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
