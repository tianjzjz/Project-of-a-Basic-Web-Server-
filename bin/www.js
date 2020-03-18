const http = require('http')

const PORT = 8000 
const serverHandle = require('../app') //引用了module

const server = http.createServer(serverHandle) 
//本来是req, res函数, 但是我们决定写在别的地方 再引用他 


server.listen(PORT)
console.log('OK')
