import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { defaultColors, imageUrl, proporcaoCard } from "../utils";
import { useEffect, useState } from "react";
import { Icon, ProgressBar, Checkbox  } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Snackbar from "react-native-snackbar";
const { height, width }  = Dimensions.get('screen');

export default function CardCapitulo({
    obra,
    capitulo,
    onPress,
    onLido,
    leitura,
    isLoading,
    obraNome
}){
    const{
        id,
        imagem,
        descricao,
        lido,
        nome,
        numero,
        lancado_em,
        totallinks,
        tem_paginas
    } = capitulo
    const navigation = useNavigation()
    const imagePath = `${imageUrl}obras/${obra.id}/${imagem}`;
    const [imageError, setImageError] = useState(false)
    const [capituloLido, setCapituloLido] = useState(lido || leitura.status.id == 3);

    useEffect(() => {
        let newLido = lido || leitura.status.id == 3
        if(newLido != capituloLido) setCapituloLido(lido || leitura.status.id == 3)
    },[lido, leitura])

    return(
        <TouchableOpacity 
            onPress={() => {
                if(tem_paginas){
                    setCapituloLido(true)
                    if(onLido && !lido) onLido(id, true)
                    navigation.navigate('capitulo', { id , leitura, lido: capituloLido, obra })
                }else{
                    setCapituloLido(!capituloLido)
                    if(onLido) onLido(id, !lido)
                }
            }}
        >
            <View style={styles.view}>
                {/* <View style={styles.imageContainer}>
                    {
                        !imageError ?
                        <Image
                            style={styles.imagem}
                            source={{ uri : imagePath }}
                            onError={(error) => {
                                setImageError(true)
                            }}
                        />
                        :
                        <Icon 
                            source="image-off-outline" 
                            color="#312E2E" 
                            size={30}
                        />
                    }
                </View> */}
                <View style={{ flex: 1  }}>
                    <Text style={[styles.nome,{
                        color: capituloLido ? '#666' :'#fff'
                    }]}>
                        {nome}
                    </Text>
                    <Text style={[styles.numero,{
                        color: capituloLido ? '#666' :'#fff',
                        marginBottom: 5
                    }]}>
                        Número: {numero}
                    </Text>
                </View>
                {
                    !!isLoading && isLoading == id && (
                        <ActivityIndicator color={defaultColors.activeColor}/>
                    )
                }
                {
                    [2,3].includes(leitura.status.id)  && (
                        <Checkbox 
                            status={capituloLido ? 'checked' : 'unchecked'} 
                            color={defaultColors.activeColor}
                            onPress={() => {
                                if(onLido) onLido(id, !lido)
                                setCapituloLido(!capituloLido)
                            }}
                        />
                    )
                }
                
                {tem_paginas && <Icon source={"chevron-right"} color={"#fff"} size={20}/> }
                
            </View>
 
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    view: {
      padding: 10,
      width: width - 20,
      marginHorizontal: 10,
      minHeight: 60,
      overflow: 'scroll',
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    borderBottomWidth: 0.2,
    borderBottomColor: '#262626'
    },
    imageContainer:{
        width: width * 0.18,
        height: width * 0.18,
        borderColor: '#312E2E',
        borderWidth: 1,
        marginBottom: 5,
        borderRadius: 5,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imagem:{
        width: '100%',
        height: '100%'
    },
    nome:{
        fontSize: 15,
        flexWrap: 'wrap',
        color: '#fff',
    },
    numero:{
        fontSize: 10,
        flexWrap: 'wrap',
        color: '#fff',
    },
});