import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { defaultColors, imageUrl, proporcaoCard } from "../utils";
import { useState } from "react";
import { Icon, ProgressBar, } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const { height, width }  = Dimensions.get('screen');

export default function CardObra({
    obra,
    mostrarprogresso,
    feed
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
                <View style={[styles.imageContainer,{
                    width: feed ?  80 : 100,
                    height: feed ?  ((80) * (4.3 / 3)) : ((100) * (4.3 / 3)),
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
                <View style={{ width: '100%', flexWrap: 'wrap'}}>
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
                        !!tags.length && !feed && 
                        <View style={[styles.containerTags,{
                            width: feed ? '60%' : '100%'
                        }]}>
                            {
                                tags.map((tag, index) => (
                                    <Text style={styles.tags} key={index}>
                                        {tag.nome},
                                    </Text>
                                ))
                            }
                        </View>
                     
                    }
                      {
                        !!status && feed && 
      
                        <Text style={styles.status}>
                            {status.nome}
                        </Text>
                  
                     
                    }
                    
                    {
                        !!leitura?.id  && 
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
                                    backgroundColor: '#312E2E',
                                }}
                            />
                            <Text style={{color: '#fff'}}>
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
                            <Text style={{color: '#fff'}}>
                                100.00 %
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
        width: '100%',
        padding: 10,
        flexDirection: 'row',
        overflow: 'hidden',
        gap: 10
    },
    imageContainer:{
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
        color: defaultColors.gray
    },
    total_capitulos:{
        fontSize: 12,
        color: defaultColors.gray
    },
    containerTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '70%',
        gap: 2
    },
    tags:{
        fontSize: 12,
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