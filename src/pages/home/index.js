import { useEffect, useState , useCallback, useMemo, useRef } from "react";
import {  Dimensions, StyleSheet, View, Text, Image,Button, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Animated, RefreshControl } from "react-native";
import InputText from "../../components/InputText";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import Chip from "../../components/Chip";
import CardObra from "../../components/CardObra";
import { Icon, Badge  } from "react-native-paper";
import { defaultColors } from "../../utils";
import CustomButton from "../../components/CustomButton";

import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { useFiltrar } from "../../routes/stacks/homeStack";


const { height, width }  = Dimensions.get('screen');

export default function HomePage({ route }){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const [ obras , setObras] = useState([])
    const [pagina, setPagina] = useState(1)
    const [limite, setLimite] = useState(20)
    const [loading, setIsLoading] = useState(false)
    const [loadingRefresh, setIsLoadingRefresh] = useState(false)
    const [ enReached , setEnReached ] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [ posicaoNaTela, setPosicaoNaTela ] = useState(0)
    const [ showIrTopo, setShowIrTopo] = useState(false)
    const [ filtros, setFiltros ] = useState({
        tags:[],
        site: "",
        string: '',
        ...route?.params?.filtros
    })
    const isFiltrado = Object.entries(filtros).filter(([key, val]) => key != "string").some(([key,val]) => !!val && val.length > 0)

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
        
    },[])

    useEffect(() => {
        navigation.setOptions({
            headerRight:  () =>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Chip 
                        onPress={() => {
                            navigation.push('filtrar', { filtros })
                        }}
                        style={{
                            height: 60,
                            borderWidth:0,
                            position: 'relative'
                        }}
                    >
                        {
                            isFiltrado && 
                            <View 
                                style={{ 
                                    position: 'absolute', 
                                    top: 8, 
                                    right: 18,
                                    zIndex: 2, 
                                    width: 10, 
                                    height: 10, 
                                    backgroundColor: 'red',
                                    borderRadius: 10
                                }} 
                                size={14} 
                            />
                        }
                        
                        <Icon source="filter" size={24}/>
                    </Chip>
                </View>
           
        })
    },[isFiltrado])

    useEffect(() =>{
        setIsLoading(true)
        getObras(1 ,filtros)
    },[filtros])

    useEffect(() => {
        console.log({...filtros,  ...route?.params?.filtros})
        setFiltros({...filtros,  ...route?.params?.filtros})
     },[isFocused])


    const getObras = async (pag = 1, filtros = {}) => {
        if(loading || loadingRefresh || loadingMore) return
        
        try{
            const response = await api.get(`obras`, {
                params: {
                    ...filtros,
                    pagina: pag?.toString(),
                    limite: limite?.toString(),
                    temCapitulo :true
                }
            })
            console.log(response.data?.length)
            if(response.data?.length < limite){
                setEnReached(true)
            }
            if(pag == 1){
                setObras([])
                setObras(response.data)
                setEnReached(false)
            }else{
                const existingIds = obras.map(obra => obra.id); 
                const newObras = response.data.filter(obra => !existingIds.includes(obra.id));
                setObras([...obras, ...newObras]);
            }
            setPagina(pag)
        }catch(error){
        } finally{
            setIsLoading(false)
            setLoadingMore(false)
            setIsLoadingRefresh(false)
        }
    }
    

    function refresh(){
        setIsLoadingRefresh(true)
        setObras([])
        getObras(1, filtros) 
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
                    </View>
                )}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                renderItem={({item, index}) => {
                    return ( <CardObra obra={item} showtags={false}/>) 
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
                    if(!loadingMore && !enReached && !loading && !loadingRefresh){
                        setLoadingMore(true)
                        getObras(pagina + 1, filtros)
                    }
                }}
                ListFooterComponent={() => {
                    if(!enReached && obras.length > 0) return (
                        <ActivityIndicator color={defaultColors.activeColor} size={30} style={{flex: 1, marginVertical: 15}}/>
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
        borderWidth: 0,
    },
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: 'grey',
    },
});