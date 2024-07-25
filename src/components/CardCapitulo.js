import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { defaultColors, imageUrl, proporcaoCard } from "../utils";
import { useEffect, useState } from "react";
import { Icon, ProgressBar, Checkbox  } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Snackbar from "react-native-snackbar";
const { height, width }  = Dimensions.get('screen');

export default function CardCapitulo({
    obra = '',
    capitulo,
    onPress,
    onLido,
    leitura,
    isLoading
}){
    const{
        id,
        imagem,
        descricao,
        lido,
        nome,
        numero,
        formato,
        lancado_em,
        totallinks
    } = capitulo
    const navigation = useNavigation()
    const imagePath = `${imageUrl}obras/${obra}/${imagem}`;
    const [imageError, setImageError] = useState(false)
    const [capituloLido, setCapituloLido] = useState(lido || leitura == 3);

    useEffect(() => {
        let newLido = lido || leitura == 3
        if(newLido != capituloLido) setCapituloLido(lido || leitura == 3)
    },[lido, leitura])

    return(
        <TouchableOpacity 
            onPress={() => {
                navigation.navigate('capitulo', { id , leitura , lido: capituloLido})
            }}
        >
            <View style={styles.view}>
                <View style={styles.imageContainer}>
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
                </View>
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
                    {
                        !!totallinks && 
                        <Text style={[styles.numero,{
                            color:defaultColors.activeColor,
                        }]}>
                            {totallinks} { totallinks == 1 ? 'site disponivel': 'sites disponiveis'}
                        </Text>
                    }
                    
                </View>
                {
                    !!isLoading && isLoading == id && (
                        <ActivityIndicator color={defaultColors.activeColor}/>
                    )
                }
                {
                    [2,3].includes(leitura)  && (
                        <Checkbox 
                            status={capituloLido ? 'checked' : 'unchecked'} 
                            color={defaultColors.activeColor}
                            onPress={() => {
                                if(leitura == 2){
                                    if(onLido) onLido(id, !lido)
                                    setCapituloLido(!capituloLido)
                                }else{
                                    Snackbar.show({
                                    text: "Atualize o status da obra para lendo",
                                    duration: 2000,
                                    action: {
                                        text: 'OK',
                                        textColor: 'green',
                                        onPress: () => { /* Do something. */ },
                                    },
                                    });
                                }
                            }}
                        />
                    )
                }
                
                <Icon source={"chevron-right"} color={"#fff"} size={20}/>
                
            </View>
 
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    view: {
      padding: 10,
      width: width - 30,
      overflow: 'scroll',
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center'
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