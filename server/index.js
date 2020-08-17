#!/usr/bin/env node

//Paquetes de WebSocket y http
var WebSocketServer = require('websocket').server;
var http = require('http');
const { client } = require('websocket');

//Varibles globales para todas las salas
let cont = 0;
let servidores = []
let sockets = []
let usuarios = {}
let PORT = 4201
let HOST = '0.0.0.0'

// Deck de cartas 
const cards = [
	'guard','guard','guard','guard',
	'guard','priest','priest','baron',
	'baron','handmaid', 'handmaid','prince',
	'prince','king','countess','princess'
    ]

// Diccionario de numero de cartas
const diccionarioCartas = {
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

/**
 * Metodo para revolver el deck de cartas 
 * @param {*} array - lista de cartas
 */
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

/**
 * Metodo de validacion para verificar si un usuario puede entrar a la sala o no
 * Se basa en la cantidad de usuarios por sala, donde si es true, hay espacio disponible
 * y false si ya hay 4 jugadores en la sala
 * @param {*} origin - socket de sala
 * @param {*} cantjugadores - cantidad de jugadores en la sala
 */
function originIsAllowed(origin,cantjugadores) {
    // put logic here to detect whether the specified origin is allowed.
    if(cantjugadores<4){
        console.log("Esto es el true de ORIGINISALLOWED "+cantjugadores);
        return true;
    }else{
        console.log("esto es el false de ORIGINISALLOWED "+cantjugadores);
        return false;
    }
}


/**
 * Metodo donde se crea la sala y tiene todos protocolos. Es el encargado de manejar todos los protocolos para enviar al cliente
 */
function crearSala() {
    //============== Variables de sala generales 
    let usuariosIngresados = 0;
    let turno = cont;
    let puerto = PORT + turno
    let cartaServer = cards
    let socketsClients = []
    usuarios[puerto] = {}
    let turnoJugador = 0;
    //=====================================
    //============== Revolver a cartas 
    shuffle(cartaServer)
    let stack = [];
    let personas = 'usuarios|'
    let repartoInicial = 'cartas|'
    cartaServer.forEach(carta => stack.push(carta))
    console.log("Mira al Stack cuando se crea "+stack);
    //========================================
    //============ Creacion de nuevo socket para sala
    servidores[turno] = http.createServer(function (request, response) {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    });
    //============ Para verificar a que host y puerto debe escuchar la sala
    servidores[turno].listen(puerto,HOST, function () {
        console.log((new Date()) + ' Server is listening on '+HOST+':'+ puerto.toString());
    });
    //Instancia de objeto WebSocketServer
    sockets[turno] = new WebSocketServer({
        httpServer: servidores[turno],
        autoAcceptConnections: false
    });
    //=================================================
    //=========== Conexion de socket general => Aqui se desarrolla el intercambio servidor cliente
    sockets[turno].on('request', function (request) {
        // Verificacion de cantidad de usuarios en la sala, si hay mas de 4, rechaza la conexion
        if (!originIsAllowed(request.origin,usuariosIngresados)) {
            request.reject();
            console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
            return;
        }
        //====== En caso que la conexion si es aceptada 
        var connection = request.accept('echo-protocol', request.origin);
        socketsClients.push(connection);
        console.log((new Date()) + ' Connection accepted.');
        //====== Ya se establece conexion con y aqui ya se pueden enviar a manejar protocolos
        connection.on('message', function (message) {
            console.log("El mensaje ingresado es " + message.utf8Data);
            let mensaje = message.utf8Data
            let entradaCliente = mensaje.split("|");

            //====== Formato de envio de juego   => instruccion | username | target 
            if (entradaCliente[0].localeCompare("dondeConecto") == 0) {
                
                cont++;
                nuevopuerto = PORT + cont;
                connection.sendUTF(nuevopuerto.toString());
                crearSala();

            } else
            //====== Protocolo para que usuario pueda conectarse a la sala => ---
            if (entradaCliente[0].localeCompare("conectarmeASala") == 0) {
                let temp = {}
                usuariosIngresados++;
                

                console.log("Me he conectado exitosamente " + ":" + puerto);
                let indice = usuariosIngresados.toString();
                //Verificacion de nombres repetidos, si encuentra un nombre repetido le agrega el numero en el orden en el que entro
                if(usuariosIngresados>1){
                    let bandera = true
                    
                    Object.keys(usuarios[puerto]).map((key,index)=>{
                   
                        if( usuarios[puerto][key]["username"].localeCompare(entradaCliente[1]) == 0 ){
                            console.log("entroooo")
                            temp = {
                                "username": entradaCliente[1]+indice,
                                "cartas": [],
                                "invencible": false,
                                "vivo": true,
                                "tokens": 0
                            }
                            bandera = false
                        }else
                        if(bandera){
                            temp = {
                                "username": entradaCliente[1],
                                "cartas": [],
                                "invencible": false,
                                "vivo": true,
                                "tokens": 0
                            }
                        }
                    })
                }else{
                    temp = {
                        "username": entradaCliente[1],
                        "cartas": [],
                        "invencible": false,
                        "vivo": true,
                        "tokens": 0
                    }
                }
               

                usuarios[puerto][usuariosIngresados] = temp;
                                
                let mensaje = "conectado|" + usuariosIngresados
                connection.sendUTF(mensaje);
                
                //==== Asignar una carta a un jugador del stack de cartas
                let card = stack.pop();
                
                usuarios[puerto][indice]["cartas"].push(card)

                console.log(usuarios[puerto])
                personas = personas + usuariosIngresados + "|" +  usuarios[puerto][indice]["username"] + "|"
                repartoInicial = repartoInicial + usuariosIngresados + "|" + card + "|"
                socketsClients.forEach(function (client) {
                    client.sendUTF(personas);
                })
                //Una vez esten los 4 jugadores ya puede iniciar la partida y envia el usuario y cartas a cada cliente
                if(usuariosIngresados == 4){
                    let card = stack.pop();
                    usuarios[puerto]["1"]["cartas"].push(card);
                    let usuario1 = usuarios[puerto]["1"]["username"];
                    let carta11 = usuarios[puerto]["1"]["cartas"][0];
                    let carta12 = usuarios[puerto]["1"]["cartas"][1];
                    let usuario2 = usuarios[puerto]["2"]["username"];
                    let carta2 = usuarios[puerto]["2"]["cartas"][0];
                    let usuario3 = usuarios[puerto]["3"]["username"];
                    let carta3 = usuarios[puerto]["3"]["cartas"][0];
                    let usuario4 = usuarios[puerto]["4"]["username"];
                    let carta4 = usuarios[puerto]["4"]["cartas"][0];
                    turnoJugador++;
                    socketsClients.forEach(function (client) {
                        client.sendUTF("turno|"+usuario1+"|"+carta11+"|"+carta12+"|"+usuario2+"|"
                        +carta2+"|"+usuario3+"|"+carta3+"|"+usuario4+"|"+carta4);
                    });
                    console.log("Las cartas de los usuarios son")
                    console.log(usuarios[puerto]) 
                }
            } else
            //====== Protocolo para iniciar la señal de inicio de partida
            if (entradaCliente[0].localeCompare("iniciar") == 0) {
                socketsClients.forEach(function (client) {
                    client.sendUTF(repartoInicial);
                })
            }else
            //====== Protocolo para enviar mensajes por broadcast
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
            //====== Protocolo para realizar jugadas, este protocolo ya viene con la carta que jugo el usuario
            if(entradaCliente[0].localeCompare("jugar") == 0){
                //========= Variables para realizar jugadas
                let tu = entradaCliente[1]
                let cartaAJugar = entradaCliente[2].toLowerCase()
                let rival = entradaCliente[3]
                let numTuyo = getKeyByValue(usuarios[puerto],tu)
                let num = getKeyByValue(usuarios[puerto],rival)
                let cartaContrincanteReal = usuarios[puerto][num]["cartas"];
                
                //========== Carta de Guard
                if(cartaAJugar.localeCompare("guard")==0){

                    let idGuard = usuarios[puerto][numTuyo]["cartas"].indexOf("guard")

                    let adivinanza = entradaCliente[4].toLowerCase()
                    let res = guard(adivinanza,cartaContrincanteReal[0]);
                    //Si adivine la carta
                    if(res){
                        usuarios[puerto][num]["vivo"] = false;
                    }

                    socketsClients.forEach(function (client) {
                        client.sendUTF("guard|"+tu+"|"+rival+"|"+res+"|"+cartaContrincanteReal[0]);
                    })
                   console.log("El guard esta en la posicion "+idGuard+" y sera descartada")
                   usuarios[puerto][numTuyo]["cartas"].splice(idGuard,1)
                   console.log(usuarios[puerto])
                   //fruits.splice(0, 1);        // Removes the first element of fruits 
                   
                }else
                //============ Carta de Priest
                if(cartaAJugar.localeCompare("priest")==0){
                    let idPriest = usuarios[puerto][numTuyo]["cartas"].indexOf("priest")
                    console.log("La carta de tu rival es",cartaContrincanteReal[0])
                    let res = cartaContrincanteReal[0]
                    //connection.sendUTF("priest|"+res);

                    socketsClients.forEach(function (client) {
                        client.sendUTF("priest|"+tu+"|"+rival+"|"+res);
                    })
                    console.log("El priest esta en la posicion "+idPriest+" y sera descartada")
                    usuarios[puerto][numTuyo]["cartas"].splice(idPriest,1)
                    console.log(usuarios[puerto])

                }else
                //==========Carta de Baron
                if(cartaAJugar.localeCompare("baron")==0){

                    // Este se debe modificar cuando se tengan 2 cartas debido a que es el valor de tu otra carta contra la del rival no el valor del baron 
                    let miOtraCarta = ''
                    let idbar = usuarios[puerto][numTuyo]["cartas"].indexOf("baron")
                    console.log("TU BARON ESTA EN LA POSCION ", idbar)
                    if(idbar==0){//si el baron esta en la posicion 0 comparar la carta en la posicioni 1
                        miOtraCarta = usuarios[puerto][numTuyo]["cartas"][1]
                        console.log("Mi otra carta es",miOtraCarta)
                    }else{//si el baron esta en la posicion 1 comparar la carta en la posicioni 0
                        miOtraCarta = usuarios[puerto][numTuyo]["cartas"][0]
                        console.log("Mi otra carta es",miOtraCarta)
                    }

                    let primera = diccionarioCartas[miOtraCarta];
                    let segunda = diccionarioCartas[cartaContrincanteReal[0]];

                    console.log("Primera "+primera+" -- Segunda "+segunda);

                    let res = baron(primera,segunda);
                    let perdedor = "";

                    // Usuario que jugo carta gano
                    if(res == 1){
                        perdedor = rival;
                        usuarios[puerto][num]["vivo"] = false;
                        socketsClients.forEach(function (client) {
                            client.sendUTF("baron|"+tu+"|"+rival+"|"+perdedor+"|"+cartaContrincanteReal[0]);
                        })
                    }else
                    if(res == -1){ //Jugador contrario gano
                        perdedor = tu;
                        usuarios[puerto][numTuyo]["vivo"] = false;
                        socketsClients.forEach(function (client) {
                            client.sendUTF("baron|"+tu+"|"+rival+"|"+perdedor+"|"+miOtraCarta);
                        })
                        
                    }else{
                        perdedor = "-";
                        socketsClients.forEach(function (client) {
                            client.sendUTF("baron|"+tu+"|"+rival+"|"+perdedor+"|-");
                        })
                    }
                    //baron | quién tiró | quién recibió | -1/0/1
                    
                    
                    console.log("El priest esta en la posicion "+idbar+" y sera descartada")
                    usuarios[puerto][numTuyo]["cartas"].splice(idbar,1)
                    console.log(usuarios[puerto])

                }else
                //========== Carta de Prince
                if(cartaAJugar.localeCompare("prince")==0){
                    console.log("En el stack quedan "+stack.length+" cartas")
                    console.log("En el stack estan las cartas: ",stack)
                    console.log(usuarios[puerto])
                    let idPrince = usuarios[puerto][numTuyo]["cartas"].indexOf("prince")

                    let cartaAntigua = ' '
                    if(stack.length != 0 ){

                        if(num == numTuyo){ // El usuario uso prince en si mismo
                            console.log("El usuario uso prince en si mismo")
    
                            let miIndex = usuarios[puerto][num]["cartas"].indexOf("prince")
                            console.log("El index donde esta el principe del usuario es ",miIndex)
    
                            if(miIndex == 1){ // El prince del usuario esta en la posicion 1 por lo que eliminaremos la posicion 0
                                let esPrincess = usuarios[puerto][num]["cartas"][0]
                                console.log("la carta es "+usuarios[puerto][num]["cartas"][0])
    
                                if(esPrincess.localeCompare("princess")==0){ // Si la carta es princesa el jugador F
    
    
                                    usuarios[puerto][num]["vivo"] = false;
                                    console.log("Murio")
                                    //prince | quién tiró | quién recibe | nueva_carta
                                    socketsClients.forEach(function (client) {
                                        client.sendUTF("prince|"+tu+"|"+rival+"|"+"murio|princess");
                                    })
                                    usuarios[puerto][numTuyo]["cartas"].splice(idPrince,1)
    
    
                                }else{ // Si la carta es no es princesa le cambiamos la carta
                                    cartaAntigua = usuarios[puerto][num]["cartas"][0]
    
                                    usuarios[puerto][num]["cartas"].splice(0,1)
    
                                    let card = stack.pop();
                                    usuarios[puerto][num]["cartas"].push(card);
    
                                    console.log(usuarios[puerto])
                                    
                                    socketsClients.forEach(function (client) {
                                        client.sendUTF("prince|"+tu+"|"+rival+"|"+card+"|"+cartaAntigua);
                                    })
                                    usuarios[puerto][numTuyo]["cartas"].splice(idPrince,1)
                                }                        
    
                            }else{ // El prince del usuario esta en la posicion 0 por lo que eliminaremos la posicion 1
    
                                let esPrincess = usuarios[puerto][num]["cartas"][1]
                                console.log("la carta es "+usuarios[puerto][num]["cartas"][1])
    
                                if(esPrincess.localeCompare("princess")==0){ // Si la carta es princesa el jugador F 
                                    cartaAntigua = usuarios[puerto][num]["cartas"][1]
                                    usuarios[puerto][num]["vivo"] = false;
                                    console.log("Murio")
                                    socketsClients.forEach(function (client) {
                                        client.sendUTF("prince|"+tu+"|"+rival+"|"+"murio|princess");
                                    })
                                    usuarios[puerto][numTuyo]["cartas"].splice(idPrince,1)
    
                                }else{ // Si la carta es no es princesa le cambiamos la carta
                                    //console.log("cambiamos la carta de "+usuarios[puerto][num]["cartas"][1])
                                    cartaAntigua = usuarios[puerto][num]["cartas"][1]
    
                                    usuarios[puerto][num]["cartas"].splice(1,1)
                                    let card = stack.pop();
                                    usuarios[puerto][num]["cartas"].push(card);
                                    console.log(usuarios[puerto])
                                    socketsClients.forEach(function (client) {
                                        client.sendUTF("prince|"+tu+"|"+rival+"|"+card+"|"+cartaAntigua);
                                    })
                                    usuarios[puerto][numTuyo]["cartas"].splice(idPrince,1)
                                }
                            }
    
                        }else{
                            console.log("El usuario uso prince en otro jugador")
                            let esPrincess = usuarios[puerto][num]["cartas"][0]
                            //console.log("la carta es "+usuarios[puerto][num]["cartas"][0])
    
                            if(esPrincess.localeCompare("princess")==0){ // Si la carta es princesa el jugador F 
    
                                usuarios[puerto][num]["vivo"] = false;
                                console.log("Murio")
    
                                socketsClients.forEach(function (client) {
                                    client.sendUTF("prince|"+tu+"|"+rival+"|"+"murio");
                                })
                                usuarios[puerto][numTuyo]["cartas"].splice(idPrince,1)
    
                            }else{ // Si la carta es no es princesa le cambiamos la carta
                                
                                console.log("cambiamos la carta de "+usuarios[puerto][num]["cartas"][0])
    
                                usuarios[puerto][num]["cartas"].splice(0,1)
                                let card = stack.pop();
                                usuarios[puerto][num]["cartas"].push(card);
                                console.log("por la carta de "+usuarios[puerto][num]["cartas"][0])
                                console.log(usuarios[puerto])
    
                                socketsClients.forEach(function (client) {
                                    client.sendUTF("prince|"+tu+"|"+rival+"|"+card);
                                })
                                usuarios[puerto][numTuyo]["cartas"].splice(idPrince,1)
                                
                            }                    
                        }

                    }else{
                        console.log("ya no hay cartas")
                        let miIndex = usuarios[puerto][numTuyo]["cartas"].indexOf("prince")
                        usuarios[puerto][numTuyo]["cartas"].splice(miIndex,1)

                        socketsClients.forEach(function (client) {
                            client.sendUTF("sinEfectoCliente|"+tu+"|"+"prince")
                        })

                    }
                    
                }else
                //=========== Carta de Handmaid
                if(cartaAJugar.localeCompare("handmaid")==0){

                    // Este se debe modificar cuando se tengan turnos para regresar a la normalidad a un jugador
                    let idHandmaid = usuarios[puerto][numTuyo]["cartas"].indexOf("handmaid")
                    //jugar|gustavo|handmaid|gustavo
                    usuarios[puerto][num]["invencible"] = true
                    console.log(usuarios[puerto])
                    socketsClients.forEach(function (client) {
                        client.sendUTF("handmaid|"+tu);
                    })
                    usuarios[puerto][numTuyo]["cartas"].splice(idHandmaid,1)
                    console.log(usuarios[puerto])
                    
                }else
                //============= Carta de King
                if(cartaAJugar.localeCompare("king")==0){
                    let idKing = usuarios[puerto][numTuyo]["cartas"].indexOf("king")
                    let cartaContrincante = usuarios[puerto][num]["cartas"][0];
                    let indiceRey = usuarios[puerto][numTuyo]["cartas"].indexOf("king");
                    let cartaAIntercambiar = "";
                    let cartaNuevamia = "";
                    let cartaNuevaCon = "";
                    if(indiceRey == 0){
                        cartaAIntercambiar = usuarios[puerto][numTuyo]["cartas"][1];
                        let temp = cartaContrincante;
                        usuarios[puerto][num]["cartas"][0] = cartaAIntercambiar;
                        usuarios[puerto][numTuyo]["cartas"][1] = temp;
                        cartaNuevamia = usuarios[puerto][numTuyo]["cartas"][1];
                        cartaNuevaCon = usuarios[puerto][num]["cartas"][0];
                    }else{
                        cartaAIntercambiar = usuarios[puerto][numTuyo]["cartas"][0];
                        let temp = cartaContrincante;
                        usuarios[puerto][num]["cartas"][0] = cartaAIntercambiar;
                        usuarios[puerto][numTuyo]["cartas"][0] = temp;
                        cartaNuevamia = usuarios[puerto][numTuyo]["cartas"][0];
                        cartaNuevaCon = usuarios[puerto][num]["cartas"][0];
                    }
                    socketsClients.forEach(function (client) {
                        client.sendUTF("king|"+tu+"|"+rival+"|"+cartaNuevamia+"|"+cartaNuevaCon);
                    })
                    usuarios[puerto][numTuyo]["cartas"].splice(idKing,1)
                    console.log(usuarios[puerto])
                }else
                //============= Carta de countess
                if(cartaAJugar.localeCompare("countess")==0){
                    let idCountess = usuarios[puerto][numTuyo]["cartas"].indexOf("countess")
                    usuarios[puerto][numTuyo]["cartas"].splice(idCountess,1)
                    socketsClients.forEach(function (client) {
                        client.sendUTF("countess|"+tu);
                    })
                }else
                //============= Carta de princess
                if(cartaAJugar.localeCompare("princess")==0){
                    usuarios[puerto][numTuyo]["vivo"] = false;
                    let idPrincess = usuarios[puerto][numTuyo]["cartas"].indexOf("princess")
                    let otraCarta = ""
                    if(idPrincess==0){
                        otraCarta = usuarios[puerto][numTuyo]["cartas"][1]
                    }else{
                        otraCarta = usuarios[puerto][numTuyo]["cartas"][0]
                    }
                    socketsClients.forEach(function (client) {
                        client.sendUTF("princess|"+tu+"|"+otraCarta);
                    })
                    console.log("princess|"+tu+"|"+otraCarta)
                }
            //========== Verificacion para pasar cambiar al siguiente jugador
            let siguienteJugador = turnoJugador+1;
            if(siguienteJugador > 4){
                siguienteJugador = 1;
            }
            //Esto es para cambiar de turno y asignar una carta al siguiente usuario
            if( usuarios[puerto][siguienteJugador]["vivo"] == true){
                turnoJugador++;
                if(turnoJugador > 4){
                    turnoJugador = 1;
                }
            }else
            if(usuarios[puerto][siguienteJugador]["vivo"] == false){
                turnoJugador += 2;
                if(turnoJugador == 6){
                    turnoJugador = 2;
                }else
                if(turnoJugador == 5){
                    turnoJugador = 1;
                }
                if(usuarios[puerto][turnoJugador]["vivo"] == false){
                    turnoJugador++;
                    if(turnoJugador > 4){
                        turnoJugador = 1;
                    }
                }
            }

            let estado_de_jugadores = []
            let cont_perdedores = 0
            Object.keys(usuarios[puerto]).map((key,index)=>{
                estado_de_jugadores.push(usuarios[puerto][key]["vivo"]);
                if(usuarios[puerto][key]["vivo"] == false){
                    cont_perdedores++;
                }
            })
            //En caso de que gane un jugador
            if(cont_perdedores == 3){
                indice = estado_de_jugadores.indexOf(true,0) + 1;
                console.log("El ganador es"+usuarios[puerto][indice]["username"]);
                usuarios[puerto][indice]["tokens"] = usuarios[puerto][indice]["tokens"]+1;
                if(usuarios[puerto][indice]["tokens"] == 4){
                    socketsClients.forEach(function (client) {
                        client.sendUTF("ganadorsupremo|"+usuarios[puerto][indice]["username"]);
                    });    
                    sockets[turno].on('close',function(reasonCode, description){
                        console.log((new Date())+'Peer'+connection.remoteAddress+' disconnected');
                    });
                }else{
                    socketsClients.forEach(function (client) {
                        client.sendUTF("ganador|"+usuarios[puerto][indice]["username"]);
                    });
                    // Limpieza de variables para siguiente ronda
                    cartaServer = cards;
                    shuffle(cartaServer);
                    stack = [];
                    cartaServer.forEach(carta => stack.push(carta));
                    Object.keys(usuarios[puerto]).map((key,index)=>{
                        let card = stack.pop();
                        usuarios[puerto][key]["cartas"] = [card];
                        usuarios[puerto][key]["invencible"] = false;
                        usuarios[puerto][key]["vivo"] = true;
                        turnoJugador = 1;
                    })
                    let primero = stack.pop();
                    usuarios[puerto]["1"]["cartas"].push(primero);
                    let usuario1 = usuarios[puerto]["1"]["username"];
                    let carta11 = usuarios[puerto]["1"]["cartas"][0];
                    let carta12 = usuarios[puerto]["1"]["cartas"][1];
                    let usuario2 = usuarios[puerto]["2"]["username"];
                    let carta2 = usuarios[puerto]["2"]["cartas"][0];
                    let usuario3 = usuarios[puerto]["3"]["username"];
                    let carta3 = usuarios[puerto]["3"]["cartas"][0];
                    let usuario4 = usuarios[puerto]["4"]["username"];
                    let carta4 = usuarios[puerto]["4"]["cartas"][0];
                    socketsClients.forEach(function (client) {
                        client.sendUTF("turno|"+usuario1+"|"+carta11+"|"+carta12+"|"+usuario2+"|"
                        +carta2+"|"+usuario3+"|"+carta3+"|"+usuario4+"|"+carta4);
                    });
                    console.log("Limpieza");
                    console.log(usuarios[puerto]);
                }
            }else{
                if(stack.length != 0 ){
                    let card = stack.pop();
                    console.log("Jugar las cartas son"+stack)
                    usuarios[puerto][turnoJugador.toString()]["cartas"].push(card);
                    console.log(usuarios[puerto])

                    siguienteJugador = usuarios[puerto][turnoJugador.toString()]["username"];

                    let carta1 = usuarios[puerto][turnoJugador.toString()]["cartas"][0];
                    let carta2 = usuarios[puerto][turnoJugador.toString()]["cartas"][1];

                    socketsClients.forEach(function (client) {
                        client.sendUTF("turnoactual|"+siguienteJugador+"|"+carta1+"|"+carta2)
                    })
		    console.log("Turno actual"+siguienteJugador);
                }else{
                    //.send(‘final | jugador1 | carta | jugador2 | carta | jugador3 | carta | 
                    let listaJug = 'final|'
                    Object.keys(usuarios[puerto]).map((key,index)=>{

                        if(usuarios[puerto][key]["vivo"] == true){
                            listaJug = listaJug+usuarios[puerto][key]["username"]+"|"+usuarios[puerto][key]["cartas"]+"|"
                        }
                        
                    })
                    
                    socketsClients.forEach(function (client) {
                        client.sendUTF(listaJug);
                    })
                }
                
            }
        }else
        if(entradaCliente[0].localeCompare("sinEfecto") == 0){
            
            let efectoTu = entradaCliente[1]
            let efectoCarta = entradaCliente[2]

            let numTuyo = getKeyByValue(usuarios[puerto],efectoTu)

            let idSinEfecto = usuarios[puerto][numTuyo]["cartas"].indexOf(efectoCarta);
            let siguienteJugador = turnoJugador+1;
            if(siguienteJugador > 4){
                siguienteJugador = 1;
            }
            //Esto es para cambiar de turno y asignar una carta al siguiente usuario
            if( usuarios[puerto][siguienteJugador]["vivo"] == true){
                turnoJugador++;
                if(turnoJugador > 4){
                    turnoJugador = 1;
                }
            }else
            if(usuarios[puerto][siguienteJugador]["vivo"] == false){
                turnoJugador += 2;
                if(turnoJugador == 6){
                    turnoJugador = 2;
                }else
                if(turnoJugador == 5){
                    turnoJugador = 1;
                }
                if(usuarios[puerto][turnoJugador]["vivo"] == false){
                    turnoJugador++;
                    if(turnoJugador > 4){
                        turnoJugador = 1;
                    }
                }
            }
            socketsClients.forEach(function (client) {
                client.sendUTF("sinEfectoCliente|"+efectoTu+"|"+efectoCarta)
            })
            usuarios[puerto][numTuyo]["cartas"].splice(idSinEfecto,1)

            let card = stack.pop();
            usuarios[puerto][turnoJugador.toString()]["cartas"].push(card);
            console.log(usuarios[puerto])

            siguienteJugador = usuarios[puerto][turnoJugador.toString()]["username"];

            let carta1 = usuarios[puerto][turnoJugador.toString()]["cartas"][0];
            let carta2 = usuarios[puerto][turnoJugador.toString()]["cartas"][1];

            socketsClients.forEach(function (client) {
                client.sendUTF("turnoactual|"+siguienteJugador+"|"+carta1+"|"+carta2)
            })

        }else
        //============ En caso que haya un empate selecciona al ganador dependiendo del numero de la carta
        if(entradaCliente[0].localeCompare("ganadorEmpate") == 0){
            
            let ganadorEmpate = entradaCliente[1]
            let numTuyo = getKeyByValue(usuarios[puerto],ganadorEmpate)
            socketsClients.forEach(function (client) {
                client.sendUTF("ganador|"+ganadorEmpate)
            })
            usuarios[puerto][numTuyo]["tokens"] = usuarios[puerto][numTuyo]["tokens"]+1;

            cartaServer = cards;
            shuffle(cartaServer);
            stack = [];
            cartaServer.forEach(carta => stack.push(carta));
            Object.keys(usuarios[puerto]).map((key,index)=>{
                let card = stack.pop();
                usuarios[puerto][key]["cartas"] = [card];
                usuarios[puerto][key]["invencible"] = false;
                usuarios[puerto][key]["vivo"] = true;
                turnoJugador = 1;
            })
            let primero = stack.pop();
            usuarios[puerto]["1"]["cartas"].push(primero);
            let usuario1 = usuarios[puerto]["1"]["username"];
            let carta11 = usuarios[puerto]["1"]["cartas"][0];
            let carta12 = usuarios[puerto]["1"]["cartas"][1];
            let usuario2 = usuarios[puerto]["2"]["username"];
            let carta2 = usuarios[puerto]["2"]["cartas"][0];
            let usuario3 = usuarios[puerto]["3"]["username"];
            let carta3 = usuarios[puerto]["3"]["cartas"][0];
            let usuario4 = usuarios[puerto]["4"]["username"];
            let carta4 = usuarios[puerto]["4"]["cartas"][0];
            socketsClients.forEach(function (client) {
                client.sendUTF("turno|"+usuario1+"|"+carta11+"|"+carta12+"|"+usuario2+"|"
                +carta2+"|"+usuario3+"|"+carta3+"|"+usuario4+"|"+carta4);
            });
            console.log("Ganador de un empate se reinicia");
            console.log(usuarios[puerto]);

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
