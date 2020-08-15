#!/usr/bin/env node

var WebSocketServer = require('websocket').server;
var http = require('http');
const { client } = require('websocket');

let cont = 0;
let servidores = []
let sockets = []
let usuarios = {}
let PORT = 4200
let cards = [
	'guard','guard','guard','guard',
	'guard','priest','priest','baron',
	'baron','handmaid', 'handmaid','prince',
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
                    "invencible": false,
                    "vivo": true,
                    "tokens": 0
                }

                usuarios[puerto][usuariosIngresados] = temp;
                
                let mensaje = "conectado|" + usuariosIngresados
                connection.sendUTF(mensaje);

                let card = stack.pop();
                console.log("conectarmeASala las cartas son "+stack)
                let indice = usuariosIngresados.toString();

                usuarios[puerto][indice]["cartas"].push(card)

                console.log(usuarios[puerto])

                repartoInicial = repartoInicial + usuariosIngresados + "|" + card + "|"
                socketsClients.forEach(function (client) {
                    client.sendUTF(personas);
                })
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
            // if(entradaCliente[0].localeCompare("cerrar")==0){
            //     client.clo
            // }
            if(entradaCliente[0].localeCompare("jugar") == 0){

                let tu = entradaCliente[1]
                let cartaAJugar = entradaCliente[2].toLowerCase()
                let rival = entradaCliente[3]
                let numTuyo = getKeyByValue(usuarios[puerto],tu)
                console.log("el num del usuario es",numTuyo)

                let num = getKeyByValue(usuarios[puerto],rival)
                console.log("el num del rival es",num)
                let cartaContrincanteReal = usuarios[puerto][num]["cartas"];

                if(cartaAJugar.localeCompare("guard")==0){

                    let adivinanza = entradaCliente[4].toLowerCase()
                    let res = guard(adivinanza,cartaContrincanteReal[0]);
                    //Si adivine la carta
                    if(res){
                        usuarios[puerto][num]["vivo"] = false;
                    }

                    socketsClients.forEach(function (client) {
                        client.sendUTF("guard|"+tu+"|"+rival+"|"+res);
                    })
                   usuarios[puerto][numTuyo]["cartas"].splice(cartaAJugar,1)
                   console.log(usuarios[puerto])
                   //fruits.splice(0, 1);        // Removes the first element of fruits 
                   
                }else
                if(cartaAJugar.localeCompare("priest")==0){

                    console.log("La carta de tu rival es",cartaContrincanteReal[0])
                    let res = cartaContrincanteReal[0]
                    //connection.sendUTF("priest|"+res);

                    socketsClients.forEach(function (client) {
                        client.sendUTF("priest|"+tu+"|"+rival+"|"+res);
                    })
                    usuarios[puerto][numTuyo]["cartas"].splice(cartaAJugar,1)
                    console.log(usuarios[puerto])

                }else
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
                    }else
                    if(res == -1){ //Jugador contrario gano
                        perdedor = tu;
                        usuarios[puerto][numTuyo]["vivo"] = false;
                    }else{
                        perdedor = "-";
                    }
                    //baron | quién tiró | quién recibió | -1/0/1

                    socketsClients.forEach(function (client) {
                        client.sendUTF("baron|"+tu+"|"+rival+"|"+perdedor);
                    })
                    usuarios[puerto][numTuyo]["cartas"].splice(cartaAJugar,1)
                    console.log(usuarios[puerto])

                }else
                if(cartaAJugar.localeCompare("prince")==0){
                    console.log(usuarios[puerto])

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
                                    client.sendUTF("prince|"+tu+"|"+rival+"|"+"murio");
                                })
                                usuarios[puerto][numTuyo]["cartas"].splice(cartaAJugar,1)


                            }else{ // Si la carta es no es princesa le cambiamos la carta
                                usuarios[puerto][num]["cartas"].splice(0,1)
                                let card = stack.pop();
                                usuarios[puerto][num]["cartas"].push(card);
                                console.log(usuarios[puerto])
                                socketsClients.forEach(function (client) {
                                    client.sendUTF("prince|"+tu+"|"+rival+"|"+card);
                                })
                                usuarios[puerto][numTuyo]["cartas"].splice(cartaAJugar,1)
                            }                        

                        }else{ // El prince del usuario esta en la posicion 0 por lo que eliminaremos la posicion 1

                            let esPrincess = usuarios[puerto][num]["cartas"][1]
                            console.log("la carta es "+usuarios[puerto][num]["cartas"][1])

                            if(esPrincess.localeCompare("princess")==0){ // Si la carta es princesa el jugador F 

                                usuarios[puerto][num]["vivo"] = false;
                                console.log("Murio")
                                socketsClients.forEach(function (client) {
                                    client.sendUTF("prince|"+tu+"|"+rival+"|"+"murio");
                                })
                                usuarios[puerto][numTuyo]["cartas"].splice(cartaAJugar,1)

                            }else{ // Si la carta es no es princesa le cambiamos la carta
                                //console.log("cambiamos la carta de "+usuarios[puerto][num]["cartas"][1])
                                usuarios[puerto][num]["cartas"].splice(1,1)
                                let card = stack.pop();
                                usuarios[puerto][num]["cartas"].push(card);
                                console.log(usuarios[puerto])
                                socketsClients.forEach(function (client) {
                                    client.sendUTF("prince|"+tu+"|"+rival+"|"+card);
                                })
                                usuarios[puerto][numTuyo]["cartas"].splice(cartaAJugar,1)
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
                            usuarios[puerto][numTuyo]["cartas"].splice(cartaAJugar,1)

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
                            usuarios[puerto][numTuyo]["cartas"].splice(cartaAJugar,1)
                        }                    
                    }
                }else
                if(cartaAJugar.localeCompare("handmaid")==0){

                    // Este se debe modificar cuando se tengan turnos para regresar a la normalidad a un jugador

                    //jugar|gustavo|handmaid|gustavo
                    usuarios[puerto][num]["invencible"] = true
                    console.log(usuarios[puerto])
                    socketsClients.forEach(function (client) {
                        client.sendUTF("handmaid|"+tu);
                    })
                    usuarios[puerto][numTuyo]["cartas"].splice(cartaAJugar,1)
                    console.log(usuarios[puerto])
                    
                }else
                if(cartaAJugar.localeCompare("king")==0){
                    let cartaContrincante = usuarios[puerto][num]["cartas"][0];
                    let indiceRey = usuarios[puerto][numTuyo]["cartas"].indexOf("king");
                    let cartaAIntercambiar = "";
                    let cartaNuevamia = "";
                    let cartaNuevaCon = "";
                    if(indiceRey == 0){
                        cartaAIntercambiar = usuarios[puerto][numTuyo]["cartas"][1];
                        console.log("Entro al if");
                        console.log("Carta a intercambiar"+cartaAIntercambiar);
                        console.log("Antes de intercambio"+JSON.stringify(usuarios));
                        let temp = cartaContrincante;
                        usuarios[puerto][num]["cartas"][0] = cartaAIntercambiar;
                        usuarios[puerto][numTuyo]["cartas"][1] = temp;
                        console.log("Despues de intercambio"+JSON.stringify(usuarios));
                        cartaNuevamia = usuarios[puerto][numTuyo]["cartas"][1];
                        cartaNuevaCon = usuarios[puerto][num]["cartas"][0];
                    }else{
                        cartaAIntercambiar = usuarios[puerto][numTuyo]["cartas"][0];
                        console.log("Se fue al else");
                        console.log("Antes de intercambio"+JSON.stringify(usuarios));
                        console.log("Antes de intercambio"+usuarios);
                        let temp = cartaContrincante;
                        usuarios[puerto][num]["cartas"][0] = cartaAIntercambiar;
                        usuarios[puerto][numTuyo]["cartas"][0] = temp;
                        console.log("Despues de intercambio"+JSON.stringify(usuarios));
                        cartaNuevamia = usuarios[puerto][numTuyo]["cartas"][0];
                        cartaNuevaCon = usuarios[puerto][num]["cartas"][0];
                    }
                    socketsClients.forEach(function (client) {
                        client.sendUTF("king|"+tu+"|"+rival+"|"+cartaNuevamia+"|"+cartaNuevaCon);
                    })
                    usuarios[puerto][numTuyo]["cartas"].splice(cartaAJugar,1)
                    console.log(usuarios[puerto])
                }else
                if(cartaAJugar.localeCompare("countess")==0){
                    usuarios[puerto][numTuyo]["cartas"].splice(cartaAJugar,1)
                    console.log("Se jugo a la condesa")
                    socketsClients.forEach(function (client) {
                        client.sendUTF("countess|"+tu);
                    })
                }else
                if(cartaAJugar.localeCompare("princess")==0){
                    usuarios[puerto][numTuyo]["vivo"] = false;
                    console.log("Se jugo a a la princesa");
                    socketsClients.forEach(function (client) {
                        client.sendUTF("princess|"+tu);
                    })
                }
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
                    console.log("Entro al iffff"+estado_de_jugadores);
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
                    sockets[turno].close();
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
                console.log("Esto tiene el array"+estado_de_jugadores+"y el valor de perdedores es"+cont_perdedores);

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