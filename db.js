const mysql = require("mysql2/promise");

// MySQL 데이터베이스 연결 풀 설정
const db = mysql.createPool({
  host: process.env.DB_HOST, // 데이터베이스 호스트
  user: process.env.DB_USER, // 데이터베이스 사용자 이름
  password: process.env.DB_PASS, // 데이터베이스 비밀번호
  database: process.env.DB_NAME, // 사용할 데이터베이스 이름
  waitForConnections: true,
  connectionLimit: 10, // 최대 연결 수 (연결 풀 크기)
  queueLimit: 0,
});

module.exports = db;
