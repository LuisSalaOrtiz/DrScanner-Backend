var express = require('express');
const router = express.Router();
var app = express();

// var allowCrossDomain = function(req, res, next) {
//
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
// // intercept OPTIONS method
//   if ('OPTIONS' == req.method) {
//     res.send(200);
//   }
//   else {
//     next();
//   }
// };
//
// app.configure(function () {
//   app.use(allowCrossDomain);
// });
//
var bodyParser = require('body-parser');
// app.use(express.bodyParser());


app.use(bodyParser.urlencoded({ extended: true }));

var pg = require('pg');
pg.defaults.ssl = true;

var url = "postgres://mkzqrshajdrfgl:Rvh7iuqboKBniQR9jSA8Qivdpa@ec2-54-235-221-102.compute-1.amazonaws.com:5432/d838fcj8sslfn";
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/db', function (request, response) {
  pg.connect(url, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
      { console.error(err); response.send("Error " + err); }
      else
      {

        //  response.render('pages/db', {results: result.rows} );
        response.json(result.rows);
        console.log(result.rows);

      }
    });
  });
});

app.get('/users/:email/:password', function (request, response) {
  const data = {pass: request.params.password, mail: request.params.email};
  pg.connect(url, function(err, client, done) {
    client.query('SELECT email,password,type FROM users WHERE email=$1 AND password=$2', [data.mail, data.pass], function(err, result) {
      done();
      if (err)
      { console.error(err); response.send("Error " + err); }
      else
      {

        //  response.render('pages/db', {results: result.rows} );
        response.json(result.rows);
        console.log(result.rows);

      }
    });
  });
});

//Getting full patient info
app.get('/patients/:qrcode/', function (request, response) {
  pg.connect(url, function(err, client, done) {
    client.query(('select qrcode, patient.pid, pfirst, plast, ssn, age, email, marital, gender, phone, weight, height, blood, address, hcname, hcnum, hcexp, vdate, vid, dfirst, dlast, specialty, cname, severity from (patient natural inner join (personal_info natural left join address natural left join healthcare) natural left join ((visits natural left join doctor) natural left join diagnostic natural left join condition)) where patient.qrcode=\'').concat(request.params.qrcode.concat("\'")), function(err, result) {
      done();
      if (err)
      { console.error(err); response.send("Error " + err); }
      else
      {
        response.json(result.rows);
        console.log(result.rows);

      }
    });
  });
});

app.post('/post/user/', function(request, response) {
  const data = {pass: request.body.password, type: request.body.type, mail: request.body.email};
  console.log('Post new user');
  console.log(data);
  pg.connect(url, function(err, client, done) {
    client.query('insert into users (password, type, email) values ($1, $2, $3)', [data.pass, data.type, data.mail], function(err, result) {

      if(err) {
        done();
        console.log(err);
        return response.status(500).json({success: false, data: err});
      }
      else
      {
        response.json(result.rows);
        console.log(result.rows);
      }
    });
  });
});


//Posting a patient
//_____________________________________________________________________________________________
app.post('/post/patient/part1/', function(request, response) {
  const data = {qr: request.body.qrcode, pf: request.body.pfirst, pl: request.body.plast, ssn: request.body.ssn, address: request.body.address, hcname: request.body.hcname, hcnum: request.body.hcnum};
  console.log('Post new patient');
  console.log(data);
  pg.connect(url, function(err, client, done) {

    //First Query
    client.query('insert into patient (qrcode, pfirst, plast, ssn) values ($1, $2, $3, $4)', [data.qr, data.pf, data.pl, data.ssn], function(err, result) {
      if(err) {
        done();
        console.log(err);
        return response.status(500).json({success: false, data: err});
      }
      else
      {
        response.json(result.rows);
        console.log(result.rows);
      }
    });

    //Second query
    client.query('insert into address (address) values ($1)', [data.address], function(err, result) {
      if(err) {
        done();
        console.log(err);
        return response.status(500).json({success: false, data: err});
      }
      else
      {
        response.json(result.rows);
        console.log(result.rows);
      }
    });
  });
});

app.post('/post/patient/part1.5/', function(request, response) {
  const data = {hcname: request.body.hcname, hcnum: request.body.hcnum};
  console.log('Post new patient');
  console.log(data);
  pg.connect(url, function(err, client, done) {

    //Third query
    client.query('insert into healthcare (hcname, hcnum) values ($1, $2)', [data.hcname, data.hcnum], function(err, result) {
      if(err) {
        done();
        console.log(err);
        return response.status(500).json({success: false, data: err});
      }
      else
      {
        response.json(result.rows);
        console.log('complete');
      }
    });
  });
});

//Getting initial ids
app.get('/patient/:qrcode/:address/:hcnum/', function (request, response) {
  const data = {qr: request.params.qrcode, addr: request.params.address, hcnum: request.params.hcnum};
  pg.connect(url, function(err, client, done) {
    client.query('SELECT patient.pid,address.aid,healthcare.hcid FROM patient,address,healthcare WHERE qrcode=$1 AND address=$2 AND hcnum=$3', [data.qr, data.addr, data.hcnum], function(err, result) {
      done();
      if (err)
      { console.error(err); response.send("Error " + err); }
      else
      {
        response.json(result.rows);
        console.log(result.rows);
      }
    });
  });
});

app.post('/post/patient/part2/', function(request, response) {
  const data = {pid: request.body.pid,vdate: request.body.vdate};
  console.log('Post visits');
  console.log(data);
  pg.connect(url, function(err, client, done) {
    client.query('insert into visits (pid, did, vdate) values ($1, 1, $2)', [data.pid, data.vdate], function(err, result) {

      if(err) {
        done();
        console.log(err);
        return response.status(500).json({success: false, data: err});
      }
      else
      {
        response.json(result.rows);
        console.log(result.rows);
      }
    });
  });
});

//Getting vid
app.get('/patients/vid/:qrcode/', function (request, response) {
  const data = {qr: request.params.qrcode};
  pg.connect(url, function(err, client, done) {
    client.query('SELECT vid FROM patient,visits WHERE qrcode=$1 AND patient.pid=visits.pid', [data.qr], function(err, result) {
      done();
      if (err)
      { console.error(err); response.send("Error " + err); }
      else
      {
        response.json(result.rows);
        console.log(result.rows);
      }
    });
  });
});

app.post('/post/patient/part3/', function(request, response) {
  const data1 = {email: request.body.email, marital: request.body.marital, gender: request.body.gender, phone: request.body.phone, weight: request.body.weight, height: request.body.height, blood: request.body.blood};
  const data2 = {pid: request.body.pid, aid: request.body.aid, hcid: request.body.hcid, age: request.body.age, vid: request.body.vid};
  console.log('Post new patient personal_info');
  console.log(data);
  pg.connect(url, function(err, client, done) {

    //First Query
    client.query('insert into personal_info values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [data1.email, data1.marital, data1.gender, data1.phone, data1.weight, data1.height, data1.blood, data2.pid, data2.aid, data2.hcid, data2.age], function(err, result) {
      if(err) {
        done();
        console.log(err);
        return response.status(500).json({success: false, data: err});
      }
      else
      {
        response.json(result.rows);
        console.log(result.rows);
      }
    });

    //Second query
    client.query('insert into diagnostic (vid) values ($1)', [data2.vid], function(err, result) {
      if(err) {
        done();
        console.log(err);
        return response.status(500).json({success: false, data: err});
      }
      else
      {
        response.json(result.rows);
        console.log(result.rows);
      }
    });
  });
});

//Getting diagid
app.get('/patient/:qrcode/:vid', function (request, response) {
  const data = {qr: request.params.qrcode, vid:request.params.vid};
  pg.connect(url, function(err, client, done) {
    client.query('SELECT diagid FROM patient,visits,diagnostic WHERE qrcode=$1 AND patient.pid=visits.pid AND visits.vid=diagnostic.vid AND diagnostic.vid=$2', [data.qr, data.vid], function(err, result) {
      done();
      if (err)
      { console.error(err); response.send("Error " + err); }
      else
      {
        response.json(result.rows);
        console.log(result.rows);
      }
    });
  });
});

app.post('/post/patient/part4/', function(request, response) {
  const data = {diagid: request.body.diagid, cname: request.body.cname, severity: request.body.severity};
  console.log('Post conditions');
  console.log(data);
  pg.connect(url, function(err, client, done) {
    client.query('insert into condition (diagid, cname, severity) values ($1, $2, $3)', [data.diagid, data.cname, data.severity], function(err, result) {

      if(err) {
        done();
        console.log(err);
        return response.status(500).json({success: false, data: err});
      }
      else
      {
        response.json(result.rows);
        console.log(result.rows);
      }
    });
  });
});
//_______________________________________________________________________________________________________________________
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
