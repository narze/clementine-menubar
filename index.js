var path = require('path')
var menubar = require('menubar')

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

