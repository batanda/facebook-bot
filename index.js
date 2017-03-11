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


// Spin up the server
app.listen(app.get('port'), function()
{
    console.log('running on port', app.get('port'))
})
