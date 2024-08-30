const dotenv = require("dotenv");
dotenv.config();

console.log("Loaded environment variables:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,
  SESSION_SECRET: process.env.SESSION_SECRET,
});
const db = require("./db");
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const engine = require("ejs-locals");
const session = require("express-session");

const authRoutes = require("./auth");

const app = express();
app.use(express.json()); // JSON 형식의 요청 데이터를 파싱

const port = process.env.PORT || 3000;

// 세션 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // HTTPS에서만 secure 설정을 true로 변경
  })
);

// Logging middleware
app.use(morgan("combined"));
app.engine("ejs", engine);
app.set("view engine", "ejs");

// Static file middleware with caching
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1d" }));
app.use(express.urlencoded({ extended: true }));

// Middleware to disable caching for dynamic content
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Middleware to check if user is logged in
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  if (res.locals.isLoggedIn) {
    res.locals.id = req.session.user.id || false;
    res.locals.email = req.session.user.email || false;
    res.locals.gender = req.session.user.gender || false;
  }
  next();
});

// Redirect root to /main
app.get("/", (req, res) => {
  res.redirect("/main");
});

// Use auth routes
app.use("/", authRoutes);

// Other routes
app.get("/main", (req, res) => {
  res.render("main");
});

app.get("/product-list", (req, res) => {
  res.render("product-list");
});

app.get("/mypage", (req, res) => {
  if (req.session.isLoggedIn) {
    res.render("mypage");
  } else {
    res.redirect("/login");
  }
});

// 로그인 라우트
app.get("/login", async (req, res) => {
  if (!req.session.isLoggedIn) {
    const [rows] = await db.query("SELECT count(distinct username) FROM users");
    userCnt = rows[0]["count(distinct username)"];
    res.render("login", { userCnt: `${userCnt}` });
  } else {
    res.redirect("/mypage");
  }
});

// 회원가입 라우트
app.get("/signup", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.render("signup");
  } else {
    res.redirect("/mypage");
  }
});

app.get("/product-detail/:id", (req, res) => {
  const productId = req.params.id;
  res.render("product-detail", { productId: `${productId}` });
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
