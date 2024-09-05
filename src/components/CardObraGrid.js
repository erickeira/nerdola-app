import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { defaultColors, imageUrl, proporcaoCard } from "../utils";
import { useState } from "react";
import { Icon, ProgressBar, } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Chip from "./Chip";

const { height, width }  = Dimensions.get('screen');
const largura =  width * 0.30
export default function CardObraGrid({
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
        capitulos_importados
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
    }

    

    return(
        <>
            <TouchableOpacity onPress={handleClick}>
                <View style={[styles.view,{
                    borderColor: '#312E2E',
                    borderWidth:  0,
                    borderRadius: 5,
                    width: '100%',
                    marginTop: 0
                }]}>
                    {
                        capitulos_importados > 0 &&
                        <Chip style={{ paddingHorizontal: 8, paddingVertical: 4, position: 'absolute', right: 0, top: 0, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.6)'}}>
                            <Text style={styles.disponivel}>
                            Leitura disponível
                            </Text>
                        </Chip>
                        
                    }
                    <View style={[styles.imageContainer,{
                        width:  largura,
                        height:  ((largura) * (4.3 / 3)),   
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
                    
                    <View style={{ width: '90%', flexWrap: 'wrap', marginTop: 5}}>
                        <Text style={styles.formato}>
                            {formato?.nome}
                        </Text>
                        <Text 
                            style={[styles.nome,{
                                width: largura
                            }]}
                            numberOfLines={3} 
                            ellipsizeMode="tail"
                        >
                            {nome}
                        </Text>
                        <Text style={styles.total_capitulos}>
                            {showstatus ? `${status?.nome} - `  : ''}{total_capitulos} { total_capitulos == 1 ? 'capitulo' : 'capitulos' }
                        </Text>
                        {
                            !!total_usuarios_lendo && 
                            <Text style={styles.total_usuarios_lendo}>
                                {total_usuarios_lendo} lendo
                            </Text>
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
                                    color={leituraColors[leitura?.status?.id]} 
                                    style={{
                                        height: 2,
                                        marginTop: 10, 
                                        backgroundColor: '#312E2E',
                                    }}
                                />
                                <View style={{flexDirection: 'row', justifyContent: 'space-between',  alignItems: 'center', marginTop: 2}}>
                                    <Text style={{color: '#fff', fontSize: 11}}>
                                        {(progresso * 100).toFixed(2)} %
                                    </Text>
                                    <Text style={{color: defaultColors.gray, fontSize: 11}}>
                                        {total_lidos} / {total_capitulos}
                                    </Text>
                                </View>
                                
                            </>
                            
                        }
                        {
                            leitura?.status?.id == 3  && 
                            <>
                                <ProgressBar 
                                    progress={1} 
                                    color={leituraColors[leitura?.status?.id]} 
                                    style={{
                                        height: 2,
                                        marginTop: 10, 
                                        backgroundColor: '#312E2E'
                                    }}
                                />
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2}}>
                                    <Text style={{color: '#fff', fontSize: 11}}>
                                        100.00 %
                                    </Text>
                                    <Text style={{color: defaultColors.gray, fontSize: 12}}>
                                        {total_capitulos} / {total_capitulos}
                                    </Text>
                                </View>
                             
                            </>
                            
                        }
                    </View>

                </View>
    
            </TouchableOpacity>
            {
                !!tags?.length &&  showtags &&
                <View style={[styles.containerTags]}>
                    {
                        tags.map((tag, index) => (
                            <Chip
                                key={index}
                                style={{
                                    paddingVertical : 4,
                                    marginBottom: 0
                                }}
                            >
                                <Text style={styles.tags} key={index}>
                                    {tag.nome}
                                </Text>
                            </Chip>
                            
                        ))
                    }
                </View>
                
            }
        
        </>
    )
}
const styles = StyleSheet.create({
    view: {
        maxWidth: largura,
        overflow: 'hidden',
        gap: 3,
        position: 'relative',
        marginBottom: 10,
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
        fontSize: 14,
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