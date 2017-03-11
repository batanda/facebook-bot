'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

app.get('/', function (req, res)
{
    console.log("plain GET request");
    res.send('Hello World, I would like to be a chat bot')
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


// Spin up the server
app.listen(app.get('port'), function()
{
    console.log('running on port', app.get('port'))
})
