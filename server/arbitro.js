
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
    if(cartaUsuario > miCarta){
        return -1;
    }else
    if(cartaUsuario == miCarta){
        return 0;
    }
}

export default { guard, baron }

