import { useEffect, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Animated, RefreshControl } from "react-native";
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
import CardComentario from "./CardComentario";

const { height, width }  = Dimensions.get('screen');

export default function Comentarios({ route }){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const [ comentarios , setComentarios] = useState([])
    const [pagina, setPagina] = useState(1)
    const [limite, setLimite] = useState(20)
    const [loading, setIsLoading] = useState(false)
    const [loadingRefresh, setIsLoadingRefresh] = useState(false)
    const [ enReached , setEnReached ] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [ posicaoNaTela, setPosicaoNaTela ] = useState(0)
    const [ showIrTopo, setShowIrTopo] = useState(false)
    const { publicacao, capitulo } = route.params
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

    const downButtonHandler = () => {
        listRef?.scrollToEnd({ 
          animated: true 
        });
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
        getComentarios()
    },[])

    useEffect(() => {
        setIsLoading(true)
        getComentarios(1 , filtros)
    },[filtros])

    useEffect(() => {
        if(isFocused){
            getComentarios(pagina, filtros)
        }
    },[isFocused])


      

    const getComentarios = async (pag = 1, filtros = {}) => {
        if(loading || loadingRefresh || loadingMore) return
        try{
            const response = await api.get(`comentarios`, {
                params: {
                    publicacao: publicacao?.id,
                    capitulo: capitulo?.id
                }
            })

            setEnReached(true)
            if(pag == 1){
                setComentarios([])
                setComentarios([...response.data])
                setEnReached(false)
            }else{
                const existingIds = response.data.map(comentario => comentario.id); 
                const oldComentario = comentarios?.filter(comentario => !existingIds.includes(comentario.id));
                setComentarios([...oldComentario, ...response.data]);
            }
            setPagina(pag)
        }catch(error){
            console.log(error)
        } finally{
            setIsLoading(false)
            setLoadingMore(false)
            setIsLoadingRefresh(false)
        }
    }


    function refresh(){
        setIsLoadingRefresh(true)
        setComentarios([])
        getComentarios(1) 
    }

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

    return(
        <>
            <FlatList
                data={comentarios}
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
                        <CardComentario 
                            comentario={item} 
                            handleExcluir={() => handleExcluir(item.id)}
                        />
                    ) 
                }}
                ListEmptyComponent={
                    loading ? 
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color="#fff" size={30}/>
                    </View>
                    :
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <Text allowFontScaling={ false } style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
                           Nenhuma comentário ainda!
                        </Text>
                    </View>
                }
                keyExtractor={(item, index) => {  return `${item.numero}-${index}` }}
                onEndReached={() => {
                    if(!loadingMore && !enReached && !loading && !loadingRefresh){
                        setTimeout(() => {
                            // setLoadingMore(true)
                            getComentarios(pagina + 1)
                        }, 1000)
                 
                    }
                }}
                ListFooterComponent={() => {
                    if(!enReached && comentarios.length > 0) return (
                        <ActivityIndicator color={defaultColors.activeColor} size={30} style={{flex: 1, marginVertical: 15}}/>
                    )
                    return null
                }}
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
                />
                <CustomButton 
                    style={styles.button}
                    onPress={handleComentar}
                    isLoading={isLoadingComentando}
                    disabled={isLoadingComentando || comentario.length < 1}
                >
                    Publicar
                </CustomButton>
            </View>
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