

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
        onSuccess: function (data) {
            console.log('connected');
            var topic = "$aws/things/myThingName/shadow/get";
            
            // subscribe to the drawing
            client.subscribe(topic);
            
            // publish a lifecycle event
            var ping_for_get = new Paho.MQTT.Message("");
            ping_for_get.destinationName = `$aws/things/myThingName/shadow/get`;
            var active_sync = function() {
              console.log("Pinging client with empty message")
              client.send(ping_for_get);
              setTimeout(active_sync, 5000);
            };
            active_sync();

        },
        useSSL: true,
        timeout: 20,
        mqttVersion: 4,
        onFailure: function (err) {
            console.error('connect failed');
            console.error(err);
        },
        
    }

    client.onMessageArrived =  function (message) {
            try {
                console.log("msg arrived");
            } catch (e) {
                console.log("error! " + e);
            }
    }

    client.onConnectionLost =  function(responseObject) {
      console.log(responseObject)
      if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:"+responseObject.errorMessage);
      }
    }

    client.connect(connectOptions);

}
