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
function crearSala(){
    console.log("He llegado de nuevo a crear sala")
    let usuariosIngresados = 0;
    let turno = cont;
    let puerto = PORT + turno
    let cartaServer = cards
    let socketsClients = []
    usuarios[puerto] = {}
    shuffle(cartaServer)
    let stack = []; 
    let personas = 'usuarios|'
    let repartoInicial = 'cartas|'
    cartaServer.forEach(carta=>stack.push(carta))
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
                usuariosIngresados++;

                personas = personas+usuariosIngresados+"|"+entradaCliente[1]+"|"
                
                console.log("Me he conectado exitosamente "+":"+puerto);
                
                console.log("personas conectadas "+personas)
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

                let card = stack.pop();
                let indice = usuariosIngresados.toString();
                console.log("inice"+indice);
                usuarios[puerto][indice]["cartas"].push(card)
                console.log("Esto esta usuarios"+JSON.stringify(usuarios));
                
                repartoInicial = repartoInicial+usuariosIngresados+"|"+card+"|"

                socketsClients.forEach(function(client){
                    client.sendUTF(personas);
                    //client.sendUTF(repartoInicial);
                })

                

            }else
            if(entradaCliente[0].localeCompare("iniciar")==0){
                console.log("entro al if")
                console.log(repartoInicial)
                socketsClients.forEach(function(client){
                    client.sendUTF(repartoInicial);
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
 
