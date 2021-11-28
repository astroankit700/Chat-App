const generateMessages = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessages = (url) => {
    return {
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessages,
    generateLocationMessages
}