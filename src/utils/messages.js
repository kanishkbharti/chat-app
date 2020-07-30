const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

const generateUploadMessage = (username,file,fileName,ext) => {
    return {
        username,
        file,
        fileName,
        ext,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    generateMessage,
    generateLocationMessage,
    generateUploadMessage
}