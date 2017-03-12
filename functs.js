const request = require('request')

const PAGE_ACCESS_TOKEN = "EAADvMZC7RAZCgBAPZCKShM436aCGZByoKZAXTnQN5vLAudGOOMxWYRBZCHBMVyjZClKsP4NwBZCncnP8z08Q3s6HTimPp8fSKMPtGqGgoSUbXC5VfYYQjJk2TiZAHZBcyT6ZAozR2rW2HOW0kXbZABscLGMJ58ptkMKUYllTN1uBozkVqwZDZD"

module.exports = {
receivedMessage: function(event)
{
    var fromId = event.sender.id;
    var myId = event.recipient.id;
    var timestamp = event.timestamp;
    var message = event.message;

    console.log("Page %d received message from user %d." , myId, fromId);
    console.log("    Message: " + JSON.stringify(message));

    this.processMessage(fromId, myId, timestamp, message)
},

processMessage: function(fromId, myId, timestamp, message)
{
    var messageId = message.mid;
    var messageText = message.text;
    var messageAttachments = message.attachments;
    var textResponse;

    if (messageAttachments)
        this.processMessageWithAttachements(fromId, messageText, "Message with attachment received");

    // Add logic here to determine appropriate response. For now, just echo it.

    textResponse = this.getResponse(message);
    if (textResponse == "post trip")
      this.postTripButton(fromId)
    // if (textResponse == "structured")
    //     this.sendGenericMessage(fromId)
    else
        this.sendTextMessage(fromId, textResponse)
},

// Based on the incoming message, determine what to send back

getResponse: function(message)
{
    var rsp = message.text;

    if (message.text == "structured")
        rsp = "structured"
    if (message.text == "Knock Knock")
        rsp = "Who's There?"
    if (message.text == "post trip")
        rsp = "post trip"

    return rsp;
},

sendTextMessage: function(toId, messageText)
{
  var messageData = {
    recipient: {
      id: toId
    },
    message: {
      text: messageText
    }
  };

  console.log("Sending text-only message to id: " + toId)
  callSendAPI(messageData);
},

// Stubs
processMessageWithAttachements: function(senderId, messageText, messageAttacments)
{
    console.log("Stub: process the message and attachments and send a response")
},

//
insertUsersData: function(fromId)
{
  request("https://graph.facebook.com/v2.6/"+ fromId +"?access_token="+ PAGE_ACCESS_TOKEN, function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
});
},

// getStarted button
setupGetStartedButton: function(res)
{
  var messageData = {
                "get_started":[
                {
                    "payload":"justPayload"
                    }
                ]
        };
  callSendAPI(res);
},

postTripButton: function(toId)
{
  console.log("Sending message with 2 Cards to id: " + toId)
  var messageData = {
    recipient: {
      id: toId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
            title: "JustNet",
            subtitle: "In Kigali",
            item_url: "http://www.cmu.edu/africa/about-cmur/index.html",
            image_url: "http://www.cmu.edu/africa/files/images/bios/About%20CMU%20Rwanda.jpg",
            buttons:
            [{
              type: "postback",
              title: "Post Trip",
              payload: "help me post trip",
            }]
            },{
            title: "Bot Party",
            subtitle: "Bots for Messenger Challenge",
            item_url: "https://messengerchallenge.splashthat.com/",
            image_url: "https://d24wuq6o951i2g.cloudfront.net/img/events/id/272/2724336/assets/d0c.BotforMess_Splash.png",
            buttons:
            [{
              type: "postback",
              title: "Request courier",
              payload: "help me request courier",
            }],
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
},

sendGenericMessage: function(toId)
{
  console.log("Sending message with 2 Cards to id: " + toId)
  var messageData = {
    recipient: {
      id: toId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
            title: "CMU-Africa",
            subtitle: "In Kigali",
            item_url: "http://www.cmu.edu/africa/about-cmur/index.html",
            image_url: "http://www.cmu.edu/africa/files/images/bios/About%20CMU%20Rwanda.jpg",
            buttons:
            [{
              type: "web_url",
              url: "http://www.cmu.edu/africa/",
              title: "CMU Africa"
            },{
              type: "postback",
              title: "Help Me Apply",
              payload: "help me apply",
            }]
            },{
            title: "Bot Party",
            subtitle: "Bots for Messenger Challenge",
            item_url: "https://messengerchallenge.splashthat.com/",
            image_url: "https://d24wuq6o951i2g.cloudfront.net/img/events/id/272/2724336/assets/d0c.BotforMess_Splash.png",
            buttons:
            [{
              type: "web_url",
              url: "https://messengerchallenge.splashthat.com/",
              title: "Facebook Messenger Challenge"
            },{
              type: "postback",
              title: "Please do something for me",
              payload: "Payload for Please do something for me bubble",
            }],
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
},

doPostback: function(event)
{
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;
  var myResponse = payload.replace("me", "you");

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful

  this.sendTextMessage(senderID, "I will gladly " + myResponse);
},

};

function callSendAPI(messageData)
{
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  },function (error, response, body)
    {
        if (error)
        {
            console.log('Error sending message: ')
            console.log(response);
            console.log(error);
        }
        else if (response.statusCode != 200)
        {
            console.log('Error sending message, response code not 200: ' + response.statusCode);
        }
        else if (response.body.error)
        {
            console.log('Error: ', response.body.error)
        }
    });
}
