"use strict"

// Configure Cognito identity pool
var credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-west-2:7b7923c1-68de-4a32-8fe2-52840b399eb9',
});

//Getting AWS creds from Cognito is async, so we need to drive the rest of the mqtt client initialization in a callback
credentials.get(function(err) {
    if(err) {
        console.log(err);
        return;
    }
    var requestUrl = SigV4Utils.getSignedUrl('wss', 'data.iot.us-west-2.amazonaws.com', '/mqtt',
        'iotdevicegateway', 'us-west-2',
        credentials.accessKeyId, credentials.secretAccessKey, credentials.sessionToken);
    console.log('requestUrl:', requestUrl)
    initClient(requestUrl);
});

function init() {
    // console.log("Initializing the function")
}

// Connect the client, subscribe to the drawing topic, and publish a "hey I connected" message
function initClient(requestUrl) {
    var clientId = String(Math.random()).replace('.', '');
    var client = new Paho.MQTT.Client(requestUrl, clientId);
    var connectOptions = {
        onSuccess: function () {
            console.log('connected');

            // subscribe to the drawing
            client.subscribe("aws/things/test-iot/shadow");

            // publish a lifecycle event
            message = new Paho.MQTT.Message('{"id":"' + credentials.identityId + '"}');
            message.destinationName = 'aws/things/test-iot/shadow';
            console.log("I am here");
            console.log(message);
            client.send(message);
        },
        useSSL: true,
        timeout: 3,
        mqttVersion: 4,
        onFailure: function (err) {
            console.error('connect failed');
            console.error(err);
        }
    };

    client.connect(connectOptions);

    client.onMessageArrived = function (message) {
        try {
            console.log("msg arrived: " +  message.payloadString);
        } catch (e) {
            console.log("error! " + e);
        }

    };
}
