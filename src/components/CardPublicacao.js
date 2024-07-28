import { StyleSheet, Text, View , TouchableOpacity} from "react-native";
import { Avatar, Icon } from "react-native-paper";
import { defaultColors } from "../utils";
import { useState } from "react";
import CardCapituloPublicacao from "./CardCapituloPublicacao";
import { useNavigation } from "@react-navigation/native";
import { Button, Menu, Divider, PaperProvider } from 'react-native-paper';
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

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

    const handleClick = (obra) => {
        navigation.navigate('capitulo', { id: obra.capitulo.id, obraNome: obra.nome })
    }

    const handleComentarios = async () => {
        navigation.navigate('comentarios', { publicacao })
    }

    return(
        <View style={styles.view}>
            <View>
                <Avatar.Text size={30} label={ publicacao?.usuario?.nome?.split(' ')?.slice(0 , 2)?.map(t => t[0])?.join('') } />
            </View>
            <View style={{width: '95%'}}>
                <View style={styles.head}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3}}>
                        <Text style={styles.nome}>
                            { publicacao?.usuario?.nome }
                        </Text>
                        <Text style={styles.criada_em}>
                            {/* 6h */}
                        </Text>
                    </View>
                    {
                        publicacao.usuario.id == usuario.id &&
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
                    !!publicacao?.obra?.id && (
                        <CardCapituloPublicacao
                            obra={publicacao?.obra}
                            handleClick={() => handleClick(publicacao?.obra)}
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
                        <Text>
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
                        <Text>
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
        fontSize: 14
    },
    conteudo:{
        fontSize: 13,
        fontWeight: '400',
        width: '90%'
    },
    buttons:{
        flexDirection: 'row',
        paddingTop:20,
        gap: 20
    }
});