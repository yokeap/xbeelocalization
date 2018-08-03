var SerialPort = require('serialport');
var xbee_api = require('xbee-api');
var C = xbee_api.constants;

var flag = false;

var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 1
});

var serialport = new SerialPort("/dev/ttyUSB0", {
  baudRate: 9600,
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
    xbeeAPI.builder.write(frame_obj);
  }
  if(data.type == 136){
     var dataDB = JSON.parse(JSON.stringify(frame.commandData));
      console.log(">>" , dataDB.data[0]*-1);
  }

  // if(data.)
  // if(data.data[0] == 84){
  //   xbeeAPI.builder.write(frame_obj);
  // }
	//console.log(">>" , data.data[0]);
  //xbeeAPI.builder.write(frame_obj);
});
