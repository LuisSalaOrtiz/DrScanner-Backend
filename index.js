var express = require('express');
const router = express.Router();
var app = express();

var pg = require('pg');
pg.defaults.ssl = true;

var url = "postgres://mkzqrshajdrfgl:Rvh7iuqboKBniQR9jSA8Qivdpa@ec2-54-235-221-102.compute-1.amazonaws.com:5432/d838fcj8sslfn";
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(express.json());   

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

app.get('/users/:email/', function (request, response) {
  pg.connect(url, function(err, client, done) {
    client.query(('SELECT email,password,type FROM users WHERE email=\'').concat(request.params.email.concat("\'")), function(err, result) {
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

app.get('/patients/:qrcode/', function (request, response) {
  pg.connect(url, function(err, client, done) {
    client.query(('select qrcode, patient.pid, pfirst, plast, ssn, birth, email, marital, gender, phone, weight, height, blood, address, hcname, hcnum, hcexp, vdate, vid, dfirst, dlast, specialty, cname, severity from (patient natural inner join (personal_info natural left join address natural left join healthcare) natural left join ((visits natural left join doctor) natural left join diagnostic natural left join condition)) where patient.qrcode=\'').concat(request.params.qrcode.concat("\'")), function(err, result) {
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

app.post('/post/user/',function(request, response) {
  const data = {pass: request.body.password, type: request.body.type, mail: request.body.email};

  pg.connect(url, function(err, client, done) {
    client.query('insert into users (password, type, email) values (\'$1\', \'$2\', \'$3\')', [data.pass, data.type, data.mail], function(err, result) {

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

// app.post('/post/user/', function(req, res, next) {
//
//   if(!req.body.hasOwnProperty('password')|| !req.body.hasOwnProperty('type') || !req.body.hasOwnProperty('email')) {
//     res.statusCode = 400;
//     return res.send('Error: Missing fields for event.');
//   }
//   pg.connect(url, function(err, client, done) {
//     client.query('insert into users (password, type, email) values ($1, $2, $3)',[req.body.password,req.body.type,req.body.email], function(err, result) {
//
//       if (err)
//       { console.error(err); response.send("Error " + err); }
//       else
//       res.json(result.rows);
//       //console.log(result.rows)
//       done();
//     });
//   });
// });


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
