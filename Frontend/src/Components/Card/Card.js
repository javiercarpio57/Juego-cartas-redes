import React, { Component } from 'react';
import './card.scss'


class Header extends Component{
    constructor(props){
        super(props)

        this.state = {
            flipped: false,
            //16 cartas listadas con su valor, imagen frontal e imagen trasera
            cards: [{
                value: 1,
                guard: 'guard',
                back: 'backCard',
            },{
                value: 2,
                guard: 'priest',
                back: 'backCard',
            },{
                value: 3,
                guard: 'baron',
                back: 'backCard',
            },{
                value: 4,
                guard: 'handmaid',
                back: 'backCard',
            },{
                value: 5,
                guard: 'prince',
                back: 'backCard',
            },{
                value: 6,
                guard: 'king',
                back: 'backCard',
            },{
                value: 7,
                guard: 'countess',
                back: 'backCard',
            },{
                value: 8,
                guard: 'princess',
                back: 'backCard',
            }
            ]
        }

    }
}