import { useEffect, useState , useCallback, useMemo, useRef } from "react";
import {  Dimensions, StyleSheet, View, Text, Image,Button, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Animated, RefreshControl, BackHandler } from "react-native";
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
  BottomSheetFlatList
} from '@gorhom/bottom-sheet';
import { useFiltrar } from "../../routes/stacks/homeStack";
import CardObraSkeleton from "../../components/CardObraSkeleton";
import CardObraLendo from "../../components/CardObraLendo";
import CardLista from "../../components/CardLista";


const { height, width }  = Dimensions.get('screen');

export default function LeiturasPage({ route }){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const { usuario } = useAuth()
    const [ obras , setObras] = useState([])
    const [ obrasLendo , setObrasLendo ] = useState([])
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
        formato: "",
        statusleitura: []
    })
    const previousFilters = useRef(filtros);
    const isFiltrado = Object.entries(filtros).filter(([key, val]) => key != "string").some(([key,val]) =>  Array.isArray(val) ? val.length > 0 : !!val )

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
  

    useEffect(() => {
        getStatusList()
    },[])

    const [ statusList, setStatusList] = useState([])
    const getStatusList = async () => {
        try{
            const response = await api.get(`leitura-status`)
            setStatusList(response.data)
        }catch(error){

        } 
    }

    useEffect(() => {
        setIsLoading(true)
        getObras(1 ,filtros)
        getListas(usuario.id)
    },[])

    useEffect(() => {
        getObras(pagina ,filtros)
        getObrasLendo()
        getListas(usuario.id)
    },[isFocused])

    const getObras = async (pag = 1, filtros = {}) => {
        
        const params =  {
            ...filtros,
            pagina: pag?.toString(),
            limite: limite?.toString(),
            statusleitura : (filtros.statusleitura?.length ? filtros.statusleitura : statusList.map(st => st.id)),
            temCapitulo :true,
            usuario: usuario.id 
        }
        
        try{
            const response = await api.get(`obras`, {  params })
            if(response.data?.length < limite){
                setEnReached(true)
            }
            if(pag == 1){
                setObras(response.data)
                setEnReached(false)
            }else{
                const existingIds = obras.map(obra => obra.id); 
                const newObras = response.data.filter(obra => !existingIds.includes(obra.id));
                setObras([...obras, ...newObras]);
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

    const getObrasLendo = async () => {
        try{
            const response = await api.get(`obras`, {
                params: {
                    pagina: "1",
                    limite: "1000",
                    ultimos_lidos: true,
                    statusleitura: [2],
                    temPaginas: true
                }
            })
            setObrasLendo(response.data)

        }catch(error){
        } finally{
        }
    }
    

    function refresh(){
        setIsLoadingRefresh(true)
        setObras([])
        getObras(1, filtros) 
    }

    const totais = {
        1: usuario?.obras?.total_interessadas,
        2: usuario?.obras?.total_lendo,
        3: usuario?.obras?.total_lidos,
        4: usuario?.obras?.total_dropados || 0
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: ()  =>  (
                <View style={{flexDirection: 'row' , alignItems: 'center', gap: 20, marginRight: 30}}>
                  <TouchableOpacity 
                      onPress={handlePresentModalPress} 
                      hitSlop={{left: 20, bottom: 20}} 
                  >
                      <Icon
                        source="format-list-bulleted"
                        size={24}
                      />
                  </TouchableOpacity>
                  <TouchableOpacity 
                      onPress={async () => {
                       navigation.navigate("pedidos")
                      }} 
                      hitSlop={{left: 20, bottom: 20}} 
                  >
                      <Icon
                        source="inbox"
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
                    usuario
                }
            })
            setListas(response.data)
        }catch(error){
        } finally {
        }
    }
 

    const bottomSheetModalRef = useRef(null);

    
    const [nomeLista, setNomeLista] = useState("");
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

    const [ criandoLista, setCriandoLista] = useState(false)
    const [erroNome, setErrorNome] = useState(false)
    const criarLista = async (nome) => {
        if(!nomeLista){
            setErrorNome(true)
            return
        }
        setCriandoLista(true)
        try{
            const response = await api.post(`listas`,{
                nome
            })
            getListas(response.data)
            setNomeLista("")
        }catch(error){
        } finally {
            setCriandoLista(false)
        }
    }
    const renderItemLista = useCallback(
        ({ item }) => (
          <CardLista lista={item}/>
        ),
        []
    );

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
                        {
                            obrasLendo?.length > 0 && (
                                <>
                                    <Text style={{marginBottom: 10, color: defaultColors.gray, fontSize: 12}}>
                                        Continue lendo
                                    </Text>
                                    <ScrollView horizontal style={{gap: 5, paddingLeft: 5, marginBottom: 10}} showsHorizontalScrollIndicator={false}>
                                        {
                                            obrasLendo?.map((obra,index) => (
                                                <CardObraLendo obra={obra} key={index}/>
                                            )) 
                                        }
                                    </ScrollView>
                                    
                                </>
                            )
                        }
                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
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
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusList}>
                            {
                                statusList?.map((status, index) => (
                                    <Chip
                                        key={index}
                                        value={status.id}
                                        onPress={(status) => {
                                            if(loading) return
                                            let newStatusleitura = [...filtros.statusleitura];
                                            if (newStatusleitura.includes(status)) {
                                                newStatusleitura = newStatusleitura.filter(tag => tag !== status);
                                            } else {
                                                newStatusleitura = [...newStatusleitura, status];
                                            }
                                            const novoFiltro = {...filtros, statusleitura: newStatusleitura }
                                            handleChange(novoFiltro);
                                            setIsLoading(true)
                                            getObras(1 , novoFiltro)
                                        }}
                                        isSelected={filtros.statusleitura?.includes(status?.id)}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color :filtros.statusleitura.includes(status?.id) ? '#000' : defaultColors.gray
                                            }}
                                        >
                                            {`(${totais[status.id] || 0}) ${status?.nome}`}
                                        </Text>
                                    </Chip>
                                ))
                            }
                        </ScrollView> 
                        {
                            (loading || loadingRefresh) && (
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
                            { isFiltrado ?  'Nenhuma leitura encontrada!' : 'Nenhuma leitura ainda!'  }
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
                <View style={{flexDirection: 'row',alignItems: 'center', gap: 5, paddingHorizontal: 10, marginTop: 20}}>
                    <InputText
                        height={45}
                        placeholder="Criar nova lista"
                        ref={textoListaRef}
                        value={nomeLista}
                        onChange={(nome) => {
                            setNomeLista(nome)
                            setErrorNome(false)
                        }}
                        error={erroNome}
                        style={{
                            width: width - 120,
                        }}
                        containerStyle={{
                            backgroundColor: '#191919',
                            borderWidth: 0,
                        }}
                        errorText="Insira o nome da lista"
                    />
                    <CustomButton 
                        isLoading={criandoLista}
                        onPress={() => {
                            criarLista(nomeLista)
                        }}
                        style={{
                            height: 45,
                            borderWidth:0,
                            position: 'relative',
                            marginBottom: 10
                        }}
                    >
                        <Icon source="plus" size={24}/>
                    </CustomButton>
                </View>
                <BottomSheetFlatList
                    data={listas}
                    keyExtractor={(i) => i.id}
                    renderItem={renderItemLista}
                    contentContainerStyle={styles.contentContainer}
                    style={{paddingHorizontal: 10}}
                />
            </BottomSheetModal>
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
        marginBottom: 0 
    },
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: 'grey',
    },
    statusList: {
        marginHorizontal: 15,
        gap: 5
    },
    modalContainer:{
        backgroundColor: '#121212',
        padding: 30
    },
    buttonNovaLista:{
        height: 51,
        justifyContent: 'center',
        marginTop: 50,
        borderColor: '#312E2E'
    },
});