'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

// database

const Pool = require('pg-pool');
const url = require('url')

// var DATABASE_URL = "postgres://sgvrhspmshvakk:3b1f5e98e03f23fa971278cd89961e1fc432363599046aa3050956eb372cc5f5@ec2-50-19-116-106.compute-1.amazonaws.com:5432/d5bej7q20gpg9n";
const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: true
};

const pool = new Pool(config);

// to run a query we can acquire a client from the pool,
// run a query on the client, and then return the client to the pool
pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query('SELECT $1::int AS number', ['1'], function(err, result) {
    //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
    done(err);

    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].number);
    //output: 1
  });
});

pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
});

// import the functions

var functs = require('./functs');

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Process get started button
app.get('/setup',function(req,res){

    functs.setupGetStartedButton(res);
});

app.get('/', function (req, res)
{
    console.log("plain GET request");
    res.send('Hello World, I would like to be a chat bot, as in REALLY!!!!')
})

// for Facebook verification
app.get('/webhook', function (req, res)
{
    console.log("/webhook Verify Token");

    // Facebook verification

    console.log("Verify Token sent");
    if (req.query['hub.mode'] === 'subscribe')
    {
        console.log("Subscribe Verify Token, check: " + req.query['hub.verify_token']);
        if (req.query['hub.verify_token'] === 'just_net_token')
        {
            console.log("Validating webhook");
            res.send(req.query['hub.challenge'])
        }
        else
        {
            console.log("Oh No, invalid Verify Token: " + req.query['hub.verify_token']);
            res.send("Error, wrong token.");
        }
    }
    else
    {
        console.log("not subscribing");
        res.send('Hello world')
    }
});

// Process Facebook Messenger Requests

app.post('/webhook', function (req, res)
{
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page')
    {
        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function(entry)
        {
        var pageID = entry.id;
        var timestamp = entry.time;

        // Iterate over each messaging event
        entry.messaging.forEach(function(event)
        {
            if (event.message)
            {
                if (event.message.is_echo)
                      console.log("Bot received message written event");
                else
                      // console.log("Bot received message " + event.message.text);
                      functs.receivedMessage(event);
            }
            else  if (event.delivery)
              console.log("Bot received delivery event");
            else  if (event.read)
              console.log("Bot received message-was-read event");
            else  if (event.postback)
              functs.doPostback(event);
            else
              console.log("Bot received unknown EVENT: ");
          });
        });
    }
    else
    {
      console.log("Bot received unknown OBJECT (not page): ", data.object);
    }

    // All good, sent response status 200

    res.sendStatus(200)
});

// Spin up the server
app.listen(app.get('port'), function()
{
    console.log('running on port', app.get('port'))
})
