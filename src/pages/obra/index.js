import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { ActivityIndicator, BackHandler, Dimensions, FlatList, Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../../utils/api";
import { botUrl, defaultColors, imageUrl } from "../../utils";
import { Icon, IconButton,  Menu, Divider, PaperProvider  } from "react-native-paper";
import LinearGradient from 'react-native-linear-gradient';
import CardObra from "../../components/CardObra";
import CardCapitulo from "../../components/CardCapitulo";
import Chip from "../../components/Chip";
import CustomButton from "../../components/CustomButton";
import Snackbar from "react-native-snackbar";
import axios from "axios";
import CardLink from "../../components/CardLink";
import CardObraSkeleton from "../../components/CardObraSkeleton";
import Skeleton from "../../components/Skeleton";
import CardLista from "../../components/CardLista";
const { height, width }  = Dimensions.get('screen');


import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
    BottomSheetFlatList
  } from '@gorhom/bottom-sheet';
import { useAuth } from "../../context/AuthContext";

export default function ObraPage({ route }){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const { usuario } = useAuth()
    const [ isLoading, setIsLoading ] = useState(true)
    const [ obra, setObra] = useState({})
    const [ capitulosRef, setCapitulosRef ] = useState(null)
    const { id } = route.params
    const [ posicaoNaTela, setPosicaoNaTela ] = useState(0)
    const [ showIrTopo, setShowIrTopo] = useState(false)
    const{
        nome,
        imagem,
        descricao,
        leitura,
        links
    } = obra
    const imagePath = `${imageUrl}obras/${id}/${imagem}`;
    const [imageError, setImageError] = useState(false)
    const [ondeLer, setOndeLer] = useState(false)
    const [ capitulos, setCapitulos] = useState([])

    useEffect(() => {
        setImageError(false)
    },[imagePath])

    const upButtonHandler = () => {
        capitulosRef?.scrollToOffset({ 
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
    };
   
    const getObra = async () => {
        try{
            const response = await api.get(`obras/${id}`)
            setObra({ 
                ...obra, 
                ...response.data
            })
            setCapitulos(ordenaCapitulos(response.data.capitulos))
        }catch(error){

        } finally{
            setIsLoading(false)
        }
    }
    const ordenaCapitulos = (capitulos) => {
        if (!capitulos || !Array.isArray(capitulos)) {
          return [];
        }
      
        return capitulos.sort((a, b) => {
          const numA = parseInt(a.numero, 10);
          const numB = parseInt(b.numero, 10);
          return numA - numB;
        });
    };

    useEffect(() => {
        setIsLoading(true)
        getStatusList()
    },[])

    useEffect(() => {
        if(isFocused) {
            getObra()
            getListas(usuario.id)
        }
    },[isFocused])

    const [ statusList, setStatusList] = useState([])
    const getStatusList = async () => {
        try{
            const response = await api.get(`leitura-status`)
            setStatusList(response.data)
        }catch(error){

        } 
    }

    const [isLoadingLeitura, setIsLoadingLeitura] = useState(false)

    const handleRemoveLeitura = async () => {
        if(isLoadingLeitura) return
        setIsLoadingLeitura(true)
        try{
            const response = await api.delete(`usuario-leitura/${leitura.id}`, {
                obra : id,
                status: 1
            })
            getObra()
        }catch(error){
        } finally{
            setIsLoadingLeitura(false)
        }
    }
    
    const handleAddLeitura = async (status) => {
        if(isLoadingLeitura) return
        setIsLoadingLeitura(true)
        try{
            const response = await api.post(`usuario-leitura`, {
                obra : id,
                status
            })
            getObra()
        }catch(error){
        } finally{
            setIsLoadingLeitura(false)
        }
    }

   
    const handleUpdateLeitura = async (status) => {
        if(isLoadingLeitura) return
        setIsLoadingLeitura(true)
        try{
            const response = await api.patch(`usuario-leitura/${leitura.id}`, {
                status
            })
            getObra()
        }catch(error){
        } finally{
            setIsLoadingLeitura(false)
        }
    }

    const [isLoadingCapitulo, setIsLoadingCapitulo] = useState(null)
    const handlePressCapitulo = async (capitulo, marcarLido = true) => {
        setIsLoadingCapitulo(capitulo)
        try{
            await api.post(`capitulos/${capitulo}/marcar-como-lido`)

            if(obra.total_capitulos == (obra.total_lidos + 1) && leitura?.status.id != 3 && [2,4].includes(obra.status)){
                await api.patch(`usuario-leitura/${leitura.id}`, {
                    status : 3
                })
            }
        }catch(error){
        } finally{
            getObra()
            setIsLoadingCapitulo(null)
        }
    }    

    const [isLoadingInformar, setIsLoadingInformar] = useState(false)
    const [informado, setInformado] = useState(false)
    const handleInformar = async () => {
        setIsLoadingInformar(true)
        try{
            const response = await axios.post(botUrl,{
                content: "Obra desatualizada, por favor inserir novo capitulo!\n_ _",
                embeds: [ {
                    "title": nome,
                    "description": `Último capitulo:  ${ obra?.capitulos ? obra?.capitulos[ obra?.capitulos.length - 1]?.numero : ''}`,
                    "url": `https://admin.nerdola.com.br/capitulos/${id}`,
                    "color": 5814783,
                    "thumbnail": {
                      "url": imagePath
                    }
                }],
                attachments: []
            })
            setIsLoadingInformar(false)
            Snackbar.show({
                text: "Obrigado por nos informar",
                duration: 2000,
                action: {
                    text: 'OK',
                    textColor: 'green',
                    onPress: () => { /* Do something. */ },
                },
            });
            setInformado(true)
        }catch(err){

        }
    }

    const [ordem, setOrdem] = useState("ascending")

    useEffect(() => {
        navigation.setOptions({
            headerRight: ()  =>  (
                <View style={{flexDirection: 'row' , alignItems: 'center', gap: 20, marginRight: 20}}>
                  <TouchableOpacity 
                      onPress={handlePresentModalPress} 
                      hitSlop={{left: 20, bottom: 20}} 
                      style={{ 
                        padding: 8,
                        borderRadius: 100,
                        backgroundColor: 'rgba(0,0,0,0.3)'
                      }}
                  >
                      <Icon
                        source="bookmark-outline"
                        size={24}
                      />
                  </TouchableOpacity>
                </View>
            
            ),  
        })
    },[])

    const [ listas, setListas] = useState([])
    const getListas = async (usuario) => {
        try{
            const response = await api.get(`listas`,{
                params:{
                    usuario,
                    obra: obra.id
                }
            })
            setListas([])
            setListas(response.data)
        }catch(error){
        } finally {
        }
    }
 
    const bottomSheetModalRef = useRef(null);
    const textoListaRef = useRef();
    const snapPoints = useMemo(() => ['60%', '95%'], []);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
        BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    }, []);

    const handleSheetChanges = useCallback((index) => {
        if(index > 0){
            // textoListaRef?.current?.focus()
        }else if(index < 0){
            BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
        }
        // console.log('handleSheetChanges', index);
    }, []);

    useEffect(() => {
        
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
        };
    }, []);
    
    const handleBackPress = () => {
        if (bottomSheetModalRef.current) {
            bottomSheetModalRef.current.dismiss();
            return true; 
        }
        return false;
    };

    const [loadingLista, setLoadingLista] = useState(null)
    const handleAddLista = async (lista) => {
        setLoadingLista(lista)
        try{
            const response = await api.post(`listas/${lista}/adicionar-remover-obra`,{
                obra: obra.id
            })
            Snackbar.show({
                text: response.data?.message,
                duration: 2000,
                action: {
                  text: 'OK',
                  textColor: 'green',
                  onPress: () => { /* Do something. */ },
                },
            });
            getListas(usuario.id)
        }catch(error){
        } finally {
            setLoadingLista(null)
        }
    }

   
    const renderItemLista = useCallback(
        ({ item }) => (
          <CardLista 
            lista={item} 
            add
            onAdd={() => {
                handleAddLista(item.id)
            }}
            isLoading={loadingLista == item.id}
        />
        ),
        [loadingLista, obra]
    );


    if(isLoading) return(
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator color={defaultColors.activeColor} size={25}/>
        </View>
    )
    return(
        <SafeAreaView style={styles.view}>
            <BottomSheetModalProvider>
            <FlatList
                extraData={leitura}
                data={ ondeLer ? links : capitulos } 
                ref={ref => setCapitulosRef(ref)}
                onScroll={scrollHandler}
                ListHeaderComponent={(
                <View >
                    <View style={styles.imageContainer}>
                        {
                            !imageError && !isLoading ?
                            <Image
                                style={styles.imagem}
                                source={{ uri : imagePath }}
                                onError={(error) => {
                                    setImageError(true)
                                }}
                            />
                            :
                            <View style={{marginTop: 100}}>
                                <Icon 
                                    source="image-off-outline" 
                                    color="#312E2E" 
                                    size={30}
                                />
                            </View>
                        }

                    </View>
                    <LinearGradient 
                        colors={[
                            'rgba(13, 13, 13, 0.8)', 
                            'rgba(13, 13, 13, 1)', 
                            'rgba(13, 13, 13, 1)', 
                            'rgba(13, 13, 13, 1 )'
                        ]} 
                        style={styles.gradiente}
                    >
                    {
                        !!obra.id && (
                            <View style={styles.details}>
                                {
                                    isLoading? <CardObraSkeleton/> :
                                    <CardObra obra={obra} showstatus showtags/>
                                }
                                
                                <View style={styles.divider}/> 
                                {
                                    !isLoading && (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusList}>
                                            {
                                                statusList?.map((status) => (
                                                    <Chip 
                                                        key={status.id}
                                                        label={status?.nome}
                                                        value={status.id}
                                                        isSelected={leitura.status.id == status.id}
                                                        onPress={(id) => {
                                                            if(leitura.status.id == id){
                                                                handleRemoveLeitura()
                                                            }else if(!!leitura.id){
                                                                handleUpdateLeitura(id)
                                                            }else{
                                                                handleAddLeitura(id)
                                                            }
                                                        }}
                                                    />
                                                ))
                                            }
                                            
                                        </ScrollView>
                                    )
                                }
                                
                                {
                                    isLoading ? <Skeleton style={{ width: '100%', height: 200, paddingHorizontal: 10}}/> :
                                    (
                                        !!descricao  && 
                                        <Text style={styles.descricao}>
                                            {descricao}
                                        </Text>
                                    )
                                    
                                }
                            </View>
                        )
                    }
                    
                    </LinearGradient>
                    {
                        !isLoading && (
                            <View style={{ width: '100%',flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', flexWrap: 'wrap'}}>
                                <Chip
                                    onPress={() => {
                                        navigation.navigate('publicar', {
                                            obra
                                        })
                                    }}
                                    style={{ paddingVertical: 3, height: 45}} 
                                >
                                    <Text style={{color: '#fff'}}>
                                        Publicar no feed
                                    </Text>
                                </Chip>
                                {
                                    !ondeLer ? 
                                    <Chip 
                                        label={""}
                                        isSelected={false}
                                        onPress={(id) => {
                                            setOndeLer(true)
                                        }}
                                        style={{ alignItems: 'center' }}
                                    >
                                        
                                        <Text style={{color: '#fff'}}>
                                            Onde ler
                                        </Text>
                                        <Icon source="web" size={15}/>
                                    </Chip>
                                    :
                                    <Chip 
                                        label={""}
                                        isSelected={false}
                                        onPress={(id) => {
                                            setOndeLer(false)
                                        }}
                                        style={{ alignItems: 'center' }}
                                    >
                                        
                                        <Text>
                                            Capitulos
                                        </Text>
                                        <Icon source="format-list-checkbox" size={15}/>
                                    </Chip>
                                }
                            
                                <Chip 
                                    label={""}
                                    isSelected={false}
                                    onPress={(id) => {
                                        if(ordem == "ascending") setOrdem("descending")
                                        else setOrdem("ascending")
                                        setCapitulos(capitulos.reverse())
                                    }}
                                    style={{ width: 100}}
                                >
                                    <Icon 
                                        source={ordem == "ascending" ? "sort-ascending" : "sort-descending"} 
                                        color="#fff" size={18} 
                                    />
                                </Chip>
                            </View>

                        )
                    }
                    {
                        obra.ultimo_lido?.prox_capitulo && (
                            <CustomButton 
                                style={{paddingVertical: 15, borderRadius: 0}}
                                onPress={() => {
                                    navigation.navigate("capitulo", { 
                                        id: obra.ultimo_lido?.prox_capitulo ,
                                        leitura,
                                        obra
                                    })
                                }}
                            >
                                Voltar onde parou
                            </CustomButton>
                        )
                    }    
                
                    <Text style={styles.capitulos}>
                        { ondeLer?  'Onde ler' :'Capitulos' }
                    </Text>
                </View>
                )}
                renderItem={({item, index}) => {
                    if(ondeLer){
                        return (
                            <CardLink 
                                link={item} 
                                onPress={() => {
                                    Linking.openURL(item.url)
                                }}    
                            />
                        )
                    }
                    return (
                        <CardCapitulo
                            onLido={handlePressCapitulo}
                            isLoading={isLoadingCapitulo}
                            capitulo={item}
                            leitura={leitura}
                            obra={obra}
                        />
                    )
                }}
                ListEmptyComponent={
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <Text allowFontScaling={ false } style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
                            { ondeLer ? 'Nenhum link informado!' : 'Nenhum capitulo ainda!' }
                        </Text>
                    </View>
                }
                keyExtractor={(item, index) => {  return `${item.id}-${index}` }}
                ListFooterComponent={() => (
                    !informado &&  !ondeLer &&
                    <CustomButton 
                        mode="outlined"
                        style={styles.buttonInformar}
                        onPress={handleInformar}
                        isLoading={isLoadingInformar}
                    >
                        Obra desatualizada?
                    </CustomButton>
                )}
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
                        borderWidth: 0,
                        paddingHorizontal: 20,
                        flexDirection: 'row',
                        backgroundColor: defaultColors.primary,
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        gap: 10
                    }}
                    onPress={upButtonHandler}
                >
                    Ir para o topo
                </CustomButton>
                : null

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
                    <View
                        style={{
                            borderBottomWidth: 0.2,
                            borderBottomColor: '#262626',
                            paddingVertical: 10
                        }}
                    >
                        <Text style={{ color: defaultColors.gray, textAlign: 'center' }}>{listas.length} { listas.length == 1 ? "lista" : "listas"}</Text>
                    </View>
                    <BottomSheetFlatList
                        data={listas}
                        keyExtractor={(i) => i.id}
                        renderItem={renderItemLista}
                        contentContainerStyle={styles.contentContainer}
                        style={{paddingHorizontal: 10}}
                    />
                </BottomSheetModal>
            </BottomSheetModalProvider>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    view: {
    },
    imageContainer:{
        width: width,
        minHeight: (width) * (4.3 / 3),
        overflow: 'hidden',
        alignItems: 'center',
        position: 'absolute'
    },
    imagem:{
        width: '100%',
        height: '100%',
    },
    statusList:{
        marginHorizontal: 15,
        // flexDirection: 'row',
    },
    descricao:{
        fontSize: 13,
        flexWrap: 'wrap',
        color: '#fff',
        width: "100%",
        paddingHorizontal: 15
    },
    gradiente:{
        width: width,
        minHeight: (width) * (4.3 / 3),
    },
    details:{
        paddingTop: 120
    },
    capitulos:{
        paddingHorizontal: 15,
        marginVertical: 10,
        color: '#666'
    },
    buttonInformar:{
        height: 51,
        justifyContent: 'center',
        marginBottom: 100,
        borderColor: '#312E2E',
        borderRadius: 5,
        marginHorizontal: 10
    },
    divider:{
        borderColor: '#312E2E',
        borderBottomWidth: 1,
        marginVertical: 20,
        width: width - 40,
        marginHorizontal: 20,
    },
    modalContainer:{
        backgroundColor: '#121212',
        padding: 30
    },
});