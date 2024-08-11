const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const conn = require('./db');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// 정적 파일 제공을 위한 설정 (이미지 파일 제공)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// 파일 업로드 설정
const storage = multer.diskStorage({
  // 업로드된 파일을 저장할 위치를 지정합니다.
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/'));  // 파일이 저장될 디렉토리 경로를 지정합니다.
  },
  // 저장될 파일의 이름을 지정합니다.
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);  // 현재 시간을 기준으로 파일 이름을 생성하여 파일 이름 충돌을 방지합니다.
  }
});

// 파일 업로드를 처리하는 multer 객체를 생성합니다.
const upload = multer({ storage: storage });

// // 파일 업로드 처리 엔드포인트
// app.post('/upload', upload.single('image'), (req, res) => {
//   if(!req.file) {
//     return res.status(400).send('파일이 업로드 되지 않았습니다.');
//   }

//   // 업로드된 파일 경로를 클라이언트에 반환
//   res.send({
//     status: 'success',
//     imageUrl: `/uploads/${req.file.filename}` // 저장된 파일 경로 반환
//   });
// });




// 분실물게시물 등록 엔드포인트
app.post('/lostboard', upload.single('image'), (req, res) => {
  const { category_id, lost_title, lost_content } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  // 현재 시간을 생성 날짜로 사용
  const lost_create_date = new Date();
  const lost_date = new Date(); // 필요시 클라이언트에서 받아오는 로직으로 변경 가능
  const lost_latitude = 0.0; // 테스트용 기본값, 실제 사용시 클라이언트에서 받아오는 값으로 변경
  const lost_longitude = 0.0; // 테스트용 기본값, 실제 사용시 클라이언트에서 받아오는 값으로 변경
  const id = 1; // 테스트용 사용자 ID, 실제 사용시 로그인 세션에서 가져오는 로직으로 변경
  const lost_state = false;
  const award = 3000;


  //위에것들 다 임시로 저장해논거임. 

  // SQL 쿼리 작성: lostboard 테이블에 데이터 삽입
  const sql = `
    INSERT INTO lostboard 
    (lost_board_id, category_id, award, lost_title, lost_content, lost_create_date, lost_date, lost_state, lost_latitude, lost_longitude, id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  // 데이터베이스 쿼리 실행
  conn.query(sql, [category_id, award, lost_title, lost_content, lost_create_date, lost_date, lost_state, lost_latitude, lost_longitude, id], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).send('Server error');
    }

    console.log("Data inserted into lostboard:", result);

    if (imageUrl) {
      const imageSql = 'INSERT INTO lostimage (lost_board_id, lost_image_url) VALUES (?, ?)';
      conn.query(imageSql, [result.insertId, imageUrl], (imageErr) => {
        if (imageErr) {
          console.error('Error inserting image data:', imageErr);
          return res.status(500).send('Server error2');
        }
        // 데이터 삽입 후 리다이렉트
        res.redirect('/lostboard');
      });
    } else {
      // 데이터 삽입 후 리다이렉트
      res.redirect('/lostboard');
    }
  });
});


// app.get('/findboard', function(req, res) {
//   res.sendFile(__dirname + '/findboard.html');
// });

// app.get('/lostimage', function(req, res) {
//   res.sendFile(path.join(__dirname, 'lostimage.html'));
// });

app.get('/', function(req, res) {
  res.send('루트 입니당');
});

app.get('/lostboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'lostboard.html'));
});


// 3000번 포트에서 서버 실행
app.listen(port, function() {
  console.log('listening on 3000');
}); 
