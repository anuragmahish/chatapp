const express = require('express')
const path = require('path')
const app = express()
const mysql = require('mysql')
const CryptoJS = require('crypto-js')

const key = "very-very-sed-lyf-of-munmun"

const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`))

const io = require('socket.io')(server)
 
//database connection
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'chatapp'
});

app.use(express.static(path.join(__dirname, 'public')))

let socketsConected = new Set()

io.on('connection', onConnected)

function onConnected(socket)
{
  console.log('Socket connected', socket.id)
  socketsConected.add(socket.id)
  io.emit('clients-total', socketsConected.size)

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id)
    socketsConected.delete(socket.id)
    io.emit('clients-total', socketsConected.size)
  })

  socket.on('message', (data) => {

/*decrypting ciphertext using DES

    let start = Date.now()
    const decrypted = CryptoJS.DES.decrypt(data.message, key, {
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
    let end = Date.now()
*/

/*decrypting ciphertext using TripleDES

    let start = Date.now()
    const decrypted = CryptoJS.TripleDES.decrypt(data.message, key, {
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
    let end = Date.now()
*/

/*decrypting ciphertext using AES
*/
    let start = Date.now()
    const decrypted = CryptoJS.AES.decrypt(data.message, key, {
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
    let end = Date.now()


    /*decrypting ciphertext using RC4
    
    let start = Date.now()
    const decrypted = CryptoJS.RC4.decrypt(data.message, key, {
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
    let end = Date.now()
*/
    
    let dectime = end-start + "ms"

    con.query('insert into data values( "'+data.fileSize+'","'+data.algo+'","'+data.enctime+'","'+dectime+'")' )

    socket.broadcast.emit('chat-message', data)
  })

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data)
  })
}