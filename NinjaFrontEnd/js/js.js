AWS.config.update({
    region: "us-west-2"
});
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "us-west-2:1e6acf74-146a-4777-82bf-8504e6fda754",
    RoleArn: "arn:aws:iam::281471766549:role/Cognito_DynamoPoolUnauth"
});

var docClient = new AWS.DynamoDB.DocumentClient();

function scanData() {
    document.getElementById('textarea').innerHTML += "Scanning DataBase" + "\n";

    var params = {
        TableName: 'NinjaTap',
    };


    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            document.getElementById('textarea').innerHTML += "Unable to scan the table: " + "\n" + JSON.stringify(err, undefined, 2);
        } else {
            // Print all the pours
            document.getElementById('textarea').innerHTML += "Scan succeeded. " + "\n";

            var myTable = ""
            var something = [];

            data.Items.forEach(function(tap) {
                if (tap.payload.pour) {
                var ounces =  tap.payload.pour /5800 * 33.814;
                ounces = parseFloat(ounces.toFixed(4))
                //var date = new Date(tap.Timestamp + 'UTC');
                var date = tap.Timestamp;
                //date = date.toString();
                //date = date.substring(date.indexOf(" ") + 1);
                //something.push(date + " | Tap: " + tap.Tap + " | Value: " + tap.payload.pour + " |  Liters = " + liters + " |  Ounces = " + ounces + "\n");
                something.push(date + " | Tap: " + tap.Tap + " |  Ounces = " + ounces + "\n");
                }
            });
            something.sort();
            something.reverse();
            
        }

        for (var i = 0; i <= something.length-1; i++) {
            myTable += "<table><tr><div class=\"table-responsive\"> <table class=\"table table-striped\"></thead<tbody>";
            myTable += "<td style='text-align: left;'>" + something[i] + "</td></tr></table>";
        }

        document.getElementById('tablePrint').innerHTML = myTable;       
    }
}






function queryData() {
    var a  = document.getElementById('tapID').value;
    var d1 = document.getElementById('date1').value;
    var d2 = document.getElementById('date2').value;

    // Testing for ISO String format 
    // var d1 = "2017-07-16T15:00:53.677Z";
    // var d2 = "2017-07-23T17:00:53.677Z";
    
    if (a && d1 && d2) {
    document.getElementById('textarea').innerHTML += "Scanning DataBase" + "\n";

       var params = {
        TableName : "NinjaTap",
        KeyConditionExpression: "#yr = :Tap and #time between :date1 and :date2",
        ExpressionAttributeNames:{
            "#yr": "Tap",
            "#time": "Timestamp"
        },
        ExpressionAttributeValues: {
            ":Tap": a,
            ":date1": d1,
            ":date2": d2
        }
    };


    docClient.query(params, onQuery);

    function onQuery(err, data) {
        console.log(data)
        if (err) {
            document.getElementById('textarea').innerHTML += "Unable to scan the table: " + "\n" + JSON.stringify(err, undefined, 2);
        } else {

            document.getElementById('textarea').innerHTML += "Scan succeeded... " + "\n";
            var myTable = ""
            var something = [];

            data.Items.forEach(function(tap) {
                if (tap.payload.pour) {
                    var ounces =  tap.payload.pour /5800 * 33.814;
                    ounces = parseFloat(ounces.toFixed(4))
                    //var date = new Date(tap.Timestamp + 'UTC');
                    var date = new Date(tap.Timestamp);
                    date = date.toString();
                    date = date.substring(date.indexOf(" ") + 1);

                    something.push(date + " | Tap: " + tap.Tap + " |  Ounces = " + ounces + "\n");
                }
                
            });
            something.sort();
            something.reverse();
            
        }

        for (var i = 0; i <= something.length-1; i++) {
            myTable += "<table><tr><div class=\"table-responsive\"> <table class=\"table table-striped\"></thead<tbody>";
            myTable += "<td style='text-align: left;'>" + something[i] + "</td></tr></table>";
        }

        document.getElementById('tablePrint').innerHTML = myTable;       
    }
}   
}


