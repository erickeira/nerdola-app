import { useEffect, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Animated, RefreshControl } from "react-native";
import InputText from "../../components/InputText";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import Chip from "../../components/Chip";
import CardObra from "../../components/CardObra";
import { Icon } from "react-native-paper";
import { defaultColors } from "../../utils";

const { height, width }  = Dimensions.get('screen');

export default function HomePage(){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const [ obras , setObras] = useState([])
    const [ tags , setTags] = useState([])
    const [pagina, setPagina] = useState(0)
    const [loading, setIsLoading] = useState(false)
    const [loadingRefresh, setIsLoadingRefresh] = useState(false)
    const [ enReached , setEnReached ] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [ posicaoNaTela, setPosicaoNaTela ] = useState(0)
    const [ showIrTopo, setShowIrTopo] = useState(false)
    const [ filtros , setFiltros] = useState({
        pagina: 1,
        string: '',
        tags: []
    })
    const handleChange = (dado) => {
        setFiltros((prevFiltros) => ({...prevFiltros, ...dado}))
    }

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
        getObras()
        getTags()
    },[])

    useEffect(() =>{
        if(obras.length > 0){
            getObras()
            getTags()
        }
    },[isFocused])

    useEffect(() => {
        setIsLoading(true)
        getObras(1 , filtros)
    },[filtros])

    const getObras = async (pag = 1, filtros = {}) => {
        if(loading || loadingRefresh) return
        
        try{
            const response = await api.get(`obras`, {
                params: {
                    ...filtros,
                    temCapitulo :true
                }
            })
            if(response.data && response.data?.length > 0 || filtros.string.length > 0 || filtros.tags.length > 0){
              setObras(response.data)
              setPagina(pag)
            }else{
              setEnReached(true)
            }
        }catch(error){

        } finally{
            setIsLoading(false)
            setIsLoadingRefresh(false)
        }
    }

    const getTags = async () => {
        try{
            const response = await api.get(`tags`, {
                params: {
                    tageds: true
                }
            })
            setTags(response.data)
        }catch(error){

        } 
    }

    function refresh(){
        setIsLoadingRefresh(true)
        setPagina(1)
        setObras([])
        getObras(1) 
    }

    return(
        <>
            <FlatList
                data={obras}
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
                ListHeaderComponent={(
                    <View >
                        <InputText
                            placeholder="Pesquisar"
                            value={filtros.string}
                            onStopType={(string) => {
                                handleChange({string})
                            }}
                            containerStyle={styles.textInput}
                            height={45}
                            leftElement={<Icon source={"magnify"} size={18} color="#666"/>}
                        />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tags}>
                            {
                                tags?.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        label={tag.nome}
                                        value={tag.id}
                                        onPress={(val) => {
                                            let newTags = [...filtros.tags];
                                            if (newTags.includes(val)) {
                                                newTags = newTags.filter(tag => tag !== val);
                                            } else {
                                                newTags = [...newTags, val];
                                            }
                                            handleChange({ tags: newTags });
                                        }}
                                        isSelected={filtros.tags.includes(tag.id)}
                                    />
                                ))
                            }
                        </ScrollView> 
                    </View>
                )}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                renderItem={({item, index}) => {
                    return ( <CardObra obra={item} />) 
                }}
                ListEmptyComponent={
                    loading ? 
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color="#fff" size={30}/>
                    </View>
                    :
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <Text allowFontScaling={ false } style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
                            { filtros.string.length > 0 || filtros.tags.length > 0 ?  'Nenhum obra encontrada!' : 'Nenhum obra publicada!'  }
                        </Text>
                    </View>
                }
                keyExtractor={(item, index) => {  return `${item.numero}-${index}` }}
                onEndReached={() => {
                    if(!loadingMore && !enReached){
                        setLoadingMore(true)
                        getObras(pagina + 1)
                    }
                }}
                ListFooterComponent={() => {
                    if(!enReached) return (
                        <ActivityIndicator color={defaultColors.activeColor} size={30} style={{flex: 1, marginVertical: 15}}/>
                    )
                    return null
                }}
            />
            {
                showIrTopo ? 
                <Animated.View>
                    <Chip
                        style={{
                            position: 'absolute',
                            zIndex: 10,
                            bottom: 10,
                            right: 10,
                            backgroundColor: 'rgba(255, 255, 255, 0.3)'
                        }}
                        onPress={upButtonHandler}
                    >
                         <Icon 
                            source="arrow-up"
                            // color={defaultColors.activeColor}
                            color="#fff"
                            size={20}
                        />
                        </Chip>
                </Animated.View>
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