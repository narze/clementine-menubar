var path = require('path')
var menubar = require('menubar')

var protos = require('./protos/remotecontrolmessages_pb.js')
var message = new protos.Message()
var requestConnect = new protos.RequestConnect()
message.setType(protos.MsgType.CONNECT)
// message.setRequestConnect(requestConnect)

// Connect Clementine Remote
var net = require('net');

var client = new net.Socket();
client.connect(5500, '127.0.0.1', function() {
  console.log('Connected');
  var message_buffer = Buffer.from(message.serializeBinary())
  var length_buffer = Buffer.allocUnsafe(4)
  length_buffer.writeUInt32BE(message_buffer.length)

  client.write(Buffer.concat([length_buffer, message_buffer]))

  // Sent play/pause every 5 seconds
  setInterval(function() {
    var message = new protos.Message()
    message.setType(protos.MsgType.PLAYPAUSE)

    var message_buffer = Buffer.from(message.serializeBinary())
    var length_buffer = Buffer.allocUnsafe(4)
    length_buffer.writeUInt32BE(message_buffer.length)

    client.write(Buffer.concat([length_buffer, message_buffer]))
  }, 5000)
});

client.on('data', function(data) {
  var length = data.readUInt32BE()
  var message_buffer = data.slice(4, 4 + length)

  message = protos.Message.deserializeBinary(message_buffer)
  console.log('Type : ' + message.getType())
//
  // message = protos.Message.deserializeBinary(data.slice(4, 4 + ))
  // console.log(message.getType())
  // if (message.getType() == protos.MsgType.KEEP_ALIVE)
  //   client.write(new Buffer(message.serializeBinary()))

  // client.destroy(); // kill client after server's response
});

client.on('close', function() {
  console.log('Connection closed');
});

///

var mb = menubar({
  dir: __dirname,
  icon: path.join(__dirname, 'images', 'clementine.png'),
  width: 200
})

mb.on('ready', function ready () {
  var i = 1
  setInterval(function () {
    mb.tray.setTitle(' Hello world '+ i++)
  }, 1000)
})

