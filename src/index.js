const path = require('path')
const http = require('http')
const express = require('express')
const fs=require("fs")
const { v4: uuidv4 }=require('uuid')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage,generateUploadMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    /*
    socket.on('base64 file', function (msg) {
        console.log('received base64 file from client')

        const user = getUser(socket.id)

        const baseImage=msg.file
        const uploadPath = __dirname
        const localPath = `${uploadPath}/uploads/images/`
        const ext = baseImage.substring(baseImage.indexOf("/") + 1, baseImage.indexOf(";base64"))
        const fileType = baseImage.substring("data:".length, baseImage.indexOf("/"))
        const regex = new RegExp(`^data:${fileType}\/${ext};base64,`, 'gi')
        const base64Data = baseImage.replace(regex, "")
        const filename = `${uuidv4()}.${ext}`
        if (!fs.existsSync(`${uploadPath}/uploads/`)) {
            fs.mkdirSync(`${uploadPath}/uploads/`);
        }
        if (!fs.existsSync(localPath)) {
            fs.mkdirSync(localPath)
        }
        fs.writeFileSync(localPath + filename, base64Data, 'base64')
        
        io.to(user.room).emit('uploadFile',

            generateUploadMessage(user.username,msg.file, localPath + filename,ext)


        );
    });
    */

    socket.on('user image',function(image){

        console.log("received");
        const ext = image.substring(image.indexOf("/") + 1, image.indexOf(";base64"))
        console.log("Extension:",ext)
        const user = getUser(socket.id)
        
        if(ext==="mp4")
        {
        io.sockets.to(user.room).emit('addvideo','Video Received',generateUploadMessage(user.username,image));
        }
        else
        {
        io.sockets.to(user.room).emit('addimage','Image Received',generateUploadMessage(user.username,image));
        }
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})