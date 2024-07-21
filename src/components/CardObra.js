import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { defaultColors, imageUrl, proporcaoCard } from "../utils";
import { useState } from "react";
import { Icon, ProgressBar, } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const { height, width }  = Dimensions.get('screen');

export default function CardObra({
    obra
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
        status
    } = obra

    const navigation = useNavigation()
    const imagePath = `${imageUrl}obras/${id}/${imagem}`;
    const [imageError, setImageError] = useState(false)

    console.log(imagePath)
    const leituraColors = {
        1: '#59A0F1',
        2: '#DBD54C',
        3 : '#3CAF1F'
    }
    const progresso = parseFloat((total_lidos / total_capitulos).toFixed(2)) || 0 

    const handleClick = () => {
        navigation.navigate('obra', { id })
    }



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
                    <Text style={styles.total_capitulos}>
                        {total_capitulos} { total_capitulos == 1 ? 'capitulo' : 'capitulos' }
                    </Text>
                    
                    {
                        !!tags.length && 
                        <Text style={styles.tags}>
                            {tags.map(tag => tag.nome).join(', ')}
                        </Text>
                    }
                    
                    {
                        !!leitura.id  && 
                        <Text style={[styles.leitura, {
                            color: leituraColors[leitura?.status?.id]
                        }]}>
                            {leitura.status?.nome}
                        </Text>
                    }
                    {
                        leitura?.status?.id == 2  && 
                        <>
                            <ProgressBar 
                                progress={progresso} 
                                color={defaultColors.activeColor} 
                                style={{
                                    height: 2,
                                    marginTop: 10, 
                                    backgroundColor: '#312E2E'
                                }}
                            />
                            <Text>
                                {(progresso * 100).toFixed(2)} %
                            </Text>
                        </>
                        
                    }
                    {
                        leitura?.status?.id == 3  && 
                        <>
                            <ProgressBar 
                                progress={1} 
                                color={defaultColors.activeColor} 
                                style={{
                                    height: 2,
                                    marginTop: 10, 
                                    backgroundColor: '#312E2E'
                                }}
                            />
                            <Text>
                                100 %
                            </Text>
                        </>
                        
                    }
                </View>

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
      gap: 10
    },
    imageContainer:{
        ...proporcaoCard,
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
        fontSize: 18,
        flexWrap: 'wrap',
        color: '#fff',
        width: "70%",
    },
    formato:{
        fontSize: 11,
    },
    total_capitulos:{
        fontSize: 12,
    },
    tags:{
        fontSize: 12,
    },
    leitura:{
        fontSize: 12,
    }
});