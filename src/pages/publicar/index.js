import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar, Icon } from "react-native-paper";
import { defaultColors } from "../../utils";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useEffect, useRef, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Button, Menu, Divider, PaperProvider } from 'react-native-paper';
import { useAuth } from "../../context/AuthContext"
import InputText from "../../components/InputText";
import CustomButton from "../../components/CustomButton";
import api from "../../utils/api";
import { refresh } from "@react-native-community/netinfo";
import Snackbar from "react-native-snackbar";
import CardCapituloPublicacao from "../../components/CardCapituloPublicacao";

const { height, width }  = Dimensions.get('screen');

export default function PublicarPage({ route }){
    const { usuario } = useAuth()
    const navigation = useNavigation()
    const [conteudo, setConteudo] = useState({})
    const [ focus, setFocus] = useState(false)
    const inputRef = useRef()
    const isFocused = useIsFocused()

    useEffect(() => {
        setFocus(isFocused)
    },[isFocused])

    const [isLoadingPublicando, setIsLoadingPublicando] = useState(false)
    const handlePublicar = async () => {
        setIsLoadingPublicando(true)
        try{
            const response = await api.post(`publicacoes`,{  
                conteudo,
                capitulo: route?.params?.capitulo?.id
            })
            setConteudo("")
            navigation.navigate('PublicacoesTab')
            navigation.navigate('publicacoes', { refresh : true })
            Snackbar.show({
                text: response.data?.message,
                duration: 2000,
                action: {
                  text: 'OK',
                  textColor: 'green',
                  onPress: () => { /* Do something. */ },
                },
              });
        }catch(error){
            console.log(error)
        } finally{
            setIsLoadingPublicando(false)
        }
    }

    return(
        <View 
            style={{height: '100%',padding : 5, }}
            keyboardShouldPersistTaps="handled"
            
        >
            <ScrollView>
                <View style={styles.view}>
                    <View>
                        <Avatar.Text size={30} label={ usuario?.nome?.split(' ')?.slice(0 , 2)?.map(t => t[0])?.join('') } />
                    </View>
                    <View style={{width: '95%'}}>
                        <View style={styles.head}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3}}>
                                <Text style={styles.nome}>
                                    { usuario?.nome }
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.conteudo}>
                            <InputText
                                containerStyle={styles.input}
                                placeholder="Escreva sua publicação"
                                style={{
                                    width  : width - 100,
                                    textAlignVertical : 'top',
                                }}
                                focus={focus}
                                tipo="area"
                                height={!!route.params?.obra?.id ? 80  : (height / 2)}
                                numberOfLines={20}
                                value={conteudo}
                                onChange={setConteudo}
                            />
                            {
                                !!route.params?.obra?.id && 
                                <CardCapituloPublicacao
                                    obra={route.params.obra}
                                    capitulo={route.params.capitulo}                                 
                                />
                            }
                           
                        </Text>
                    </View>
                    
                </View>
                
            </ScrollView>
            <View style={styles.containerComment}>
                <CustomButton 
                    style={styles.button}
                    onPress={handlePublicar}
                    isLoading={isLoadingPublicando}
                    disabled={isLoadingPublicando || conteudo.length < 1}
                >
                    Publicar
                </CustomButton>
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
    
    conteudo:{
        fontSize: 13,
        fontWeight: '400',
        width: '90%',
    },
    containerComment:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    input: {
        borderWidth: 0,
        height: height / 2,
        paddingHorizontal: 0
    },
    button:{
        width: 100,
        height: 40,
        justifyContent: 'center',
        backgroundColor: defaultColors.activeColor,
        marginRight: 20,
    }
});