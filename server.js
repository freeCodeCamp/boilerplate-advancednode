'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const ObjectID = require('mongodb').ObjectID;

const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session')
const passport = require('passport');

const app = express();
app.set('view engine', 'pug');


fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize())
app.use(passport.session())

myDB(async client => {
  const myDataBase = await client.db('database').collection('users')

  app.route('/').get((req, res) => {
    res.render(
      'pug', // process.cwd() + '/views/pug/index', 
      {
        title: 'Connected to Database', 
        message: 'Please login'
      });
  });

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser((id, done) => {
    myDB.findOne({_id: new ObjectID(id)}, (err, doc) => {
      done(null, doc)
    })
  });
}).catch(err => {
  app.get('/', (req, res) => {
    res.render('pug', { title: err, message: 'Unable to login'});
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
