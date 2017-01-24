var express = require('express');
const router = express.Router();
var app = express();
//app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

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

app.delete('/delete/patient/:qrcode', function(request, response) {
  const data = {qr: request.params.qrcode};
  console.log('Delete a patient');
  console.log(data);
  pg.connect(url, function(err, client, done) {
    client.query('delete from patient where qrcode=$1', [data.qr], function(err, result) {

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

//Post a patient
//_______________________________________________________________________________________________________________________
app.post('/post/patient/', function(request, response) {
  const patientData = {qr: request.body.qrcode, pf: request.body.pfirst, pl: request.body.plast, ssn: request.body.ssn};
  const addressData = {address: request.body.address}
  const healthData = {hcname: request.body.hcname, hcnum: request.body.hcnum};
  const personalData = {email: request.body.email, marital: request.body.marital, gender: request.body.gender, phone: request.body.phone, weight: request.body.weight, height: request.body.height, blood: request.body.blood, age: request.body.age};
  const numberOfCon = request.body.number;
//  const conditionsData = {cname: request.body.cname, severity: request.body.severity};

  var queryString = 'with addr as (insert into address (address) values ($1) returning aid), health as (insert into healthcare (hcname, hcnum) values ($2, $3) returning hcid), pat as (insert into patient (qrcode, pfirst, plast, ssn) values ($4, $5, $6, $7) returning pid), vis as (insert into visits (pid, did) select pid, 1 from pat returning vid), per_info as (insert into personal_info select $8, $9, $10, $11, $12, $13, $14, aid, hcid, pid, $15 from pat, addr, health), diag as (insert into diagnostic (vid) select vid from vis returning diagid) insert into condition (diagid, cname, severity) values ';

  var listOfElements = [addressData.address, healthData.hcname, healthData.hcnum, patientData.qr, patientData.pf, patientData.pl, patientData.ssn, personalData.email, personalData.marital, personalData.gender, personalData.weight, personalData.height, personalData.blood, personalData.age, personalData.phone];

  //((select diagid from diag), 'Muerte', 'High'), ((select diagid from diag), 'Vida', 'High')'

  for(var i=0; i<numberOfCon; i++)
  {
    var identifier = '$' + (16+i);
    queryString += '((select diagid from diag), '+identifier+', \'High\')';
    listOfElements.push(request.body['cname'+(i+1)]);
    if(numberOfCon>(i+1))
    {
      queryString += ', '
    }
  }

  console.log('Post patient');
  pg.connect(url, function(err, client, done) {

    client.query(queryString, listOfElements, function(err, result) {

      if(err) {
        done();
        console.log(err);
        return response.status(500).json({success: false, data: err});
      }
      else
      {
        response.json({Process: 'Complete', Status: 'Succesful'});
        console.log(result.rows);
      }
    });
  });
});
//_______________________________________________________________________________________________________________________

//Update a patient info
//_______________________________________________________________________________________________________________________
app.PUT('/update/patient/', function(request, response) {
  const patientData = {qr: request.body.qrcode, pf: request.body.pfirst, pl: request.body.plast, ssn: request.body.ssn};
  const addressData = {address: request.body.address}
  const healthData = {hcname: request.body.hcname, hcnum: request.body.hcnum};
  const personalData = {email: request.body.email, marital: request.body.marital, gender: request.body.gender, phone: request.body.phone, weight: request.body.weight, height: request.body.height, blood: request.body.blood, age: request.body.age};
  const numberOfCon = request.body.number;

  var queryString = 'with pat as (update patient set pfirst=$1, plast=$2, ssn=$3 where qrcode=$4 returning pid), per_info as (update personal_info set email=$5, marital=$6, gender=$7, weight=$8, height=$9, blood=$10, age=$11, phone=$12 where pid=(select pid from pat) returning aid, hcid), addr as (update address set address=$13 where aid=(select aid from per_info)), health as (update healthcare set hcname=$14, hcnum=$15 where hcid=(select hcid from per_info)) insert into condition (diagid, cname, severity) values ';
  //((select diagid from patient, visits, diagnostic where patient.pid=(select pid from pat)), $16, 'High')';

  var listOfElements = [patientData.pf, patientData.pl, patientData.ssn, patientData.qr, personalData.email, personalData.marital, personalData.gender, personalData.weight, personalData.height, personalData.blood, personalData.age, personalData.phone, addressData.address, healthData.hcname, healthData.hcnum];

  //((select diagid from diag), 'Muerte', 'High'), ((select diagid from diag), 'Vida', 'High')'

  for(var i=0; i<numberOfCon; i++)
  {
    var identifier = '$' + (16+i);
    queryString += '(((select diagid from patient, visits, diagnostic where patient.pid=(select pid from pat)), '+identifier+', \'High\')';
    listOfElements.push(request.body['cname'+(i+1)]);
    if(numberOfCon>(i+1))
    {
      queryString += ', '
    }
  }

  console.log('Post patient');
  pg.connect(url, function(err, client, done) {

    client.query(queryString, listOfElements, function(err, result) {

      if(err) {
        done();
        console.log(err);
        return response.status(500).json({success: false, data: err});
      }
      else
      {
        response.json({Process: 'Complete', Status: 'Succesful'});
        console.log(result.rows);
      }
    });
  });

  console.log('Delete duplicates');
  pg.connect(url, function(err, client, done) {

    client.query('delete from condition where exists (select 1 from condition as t2 where t2.cname = condition.cname and t2.diagid = condition.diagid and t2.cid > condition.cid)', function(err, result) {

      if(err) {
        done();
        console.log(err);
        return response.status(500).json({success: false, data: err});
      }
      else
      {
        response.json({Delete_Duplicates: 'Complete', Status: 'Succesful'});
        console.log(result.rows);
      }
    });
  });
});
//_______________________________________________________________________________________________________________________

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
