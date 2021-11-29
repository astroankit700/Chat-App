const socket = io();

// Elements
const $messageBox = document.querySelector('#message-box');
const $messageForm = document.querySelector('#message-form');
const $messageFormBtn = $messageForm.querySelector('#send');
const $locationBtn = document.querySelector('#send-location');
const $container = document.querySelector('#messages');

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-message-template').innerHTML;

//query string
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

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
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $container.insertAdjacentHTML('beforeend', html)

    console.log(message);
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
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    });
    $container.insertAdjacentHTML('beforeend', html);
    console.log(location.url);
})

socket.emit('join', { username, room });


