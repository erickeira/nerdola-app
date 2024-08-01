import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { defaultColors, imageUrl, proporcaoCard } from "../utils";
import { useEffect, useState } from "react";
import { Icon, ProgressBar, Checkbox, Avatar, Menu, Divider  } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Snackbar from "react-native-snackbar";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

import  dayjs from 'dayjs'
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
dayjs.locale("pt-br");

const { height, width }  = Dimensions.get('screen');

export default function CardComentario({
    comentario: oldComentario,
    handleExcluir
}){
    const { usuario } = useAuth()
    const [comentario, setComentario] = useState(oldComentario)
    const navigation = useNavigation()
    const [ curtido, setCurtido] = useState(comentario.curtido);

    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    useEffect(() => {
        setComentario(oldComentario)
    },[oldComentario])

    const handleCurtir = async () => {
        setComentario({
            ...comentario,
            total_curtidas : curtido ? comentario.total_curtidas - 1  : comentario.total_curtidas + 1
        })
        setCurtido(!curtido)
        try{
            await api.post(`comentarios/${comentario.id}/curtir`)
        }catch(error){
            console.log(error)
        } finally{
        }
    }

    const handleComentarios = async () => {
        navigation.navigate('comentarios', { publicacao })
    }

    const imagePath = `${imageUrl}usuarios/${comentario?.usuario?.id}/${comentario?.usuario?.imagem}`;
    const [imageError, setImageError] = useState(false)


    return(
        <View style={styles.view}>
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate('verperfil', { id : comentario?.usuario?.id })
                }}
            >
                {
                    comentario?.usuario?.imagem && !imageError ?
                    <View style={styles.imageContainer}>
                        <Image
                            style={styles.imagem}
                            source={{ uri : imagePath }}
                            onError={(error) => {
                                setImageError(true)
                            }}
                        />
                    </View>
                    :
                    <Avatar.Text 
                        size={30} 
                        label={ comentario?.usuario?.nome?.split(' ')?.slice(0 , 2)?.map(t => t[0])?.join('') } 
                    />
                }
            </TouchableOpacity>
            <View style={{width: '95%'}}>
                <View style={styles.head}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('verperfil', { id : comentario?.usuario?.id })
                        }}
                        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 3}}
                    >
                        <View>
                            <Text style={styles.nome}>
                                { comentario?.usuario?.nome }
                            </Text>
                            { !!comentario?.usuario?.nick  && (
                                <Text style={styles.nick}>
                                    @{ comentario?.usuario?.nick }
                                </Text>
                                )
                            }
                            
                        </View>
                    </TouchableOpacity>
                    <View style={{flexDirection: 'row', gap: 10}}>
                        <Text style={styles.criado_em}>
                            { dayjs(dayjs(comentario.criado_em)).fromNow() }
                        </Text>
                        {
                            (comentario.usuario.id == usuario.id || usuario.id == 1) &&
                            <Menu
                                visible={visible}
                                onDismiss={closeMenu}
                                anchor={
                                    <TouchableOpacity 
                                        onPress={openMenu}
                                        hitSlop={{
                                            left: 15,
                                            bottom: 15
                                        }}
                                    >
                                        <Icon source="dots-horizontal" size={17} color="#fff"/>
                                    </TouchableOpacity>
                                }
                                contentStyle={{
                                    backgroundColor: defaultColors.primary,
                                }}
                            >
                                <Menu.Item 
                                    onPress={handleExcluir} 
                                    title="Excluir"  
                                    titleStyle={{ color: '#DB4C4C'}}
                                />
                            </Menu>
                        }
                    </View>
                    
                    
                
                </View>
                <Text style={styles.conteudo}>
                    { comentario?.comentario }
                </Text>

                <View style={styles.buttons}>
                    <TouchableOpacity 
                        onPress={handleCurtir}
                        hitSlop={{
                            left: 5,
                            right: 5,
                            top: 5,
                            bottom: 5
                        }}
                        style={{
                            flexDirection: 'row',
                            gap: 3,
                            width: 40,
                            alignItems: 'center'
                        }}
                    >
                        <Icon 
                            source={ curtido? "heart" : "heart-outline"} 
                            size={20} 
                            color={ curtido ? "#EC4A55" : "#fff"}
                        />
                        <Text style={{color: '#fff'}}>
                        { comentario.total_curtidas } 
                        </Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity 
                        onPress={handleComentarios}
                        hitSlop={{
                            left: 5,
                            right: 5,
                            top: 5,
                            bottom: 5
                        }}
                        style={{
                            flexDirection: 'row',
                            gap: 3
                        }}
                    >
                        <Icon 
                            source={ "reply"} 
                            size={20} 
                            color={ "#fff"}
                        />
                        <Text>
                        { comentario.total_comentarios }
                        </Text>
                    </TouchableOpacity> */}
                </View >
            </View>
        
        </View>
 
    )
}

const styles = StyleSheet.create({
    view: {
        padding: 10,
        paddingVertical: 20,
        gap: 10,
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 0.2,
        borderBottomColor: '#262626'
    },
    head:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '94%',
        marginBottom: 5
    },
    nome:{
        color: '#fff',
        fontSize: 15
    },
    criada_em :{
        color: defaultColors.gray,
        fontSize: 14
    },
    conteudo:{
        fontSize: 13,
        fontWeight: '400',
        width: '90%',
        color: '#fff'
    },
    buttons:{
        flexDirection: 'row',
        paddingTop:20,
        gap: 20
    },
    imageContainer:{
        width: 30,
        height: 30,
        borderColor: '#312E2E',
        borderWidth: 1,
        marginBottom: 5,
        borderRadius: 100,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imagem:{
        width: '100%',
        height: '100%'
    },
    criado_em :{
        color: defaultColors.gray,
        fontSize: 11
    },
});