var SerialPort = require('serialport');
var xbee_api = require('xbee-api');
var C = xbee_api.constants;

var flagA = false,
    flagB = false,
    flagC = false;

var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 1
});

var serialport = new SerialPort("/dev/ttyUSB0", {
  baudRate: 115200,
});

var frame_obj = { // AT Request to be sent
  type: C.FRAME_TYPE.AT_COMMAND,
  command: "DB",
  commandParameter: [],
};

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);

serialport.on("open", function() {


  //xbeeAPI.builder.write(frame_obj);
});

// All frames parsed by the XBee will be emitted here
xbeeAPI.parser.on("data", function(frame) {
  var data = JSON.parse(JSON.stringify(frame));
  if(data.type == 144){
    var dataNodeName = JSON.parse(JSON.stringify(data.data));
    if(dataNodeName.data[0] == 65) {
      flagA = true;
      xbeeAPI.builder.write(frame_obj);
    }
  }
  if(data.type == 136){
    if(flagA){
      var dataRSSI = JSON.parse(JSON.stringify(frame.commandData));
       console.log("Node A >>" , dataRSSI.data[0]*-1);
       flagA = false;
    }
  }

  // if(data.)
  // if(data.data[0] == 84){
  //   xbeeAPI.builder.write(frame_obj);
  // }
	//console.log(">>" , data.data[0]);
  //xbeeAPI.builder.write(frame_obj);
});
