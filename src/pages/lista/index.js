import { useEffect, useState , useCallback, useMemo, useRef } from "react";
import {  Dimensions, StyleSheet, View, Text, Image,Button, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Animated, RefreshControl } from "react-native";
import InputText from "../../components/InputText";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import Chip from "../../components/Chip";
import CardObra from "../../components/CardObra";
import { Icon, Badge  } from "react-native-paper";
import { defaultColors, imageUrl } from "../../utils";
import CustomButton from "../../components/CustomButton";

import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { useFiltrar } from "../../routes/stacks/homeStack";
import CardObraSkeleton from "../../components/CardObraSkeleton";
import CardObraLendo from "../../components/CardObraLendo";


const { height, width }  = Dimensions.get('screen');

export default function ListaPage({ route }){
    const navigation = useNavigation()
    const lista = route?.params?.lista
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
        lista: lista.id
    })
    const previousFilters = useRef(filtros);
    const isFiltrado = Object.entries(filtros).filter(([key, val]) => key != "lista").some(([key,val]) =>  Array.isArray(val) ? val.length > 0 : !!val )

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
    const [loadingDelete, setLoadingDelete] = useState(false)
    const handleDelete = async () => {
        if(loadingDelete) return
        setLoadingDelete(true)
        try{
            await api.delete(`listas/${lista.id}`)
        }catch(error){
        } finally{
            setLoadingDelete(false)
            navigation.goBack()
        }
    }
  

    useEffect(() =>{
        setIsLoading(true)
        getObras(1,filtros) 
        navigation.setOptions({
            headerTitle: lista.nome,
            headerRight: ()  => (
                <TouchableOpacity 
                    onPress={() => {
                        handleDelete()
                    }} 
                    hitSlop={{left: 20, bottom: 20}} 
                    style={{marginRight: 20}}
                >
                    <Icon source="delete" size={24}  color={"#9E3939"}/>
                </TouchableOpacity>
            ),
        })
    },[lista])

  
    useEffect(() => {
        getObras(1 ,filtros)
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

    const imagePath = `${imageUrl}usuarios/${lista?.usuario?.id}/${lista?.usuario?.imagem}`;
    const [imageError, setImageError] = useState(false)

    useEffect(() => {
        setImageError(false)
    },[lista])

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
                    <View>
                        <View style={{padding: 15, marginTop: 40}}>
                            <Text style={{color: defaultColors.gray, fontSize :12, marginBottom :10}}>
                                Criada por:
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate('verperfil', { id : lista?.usuario?.id })
                                }}
                                style={{flexDirection: 'row', gap :10, alignItems: 'center'}}
                            >
                                {
                                    lista?.usuario?.imagem && !imageError ?
                                    <View style={styles.imageContainer}>
                                        <Image
                                            style={styles.imagem}
                                            source={{ uri : imagePath }}
                                            onError={(error) => {
                                                setImageError(true)
                                            }}
                                        />
                                    </View>
                                    :
                                    
                                    <Avatar.Text 
                                        size={30} 
                                        style={{
                                            backgroundColor: gerarCorPorString(publicacao?.usuario?.nome)
                                        }}
                                        label={ publicacao?.usuario?.nome?.split(' ')?.slice(0 , 2)?.map(t => t[0])?.join('') } 
                                    />
                                }
                                <View>
                                    <Text style={styles.nome}>
                                        { lista?.usuario?.nome }
                                    </Text>
                                    { !!lista?.usuario?.nick  && (
                                        <Text style={styles.nick}>
                                            @{ lista?.usuario?.nick }
                                        </Text>
                                        )
                                    }
                                    
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <InputText
                                placeholder="Pesquisar"
                                value={filtros.string}
                                onStopType={(string) => {
                                    handleChange({string})
                                    getObras(1 ,{...filtros, string })
                                }}
                                containerStyle={styles.textInput}
                                height={45}
                                leftElement={<Icon source={"magnify"} size={18} color="#666"/>}
                                clearEnable
                            />
                        </View>
                        {
                            loading && (
                                <>
                                    <CardObraSkeleton/>
                                    <CardObraSkeleton/>
                                    <CardObraSkeleton/>
                                </>
                            )
                        }
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
                            { isFiltrado ?  'Nenhuma obra encontrada!' : 'Nenhuma obra salva!'  }
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
        width: "100%",
        marginBottom: 0 
    },
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: 'grey',
    },
    imageContainer:{
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
    imagem:{
        width: '100%',
        height: '100%'
    },
});