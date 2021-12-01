const socket = io();

// Elements
const $messageBox = document.querySelector('#message-box');
const $messageForm = document.querySelector('#message-form');
const $messageFormBtn = $messageForm.querySelector('#send');
const $locationBtn = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild;

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMesageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMesageMargin;

    //visible height
    const visibleHeight = $messages.offsetHeight;

    // height of the container
    const containerHeight = $messages.scrollHeight;

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (scrollOffset >= containerHeight - newMessageHeight) {
        $messages.scrollTop = $messages.scrollHeight;
    }




}

// sending message
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //disabling button
    $messageFormBtn.setAttribute('disabled', 'disabled');

    socket.emit('send', $messageBox.value, (error) => {
        //re-enabling buttons
        $messageFormBtn.removeAttribute('disabled', 'disabled');
        $messageForm.reset();
        $messageBox.focus();

        if (error) return console.log(error);
        console.log("This message was delivered!");
    });
});

//receiving message
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll();
})

//room data
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;

})

//sending location
$locationBtn.addEventListener('click', (e) => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser!!');

    $locationBtn.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        // console.log('click');
        // console.log(position);
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationBtn.removeAttribute('disabled');
            console.log('Location Shared!');
        })
    })
})

socket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});
