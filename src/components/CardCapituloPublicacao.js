import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { defaultColors, imageUrl, proporcaoCard } from "../utils";
import { useState } from "react";
import { Icon, ProgressBar, } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const { height, width }  = Dimensions.get('screen');

export default function CardCapituloPublicacao({
    obra,
    handleClick
}){
    const{
        id,
        imagem,
        nome,
        formato,
        capitulo
    } = obra

    const navigation = useNavigation()
    const imagePath = `${imageUrl}obras/${id}/${imagem}`;
    const [imageError, setImageError] = useState(false)

    return(
        <TouchableOpacity onPress={handleClick}>
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
                <View style={{ width: '100%'}}>
                    <Text style={styles.formato}>
                        {formato}
                    </Text>
                    <Text style={styles.nome}>
                        {nome}
                    </Text>
                    <View style={styles.divider}/> 
                    <Text style={styles.capitulo}>
                       Capitulo
                    </Text>
                    <Text style={styles.capitulo_nome}>
                        {capitulo?.nome}
                    </Text>
                </View>

            </View>
 
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    view: {
      padding: 10,
      width: "90%",
      overflow: 'scroll',
      flexDirection: 'row',
      gap: 10,
      marginTop: 20,
      borderColor: '#312E2E',
      borderWidth: 1,
      borderRadius: 5,
    },
    imageContainer:{
        width: width * 0.15,
        height: (width * 0.15) * (4.3 / 3),
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
        width: "70%",
    },
    formato:{
        fontSize: 11,
        color: defaultColors.gray
    },
    capitulo:{
        fontSize: 12,
        color: defaultColors.gray
    },
    capitulo_nome:{
        color: '#fff'
    },
    arrow:{

    },
    divider:{
        borderColor: '#312E2E',
        borderBottomWidth: 1,
        marginVertical: 5,
        width: '70%'
    },
});