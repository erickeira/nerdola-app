import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { defaultColors, imageUrl, proporcaoCard } from "../utils";
import { useState } from "react";
import { Icon, ProgressBar, } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Chip from "./Chip";

const { height, width }  = Dimensions.get('screen');

export default function CardObraLendo({
    obra,
    mostrarprogresso,
    feed,
    showtags = false,
    showstatus = false
}){
    const{
        id,
        imagem,
        descricao,
        nome,
        formato,
        tags,
        leitura,
        total_lidos,
        total_capitulos,
        status,
        total_usuarios_lendo,
        capitulos_importados,
        ultimo_lido
    } = obra

    const navigation = useNavigation()
    const imagePath = `${imageUrl}obras/${id}/${imagem}`;
    const [imageError, setImageError] = useState(false)

    const leituraColors = {
        1: '#59A0F1',
        2: '#DBD54C',
        3: '#3CAF1F',
        4: '#9E3939',
        5: '#72D8D2'
    }
    const progresso = parseFloat((total_lidos / total_capitulos).toFixed(2)) || 0 

    const handleClick = () => {
        navigation.navigate('obra', { id })
        navigation.navigate('capitulo', { id : ultimo_lido.prox_capitulo, obra })
    }

    return(
        <>
            <TouchableOpacity 
                onPress={handleClick}
                style={styles.view}    
            >
                    <View style={[styles.imageContainer,{
                        width:  100,
                        height: ((100) * (4.3 / 3)),   
                    }]}>
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
                    {
                        leitura?.status?.id == 2  && 
                        <View style={{paddingHorizontal: 0, justifyContent: 'center'}}>
                            <ProgressBar 
                                progress={progresso} 
                                color={leituraColors[leitura?.status?.id]} 
                                style={{
                                    height: 2,
                                    marginTop: 3, 
                                    backgroundColor: '#312E2E',
                                }}
                            />
                        </View>
                        
                    }
    
            </TouchableOpacity>
        </>
    )
}
const styles = StyleSheet.create({
    view: {
        width: 100,
        marginRight: 10
    },
    imageContainer:{
        borderColor: '#312E2E',
        borderWidth: 1,
        marginBottom: 1,
        borderRadius: 5,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagem:{
        width: '100%',
        height: '100%'
    },
    nome:{
        fontSize: 18,
        flexWrap: 'wrap',
        color: '#fff',
        width: "70%",
        
    },
    formato:{
        fontSize: 11,
        color: defaultColors.gray
    },
    disponivel:{
        fontSize: 9,
        color: "#fff"
    },
    total_capitulos:{
        fontSize: 12,
        color: defaultColors.gray
    },
    total_usuarios_lendo:{
        fontSize: 12,
        color: defaultColors.activeColor
    },
    containerTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        gap: 0,
        paddingHorizontal: 10
    },
    tags:{
        fontSize: 10,
        color: defaultColors.gray,
    },
    status:{
        fontSize: 12,
        color: defaultColors.gray,
    },
    leitura:{
        fontSize: 12,
        color: defaultColors.gray
    }
});