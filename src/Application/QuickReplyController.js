var MuxController = require('./MuxController');
var ReplyController = require('./ReplyController');

var QuickReplyController = function () {};

var buildQuickReply = function (sender, token, obj) {
    
    var quickReplies = [
        {
            "content_type":"text",
            "title":"Yes",
            "payload":"quickyes"
        },{
            "content_type":"text",
            "title":"No",
            "payload":"quickno"
        },{
            "content_type":"text",
            "title":"Maybe",
            "payload":"quickmaybe"
        }
    ];
    
    ReplyController.sendQuickReplies(sender, token, obj.question, quickReplies)
    
}

var buildCaroselReply = function (sender, token, res){
    
    var elements = [];

    console.log("LOGIC RESPONSE");
    console.log(res);
    console.log("");
    
    res.restaurants.forEach(function (restaurant) {
       
        var buttons = [{
            "type" : "web_url",
            "url" : restaurant.googleUrl,
            "title" : "Google Maps"
        }];
        
        if (restaurant.website != null) {
            buttons.push({
                "type" : "web_url",
                "url" : restaurant.website,
                "title" : "Website"
            })
        }
        
        elements.push({
            "title" : restaurant.name,
            "subtitle" : "Rating: "+ restaurant.rating,
            "image_url" : "...",
            "buttons" : buttons
        });
        
    });
    
    if (elements.length > 0) {
        
        var caroselData = {
             "attachment":{  
               "type":"template",
               "payload":{  
                  "template_type":"generic",
                  "elements":elements
               }
            }
        };

        ReplyController.sendGeneric(sender, token, caroselData)
        
    } else {
        
        // No restaurants to show, send error message
        ReplyController.sendMessage(sender, token, "Sorry! It looks like we don't have that!")
        
    }    
    
}

var buildMonteCarloReply = function (sender, token, response) {
    MuxController.handleMonteCarloRequest(sender, response).then(function (res){
        if (res.isDone){
            buildCaroselReply(sender, token, res)
        } else {
            buildQuickReply(sender, token, res)
        }
    }).catch(console.log);
}

var buildMessageReply = function (sender, token, message) {
    MuxController.handleMessageRequest(sender, message).then(function (res){
        if (res.isDone){
            buildCaroselReply(sender, token, res)
        } else {
            buildQuickReply(sender, token, res)
        }
    }).catch(console.log);
}

QuickReplyController.handle = function(sender, text, token, req, res) {
    var textToReturn = "";
    
    var newtext = text.toLowerCase();
    
    // Let facebook know it was received
    ReplyController.sendReceived(sender, token);

    switch(newtext) {

        case "quickno":
            buildMonteCarloReply(sender, token, 0);
            break;
            
        case "quickmaybe":
            buildMonteCarloReply(sender, token, 1);
            break;
            
        case "quickyes":
            buildMonteCarloReply(sender, token, 2);
            break;
            
        default:

    }
}

module.exports = QuickReplyController;