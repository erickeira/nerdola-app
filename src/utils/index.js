import { Dimensions, StyleSheet } from 'react-native';

const { height, width }  = Dimensions.get('screen');
// const production = !__DEV__
const production = true
// const imageUrl =  "https://storage.nerdola.com.br/";
const imageUrl = production ? 'https://storage.nerdola.com.br/' : 'http://192.168.1.140:3001/';
// const imageUrl = production ? 'https://storage.nerdola.com.br/' : 'http://192.168.1.100:3001/';
const botUrl = "https://discord.com/api/v10/webhooks/1266480912481390622/Z9oq5b4rQv-_QHfuC_t6PjlCszo36kWAT0KkQAfLxgpv2EoUheLxM-tbYWL-mhoBpye6?wait=true";

const proporcaoCard = {
    width: width * 0.25,
    height: (width * 0.25) * (4.3 / 3),
}

// const production = true

const defaultColors = {
    primary : '#0D0D0D',
    secundary: '#674FA3',
    activeColor: '#674FA3',
    gray : "#A0A0A0"
}
// const fontFamily = 'SF Pro Display';
const fontFamily = '';
const defaultStyles = StyleSheet.create({
    defaultHeaderStyles: {
        backgroundColor: defaultColors.primary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 5,
        elevation: 6
    },
    tituloCategoria:{
        fontWeight: '700',
        color: '#666',
        marginVertical: 10
    }
})

const defaultHeaderProps ={
    headerStyle: {
        backgroundColor: defaultColors.primary,
        shadowColor: 'transparent'
    },
    headerTintColor: '#fff',
}

function gerarCorAleatoriaRGBA() {
    var r = Math.floor(Math.random() * 256); 
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256); 

    var corRGBA = "rgba(" + r + ", " + g + ", " + b + ", " + 1 + ")";
    return corRGBA;
}

function gerarCorPorString(str) {
    if(!str) return defaultColors.activeColor
    // Função para gerar um hash a partir da string
    function hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    // Função para converter um hash em uma cor no formato hexadecimal
    function intToRGB(i) {
        const c = (i & 0x00FFFFFF)
            .toString(16)
            .toUpperCase();

        return "00000".substring(0, 6 - c.length) + c;
    }

    const hash = hashString(str);
    const color = intToRGB(hash);

    return `#${color}`;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  


export {
    defaultStyles,
    defaultColors,
    defaultHeaderProps,
    production,
    imageUrl,
    proporcaoCard,
    botUrl,
    gerarCorAleatoriaRGBA,
    gerarCorPorString,
    isValidEmail
}