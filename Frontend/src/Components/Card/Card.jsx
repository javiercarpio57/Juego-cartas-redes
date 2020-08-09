import React from 'react'

export default class Card extends React.Component {
	constructor(props){
		super(props);
	}
	
	render(){
		const { value, name, frontImage, backImage, play } = this.props

		return (
            <div className= {frontImage}> { name } </div>
		)
	}
}