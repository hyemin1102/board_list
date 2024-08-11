const mysql = require('mysql');

const conn = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1102',
  database: 'lostitem'
});

conn.connect((err) => {
  if (err) throw err;
  console.log('db 연결됨 ');
});


module.exports = conn;