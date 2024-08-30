const express = require("express");
const bcrypt = require("bcrypt");
const db = require("./db");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length > 0) {
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        req.session.isLoggedIn = true;

        req.session.user = {
          id: user.id,
          email: user.email,
          gender: user.gender,
        };

        return res.json({ success: true });
      }
    }
    return res.json({ success: false, message: "없는 아이디거나 비밀번호가 틀렸습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).render("500", { error: "서버 오류가 발생했습니다." });
  }
});

router.post("/signup", async (req, res) => {
  const { username, password, confirmPassword, email, gender } = req.body;

  if (password !== confirmPassword) {
    return res.render("signup", { error: "비밀번호가 일치하지 않습니다." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ? OR email = ?", [username, email]);

    if (rows.length > 0) {
      return res.render("signup", { error: "이미 사용 중인 아이디 또는 이메일입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query("INSERT INTO users (username, `password`, email, gender) VALUES (?, ?, ?, ?)", [username, hashedPassword, email, gender]);

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).render("500", { error: "서버 오류가 발생했습니다." });
  }
});

// 로그아웃 라우트
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "로그아웃 중 오류가 발생했습니다." });
    }
    res.json({ success: true });
  });
});

module.exports = router;
