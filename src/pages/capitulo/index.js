import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, Linking, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../../utils/api";
import { defaultColors, imageUrl, proporcaoCard } from "../../utils";
import { Icon, IconButton,  Menu, Divider, PaperProvider, Checkbox  } from "react-native-paper";
import CustomButton from "../../components/CustomButton";
import AutoHeightImage from "react-native-auto-height-image";
import FastImage from 'react-native-fast-image';
import Snackbar from "react-native-snackbar";
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height, width }  = Dimensions.get('screen');

const CustomImage = ( { imagem, obra, capitulo }) => {
    const imagePath = `${imageUrl}obras/${obra?.id}/capitulos/${capitulo?.numero}/${imagem?.src}`;
    const [imageError, setImageError] = useState(false)
    const [imageHeight, setImageHeight] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (imagem) {
            Image.getSize(imagePath, (width, height) => {
                const scaleFactor = width / Dimensions.get('window').width;
                const imageHeight = height / scaleFactor;
                setImageHeight(imageHeight);
                setLoading(false);
            }, (error) => {
                setImageError(true);
                setLoading(false);
            });
        }
    }, [imagePath]);

    useEffect(() => {
        setImageError(false);
    },[imagem])

    return(
         <>
            {loading ? (
                <View style={{ width :"100%", height: 300, flexDirection: 'row' , alignItems: 'center', justifyContent: 'center'}}>
                    <ActivityIndicator size="large" color={defaultColors.activeColor} />
                </View>
                
            ) : (
                imagem && !imageError ? (
                    // <FastImage
                    <AutoHeightImage
                        style={{ width, height: imageHeight }}
                        source={{
                            uri: imagePath,
                            priority: FastImage.priority.high,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <Icon
                        name="image-off-outline"
                        type="material-community"
                        color="#312E2E"
                        size={30}
                    />
                )
            )}
        </>
    )
}

export default function CapituloPage({ route }){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const [ isLoading, setIsLoading ] = useState(false)
    const [loadingRefresh, setIsLoadingRefresh] = useState(false)
    const [ capituloId, setCapituloId] = useState(route.params?.id)
    const [ capitulo, setCapitulo] = useState({})
    const capitulosRef = useRef()
    // const [ capitulosRef, setCapitulosRef ] = useState(null)
    const [ posicaoNaTela, setPosicaoNaTela ] = useState(0)
    const [ showIrTopo, setShowIrTopo] = useState(false)
    const { leitura, obra  } = route.params
    const [lido, setLido ] = useState(false)
    const{
        nome,
        numero,
        imagem,
        descricao,
        links
    } = capitulo
    
    const upButtonHandler = () => {
        capitulosRef?.current?.scrollToOffset({ 
          offset: 0, 
          animated: true 
        });
        setShowIrTopo(false)
    };

    const scrollHandler = event => {
        const offsetY = parseInt(event.nativeEvent.contentOffset.y);
        if (offsetY > posicaoNaTela && showIrTopo) {
          setShowIrTopo(false);
        } else if (offsetY < posicaoNaTela && !showIrTopo && (posicaoNaTela > height - 0)) {
          setShowIrTopo(true);
        }
        setPosicaoNaTela(offsetY)
        if(!isLoading){
            AsyncStorage.setItem(`posicao-${capituloId}`, offsetY.toString())
        }
    };

    useEffect(() =>{
        if(capituloId) getCapitulo(capituloId)
    },[capituloId])

    const getCapitulo = async (id) => {
        if(isLoading) return
        setIsLoading(true)
        try{
            const response = await api.get(`capitulos/${id}`)
            setCapitulo([])
            setCapitulo(response.data)
            navigation.setOptions({
                headerTitle: response.data?.nome
            })
            setLido(response.data.lido)
            setTimeout(async () => {
                const posicaoAnterior = await AsyncStorage.getItem(`posicao-${response.data.id}`)
                console.log('posicaoAnterior', posicaoAnterior)
                if (posicaoAnterior) {
                    capitulosRef?.current?.scrollToOffset({ 
                        offset: parseInt(posicaoAnterior), 
                        animated: true 
                    });
                    setShowIrTopo(true);
                    setTimeout(() => {
                        Snackbar.show({
                            text: "Voltando para onde parou",
                            duration: 2000,
                            action: {
                                text: 'OK',
                                textColor: 'green',
                                onPress: () => { /* Do something. */ },
                            },
                        });
                    })
                }
            },1000)
        }catch(error){

        } finally{
            setIsLoading(false)
            setIsLoadingRefresh(false)
        }
    }

    const handleCapituloLido = async () => {
        if(isLoading) return
        try{
            await api.post(`capitulos/${capituloId}/marcar-como-lido`)

            Snackbar.show({
                text: "Marcado como lido!",
                duration: 2000,
                action: {
                    text: 'OK',
                    textColor: 'green',
                    onPress: () => { /* Do something. */ },
                },
            });
            AsyncStorage.removeItem(`posicao-${capituloId}`)
            if(obra.total_capitulos == (obra.total_lidos + 1) && leitura?.status.id != 3 && [2,4].includes(obra.status)){
                await api.patch(`usuario-leitura/${leitura.id}`, {
                    status : 3
                })
            }
            obra.total_lidos = obra.total_lidos + 1
        }catch(error){
        } finally{
        }
    }  

    function refresh(){
        setIsLoadingRefresh(true)
        setCapitulo([])
        getCapitulo(capituloId) 
    }


    if(isLoading) return (
        <View style={{ paddingVertical: 100, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" size={30} style={{marginTop: 100}}/>
        </View>
    )
    return(
        <>
          
            <FlatList
                data={capitulo.paginas} 
                // ref={ref => setCapitulosRef(ref)}
                ref={capitulosRef}
                onScroll={scrollHandler}
                refreshControl={
                    <RefreshControl 
                        refreshing={loadingRefresh} 
                        tintColor={`#666`}
                        onRefresh={refresh}
                    />
                }
                renderItem={({item, index}) => {
                return (
                    <CustomImage 
                        imagem={item}
                        obra={obra}
                        capitulo={capitulo}
                        key={index}
                    />
                )
                }}
                ListEmptyComponent={
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <Text allowFontScaling={ false } style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
                            Nenhuma página ainda!
                        </Text>
                    </View>
                }
                ListFooterComponent={
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        {
                            capitulo?.cap_anterior &&
                            <CustomButton 
                                mode="outlined"
                                style={styles.buttonNext}
                                onPress={() => {
                                    setCapituloId(capitulo?.cap_anterior)
                                }}
                            >
            
                                Capitulo anterior
                            </CustomButton>
                        }
                        {
                            capitulo?.prox_cap &&
                            <CustomButton 
                                mode="outlined"
                                style={styles.buttonNext}
                                onPress={() => {
                                    setCapituloId(capitulo?.prox_cap)
                                }}
                            >
            
                                Próximo capitulo
                            </CustomButton>
                        }
                    </View>
                
                }
                keyExtractor={(item, index) => {  return `${item.src}-${index}` }}
                onEndReached={() => {
                    if(!lido) {
                        setLido(true)
                        handleCapituloLido()
                    }
                }}
            />
            {
                showIrTopo ? 
                <CustomButton
                    style={{
                        position: 'absolute',
                        zIndex: 10,
                        bottom: 10,
                        right: 10,
                        borderColor: '#312E2E',
                        borderWidth: 1,
                        paddingHorizontal: 20,
                        flexDirection: 'row',
                        backgroundColor: defaultColors.primary,
                        alignItems: 'center',
                        gap: 10
                    }}
                    onPress={upButtonHandler}
                >
                    Ir para o topo
                </CustomButton>
                : null
            } 
        </>
    )
}

const styles = StyleSheet.create({
    view: {
        height: height
    },
    statusList:{
        paddingHorizontal: 15,
        flexDirection: 'row',
    },
    descricao:{
        fontSize: 13,
        flexWrap: 'wrap',
        color: '#fff',
        width: "100%",
        paddingHorizontal: 15,
        marginBottom: 30
    },
    gradiente:{
        width: width,
        height: (width) * (4.3 / 3),
    },
    details:{
        paddingTop: 120
    },
    capitulos:{
        paddingHorizontal: 15,
        marginBottom: 10,
        color: '#666'
    },
    buttonNext:{
        flex: 1,
        height: 51,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 100,
        borderColor: '#312E2E',
        borderRadius: 5,
        marginHorizontal: 10
    },
    viewCard:{
        marginTop: 40,
        padding: 10,
        width: width - 30, 
        overflow: 'scroll',
        flexDirection: 'row',
        gap: 10
    },
    imageContainerCard:{
        width: width * 0.18,
        height: width * 0.18,
        borderColor: '#312E2E',
        borderWidth: 1,
        marginBottom: 5,
        borderRadius: 5,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    obraNome:{
        fontSize: 15,
        flexWrap: 'wrap',
        color: defaultColors.gray,
        width: "70%",
    },
    nome:{
        fontSize: 18,
        flexWrap: 'wrap',
        color: '#fff',
        width: "70%",
        marginBottom: 5
    },
    numero:{
        fontSize: 12,
        flexWrap: 'wrap',
        color: defaultColors.gray,
        width: "70%",
    },
    buttons:{
        paddingHorizontal: 20,
        marginBottom: 10
    },
    containerComment:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        borderWidth: 0,
    },
    button:{
        width: 100,
        height: 40,
        justifyContent: 'center',
        backgroundColor: defaultColors.activeColor,
        marginRight: 20
    }
});