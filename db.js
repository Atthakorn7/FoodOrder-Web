const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1907',       // ถ้า root ไม่มีรหัส ใส่ว่าง
  database: 'restaurant_db'
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL error:', err);
  } else {
    console.log('✅ MySQL connected');
  }
});

module.exports = db;