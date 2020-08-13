#!/usr/bin/env node

var WebSocketServer = require('websocket').server;
var http = require('http');

let cont = 0;
let servidores = []
let sockets = []
let usuarios = {}
let PORT = 4200
let cards = [
    'guard','guard','handmaid','handmaid',
    'handmaid','handmaid','handmaid','handmaid',
    'handmaid','handmaid', 'handmaid','prince',
    'prince','king','countess','princess'
]

let diccionarioCartas = {
    'guard': '1',
    'priest': '2',
    'baron':'3',
    'handmaid': '4',
    'prince': '5',
    'king': '6',
    'countess': '7',
    'princess': '8'
}
/**
 * Metodo para devolver si adivino al utilizar carta de Guardia
 * que dependiendo si devuelve true signfica que el usaurio advino la carta
 * del contrincante
 * @param {*} cartaContrincante
 * @param {*} cartaAdivinar
 */
function guard(cartaContrincante,cartaAdivinar){
    console.log("la carta verdadera",cartaContrincante)
    console.log("la carta adivinar",cartaAdivinar)
    if(cartaContrincante.localeCompare(cartaAdivinar) == 0){
        return true;
    }else{
        return false;
    }
}
/**
 * Metodo para devolver que dependiendo el valor del contrincante es que se devuelve
 * Si el valor es 1 significa que el usuario gano y sale el contrincante
 * Si el valor es -1 significa que el usuario perdio y se queda el contrincante
 * Si el valor es 0 significa empate
 * @param {*} miCarta 
 * @param {*} cartaUsuario 
 */
function baron(miCarta,cartaUsuario){
    if(miCarta > cartaUsuario){
        return 1;
    }else
    if(miCarta < cartaUsuario){
        return -1;
    }else
    if(cartaUsuario == miCarta){
        return 0;
    }
}
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

function crearSala() {
    //============== Variables de sala generales 
    let usuariosIngresados = 0;
    let turno = cont;
    let puerto = PORT + turno
    let cartaServer = cards
    let socketsClients = []
    usuarios[puerto] = {}
    //=====================================
    //============== Revolver a cartas 
    shuffle(cartaServer)
    let stack = [];
    let personas = 'usuarios|'
    let repartoInicial = 'cartas|'
    cartaServer.forEach(carta => stack.push(carta))
    //========================================
    //============ Creacion de nuevo socket para sala
    servidores[turno] = http.createServer(function (request, response) {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    });
    servidores[turno].listen(puerto, function () {
        console.log((new Date()) + ' Server is listening on port ' + puerto.toString());
    });
    sockets[turno] = new WebSocketServer({
        httpServer: servidores[turno],
        autoAcceptConnections: false
    });
    //=================================================
    //=========== Conexion de socket general => Aqui se desarrolla el intercambio servidor cliente
    sockets[turno].on('request', function (request) {
        if (!originIsAllowed(request.origin)) {
            request.reject();
            console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
            return;
        }
        var connection = request.accept('echo-protocol', request.origin);
        socketsClients.push(connection);
        console.log((new Date()) + ' Connection accepted.');

        connection.on('message', function (message) {
            console.log("El mensaje ingresado es " + message.utf8Data);
            let mensaje = message.utf8Data
            let entradaCliente = mensaje.split("|");

            //====== Formato de envio de juego   => instruccion | username | target 
            if (entradaCliente[0].localeCompare("dondeConecto") == 0) {
                console.log("entro a preguntar y el valor de cont es: " + cont);
                cont++;
                nuevopuerto = PORT + cont;
                connection.sendUTF(nuevopuerto.toString());
                crearSala();

            } else
            if (entradaCliente[0].localeCompare("conectarmeASala") == 0) {
                let temp = {}
                usuariosIngresados++;
                personas = personas + usuariosIngresados + "|" + entradaCliente[1] + "|"

                console.log("Me he conectado exitosamente " + ":" + puerto);

                temp = {
                    "username": entradaCliente[1],
                    "cartas": [],
                    "invencible": false
                }

                usuarios[puerto][usuariosIngresados] = temp;
                console.log(usuarios)
                let mensaje = "conectado|" + usuariosIngresados
                connection.sendUTF(mensaje);

                let card = stack.pop();
                let indice = usuariosIngresados.toString();

                usuarios[puerto][indice]["cartas"].push(card)
                repartoInicial = repartoInicial + usuariosIngresados + "|" + card + "|"
                socketsClients.forEach(function (client) {
                    client.sendUTF(personas);
                })
            } else
            if (entradaCliente[0].localeCompare("iniciar") == 0) {
                socketsClients.forEach(function (client) {
                    client.sendUTF(repartoInicial);
                })
            }else
            if (entradaCliente[0].localeCompare("broadcast") == 0) {

                let usuarioMensaje = entradaCliente[1];
                console.log("usuarioMensaje",usuarioMensaje)
                let mensajeChat = entradaCliente[2];
                console.log("mensajeChat",mensajeChat)
                let mensajeAEnviar = "chatc|"+usuarioMensaje+"|"+mensajeChat

                socketsClients.forEach(function (client) {
                    client.sendUTF(mensajeAEnviar);
                })
            }
            if(entradaCliente[0].localeCompare("jugar") == 0){

                let tu = entradaCliente[1]
                let cartaAJugar = entradaCliente[2].toLowerCase()
                let rival = entradaCliente[3]
                
                let num = getKeyByValue(usuarios[puerto],rival)
                console.log("el num del usuario es",num)
                let cartaContrincanteReal = usuarios[puerto][num]["cartas"];

                if(cartaAJugar.localeCompare("guard")==0){

                    let adivinanza = entradaCliente[4].toLowerCase()
                    let res = guard(adivinanza,cartaContrincanteReal[0]);

                    socketsClients.forEach(function (client) {
                        client.sendUTF("guard|"+tu+"|"+rival+"|"+res);
                    })
                   
                }else
                if(cartaAJugar.localeCompare("priest")==0){

                    console.log("La carta de tu rival es",cartaContrincanteReal[0])
                    let res = cartaContrincanteReal[0]
                    //connection.sendUTF("priest|"+res);

                    socketsClients.forEach(function (client) {
                        client.sendUTF("priest|"+tu+"|"+rival+"|"+res);
                    })

                }else
                if(cartaAJugar.localeCompare("baron")==0){

                    // Este se debe modificar cuando se tengan 2 cartas debido a que es el valor de tu otra carta contra la del rival no el valor del baron 

                    let primera = diccionarioCartas[cartaAJugar];
                    let segunda = diccionarioCartas[cartaContrincanteReal[0]];

                    console.log("Primera "+primera+" -- Segunda "+segunda);

                    let res = baron(primera,segunda);
                    let perdedor = "";

                    // Usuario que jugo carta gano
                    if(res == 1){
                        perdedor = rival;
                    }else
                    if(res == -1){ //Jugador contrario gano
                        perdedor = tu;
                    }else{
                        perdedor = "-";
                    }
                    //baron | quién tiró | quién recibió | -1/0/1

                    socketsClients.forEach(function (client) {
                        client.sendUTF("baron|"+tu+"|"+rival+"|"+perdedor);
                    })

                }
                if(cartaAJugar.localeCompare("handmaid")==0){

                    // Este se debe modificar cuando se tengan turnos para regresar a la normalidad a un jugador

                    //jugar|gustavo|handmaid|gustavo
                    usuarios[puerto][num]["invencible"] = true
                    console.log(usuarios[puerto])
                    socketsClients.forEach(function (client) {
                        client.sendUTF("handmaid|"+tu);
                    })
                   
                }
            }
        
        });
        connection.on('close', function (reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });
    });
}
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key]["username"] === value);
  }
  

crearSala();