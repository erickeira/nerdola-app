import { useEffect, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Animated, RefreshControl } from "react-native";
import InputText from "./InputText";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import Chip from "./Chip";
import CardObra from "./CardObra";
import { Icon } from "react-native-paper";
import { botUrl, defaultColors } from "../utils";
import CustomButton from "./CustomButton";
import CardPublicacao from "./CardPublicacao";
import Snackbar from "react-native-snackbar";
import CardPublicacaoSkeleton from "./CardPublicacaoSkeleton";
import axios from "axios";


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

    const handleReportar = async (publicacao) => {
        try{
            await axios.post(botUrl,{
                content: "Publicação reportada!\n_ _",
                embeds: [ {
                    "title":  `ID :${publicacao.id} - ${publicacao?.usuario?.nome}`,
                    "description": publicacao.publicacao, 
                    "color": 5814783,
                }],
                attachments: []
            })
            Snackbar.show({
                text: "Obrigado por reportar",
                duration: 2000,
                action: {
                    text: 'OK',
                    textColor: 'green',
                    onPress: () => { /* Do something. */ },
                },
            });
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
                            publicacao={item} 
                            handleReportar={handleReportar}
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
    }
});