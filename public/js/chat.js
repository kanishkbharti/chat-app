const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $inputFile=document.getElementById('upd')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const uploadMessageTemplate = document.querySelector('#upload-template').innerHTML
const uploadVideoTemplate = document.querySelector('#video-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


    const visibleHeight = $messages.offsetHeight

  
    const containerHeight = $messages.scrollHeight

  
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
/*
socket.on('uploadFile', (message) => {
    console.log(message)
     const html = Mustache.render(uploadMessageTemplate, {
         username:message.username,
         ext:message.ext,
         url: message.fileName,
         createdAt: moment(message.createdAt).format('h:mm a')
     })
     $messages.insertAdjacentHTML('beforeend', html)
     autoscroll()
})

*/
/*
socket.on("addimage",function(msg,base64image){
    console.log(msg)
     const html =$('.content').append($('<p>').append($('<b>').text(msg),'<a target="_blank" href="'+ base64image +'"><img src="' + base64image +'" />'))
     $messages.insertAdjacentHTML('beforeend', html)
     autoscroll()
})
*/
socket.on("addimage",function(msg,message){
    console.log(msg)
    const html = Mustache.render(uploadMessageTemplate, {
        username: message.username,
        base64image:message.base64image,
        createdAt: moment(message.createdAt).format('h:mm a')
    })   
     $messages.insertAdjacentHTML('beforeend', html)
     autoscroll()
})

socket.on("addvideo",function(msg,message){
    console.log(msg)
    const html = Mustache.render(uploadVideoTemplate, {
        username: message.username,
        base64image:message.base64image,
        createdAt: moment(message.createdAt).format('h:mm a')
    })   
     $messages.insertAdjacentHTML('beforeend', html)
     autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})
$(function(){
$('#upd').on('change', function(e){
    var data = e.originalEvent.target.files[0]
    var reader = new FileReader()
    reader.onload = function(evt){
       // var msg ={}
        // msg.file = evt.target.result
       // msg.fileName = data.name
        socket.emit('user image', evt.target.result )
    };
    reader.readAsDataURL(data);   
});

})

/*
function readThenSendFile(data){

    var reader = new FileReader()
    reader.onload = function(evt){
       // var msg ={}
        msg.file = evt.target.result
       // msg.fileName = data.name
        socket.emit('user image', msg)
    };
    reader.readAsDataURL(data);
}
*/
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})