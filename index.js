var path = require('path')
var menubar = require('menubar')

var protos = require('./protos/remotecontrolmessages_pb.js')
var message = new protos.Message()
message.setType(protos.MsgType.CONNECT)

// Connect Clementine Remote
var net = require('net')

var client = new net.Socket()
client.connect(5500, '127.0.0.1', function() {
  console.log('Connected')
  var message_buffer = Buffer.from(message.serializeBinary())
  var length_buffer = Buffer.allocUnsafe(4)
  length_buffer.writeUInt32BE(message_buffer.length)

  client.write(Buffer.concat([length_buffer, message_buffer]))

  // Sent play/pause every 5 seconds
  // setInterval(function() {
  //   var message = new protos.Message()
  //   message.setType(protos.MsgType.PLAYPAUSE)

  //   var message_buffer = Buffer.from(message.serializeBinary())
  //   var length_buffer = Buffer.allocUnsafe(4)
  //   length_buffer.writeUInt32BE(message_buffer.length)

  //   client.write(Buffer.concat([length_buffer, message_buffer]))
  // }, 5000)
})

var meta = {
  title: '',
  artist: '',
  position: '',
}

var message_buffer = new Buffer([])

client.on('data', function(data) {
  message_buffer = Buffer.concat([message_buffer, data])
  packet_length = message_buffer.readUInt32BE()

  if (message_buffer.length - 4 < packet_length)
    return

  message = message_buffer.slice(4, 4 + packet_length)
  message_buffer = message_buffer.slice(4 + packet_length)

  var messageProto = protos.Message.deserializeBinary(message)
  var messageObj = messageProto.toObject()
  var msgType = getKeyByValue(protos.MsgType, messageObj.type)
  console.log('Type : ', msgType)
  console.log('Length : ', message_buffer.length - 4)

  switch (msgType) {
    case 'CURRENT_METAINFO':
      var title = messageObj.responseCurrentMetadata.songMetadata.title
      var artist = messageObj.responseCurrentMetadata.songMetadata.artist
      console.log(messageObj.responseCurrentMetadata.songMetadata.title)
      meta.title = title
      meta.artist = artist
      break;
    case 'UPDATE_TRACK_POSITION':
      var position = messageObj.responseUpdateTrackPosition.position
      var positionMinute = parseInt(position/60)
      var positionSecond = ('0' + position%60).slice(-2)
      meta.position = `${positionMinute}:${positionSecond}`
      console.log(position)
      break;
  }

  mb.tray.setTitle(` ${meta.title} - ${meta.artist} | ${meta.position}`)
})
client.on('close', function() {
  console.log('Connection closed')
})

var mb = menubar({
  dir: __dirname,
  icon: path.join(__dirname, 'images', 'clementine.png'),
  width: 200
})

mb.on('ready', function ready () {
  console.log('Menubar ready')
})

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value)
}
