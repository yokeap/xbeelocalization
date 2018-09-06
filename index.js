var express = require('express')
  , path = require('path')
  , app = express()
  , http = require('http').Server(app)
  , io = require('socket.io')(http)
  , child = require('child_process')
  , SerialPort = require('serialport')
  , xbee_api = require('xbee-api')
  , events = require('events')
  , eventEmitter = new events.EventEmitter()
  , sequence = 0;

console.log(__dirname);

http.listen(4000, () => {
    console.log('listening on localhost:4000');
});

var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 1
});

var serialport = new SerialPort("/dev/ttyUSB0", {
  baudRate: 115200,
});

var stringVal = "";

var remoteAT = [
  {
    type: 0x17, // xbee_api.constants.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST
    id: 0x01, // optional, nextFrameId() is called per default
    destination64: "0013A20040A04C3C",
    destination16: "fffe", // optional, "fffe" is default
    remoteCommandOptions: 0x02, // optional, 0x02 is default
    command: "DB",
    commandParameter: [ ] // Can either be string or byte array.
  },
  {
    type: 0x17, // xbee_api.constants.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST
    id: 0x01, // optional, nextFrameId() is called per default
    destination64: "0013A200409F4157",
    destination16: "fffe", // optional, "fffe" is default
    remoteCommandOptions: 0x02, // optional, 0x02 is default
    command: "DB",
    commandParameter: [ ] // Can either be string or byte array.
  },
  {
    type: 0x17, // xbee_api.constants.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST
    id: 0x01, // optional, nextFrameId() is called per default
    destination64: "0013A200409F4373",
    destination16: "fffe", // optional, "fffe" is default
    remoteCommandOptions: 0x02, // optional, 0x02 is default
    command: "DB",
    commandParameter: [ ] // Can either be string or byte array.
  }
];

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "./")));
app.use(express.static(path.join(__dirname, "./public/")));

app.get('/', (req, res) => {
    res.sendfile(__dirname + '/public/index.html');
});

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);

serialport.on("open", function() {
  setInterval(send_request, 100);
});

function send_request(){
  xbeeAPI.builder.write(remoteAT[sequence++]);
  if(sequence > 1) sequence = 0;
}

// All frames parsed by the XBee will be emitted here
xbeeAPI.parser.on("data", function(frame) {
  var data = JSON.parse(JSON.stringify(frame));
  //console.log(data);

  if(data.type == 151){
    if(data.remote64 == '0013a20040a04c3c'){
       var dataRSSI = JSON.parse(JSON.stringify(frame.commandData));
       stringVal = "Node A = " + dataRSSI.data[0]*-1;
       eventEmitter.emit('anchorA.data.stream', dataRSSI.data[0]);
       console.log(stringVal);
    }
    if(data.remote64 == '0013a200409f4157'){
       var dataRSSI = JSON.parse(JSON.stringify(frame.commandData));
       stringVal = "Node B = " + dataRSSI.data[0]*-1;
       eventEmitter.emit('anchorB.data.stream', dataRSSI.data[0]);
       console.log(stringVal);
    }
    if(data.remote64 == '0013a200409f4373'){
       var dataRSSI = JSON.parse(JSON.stringify(frame.commandData));
       stringVal = "Node C = " + dataRSSI.data[0]*-1;
       eventEmitter.emit('anchorC.data.stream', dataRSSI.data[0]);
       console.log(stringVal);
    }
  }
});

io.on('connection', function(socket){
  console.log('A user connected');
  eventEmitter.on('anchorA.data.stream', function(data){
    socket.emit('anchorA.data', data);
  });
  eventEmitter.on('anchorB.data.stream', function(data){
    socket.emit('anchorB.data', data);
  });
  eventEmitter.on('anchorC.data.stream', function(data){
    socket.emit('anchorC.data', data);
  });
});
