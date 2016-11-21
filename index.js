var express = require('express');
var app = express();

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

app.get('/users/:email/', function (request, response) {
  pg.connect(url, function(err, client, done) {
    client.query(('SELECT email,password,type FROM users WHERE email=\"').concat(request.params.email.concat("\"")), function(err, result) {
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

// app.get('/patients/', function (request, response) {
//   pg.connect(url, function(err, client, done) {
//     client.query('SELECT * FROM users', function(err, result) {
//       done();
//       if (err)
//        { console.error(err); response.send("Error " + err); }
//       else
//        {
//
//         //  response.render('pages/db', {results: result.rows} );
//           response.json(result.rows);
//           console.log(result.rows);
//
//          }
//     });
//   });
// });

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
