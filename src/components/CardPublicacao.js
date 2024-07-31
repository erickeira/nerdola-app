import { StyleSheet, Text, View , TouchableOpacity, Image, Dimensions} from "react-native";
import { Avatar, Icon } from "react-native-paper";
import { defaultColors, gerarCorAleatoriaRGBA, imageUrl } from "../utils";
import { useState } from "react";
import CardCapituloPublicacao from "./CardCapituloPublicacao";
import { useNavigation } from "@react-navigation/native";
import { Button, Menu, Divider, PaperProvider } from 'react-native-paper';
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import AutoHeightImage from 'react-native-auto-height-image';

import  dayjs from 'dayjs'
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';
import CardObra from "./CardObra";
dayjs.extend(relativeTime);
dayjs.locale("pt-br");


const { height, width }  = Dimensions.get('screen');
export default function CardPublicacao({ 
    publicacao : oldPublicacao,
    handleExcluir
}){
    const { usuario } = useAuth()
    const [publicacao, setPublicacao] = useState(oldPublicacao)
    const navigation = useNavigation()
    const [ curtido, setCurtido] = useState(publicacao.curtido);
    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);
  

    const handleCurtir = async () => {
        
        setPublicacao({
            ...publicacao,
            total_curtidas : curtido ? publicacao.total_curtidas - 1  : publicacao.total_curtidas + 1
        })
        setCurtido(!curtido)
        try{
            await api.post(`publicacoes/${publicacao.id}/curtir`)
        }catch(error){
            console.log(error)
        } finally{
        }
    }

    const handleClick = (capitulo, obra) => {
        navigation.navigate('capitulo', { id: capitulo?.id, obra })
    }

    const handleComentarios = async () => {
        navigation.navigate('comentarios', { publicacao })
    }
    const imagePath = `${imageUrl}usuarios/${publicacao?.usuario?.id}/${publicacao?.usuario?.imagem}`;
    const [imageError, setImageError] = useState(false)

    const imagePathPublicacao = `${imageUrl}publicacoes/${publicacao?.id}/${publicacao.imagem}`;
    const [imageErrorPublicacao, setImageErrorPublicacao] = useState(false)

    return(
        <View style={styles.view}>
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate('verperfil', { id : publicacao?.usuario?.id })
                }}
            >
                {
                    publicacao?.usuario?.imagem && !imageError ?
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
                        label={ publicacao?.usuario?.nome?.split(' ')?.slice(0 , 2)?.map(t => t[0])?.join('') } 
                    />
                }
            </TouchableOpacity>
            <View style={{width: '95%'}}>
                <View style={styles.head}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('verperfil', { id : publicacao?.usuario?.id })
                        }}
                        style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3}}
                    >
                        <Text style={styles.nome}>
                            { publicacao?.usuario?.nome }
                        </Text>
                        <Text style={styles.criada_em}>
                            {/* 6h */}
                            { dayjs(dayjs(publicacao.criada_em)).fromNow() }
                        </Text>
                    </TouchableOpacity>
                    {
                        (publicacao.usuario.id == usuario.id || usuario.id == 1) &&
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
                <Text style={styles.conteudo}>
                    { publicacao?.conteudo }
                </Text>
                {
                    !!publicacao?.capitulo?.id && (
                        <CardCapituloPublicacao
                            obra={publicacao?.obra}
                            capitulo={publicacao.capitulo}
                            handleClick={() => handleClick(publicacao.capitulo, publicacao?.obra)}
                        />
                    )
                }

                {
                    !publicacao?.capitulo?.id && publicacao?.obra?.id && (
                        <CardObra
                            obra={publicacao?.obra}
                            feed
                        />
                    )
                }
                {
                    !!publicacao?.imagem && (
                        <AutoHeightImage
                            style={styles.imagemPublicacao}
                            width={width - 100}
                            source={{ uri : imagePathPublicacao }}
                            onError={(error) => {
                                setImageErrorPublicacao(true)
                            }}
                        />
                    )
                }

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
                            width: 40
                        }}
                    >
                        <Icon 
                            source={ curtido? "heart" : "heart-outline"} 
                            size={20} 
                            color={ curtido ? "#EC4A55" : "#fff"}
                        />
                        <Text style={{color: '#fff'}}>
                           { publicacao.total_curtidas }
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
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
                            source={ "chat-outline"} 
                            size={20} 
                            color={ "#fff"}
                        />
                        <Text style={{color: '#fff'}}>
                        { publicacao.total_comentarios }
                        </Text>
                    </TouchableOpacity>
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
        fontSize: 11
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
    imagemPublicacao:{
        marginTop: 20
    },
});