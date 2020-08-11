#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');

let cont = 0;
let servidores = []
let sockets = []
let usuarios = {}
let PORT = 4200
const cards = [
	'guard','guard','guard','guard',
	'guard','priest','priest','baron',
	'baron','handmaid', 'handmaid','prince',
	'prince','king','countess','princess'
    ]

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
  }
function convertStrToBin(mensaje) {
    let output = ""
    for (let i = 0; i < mensaje.length; i++) {
        output += input[i].charCodeAt(0).toString(2) + " ";
    }
    return output
}

function convertBinToStr(mensaje){
    let respuesta = parseInt(mensaje,2).toString(10);
}

function crearSala(){
    console.log("He llegado de nuevo a crear sala")
    let usuariosIngresados = 0;
    let turno = cont;
    let puerto = PORT + turno
    let cartaServer = cards
    let socketsClients = []
    usuarios[puerto] = {}
    servidores[turno] = http.createServer(function(request, response) {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    });
    servidores[turno].listen(puerto,function() {
        console.log((new Date()) + ' Server is listening on port '+puerto.toString());
    });
    sockets[turno] = new WebSocketServer({
        httpServer: servidores[turno],
        autoAcceptConnections: false
    });
    sockets[turno].on('request', function(request) {
        if (!originIsAllowed(request.origin)) {
          // Make sure we only accept requests from an allowed origin
          request.reject(); 
          console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
          return;
        }
        var connection = request.accept('echo-protocol', request.origin);
        socketsClients.push(connection);
        console.log((new Date()) + ' Connection accepted.');
        connection.on('message', function(message) {
            console.log("El mensaje ingresado es "+message.utf8Data);
            let mensaje = message.utf8Data
            let entradaCliente = mensaje.split("|");
            // instruccion | username | target 
            if(entradaCliente[0].localeCompare("dondeConecto")==0){
                console.log("entro a preguntar y el valor de cont es: "+cont);
                cont++;
                nuevopuerto = PORT+cont;
                connection.sendUTF(nuevopuerto.toString());
                crearSala();
                
            }else
            if(entradaCliente[0].localeCompare("conectarmeASala")==0){
                console.log("Me he conectado exitosamente "+":"+puerto);
                usuariosIngresados++;
                let temp = {}
                temp = {
                    "username": entradaCliente[1],
                    "cartas": []
                }
                console.log("Mira temp"+JSON.stringify(temp));
                console.log("Esto es usuarios"+JSON.stringify(usuarios));
                usuarios[puerto][usuariosIngresados] = temp;
                console.log(usuarios)
                let mensaje = "conectado|"+usuariosIngresados
                connection.sendUTF(mensaje);


                shuffle(cartaServer)
                //console.log(cartaServer)
                var stack = []; 
                //stack.push(cartaServer)
                cartaServer.forEach(carta=>stack.push(carta))
                //console.log(stack)
                for(i=1; i<=4; i++ ){
                    //connection.sendUTF(i+"|"+cartaServer.pop);
                    let card = stack.pop()
                    console.log(i+" | "+card)
                    //console.log("Esto esta usuarios"+JSON.stringify(usuarios[puerto]));
                }

            }else
            if(entradaCliente[0].localeCompare("iniciar")==0){
                console.log("entro al if")
                shuffle(cartaServer)
                var stack = []; 
                cartaServer.forEach(carta=>stack.push(carta))
                let mensaje  = 'cartas|'
                for(i=1; i<=4; i++ ){
                    let card = stack.pop()
                    mensaje = mensaje.concat(i+"|"+card+"|")
                    console.log(mensaje)
                    //connection.sendUTF(mensaje);
                    //console.log(i+" | "+card)
                }
                socketsClients.forEach(function(client){
                    client.sendUTF(mensaje);
                })
            }
        });
        connection.on('close', function(reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });
    });
    //cont++;
}


crearSala();
 
// var server = http.createServer(function(request, response) {
//     console.log((new Date()) + ' Received request for ' + request.url);
//     response.writeHead(404);
//     response.end();
// });
// server.listen(4200, function() {
//     console.log((new Date()) + ' Server is listening on port 8080');
// });
 
// wsServer = new WebSocketServer({
//     httpServer: server,
//     // You should not use autoAcceptConnections for production
//     // applications, as it defeats all standard cross-origin protection
//     // facilities built into the protocol and the browser.  You should
//     // *always* verify the connection's origin and decide whether or not
//     // to accept it.
//     autoAcceptConnections: false
// });
 

 
// wsServer.on('request', function(request) {
//     if (!originIsAllowed(request.origin)) {
//       // Make sure we only accept requests from an allowed origin
//       request.reject();
//       console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
//       return;
//     }
    
//     var connection = request.accept('echo-protocol', request.origin);
//     console.log((new Date()) + ' Connection accepted.');
//     connection.on('message', function(message) {
//         if (message.type === 'utf8') {
//             console.log('Received Message: ' + message.utf8Data);
//             connection.sendUTF(message.utf8Data);
//         }
//         else if (message.type === 'binary') {
//             console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
//             connection.sendBytes(message.binaryData);
//         }
//     });
//     connection.on('close', function(reasonCode, description) {
//         console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
//     });
// });