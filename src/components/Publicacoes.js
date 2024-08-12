import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Animated, RefreshControl, BackHandler } from "react-native";
import InputText from "./InputText";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import Chip from "./Chip";
import CardObra from "./CardObra";
import { Icon } from "react-native-paper";
import { defaultColors } from "../utils";
import CustomButton from "./CustomButton";
import CardPublicacao from "./CardPublicacao";
import Snackbar from "react-native-snackbar";
import CardPublicacaoSkeleton from "./CardPublicacaoSkeleton";


import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
    BottomSheetFlatList 
  } from '@gorhom/bottom-sheet';
import CardComentario from "./CardComentario";
import CardComentarioSkeleton from "./CardComentarioSkeleton";

const { height, width }  = Dimensions.get('screen');

export default function Publicacoes({ route }){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const [ publicacoes , setPublicacoes] = useState([])
    const [ tags , setTags] = useState([])
    const [pagina, setPagina] = useState(1)
    const [limite, setLimite] = useState(20)
    const [loading, setIsLoading] = useState(false)
    const [loadingRefresh, setIsLoadingRefresh] = useState(false)
    const [ enReached , setEnReached ] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [ posicaoNaTela, setPosicaoNaTela ] = useState(0)
    const [ showIrTopo, setShowIrTopo] = useState(false)
    const [ filtros , setFiltros] = useState({
    })
    const [ idAction , setIdAction] = useState(null)
    const [listRef, setListRef] = useState(null)
    const upButtonHandler = () => {
      listRef?.scrollToOffset({ 
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
  

    useEffect(() =>{
        setIsLoading(true)
        getPublicacoes()
    },[])

    // useEffect(() => {
    //     setIsLoading(true)
    //     getPublicacoes(1 , filtros)
    // },[filtros])

    useEffect(() => {
        if(isFocused){
            getPublicacoes(pagina , filtros)
        }
    },[isFocused])

    const getPublicacoes = async (pag = 1, filtros = {}) => {
        if(loading || loadingRefresh || loadingMore) return
        
        try{
            const response = await api.get(`publicacoes`, {
                params: {
                    ...filtros,
                    pagina: pag?.toString(),
                    limite: limite?.toString()
                }
            })
            if(response.data?.length < limite){
                setEnReached(true)
            }
            setEnReached(true)
            if(pag == 1){
                setPublicacoes([])
                setPublicacoes([...response.data])
                setEnReached(false)
            }else{
                const existingIds = response.data.map(publicacao => publicacao.id); 
                const oldPublicacao = publicacoes?.filter(publicacao => !existingIds.includes(publicacao.id));
                setPublicacoes([...oldPublicacao, ...response.data]);
            }
            setPagina(pag)
        }catch(error){
            console.log(error)
        } finally{
            setTimeout(() => {
                setIsLoading(false)
                setLoadingMore(false)
                setIsLoadingRefresh(false)
            }, 300);

        }
    }


    function refresh(){
        setIsLoadingRefresh(true)
        setPublicacoes([])
        getPublicacoes(1) 
    }

    const handleExcluir = async (id) => {
        try{
            const response = await api.delete(`publicacoes/${id}`)
            getPublicacoes(pagina , filtros)
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
        }
    }

     // ref
     const bottomSheetModalRef = useRef(null);

     // variables
     const snapPoints = useMemo(() => ['80%', '95%'], []);
 
     // callbacks
     const handlePresentModalPress = useCallback(() => {
         bottomSheetModalRef.current?.present();
     }, []);
 
     const handleSheetChanges = useCallback((index) => {
         // console.log('handleSheetChanges', index);
     }, []);
 
     const handleBackPress = () => {
         if (bottomSheetModalRef.current) {
             bottomSheetModalRef.current.dismiss();
             return true; 
         }
         return false;
     };
 
     useEffect(() => {
         BackHandler.addEventListener("hardwareBackPress", handleBackPress);
         return () => {
             BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
         };
     }, []);

     const [ isLoadingComentarios , setIsLoadingComentarios] = useState(false)
     const [ comentarios , setComentarios] = useState([])
     
     const getComentarios = async (publicacao) => {
        if(isLoadingComentarios) return
        setIsLoadingComentarios(true)
        try{
            const response = await api.get(`comentarios`, {
                params: {
                    publicacao
                }
            })
            setComentarios([])
            setComentarios([...response.data])
            setPagina(pag)
        }catch(error){
            console.log(error)
        } finally{
            setIsLoadingComentarios(false)
        }
    }

    const renderItem =  ({ item }) => (
       <CardComentario comentario={item} handleExcluir={() => handleExcluirComentario(item.id)}/>
    )

    const [comentario, setComentario] = useState("")
    const [isLoadingComentando, setIsLoadingComentando] = useState(false)
    
    const handleComentar = async () => {
        setIsLoadingComentando(true)
        try{
            await api.post(`comentarios`,{
                publicacao: publicacao?.id,
                capitulo: capitulo?.id,
                comentario: comentario
            })
            getComentarios()
            setComentario("")
            setTimeout(() => {
                downButtonHandler()
            }, 1000);
           
        }catch(error){
            console.log(error)
        } finally{
            setIsLoadingComentando(false)
        }
    }

    const handleExcluirComentario = async (id) => {
        try{
            await api.delete(`comentarios/${id}`)
            getComentarios()
        }catch(error){
            console.log(error)
        } finally{
            setIsLoadingComentando(false)
        }
    }

    return(
        <>
            <FlatList
                data={publicacoes}
                ref={(ref) => {setListRef(ref)}}
                onScroll={scrollHandler}
                style={styles.view}
                refreshControl={
                    <RefreshControl 
                        refreshing={loadingRefresh} 
                        tintColor={`#666`}
                        onRefresh={refresh}
                    />
                  }
                
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                renderItem={({item, index}) => {
                    return ( 
                        <CardPublicacao 
                            handleExcluir={() => handleExcluir(item.id)}   
                            handleComentarios={() => {
                                getComentarios(item.id)
                                setIdAction(item.id)
                                handlePresentModalPress()
                            }} 
                            publicacao={item} 
                        />
                    ) 
                }}
                ListHeaderComponent={
                    (loading || loadingRefresh) &&
                    <View>
                        <CardPublicacaoSkeleton/>
                        <CardPublicacaoSkeleton/>
                        <CardPublicacaoSkeleton/>
                    </View>
                }
                ListEmptyComponent={
                    !loading && !loadingRefresh && 
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <Text allowFontScaling={ false } style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
                           Nenhuma publicação ainda!
                        </Text>
                    </View>
                }
                keyExtractor={(item, index) => {  return `${item.numero}-${index}` }}
                onEndReached={() => {
                    if(!loadingMore && !enReached && !loading && !loadingRefresh){
                        setLoadingMore(true)
                        getPublicacoes(pagina + 1)
                    }
                }}
                ListFooterComponent={() => {
                    if(!enReached && publicacoes.length > 0) return (
                        <></>
                        // <ActivityIndicator color={defaultColors.activeColor} size={30} style={{flex: 1, marginVertical: 15}}/>
                    )
                    return null
                }}
            />
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
                    isLoadingComentarios ? 
                    <>
                        <CardComentarioSkeleton/>
                        <CardComentarioSkeleton/>
                        <CardComentarioSkeleton/>
                        <CardComentarioSkeleton/>
                        <CardComentarioSkeleton/>
                    </>
                    
                    :
                    <>
                        <BottomSheetFlatList
                            data={comentarios}
                            keyExtractor={(i) => i.id}
                            renderItem={renderItem}
                            contentContainerStyle={styles.contentContainer}
                            ListEmptyComponent={
                                <View >
                                    <Text style={{ textAlign: 'center',color: defaultColors.gray, marginTop: 100}}>
                                        Nenhum comentário ainda!
                                    </Text>
                                </View>
                            }
                        />
                         <View style={styles.containerComment}>
                            <InputText
                                placeholder="Faça um comentário"
                                containerStyle={styles.input}
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
                                <Text style={{color: '#fff'}}>
                                    Publicar
                                </Text>
                                
                            </CustomButton>
                        </View>
                    </>
                    
                }
                
            </BottomSheetModal>
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
      padding: 10,
      height : height - 60
    },
    tags: {
        display: 'flex',
        flexDirection: 'row',
        gap: 10
    },
    tag: {
     marginRight: 10,
    },
    containerTopoCapitulos:{
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginHorizontal: 8,
        marginVertical: 10,
        alignItems: 'center'
    },
    botaoOrdenar: {
        borderWidth: 0.3,
        borderColor: '#fff',
        paddingHorizontal: 23,
        paddingVertical: 4,
        borderRadius: 4
    },
    textInput:{
        backgroundColor: '#191919',
        borderWidth: 0
    },
    modalContainer:{
        backgroundColor: '#191919'
    },
    selected:{
        width: '93%',
        color: '#fff' 
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
        marginRight: 20,
        color: '#fff'
    }
});