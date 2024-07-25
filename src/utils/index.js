import { Dimensions, StyleSheet } from 'react-native';

const { height, width }  = Dimensions.get('screen');
const production = !__DEV__
// const production = true
const imageUrl = production ? 'https://storage.nerdola.com.br/' : 'http://localhost:3001/';

const proporcaoCard = {
    width: width * 0.25,
    height: (width * 0.25) * (4.3 / 3),
}

// const production = true

const defaultColors = {
    primary : '#0D0D0D',
    secundary: '#674FA3',
    activeColor: '#674FA3'
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


export {
    defaultStyles,
    defaultColors,
    defaultHeaderProps,
    production,
    imageUrl,
    proporcaoCard
}