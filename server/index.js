#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');

let cont = 0;
let servidores = []
let sockets = []
let usuarios = {}
let PORT = 4200

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
    usuarios[puerto] = []
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
                usuarios[puerto].push(entradaCliente[1]);
                console.log(usuarios)
                connection.sendUTF(usuariosIngresados);
            }
        });
        connection.on('close', function(reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });
    });
}

function unirseSala(){
    let turno = cont;
    servidores[turno] = http.createServer(function(request, response) {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    });
    let puerto = PORT + turno
    servidores[turno].listen(puerto,function() {
        console.log((new Date()) + ' Server is listening on port '+puerto.toString());
    });
    sockets[turno] = new WebSocketServer({
        httpServer: servidores[turno],
        // You should not use autoAcceptConnections for production
        // applications, as it defeats all standard cross-origin protection
        // facilities built into the protocol and the browser.  You should
        // *always* verify the connection's origin and decide whether or not
        // to accept it.
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
        console.log((new Date()) + ' Connection accepted.');
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                console.log(turno.toString()+' Received Message de server : ' + message.utf8Data);
                connection.sendUTF(message.utf8Data);
            }
            else if (message.type === 'binary') {
                console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                connection.sendBytes(message.binaryData);
            }
        });
        connection.on('close', function(reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });
    });
    cont++;
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