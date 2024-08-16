import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { 
    ActivityIndicator, 
    Dimensions, 
    FlatList, 
    Image, 
    Linking, 
    RefreshControl, 
    SafeAreaView, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View ,
    BackHandler, 
    Animated,
    Easing
} from "react-native";
import api from "../../utils/api";
import { botUrl, defaultColors, imageUrl, proporcaoCard } from "../../utils";
import { Icon, IconButton,  Menu, Divider, PaperProvider, Checkbox  } from "react-native-paper";
import CustomButton from "../../components/CustomButton";
import AutoHeightImage from "react-native-auto-height-image";
import FastImage from 'react-native-fast-image';
import Snackbar from "react-native-snackbar";
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CardComentario from "../../components/CardComentario";
import InputText from "../../components/InputText";


import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
    BottomSheetFlatList 
  } from '@gorhom/bottom-sheet';
import InputSelect from "../../components/InputSelect";
import axios from "axios";

const { height, width }  = Dimensions.get('screen');

const CustomImage = ({ imagem, obra, capitulo, onPress }) => {
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
                    <FastImage
                    // <AutoHeightImage
                        style={{ width, height: imageHeight }}
                        source={{
                            uri: imagePath,
                            priority: FastImage.priority.high,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                        onError={() => setImageError(true)}
                        onPress={onPress}
                        onTouchEnd={onPress}
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


    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        
        Animated.timing(fadeAnim, {
            toValue: showIrTopo ? 1 : 0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [showIrTopo]);

    
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
                if (posicaoAnterior && posicaoAnterior > posicaoNaTela) {
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

    const [ comentarios , setComentarios] = useState([])

    const downButtonHandler = () => {
        capitulosRef?.current?.scrollToEnd({ 
          animated: true 
        });
    };

    useEffect(() =>{
        setIsLoadingComentarios(true)
        getComentarios()
    },[capituloId])

    const [isLoadingComentarios, setIsLoadingComentarios] = useState(false)
    const getComentarios = async (pag = 1, ) => {
        if(isLoadingComentarios) return
        try{
            const response = await api.get(`comentarios`, {
                params: {
                    capitulo: capituloId
                }
            })

        setComentarios([])
        setComentarios([...response.data])

        }catch(error){
            console.log(error)
        } finally{
            setIsLoadingComentarios(false)
        }
    }

    const [comentario, setComentario] = useState("")
    const [isLoadingComentando, setIsLoadingComentando] = useState(false)
    
    const handleComentar = async () => {
        setIsLoadingComentando(true)
        try{
            await api.post(`comentarios`,{
                capitulo: capituloId,
                comentario: comentario
            })
            getComentarios()
            setComentario("")
            Snackbar.show({
                text: "Comentário publicado!",
                duration: 2000,
                action: {
                    text: 'OK',
                    textColor: 'green',
                    onPress: () => { /* Do something. */ },
                },
            });
            setTimeout(() => {
                downButtonHandler()
            }, 1000);
           
        }catch(error){
            console.log(error)
        } finally{
            setIsLoadingComentando(false)
        }
    }

    const handleExcluir = async (id) => {
        try{
            await api.delete(`comentarios/${id}`)
            getComentarios()
        }catch(error){
            console.log(error)
        } finally{
            setIsLoadingComentando(false)
        }
    }

    const bottomSheetModalRef = useRef(null);
    const snapPoints = useMemo(() => ['70%', '90%'], []);

    const handlePresentModalComentariosPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
        BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    }, []);

    const handleSheetChanges = useCallback((index) => {
        if(index < 0){
            BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
        }
        // console.log('handleSheetChanges', index);
    }, []);


    const bottomSheetModalReportarRef = useRef(null);
    const snapPointsReportar = useMemo(() => ['40%', '50%'], []);

    const handlePresentModalReportarPress = useCallback(() => {
        bottomSheetModalReportarRef.current?.present();
        BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    }, []);

    const handleBackPress = () => {
        if (bottomSheetModalRef.current) {
            bottomSheetModalRef.current.dismiss();
            return true; 
        }
        if (bottomSheetModalReportarRef.current) {
            bottomSheetModalReportarRef.current.dismiss();
            return true; 
        }
        return false;
    };




    const renderItem =  ({ item }) => (
        <CardComentario
            key={item.id}
            comentario={item}
            handleExcluir={() => handleExcluir(item.id)}
        />
    )

    const bugs = [
        { id: "paginas-faltando", nome: "Páginas faltando" },
        { id: "nao-carrega", nome: "Páginas não carregam" },
    ]
    const [ bug, setBug ] = useState("")
    const [ outroBug, setOutroBug ] = useState("")
    const imagePathReportar = `${imageUrl}obras/${obra.id}/${obra.imagem}`;

    const [isLoadingReportar, setIsLoadingReportar] = useState(false)
    const handleReportar = async () => {
        setIsLoadingReportar(true)
        try{
            await axios.post(botUrl,{
                content: "Bug reportado!\n_ _",
                embeds: [ {
                    "title":  `${obra.nome} - ${capitulo.nome}`,
                    "description": `${bugs.find(b => b.id == bug)?.nome ||  "Outro" } - ${outroBug}`, 
                    "color": 5814783,
                    "thumbnail": {
                      "url": imagePathReportar
                    }
                }],
                attachments: []
            })
            setBug("")
            setOutroBug("")
            Snackbar.show({
                text: "Obrigado por reportar",
                duration: 2000,
                action: {
                    text: 'OK',
                    textColor: 'green',
                    onPress: () => { /* Do something. */ },
                },
            });
            if (bottomSheetModalReportarRef.current) {
                bottomSheetModalReportarRef.current.dismiss();
                return true; 
            }
        }catch(err){
            Snackbar.show({
                text: "Erro ao reportar",
                duration: 2000,
                action: {
                    text: 'OK',
                    textColor: 'green',
                    onPress: () => { /* Do something. */ },
                },
            });
        } finally {
            setIsLoadingReportar(false)
        }
    }


    if(isLoading) return (
        <View style={{ paddingVertical: 100, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" size={30} style={{marginTop: 100}}/>
        </View>
    )
    return(
        <>
          <BottomSheetModalProvider>
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
                    // return null
                    return (
                        <CustomImage 
                            imagem={item}
                            obra={obra}
                            capitulo={capitulo}
                            key={index}
                            onPress={() => {
                                setShowIrTopo(true)
                            }}
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
                        <View style={{ marginHorizontal: 20,   marginBottom: 100,}}>
                            <View style={{ flexDirection: 'row', gap: 5, marginTop: 20,   marginBottom: 50 }}>
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
                        </View>
                        
                    
                    }
                    keyExtractor={(item, index) => {  return `${item.src}-${index}` }}
                    onEndReached={() => {
                        setShowIrTopo(true)
                        if(!lido) {
                            setLido(true)
                            handleCapituloLido()
                        }
                    }}
                />
            {
                (showIrTopo) && (
                    <Animated.View 
                        style={[
                            styles.containerBotoes,
                            {
                                opacity: fadeAnim,
                            },
                        ]}
                    >
                        <IconButton
                            icon="chat-outline"
                            size={25}
                            iconColor="#fff"
                            onPress={handlePresentModalComentariosPress}
                            style={{paddingVertical: 0}}
                        />
                        <IconButton
                            icon="share"
                            size={25}
                            iconColor="#fff"
                            onPress={() => console.log(1)}
                            style={{paddingVertical: 0}}
                            disabled={true}
                        />
                        <IconButton
                            icon="bug-outline"
                            size={25}
                            iconColor="#fff"
                            onPress={handlePresentModalReportarPress}
                            style={{paddingVertical: 0}}
                        />
                        
                    </Animated.View>
                )
            }
            
                <BottomSheetModal
                    ref={bottomSheetModalRef}
                    index={1}
                    snapPoints={snapPoints}
                    onChange={handleSheetChanges}
                    backgroundStyle={[styles.modalContainer]}
                    handleIndicatorStyle={{
                        backgroundColor: defaultColors.gray
                    }}
                >
                    {
                        comentarios.length > 0 && (
                            <View
                                style={{
                                    borderBottomWidth: 0.2,
                                    borderBottomColor: '#262626',
                                    paddingVertical: 10
                                }}
                            >
                                <Text style={{ color: defaultColors.gray, textAlign: 'center' }}>{comentarios.length} { comentarios.length == 1 ? "comentário" : "comentários"}</Text>
                            </View>
                        )
                    }
                    
                    <BottomSheetFlatList
                        data={comentarios || []}
                        keyExtractor={(i) => i.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.contentContainer}
                        ListEmptyComponent={
                            <View style={{flex: 1 , justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={{color: defaultColors.gray, marginTop: 50}}>Nenhum comentário ainda</Text>
                            </View>
                        }
                    />
                    <View style={styles.containerComment}>
                        <InputText
                            placeholder="Faça um comentário"
                            containerStyle={styles.textInput}
                            height={45}
                            mb={0}
                            maxWidth={width - 130}
                            value={comentario}
                            onChange={(comentario) => {
                                setComentario(comentario)
                            }}
                            tipo="area"
                            maxLength={190}
                        />
                        <CustomButton 
                            style={styles.button}
                            onPress={handleComentar}
                            isLoading={isLoadingComentando}
                            disabled={isLoadingComentando || comentario.length < 1}
                        >
                           <Icon
                                source="send"
                                color="#fff"
                                size={20}
                           />
                        </CustomButton>
                    </View>
                   
                </BottomSheetModal>

                <BottomSheetModal
                    ref={bottomSheetModalReportarRef}
                    index={1}
                    snapPoints={snapPointsReportar}
                    onChange={handleSheetChanges}
                    backgroundStyle={[styles.modalContainer]}
                    handleIndicatorStyle={{
                        backgroundColor: defaultColors.gray
                    }}
                >
                    <View
                        style={{
                            borderBottomWidth: 0.2,
                            borderBottomColor: '#262626',
                            paddingVertical: 10
                        }}
                    >
                        <Text style={{ color: defaultColors.gray, textAlign: 'center' }}>
                            Reportar bug
                        </Text>
                    </View>
                    <View style={{padding: 20}}>
                        <InputSelect
                            label={"Qual erro"}
                            placeholder="Selecione"
                            options={bugs}
                            value={bug}
                            onChange={setBug}
                            containerStyle={{
                                marginBottom: 25,
                            }}
                            snap="40%"
                            variant="outline"
                        />
                        <InputText
                            label="Outro?"
                            placeholder="Descreva"
                            value={outroBug}
                            onStopType={setOutroBug}
                            containerStyle={styles.textInput}
                            height={80}
                            tipo="area"
                        />
                        <CustomButton 
                            mode="contained"
                            style={{marginTop: 10}}
                            onPress={handleReportar}
                            isLoading={isLoadingReportar}
                        >
                            Reportar
                        </CustomButton>
                    </View>
                   
                </BottomSheetModal>
            
          </BottomSheetModalProvider>
            
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
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderColor: '#312E2E',
        borderRadius: 5,
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
        paddingHorizontal: 10,
        paddingBottom: 10
    },
    input: {
        backgroundColor: '#A0A0A0',
        borderWidth: 0,
        width: width - 80,
        marginBottom: 0 
    },
    button:{
        width: 60,
        height: 40,
        justifyContent: 'center',
        backgroundColor: defaultColors.activeColor,
        marginRight: 20
    },
    modalContainer:{
        backgroundColor: '#191919',
        padding: 30
    },
    containerBotoes: {
        position: 'absolute',
        right: 20,
        bottom: "25%",
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 8,
        gap: 8
    }
});