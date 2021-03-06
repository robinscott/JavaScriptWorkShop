var express = require("express"),
 randomNumberGenerator = require('./randomNumberGenerator.js'),
 mockData = require('./mockData.js'),
 meerkovo = require("./meerkovo.js"),
 datasource = new meerkovo(new randomNumberGenerator(1,50)),
 app = express(),
 server = require('http').createServer(app),
 path = require('path'),
 io = require('socket.io').listen(server);

var fullPath = path.resolve(__dirname + '/../Framework_Barebones');

app.use("/",express.static(fullPath));
app.use(express.static(__dirname + '/JSWorkshop'));

server.listen("3030");

var actionMap= {
    "meerkats-awake": datasource.numberOfMeerkatsAwake,
    "meerkats-asleep": datasource.numberOfMeerkatsAsleep,
    "meerkat-waste":  datasource.wasteProduced,
    "daylight-hours":  datasource.daylightHours,
    "food-consumed":  datasource.foodConsumed,
    "servers-down":  datasource.serversDown,
}

app.get('/api/:action/:unitOfTime',function(req, res){
   var action = req.params.action;
   var unitOfTime = req.params.unitOfTime;
   var handleAction= actionMap[action];
   if(handleAction)
   {
       var message = {"unitOfTime": unitOfTime,
                      "value": handleAction()}; 
       res.send(message);
   }
   res.send('Do not know how to handle '+action,500);
});

app.get('/',function(req, res){
    var fullPath = path.resolve(__dirname + '/../web/test.html');
    res.sendfile(fullPath);
});

app.get('/knockout',function(req, res){
  var fullPath = path.resolve(__dirname + '/../../JSWorkshop/Lessons/knockout/lesson-4/index.html');
    res.sendfile(fullPath);
});

//Calls for dummy data
app.get('/getNotifications',function(req, res){
  res.send(mockData.getNotifications())
});

app.get('/getTimeline',function(req, res){
  res.send(mockData.getTimeline())
});

app.get('/getVisitors',function(req, res){
  res.send(mockData.getVisitors())
});

app.get('/getAnimals',function(req, res){
  res.send(mockData.getAnimals())
});



console.log("listening for connections on 3030");

io.sockets.on('connection',function(socket){
    console.log("connection made");
    setInterval(emitMeerkovoState, 3000, socket);
});

function emitMeerkovoState(socket)
{
    for(var key in actionMap)
    {
        socket.emit(key, {"data": actionMap[key]("minute"), "unitOfTime": "minute"});
        socket.emit(key, {"data": actionMap[key]("hour"), "unitOfTime": "hour"});
    }
}

