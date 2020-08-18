import React from 'react'
import PanelNames from '../PanelNames/PanelNames.jsx'
import './Game.scss'

import { Modal, Loader, Input, Notification, Alert, Button } from 'rsuite'
import Card from '../Card/Card.jsx'
import { w3cwebsocket as W3CWebSocket } from "websocket";

let my_user = ''
let my_username = ''
let my_code = ''

const SIN_EFECTO = 'Jugar sin efecto'

const CARDS = {
	GUARD: 'guard',
	PRIEST: 'priest',
	BARON: 'baron',
	HANDMAID: 'handmaid',
	PRINCE: 'prince',
	KING: 'king',
	COUNTESS: 'countess',
	PRINCESS: 'princess'
}

let cards = [
	'guard','guard','guard','guard',
	'guard','priest','priest','baron',
	'baron','handmaid', 'handmaid','prince',
	'prince','king','countess','princess'
]

const CARDSVAL = {
	'guard': 1,
	'priest': 2,
	'baron': 3,
	'handmaid': 4,
	'prince': 5,
	'king': 6,
	'countess': 7,
	'princess': 8,
}

const has_to_play_other = ['guard', 'priest', 'baron', 'handmaid', 'princess']
const has_to_play_countess = ['prince', 'king']

let client = null
let puertoCodigo = ''

export default class Game extends React.Component {
	constructor (props) {
		super(props)

		this.state = {
			show: true,
			block: true,
			my_cards: [],
			discarded_cards: [],
			messages_array: [],
			is_host: false,
			connected_users: [],
			disabled_users: [],
			alive: true,
			j2_alive: true,
			j3_alive: true,
			j4_alive: true,
			player_turn: '',
			inmunes: [],
			my_points: 0,
			puntosj2: 0,
			puntosj3: 0,
			puntosj4: 0,
			has_ganador_supremo: null,
			has_check_name: false,
			has_to_go_lobby: false
		}
		this.Close = this.Close.bind(this)
		this.GetNewCard = this.GetNewCard.bind(this)
		this.SendChat = this.SendChat.bind(this)
	}

	/**
	 * Cierra el Modal de 'esperando usuarios'
	 */
	Close () {
        this.setState({
            show: false
        })
        if (client.readyState === client.OPEN) {
            let conectarmeASala = "iniciar"
            client.send(conectarmeASala);
        }
	}
	
	/**
	 * Redirecciona al menu
	 */
	GoToMenu() {
		this.props.history.push({
			pathname: '/'
		});
	}

	/**
	 * Redirecciona al lobby
	 */
	GoToLobby() {
		this.props.history.push({
			pathname: `/lobby/${my_username}`,
			state: {
					username: my_username
			}
		});
	}

	componentDidMount() {
		self = this
		my_username = this.props.location.state.username
		puertoCodigo = this.props.location.state.puerto

		let enlace = 'ws://3.135.137.126:'+this.props.location.state.puerto+'/'
		// let enlace = 'ws://localhost:'+this.props.location.state.puerto+'/'
		try {
			client = new W3CWebSocket(enlace, 'echo-protocol');
			
			client.onopen = () => {
				function EstablecerConexion() {
					if (client.readyState === client.OPEN) {
						let conectarmeASala = "conectarmeASala|"+self.props.location.state.username
						client.send(conectarmeASala);
					}
				}
				EstablecerConexion();
			};
			
			client.onclose = function() {
				console.log('echo-protocol Client Closed');
				// self.setState({
				// 	has_to_go_lobby: true
				// })
			};

			client.onmessage = function(e) {
				let mensaje= e.data
				let entradaServer = mensaje.split("|");
				console.log(entradaServer)

				if (typeof e.data === 'string') {
					console.log("El Server Manda: '" + e.data + "'");
				}
				if((entradaServer[0].localeCompare("conectado"))==0){
					console.log("Eres el cliente numero "+entradaServer[1]+" en entrar")
					my_code = entradaServer[1]

					self.setState({
						is_host: my_code == '1'
					})
				}
				//Se ejecuta la primera vez que cuando inicia el juego ahi entran las cartas
				if (entradaServer[0].localeCompare('turno') === 0) {
					const pos = entradaServer.indexOf(my_username)
					self.GetNewCard(entradaServer[pos + 1])
					if (self.state.is_host) {
						self.GetNewCard(entradaServer[pos + 2])
					}

					console.log("Asignar cartas"+entradaServer);
					self.setState({
						show: false,
						player_turn: entradaServer[1]
					})
				}

				if (entradaServer[0].localeCompare('turnoactual') === 0) {
					self.setState({
						player_turn: entradaServer[1]
					})

					if (self.state.inmunes.includes(entradaServer[1])) {
						self.RemoveInmune(entradaServer[1])
					}
					if (entradaServer[1].localeCompare(my_username) == 0) {
						const mi_lista = []
						mi_lista.push(entradaServer[2])
						mi_lista.push(entradaServer[3])
						self.ReplaceMyCards(mi_lista)
						self.CheckMyCards()
					}
				}

				if (entradaServer[0].localeCompare('usuarios') === 0) {
					let i = 0
					const con_u = []
					for(i = 1; i< (entradaServer.length) -1; i = i + 2) {
						if (!self.state.has_check_name) {
							my_username = entradaServer[(entradaServer.length) - 2]
							self.setState({
								has_check_name: true
							})
						}
						con_u.push(entradaServer[i+1])
					}
					self.setState ({
						connected_users: con_u
					})
				}

				if (entradaServer[0].localeCompare('chatc') === 0) {
					console.log("Mensaje para broadcast")
					const estructura_chat = {
						usuario: entradaServer[1],
						mensaje: entradaServer[2]
					}
					// let mensaje = (entradaServer[1]+": "+entradaServer[2])
					let mensajeArray = self.state.messages_array
					mensajeArray.push(estructura_chat)
					self.setState({
						messages_array: mensajeArray
					})
					console.log(self.state.messages_array)
				}

				if (entradaServer[0].localeCompare('final') === 0){
					console.log('FINALISTAS')
					
					let finalistas = []
					let jugador = ''
					let carta = ''
					for(var i = 1; i<entradaServer.length; i = i+2){
						jugador = entradaServer[i]
						carta = entradaServer[i+1]
						finalistas.push({
							name: jugador,
							card: carta
						})
					}

					self.CompararCartas(finalistas)
				}

				if (entradaServer[0].localeCompare('ganador') === 0) {
					self.ResetVariables()
					self.SumarPuntos(entradaServer[1])
					if (entradaServer[1].localeCompare(my_username) === 0) {
						Alert.success(`Has ganado esta ronda. Felicidades.`, 20000)
					} else {
						Alert.error(`${entradaServer[1]} ha ganado esta ronda. Intenta mejor esta ronda.`, 20000)
					}

				}

				if (entradaServer[0].localeCompare('ganadorsupremo') === 0) {
					self.setState({
						has_ganador_supremo: entradaServer[1]
					})
				}

				if (entradaServer[0].localeCompare('sinEfectoCliente') === 0) {
					const titleNotification = `${entradaServer[1]} jugó a ${entradaServer[2]}`
					let bodyNotification = `${entradaServer[1]} jugó a ${entradaServer[2]}, pero no tuvo ningún efecto`
					let my_icon = ''

					if (entradaServer[1].localeCompare(my_username) === 0) {
						my_icon = 'warning'
					} else {
						my_icon = 'info'
					}
					self.DescartarCarta(entradaServer[2], entradaServer[1])
					self.ShowNotification(titleNotification, bodyNotification, my_icon)
				}

	// ======================= JUEGO DE CARTAS =============================

				// ==================== GUARD ====================
				if (entradaServer[0].localeCompare(CARDS.GUARD) === 0) {
					console.log("De haber jugado al guard")
					//"guard|"+tu+"|"+rival+"|"+res
					console.log("El que tiro",entradaServer[1])
					console.log("El que recibio",entradaServer[2])

					const titleNotification = `${entradaServer[1]} jugó a GUARD`
					let bodyNotification = ''
					let my_icon = ''
					
					if (entradaServer[1].localeCompare(my_username) == 0) {
						if (entradaServer[3].localeCompare("true") == 0){
							bodyNotification = `Acertaste contra ${entradaServer[2]}. Lo has eliminado.`
							my_icon = 'success'
							self.DescartarCarta(entradaServer[4], entradaServer[2])
							self.KillPlayer(entradaServer[2])
							console.log("le atino")
						} else {
							bodyNotification = `Fallaste contra ${entradaServer[2]}.`
							my_icon = 'error'
							console.log("Fallaste jeje")
						}
					} else if (entradaServer[2].localeCompare(my_username) == 0) {
						if(entradaServer[3].localeCompare("true") == 0) {
							bodyNotification = `${entradaServer[1]} te ha atacado. Te han eliminado.`
							my_icon = 'error'
							self.DescartarCarta(entradaServer[4], entradaServer[2])
							self.setState ({
								alive: false
							})
							console.log("Te atacaron")
						} else {
							bodyNotification = `${entradaServer[1]} te ha atacado pero ha fallado.`
							my_icon = 'warning'
							console.log("Te atacaron pero no te afecto")
						}
					} else {
						my_icon = 'info'
						if(entradaServer[3].localeCompare("true") == 0) {
							bodyNotification = `${entradaServer[1]} ha atacado a ${entradaServer[2]}. ${entradaServer[2]} ha sido eliminado.`
							self.DescartarCarta(entradaServer[4], entradaServer[2])
							self.KillPlayer(entradaServer[2])
						} else {
							bodyNotification = `${entradaServer[1]} ha atacado a ${entradaServer[2]} pero ha fallado. ${entradaServer[2]} sigue en el juego.`
						}
					}
					
					self.DescartarCarta(entradaServer[0], entradaServer[1])
					self.ShowNotification (titleNotification, bodyNotification, my_icon)
				}
				
				// ==================== PRIEST ====================
				if (entradaServer[0].localeCompare(CARDS.PRIEST) === 0) {
					const titleNotification = `${entradaServer[1]} jugó a PRIEST`
					let bodyNotification = ''
					let my_icon = ''

					if (entradaServer[1].localeCompare(my_username) == 0) {
						bodyNotification = `La carta de ${entradaServer[2]} es ${entradaServer[3]}`
						my_icon = 'success'
						console.log("La carta de " + entradaServer[2] + " es " + entradaServer[3])
					} else if (entradaServer[2].localeCompare(my_username) == 0) {
						bodyNotification = `${entradaServer[1]} vio tu carta`
						my_icon = 'warning'
						console.log(entradaServer[1] + " vio tu carta")
					} else {
						bodyNotification = `${entradaServer[1]} vio la carta de ${entradaServer[2]}`
						my_icon = 'info'
					}

					self.DescartarCarta(entradaServer[0], entradaServer[1])
					self.ShowNotification(titleNotification, bodyNotification, my_icon)
				}
				
				// ==================== BARON ====================
				if (entradaServer[0].localeCompare(CARDS.BARON) === 0) {
					const titleNotification = `${entradaServer[1]} jugó a BARON`
					let bodyNotification = ''
					let my_icon = ''
					
					if (entradaServer[1].localeCompare(my_username) == 0) {// Si yo soy el que tiro la carta
						if (entradaServer[3].localeCompare(entradaServer[1]) == 0) {// Si el perdedor soy yo
							bodyNotification = `${entradaServer[2]} tiene una carta más alta que la tuya, perdiste`
							my_icon = 'error'
							self.setState ({
								alive: false
							})
							console.log( entradaServer[2] + " tiene una carta mas alta que la tuya, perdiste");
						} else if (entradaServer[3].localeCompare(entradaServer[2]) == 0) {// Si el perdedor es el rival
							bodyNotification = `Tu carta es más alta que la de ${entradaServer[2]}, ganaste`
							my_icon = 'success'
							
							self.KillPlayer(entradaServer[2])
							console.log("Tu carta es mas alta que la de "+entradaServer[2]+" ganaste");
						} else {
							bodyNotification = `Has empatado contra ${entradaServer[2]}`
							my_icon = 'warning'
							console.log("Empate");
						}
					} else if (entradaServer[2].localeCompare(my_username) == 0) {// Si yo soy el que recibio la carta
						if (entradaServer[3].localeCompare(entradaServer[1]) == 0) {// Si yo soy el ganador 
							bodyNotification = `Te atacó ${entradaServer[1]} pero tu carta es más alta, ganaste`
							my_icon = 'success'
							self.KillPlayer(entradaServer[1])
							console.log("Te ataco "+ entradaServer[1] + " pero tu carta es mas alta, ganaste")
						} else if (entradaServer[3].localeCompare(entradaServer[2]) == 0) {//Si yo soy el que perdedor
							bodyNotification = `Te atacó ${entradaServer[1]}, y tiene una carta más alta que la tuya, perdiste`
							my_icon = 'error'
							self.setState ({
								alive: false
							})
							console.log("Te ataco "+ entradaServer[1] + " y tiene una carta mas alta que la tuya, perdiste");
						} else {
							bodyNotification = `Has empatado contra ${entradaServer[2]}`
							console.log("Empate")
							my_icon = 'warning'
						}
					} else {
						if (entradaServer[3].localeCompare(entradaServer[1]) == 0) {// Si el perdedor soy yo
							bodyNotification = `${entradaServer[2]} tiene una carta más alta que ${entradaServer[1]}, ${entradaServer[1]} ha perdido`
							my_icon = 'info'
							self.KillPlayer(entradaServer[3])
						} else if (entradaServer[3].localeCompare(entradaServer[2]) == 0) {// Si el perdedor es el rival
							bodyNotification = `${entradaServer[1]} tiene una carta más alta que ${entradaServer[2]}, ${entradaServer[2]} ha perdido`
							my_icon = 'info'
							self.KillPlayer(entradaServer[3])
						} else {
							bodyNotification = `${entradaServer[1]} ha empatado con ${entradaServer[1]}`
							my_icon = 'info'
						}
					}

					if (entradaServer[3].localeCompare('-') !== 0) {
						self.DescartarCarta(entradaServer[4], entradaServer[3])
					}
					self.DescartarCarta(entradaServer[0], entradaServer[1])
					self.ShowNotification(titleNotification, bodyNotification, my_icon)
				}
				
				// ==================== HANDMAID ====================
				if (entradaServer[0].localeCompare(CARDS.HANDMAID) === 0) {
					const titleNotification = `${entradaServer[1]} jugó a HANDMAID`
					let bodyNotification = ''
					let my_icon = ''

					if(entradaServer[1].localeCompare(my_username) == 0){
						bodyNotification = 'Eres invencible por un turno'
						my_icon = 'success'
						console.log("Eres invencible por un turno")
					} else {
						bodyNotification = `Cuidado ${entradaServer[1]} es invencible por un turno.`
						my_icon = 'warning'
						console.log("Cuidado "+ entradaServer[1]+" es invencible por un turno.")
					}
					self.CreateInmune(entradaServer[1])
					
					self.DescartarCarta(entradaServer[0], entradaServer[1])
					self.ShowNotification(titleNotification, bodyNotification, my_icon)
				}

				// ==================== KING ====================
				if (entradaServer[0].localeCompare(CARDS.KING) === 0) {
					const titleNotification = `${entradaServer[1]} jugó a KING`
					let bodyNotification = ''
					let my_icon = ''

					self.DescartarCarta(entradaServer[0], entradaServer[1])
					if (entradaServer[1].localeCompare(my_username) === 0) {
						self.ReplaceMyCards([entradaServer[3]])
						bodyNotification = `Has intercambiado carta con ${entradaServer[2]}`
						my_icon = 'success'
					} else if (entradaServer[2].localeCompare(my_username) === 0) {
						self.ReplaceMyCards([entradaServer[4]])
						bodyNotification = `${entradaServer[1]} ha intercambiado carta contigo`
						my_icon = 'warning'
					} else {
						bodyNotification = `${entradaServer[1]} ha intercambiado carta con ${entradaServer[2]}`
						my_icon = 'info'
					}
					self.ShowNotification(titleNotification, bodyNotification, my_icon)
				}

				// ==================== PRINCE ====================
				if (entradaServer[0].localeCompare(CARDS.PRINCE) === 0) {
					//prince | quién tiró | quién recibe | nueva_carta
					const titleNotification = `${entradaServer[1]} jugó a PRINCE`
					let bodyNotification = ''
					let my_icon = ''
					
					self.DescartarCarta(entradaServer[0], entradaServer[1])
					if (entradaServer[1].localeCompare(my_username) == 0 && entradaServer[2].localeCompare(my_username) == 0) {
						if (entradaServer[3].localeCompare('murio') === 0) {
							bodyNotification = `Debido a que desechaste una princess, has perdido.`
							my_icon = 'error'
							self.DescartarCarta(CARDS.PRINCESS, entradaServer[2])
						} else {
							bodyNotification = `Cambiaste tu carta, tu nueva carta es ${entradaServer[3]}`
							my_icon = 'success'
							console.log(`Cambiaste tu carta, tu nueva carta es ${entradaServer[3]}`)
							self.ReplaceMyCards([entradaServer[3]])
						}
					} else if (entradaServer[2].localeCompare(my_username) == 0) {
						if (entradaServer[3].localeCompare('murio') === 0) {
							bodyNotification = `Debido a que desechaste una princess, has perdido.`
							my_icon = 'error'
							self.DescartarCarta(CARDS.PRINCESS, entradaServer[2])
						} else {
							bodyNotification = `${entradaServer[1]} cambió tu carta, tu nueva carta es ${entradaServer[3]}`
							my_icon = 'warning'
							self.ReplaceMyCards([entradaServer[3]])
							console.log(entradaServer[1]+" te cambio la carta, nueva carta es: "+entradaServer[3])
						}
					} else {
						if (entradaServer[3].localeCompare('murio') === 0) {
							bodyNotification = `Debido a que ${entradaServer[2]} desechó una princess, ha perdido.`
							my_icon = 'success'
							self.DescartarCarta(CARDS.PRINCESS, entradaServer[2])
						} else {
							bodyNotification = `${entradaServer[1]} cambió las cartas de ${entradaServer[2]}`
							my_icon = 'info'
							console.log("cambiaron las cartas de "+entradaServer[2])
						}
					}
					self.ShowNotification(titleNotification, bodyNotification, my_icon)
				}

				// ==================== COUNTESS ====================
				if (entradaServer[0].localeCompare(CARDS.COUNTESS) === 0) {
					const titleNotification = `${entradaServer[1]} jugó a COUNTESS`
					let bodyNotification = ''
					let my_icon = ''

					if (entradaServer[1].localeCompare(my_username) == 0) {
						bodyNotification = `Jugaste a countess`
						my_icon = 'success'
						console.log("Jugaste countess")
					} else {
						bodyNotification = `${entradaServer[1]} jugó a countess`
						my_icon = 'info'
						console.log("Jugaron countess")
					}
					self.DescartarCarta(entradaServer[0], entradaServer[1])
					self.ShowNotification(titleNotification, bodyNotification, my_icon)
				}

				// ==================== PRINCESS ====================
				if (entradaServer[0].localeCompare(CARDS.PRINCESS) === 0) {
					const titleNotification = `${entradaServer[1]} jugó a PRINCESS`
					let bodyNotification = ''
					let my_icon = ''

					if (entradaServer[1].localeCompare(my_username) === 0) {
						my_icon = 'error'
						bodyNotification = 'Jugaste a princess'
					} else {
						my_icon = 'success'
						bodyNotification = `${entradaServer[1]} jugó a princess`
					}
					self.DescartarCarta(entradaServer[0], entradaServer[1])
					self.DescartarCarta(entradaServer[2], entradaServer[1])
					self.ShowNotification(titleNotification, bodyNotification, my_icon)
				}
	// ======================================================================
			};
		} catch (err) {
			// this.setState({
			// 	has_to_go_lobby: true
			// })
		}
	}

	/**
	 * Suma 1 punto al personaje que ganó ronda
	 * @param {*} player - Nombre de jugador que sumará puntos
	 */
	SumarPuntos(player) {
		const index = this.state.connected_users.indexOf(my_username)

		if (this.state.connected_users[index] === player) {
			this.setState ({
				my_points: this.state.my_points + 1
			})
		} else if (this.state.connected_users[(index + 1) % 4] === player) {
			this.setState ({
				puntosj2: this.state.puntosj2 + 1
			})
		} else if (this.state.connected_users[(index + 2) % 4] === player) {
			this.setState ({
				puntosj3: this.state.puntosj3 + 1
			})
		} else if (this.state.connected_users[(index + 3) % 4] === player) {
			this.setState ({
				puntosj4: this.state.puntosj4 + 1
			})
		}

	}

	/**
	 * Crea inmunidad a un jugador
	 * @param {*} player - Nombre de jugador que recibirá inmunidad
	 */
	CreateInmune(player) {
		this.setState (state => {
			const eliminados = [...state.disabled_users, player]
			const inmunesss = [...state.inmunes, player]
			
			if (eliminados.length === 3 || eliminados.length === 4) {
				const users = [...state.connected_users, SIN_EFECTO]
				return {
					disabled_users: eliminados,
					inmunes: inmunesss,
					connected_users: users
				}
			} else {
				return {
					disabled_users: eliminados,
					inmunes: inmunesss
				}
			}
		})
	}

	/**
	 * Quita inmunidad a jugador
	 * @param {*} player - Nombre de jugador que se quitará inmunidad
	 */
	RemoveInmune(player) {
		const nuevos_eliminados = this.state.disabled_users.filter(item => item !== player)
		const nuevo_inmunes = this.state.inmunes.filter(item => item !== player)
		const us = this.state.connected_users.filter(item => item !== SIN_EFECTO)
		
		this.setState ({
			disabled_users: nuevos_eliminados,
			inmunes: nuevo_inmunes,
			connected_users: us
		})
	}

	/**
	 * Reemplaza mis cartas por otras nuevas
	 * @param {*} newCard - Listado de nuevas cartas a obtener
	 */
	ReplaceMyCards(newCard) {
		const temp_card = []
		newCard.map((nombre, index) => {
			temp_card.push({
				is_enable: true,
				name: nombre,
			})
		})
		this.setState({
			my_cards: temp_card
		})
	}

	/**
	 * Elimina a un jugador de la ronda
	 * @param {*} player - Nombre de jugador a eliminar en ronda
	 */
	KillPlayer(player) {
		const my_pos = this.state.connected_users.indexOf(my_username)
		
		this.setState (state => {
			const eliminados = [...state.disabled_users, player]

			return {
				disabled_users: eliminados
			}
		})

		if (player.localeCompare(this.state.connected_users[(my_pos + 1) % 4]) == 0) {
			this.setState ({
				j2_alive: false,
			})
		} else if (player.localeCompare(this.state.connected_users[(my_pos + 2) % 4]) == 0) {
			this.setState ({
				j3_alive: false
			})
		} else if (player.localeCompare(this.state.connected_users[(my_pos + 3) % 4]) == 0) {
			this.setState ({
				j4_alive: false
			})
		} else {
			this.setState ({
				alive: false
			})
		}
	}

	/**
	 * Muestra notificación para mostrar alguna información
	 * @param {*} title - Título de notificación
	 * @param {*} description - Descripción de notificación
	 * @param {*} my_icon - Ícono de notificación
	 */
	ShowNotification (title, description, my_icon) {
		Notification[my_icon] ({
			title,
			placement: 'bottomEnd',
			duration: 15000,
			description: <div style={{width: '250px'}}><p>{description}</p></div>
		})
	}

	/**
	 * Obtiene nueva carta y la pone en mi mazo
	 * @param {*} newCard - Carta a poner en mi mazo
	 */
	GetNewCard(newCard) {
		const item = newCard
		cards.splice(cards.indexOf(item), 1)

		const temp_card = this.state.my_cards
		temp_card.push({
			is_enable: true,
			name: item
		})

		console.log('GET NEW CARD:', temp_card)
		this.setState({
			my_cards: temp_card
		})
		this.CheckMyCards()
	}

	/**
	 * Verifica el ganador de la ronda
	 * @param {*} finalistas - Listado de jugadores que empataron
	 */
	CompararCartas(finalistas){
		let highestCard = 0
		let ganadores = []
		
		for(var i=0; i<finalistas.length;i++){
			for(var key in CARDSVAL){
				if(finalistas[i].card === key){
					finalistas[i].value = CARDSVAL[key]
				}
			}
			if(finalistas[i].value > highestCard){
				highestCard = finalistas[i].value
				ganadores = []
				ganadores.push(finalistas[i].name)
			}
			if(finalistas[i].value === highestCard){
				ganadores.push(finalistas[i].name)
			}
		}

		let ganador = ganadores[0]

		if(ganadores.length>1){
			ganador = this.CompararDescartadas(ganadores)
		}

		let winner = 'ganadorEmpate|'
		winner = winner+ganador

		if (ganador === my_username) {
			this.EnviarProtocolo('-',winner)
		}

	}

	/**
	 * Cuenta los puntos de las cartas descartadas
	 * @param {*} posiblesGanadores - Listado de ganadores
	 */
	CompararDescartadas(posiblesGanadores){

		let suma = 0
		let sumaGanadores = []
		for(var j=0; j<posiblesGanadores.length; j++){
			for(var i=0; i<this.state.discarded_cards.length; i++){
				for(var key in CARDSVAL){
					if(posiblesGanadores[j]===this.state.discarded_cards[i].player){
						if(this.state.discarded_cards[i].name === key){
							suma = suma + CARDSVAL[key]
						}
					}
				}
			}
			sumaGanadores.push(suma)
			suma = 0
		}

		let highestValue = 0
		for(var p=0; p<sumaGanadores.length; p++){
			if(sumaGanadores[p]>highestValue){
				highestValue = sumaGanadores[p]
			}
		}

		let indice = sumaGanadores.indexOf(highestValue)
		let ganador = posiblesGanadores[indice]

		return ganador
	}

	/**
	 * Verifica que las cartas puedan jugarse, o bloquearse según sea el caso
	 */
	CheckMyCards() {
		let tmp_cards = this.state.my_cards

		if (tmp_cards.length === 2) {
			if (has_to_play_other.includes(tmp_cards[0].name) && tmp_cards[1].name === 'countess') {
				tmp_cards[1].is_enable = false
			} else if (has_to_play_other.includes(tmp_cards[1].name) && tmp_cards[0].name === 'countess') {
				tmp_cards[0].is_enable = false
			}

			if (has_to_play_countess.includes(tmp_cards[0].name) && tmp_cards[1].name === 'countess') {
				tmp_cards[0].is_enable = false
			} else if (has_to_play_countess.includes(tmp_cards[1].name) && tmp_cards[0].name === 'countess') {
				tmp_cards[1].is_enable = false
			}
		}

		this.setState({
			my_cards: tmp_cards
		})
	}

	/**
	 * Envía el protocolo de chat al server
	 * @param {*} event - Evento de input
	 */
	SendChat(event){
		//Send to Server chat
		if(event.target.value !=''){
			this.setState({lastMessage: event.target.value})
			let texto = 'broadcast|'+my_username+'|'+event.target.value
			client.send(texto);
		}
		//Clean box
		event.target.value = ''
	}

	/**
	 * Reinicia al valor inicial de las variables
	 */
	ResetVariables(){
		this.setState({
			my_cards: [],
			discarded_cards: [],
			disabled_users: [],
			alive: true,
			j2_alive: true,
			j3_alive: true,
			j4_alive: true
		})
	}

	/**
	 * Se envía protocolo a server
	 * @param {*} cardName - Nombre de la carta
	 * @param {*} stringPlay - Protocolo a enviar al server
	 */
	EnviarProtocolo(cardName, stringPlay) {
		console.log("Al haber jugado una carta le mandamos al server:")
		console.log(stringPlay)
		client.send(stringPlay)
	}

	/**
	 * Decarta una carta de un jugador
	 * @param {*} cardName - Nombre de la carta
	 * @param {*} player - Nombre de jugador
	 */
	DescartarCarta(cardName, player) {
		let array_descartadas = this.state.discarded_cards	
		let mis_cartas = this.state.my_cards
		
		if(player === my_username){
			let indice = 1
			if(mis_cartas[0].name === cardName){
				indice = 0
			}
			mis_cartas.splice(indice, 1)
			let obj = {
				name: cardName,
				player: player
			}
			array_descartadas.push(obj)				
		}
		else{
			let obj = {
				name: cardName,
				player: player
			}
			array_descartadas.push(obj)
		}			
		this.setState({
			discarded_cards: array_descartadas,
			my_cards: mis_cartas
		})
		
		if (cardName === CARDS.PRINCESS) {
			this.KillPlayer(player)
		}
	}


	render() {
		const { show, my_cards, messages_array, connected_users, alive, discarded_cards, 
			j2_alive, j3_alive, j4_alive, player_turn, disabled_users,
			my_points, puntosj2, puntosj3, puntosj4, has_ganador_supremo } = this.state
		const my_pos = connected_users.indexOf(my_username)
		return (
            <div className='background-wood spot-organization-vertical max-height'>
				<PanelNames names={connected_users}
							pivot={my_username}
							jugador1_alive={alive}
							jugador2_alive={j2_alive}
							jugador3_alive={j3_alive}
							jugador4_alive={j4_alive}
							my_points={my_points}
							points_j2={puntosj2}
							points_j3={puntosj3}
							points_j4={puntosj4}
							player_turn={player_turn}
				/>

				<div className='player-spot-horizontal'>
					<div className='player-1-cards'>
						{	
							my_cards.map((card, index) => {
								return <Card key={card.name + '_'+ index}
											name={card.name}
											cardImagen={card.name}
											me={true}
											users={connected_users}
											my_user={my_username}
											enable={card.is_enable}
											jugarCarta={this.EnviarProtocolo.bind(this)}
											is_my_turn={my_username===player_turn}
											alive={alive}
											disabled_players={disabled_users}
										/>
							})
						}
					</div>					

					<div className='discard-pile-player-1'>
						{
							discarded_cards.map((card,index) => {
								if(card.player==my_username){
									return <Card key={card.name + '_'+ index}
									name={card.name}
									cardImagen={card.name}
									me={true}
									users={connected_users}
									my_user={my_username}
									enable={false}
									alive={false}
									/>
								}
								else{
									return null
								}
							})
						}
					</div>
				</div>

				<div className='spot-organization-horizontal'>
					<div className='player-spot-vertical-left'>
						<div className='player-2'>
							<Card name = 'player2' cardImagen= 'unknown-card' enable={true} />
						</div>
						{
							player_turn.localeCompare(connected_users[(my_pos + 1) %  4]) === 0
								?
							<div className='player-2-card-2'>
								<Card name = 'player2' cardImagen= 'unknown-card' enable={true} me={false} />
							</div>
								:
							null
						}

						<div className='discard-pile-player-2'>
							{
								discarded_cards.map((card,index) => {
									if(card.player==connected_users[(my_pos + 1) % 4]){
										return <Card key={card.name + '_'+ index}
										name={card.name}
										cardImagen={card.name}
										me={false}
										users={connected_users}
										my_user={my_username}
										enable={false}
										alive={false}
										/>
									}
									else{
										return null
									}
								})
							}
						</div>
					</div>

					<div className='center-pile-cards' />
					<div className='center-chat'> 
						<div className='center-chat-show'>
							<div className='chat-Size' style={{ padding: '10px', paddingLeft: '15px' }}>
								{
									messages_array.map(
										(d, index) => <li key={d.usuario + '_' + d.mensaje + '_' + index} style={{listStyleType: 'none'}}>
											<b>{d.usuario}</b>: {d.mensaje}
										</li>
									)
								}
							</div>
						</div>
						<div className='center-chat-input'>
							<Input style={{ height: 30, fontSize: 12 }} placeholder='Chat' onPressEnter={this.SendChat}/>
						</div>
					</div>

					<div className='player-spot-vertical-right'>
						<div className='discard-pile-player-4'>
							{/* <Card name = 'player4' cardImagen= 'priest' enable={true} /> */}
							{
								discarded_cards.map((card,index) => {
									if(card.player==connected_users[(my_pos + 3) % 4]){
										return <Card key={card.name + '_'+ index}
										name={card.name}
										cardImagen={card.name}
										me={false}
										users={connected_users}
										my_user={my_username}
										enable={false}
										alive={false}
										/>
									}
									else{
										return null
									}
								})
							}
						</div>
						
						{
							player_turn.localeCompare(connected_users[(my_pos + 3) %  4]) === 0
								?
							<div className='player-4-card-2'>
								<Card name = 'player4' cardImagen= 'unknown-card' enable={true} />
							</div>
								:
							null
						}

						<div className='player-4'>
							<Card name = 'player4' cardImagen= 'unknown-card' enable={true} />
						</div>
					</div>
				</div>
				<div className='player-spot-horizontal-top'>
					<div className='discard-pile-player-3'> 
						{
								discarded_cards.map((card,index) => {
									if(card.player==connected_users[(my_pos + 2) % 4]){
										return <Card key={card.name + '_'+ index}
										name={card.name}
										cardImagen={card.name}
										me={false}
										users={connected_users}
										my_user={my_username}
										enable={false}
										alive={false}
										/>
									}
									else{
										return null
									}
								})
							}
					</div>

					{
						player_turn.localeCompare(connected_users[(my_pos + 2) %  4]) === 0
							?
						<div className='player-3-card-2'>
							<Card name = 'player3' cardImagen= 'unknown-card' enable={true} />
						</div>
							:
						null
					}

					<div className='player-3'>
						<Card name = 'player3' cardImagen= 'unknown-card' enable={true} />
					</div>
				</div>

				<Modal show={show}>
					<Modal.Header closeButton={false}>
						{
							my_code == '1' || this.state.is_host ?
							<Modal.Title>¿Todos los jugadores están unidos?</Modal.Title>
								:
							<Modal.Title>Esperando que 4 jugadores se conecten a la partida.</Modal.Title>
						}
					</Modal.Header>
					<Modal.Body>
						<div>
							{
								my_code == '1' || this.state.is_host ?
								<div style={{ width: '100%'}}>
									<h5>Invita a tus amigos.</h5>
									<div style={{textAlign: 'center'}}>
										<h6>Código: {puertoCodigo}</h6>
										<br />
									</div>
								</div>
									:
								null
							}
							<p>Usuarios conectados:</p>
							<div className='display-names'>
								{
									this.state.connected_users.map((user, index) => {
										return <p>{user}</p>
									})
								}
							</div>
							<br />
							<div style={{ textAlign: 'center' }}>
								<Loader size="md" />
							</div>
						</div>
					</Modal.Body>
				</Modal>


				<Modal show={has_ganador_supremo !== null} backdrop='static'>
					<Modal.Body>
						<h3>¡El ganador es {has_ganador_supremo}! ¡Felicidades!</h3>
					</Modal.Body>
					<Modal.Footer>
						<div className='modal-buttons'>
                            <Button onClick={() => this.GoToMenu()} color="green">
                                Regresar a Home
                            </Button>
                        </div>
					</Modal.Footer>
				</Modal>

				<Modal show={this.state.has_to_go_lobby} backdrop='static'>
					<Modal.Header>
						<Modal.Title>Sala llena</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p>Intenta conectarte a una sala nueva</p>
					</Modal.Body>
					<Modal.Footer>
						<div className='modal-buttons'>
                            <Button onClick={() => this.GoToLobby()} color="green">
                                Regresar a Lobby
                            </Button>
                        </div>
					</Modal.Footer>
				</Modal>
			</div>
		)
	}
}