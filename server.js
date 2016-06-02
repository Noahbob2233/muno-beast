'use strict'
var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)

server.listen(4000)

app.get('/', function (req, res) {
  res.sendfile(require('path').join(__dirname, '/index.html'))
})

app.get('/slave', function (req, res) {
  res.sendfile(require('path').join(__dirname, '/slave.html'))
})

app.use(express.static('.'))

let full = ''
let updates = []

io.on('connection', function (socket) {
  if (full) {
    socket.emit('full', full)
  }
  if (updates.length) {
    updates.forEach((up) => {
      socket.emit('diff', up)
    })
  }
  socket.on('full', function (data) {
    console.log('full', data)
    socket.broadcast.emit('full', data)
    full = data
    updates = []
  })
  socket.on('diff', function (data) {
    console.log('diff', data)
    socket.broadcast.emit('diff', data)
    updates.push(data)
  })
})
