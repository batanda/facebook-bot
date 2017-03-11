const request = require('request')

const PAGE_ACCESS_TOKEN = "EAAKTalAQ2eoBEAXiFuMH3AZWarRff1dYSNSU9hTtAZxgXPkTarahOyXUH9wUxBZaTQacCZyyv24DRQAZsgD2u0L76EMSmz5zDJYbKAZH5ZCIBcNZALf2SNJS9mgVq0oSH56ZAoOFwf2PbFZCPCQmVgWqfDKhUXVSUqlVv2OWYKKEzVcAZDZD"

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
    if (textResponse == "structured")
        this.sendGenericMessage(fromId)
    else
        this.sendTextMessage(fromId, textResponse)
},

// Based on the incoming message, determine what to send back

getResponse: function(message)
{
    var rsp = "My Bot thanks you for your message: " + message.text;

    if (message.text == "structured")
        rsp = "structured"
    if (message.text == "Knock Knock")
        rsp = "Who's There?"

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

sendGenericMessage: function(toId)
{
  console.log("Stub: send generic (templated) message");
}

doPostback: function(event)
{
  console.log("Stub: process the postback");
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
