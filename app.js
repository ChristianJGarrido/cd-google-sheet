'use strict';
require('dotenv').config();
const {google} = require('googleapis');
const nconf = require('nconf');
const path = require('path');

//const credentials = require('./test-credentials.json');

const client_email = process.env.GOOGLE_CLIENT_EMAIL;
const private_key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g,'\n');
const sheetId = process.env.SHEET_ID;
const sub = process.env.SUB || '/';
console.log(private_key);

// Create JWT auth object
const jwt = new google.auth.JWT(
  client_email,
  null,
  private_key,
  [
    'https://www.googleapis.com/auth/spreadsheets'
  ]
);

const express = require('express')
const app = express();

var bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
const fs = require('fs');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(sub + 'healthcheck', require('express-healthcheck')());


app.post(sub + ':spreadsheetId/:range/append', (req,res) => {
  //var private_key = fs.readFileSync('idp/private_key_idp.pem');
  //var companyBranch = req.query.companyBranch ? req.query.companyBranch : '';
  //console.log('jwt');
  var spreadsheetId = req.params.spreadsheetId ? req.params.spreadsheetId: undefined;
  var range = req.params.range ? req.params.range: 'A1:E1';
  //console.log(req.body);
  var content = req.body ? req.body : undefined;
  jwt.authorize((err, data) => {
    if (err) {
      console.error(err);
      res.status(400);
      res.send(err);
    } else {
    //console.log('You have been successfully authenticated: ', data);
  
    // Get Google Admin API
      const sheets = google.sheets({
        version: 'v4'
      });
    
      // Delete group
      sheets.spreadsheets.values.append({
        spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        requestBody: content,
        auth: jwt
      }, (err, data) => {
        //console.log(err || data);
        if(err) {
          res.status(400);
        }
        res.send(data.data);
      });
    }
  });
});

app.get(sub, (req, res) => {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.send('Google-Sheet')
});

app.listen(process.env.PORT||3000, () => console.log('App started'));