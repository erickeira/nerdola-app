import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar, Icon } from "react-native-paper";
import { defaultColors, gerarCorPorString, imageUrl } from "../../utils";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useEffect, useRef, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Button, Menu, Divider, PaperProvider } from 'react-native-paper';
import { useAuth } from "../../context/AuthContext"
import InputText from "../../components/InputText";
import CustomButton from "../../components/CustomButton";
import api from "../../utils/api";
import { refresh } from "@react-native-community/netinfo";
import CardCapituloPublicacao from "../../components/CardCapituloPublicacao";
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Chip from "../../components/Chip";
import CardObra from "../../components/CardObra";
import { useSnackbar } from "../../context/SnackbarContext";


const { height, width }  = Dimensions.get('screen');

export default function PublicarPage({ route }){
    const { usuario } = useAuth()
    const navigation = useNavigation()
    const [publicacao , setPublicacao] = useState({})
    const [ focus, setFocus] = useState(false)
    const inputRef = useRef()
    const isFocused = useIsFocused()
    const snackbar = useSnackbar()

    useEffect(() => {
       if(inputRef && isFocused) inputRef.current?.focus();
       else  if(inputRef && !isFocused) inputRef.current?.blur();
    },[isFocused, inputRef])

    const handleChange = (dado) => {
        setPublicacao({...publicacao, ...dado})
    }

    const [isLoadingPublicando, setIsLoadingPublicando] = useState(false)
    const handlePublicar = async () => {
        if(!publicacao.conteudo?.trim()){
            snackbar.show({
                text: "É necessário escrever algo.",
                duration: 2000,
                action: {
                  text: 'OK',
                  textColor: 'green',
                  onPress: () => { /* Do something. */ },
                },
              });
            return
        }
        setIsLoadingPublicando(true)
        const body = {
            ...publicacao
        }
        if(route?.params?.capitulo?.id){
            body.capitulo = route?.params?.capitulo?.id
        }else if(route?.params?.obra?.id){
            body.obra = route?.params?.obra?.id
        }

        try{
            const response = await api.post(`publicacoes`, body )
            setPublicacao({})
            if(route?.params?.capitulo?.id){
                navigation.goBack()
            }else{
                navigation.navigate('PublicacoesTab')
                navigation.navigate('publicacoes', { refresh : true })
            }

            snackbar.show({
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

    const imagePath =  `data:image/jpeg;base64,${publicacao?.imagem}`;
    const [imageError, setImageError] = useState(false)

    const imagePathUsuario = `${imageUrl}usuarios/${usuario?.id}/${usuario?.imagem}`;
    const [imageErrorUsuario, setImageErrorUsuario] = useState(false)

    return(
        <View 
            style={{height: '100%',padding : 5, }}
            keyboardShouldPersistTaps="handled"
            
        >
            <ScrollView>
                <View 
                    style={styles.view}
                    onPress={() => {
                        inputRef?.current?.focus()
                    }}    
                >
                    <View>
                        {
                            usuario?.imagem && !imageError ?
                            <View style={styles.imageContainerUsuario}>
                                <Image
                                    style={styles.imagemUsuario}
                                    source={{ uri : imagePathUsuario }}
                                    onError={(error) => {
                                        setImageErrorUsuario(true)
                                    }}
                                />
                            </View>
                            :
                            
                            <Avatar.Text 
                                size={30} 
                                style={{
                                    backgroundColor: usuario?.nome ? gerarCorPorString(usuario?.nome) : defaultColors.activeColor
                                }}
                                label={ usuario?.nome?.split(' ')?.slice(0 , 2)?.map(t => t[0])?.join('') } 
                            />
                        }
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
                                    minHeight: 80
                                }}
                                ref={inputRef}
                                tipo="area"
                                numberOfLines={20}
                                value={publicacao.conteudo}
                                onChange={(conteudo) => {
                                    handleChange({ conteudo })
                                }}
                            />
                            {
                                !!route.params?.capitulo?.id && 
                                <CardCapituloPublicacao
                                    obra={route.params.obra}
                                    capitulo={route.params.capitulo}                                 
                                />
                            }
                            {
                                !!route.params?.obra?.id &&  !route.params?.capitulo?.id &&
                                <CardObra
                                    obra={route.params.obra}
                                    feed
                                /> 
                            }
                            {
                                !!publicacao?.imagem && (
                                    <View style={styles.imageContainer}>
                                        <Image
                                            style={styles.imagem}
                                            source={{ uri : imagePath }}
                                            onError={(error) => {
                                                setImageError(true)
                                            }}
                                            
                                        />
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                backgroundColor: '#DB4C4C',
                                                padding:10,
                                                borderRadius: 5
                                            }}
                                        >
                                            <TouchableOpacity 
                                                onPress={() =>{
                                                    handleChange({ imagem :''})
                                                }}
                                            >
                                                <Icon source="delete-outline" size={16}/>
                                            </TouchableOpacity>
                                        </View>
                                      
                                    </View>
                                    
                                )
                            }

                        </Text>
                    </View>
                    
                </View>
                
            </ScrollView>
            <View style={styles.containerComment}>
                {
                    !publicacao?.imagem && (
                    <Chip
                        onPress={async () => {
                            const options = {
                                mediaType: 'photo',
                                quality: 0.8,
                                includeBase64: true
                            }
                            try{
                                const result = await launchImageLibrary(options);
                                const imagem = result.assets[0]?.base64
                                handleChange({ imagem })
                                setImageError(false)
                            }catch(error){

                            }
                           
                        }}
                    >
                        <Icon source="image-outline" size={20}/>
                    </Chip>
                    )
                }
                <CustomButton 
                    style={styles.button}
                    onPress={handlePublicar}
                    isLoading={isLoadingPublicando}
                    disabled={isLoadingPublicando || publicacao.conteudo?.length < 1}
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
    },
    imageContainer:{
        width: width - 100,
        height: width - 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        position: 'relative',
        marginTop: 20
    },
    imagem:{
        width: '100%',
        height: '100%',
        objectFit: 'contain'
    },
    imageContainerUsuario:{
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
    imagemUsuario:{
        width: '100%',
        height: '100%'
    },
});