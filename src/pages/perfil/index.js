import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Animated, RefreshControl, BackHandler } from "react-native";
import InputText from "../../components/InputText";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import Chip from "../../components/Chip";
import CardObra from "../../components/CardObra";
import { Avatar, Icon } from "react-native-paper";
import { defaultColors, gerarCorPorString, imageUrl } from "../../utils";
import CustomButton from "../../components/CustomButton";
import CardPublicacao from "../../components/CardPublicacao";
import CardObraSkeleton from "../../components/CardObraSkeleton";
import CardLista from "../../components/CardLista";
import Skeleton from "../../components/Skeleton";
import { BottomSheetModal } from "@gorhom/bottom-sheet";


const { height, width }  = Dimensions.get('screen');


export default function PerfilPage({ route }){
    const id = route?.params?.id 
    const navigation = useNavigation()
    const { usuario, handleLogout } = useAuth()
    const isFocused = useIsFocused()
    const [ obras , setObras] = useState([])
    const [ publicacoes , setPublicacoes] = useState([])
    const [pagina, setPagina] = useState(0)
    const [paginaPublicacoes, setPaginaPublicacoes] = useState(0)
    const [limite, setLimite] = useState(20)
    const [loading, setIsLoading] = useState(false)
    const [loadingRefresh, setIsLoadingRefresh] = useState(false)
    const [ enReached , setEnReached ] = useState(false)
    const [ enReachedPublicacoes , setEnReachedPublicacoes ] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [loadingMorePublicacoes, setLoadingMorePublicacoes] = useState(false)

    const [ posicaoNaTela, setPosicaoNaTela ] = useState(0)
    const [ showIrTopo, setShowIrTopo] = useState(false)
    const [ listMode, setListMode ] = useState("obras")
    const [ filtros , setFiltros] = useState({
        string: '',
        statusleitura: []
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
        setIsLoadingMe(true)
        getStatusList()
        getUser()
    },[])

    useEffect(() =>{
        if(obras.length > 0){
            getStatusList()
           if(!loading && user.id) getObras()
        }
        getUser()
    },[isFocused])

    useEffect(() => {
        setIsLoading(true)
        if(user?.id){
            getObras(1 , filtros, )
            getPublicacoes(1, user.id)
        }
    },[filtros])

    const getObras = async (pag = 1, filtros = {}, id = id || user.id) => {
        if(loading || loadingRefresh) return
        const params =  {
            ...filtros,
            pagina: pag?.toString(),
            limite: limite?.toString(),
            statusleitura : (filtros.statusleitura?.length ? filtros.statusleitura : statusList.map(st => st.id)),
            temCapitulo :true,
            usuario: id 
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
        } finally{
            setIsLoading(false)
            setLoadingMore(false)
            setIsLoadingRefresh(false)
        }
    }

    const getPublicacoes = async (pag = 1, id = user.id) => {
        if(loading || loadingRefresh) return
        const params =  {
            usuario: id?.toString(),
            limite: limite?.toString()
        }
        try{
            const response = await api.get(`publicacoes`, {  params })
            if(response.data?.length < limite){
                setEnReachedPublicacoes(true)
            }
            if(pag == 1){
                setPublicacoes(response.data)
                setEnReachedPublicacoes(false)
            }else{
                const existingIds = publicacoes.map(publicacao => publicacao.id); 
                const newPublicacoes = response.data.filter(publicacao => !existingIds.includes(publicacao.id));
                setPublicacoes([...publicacoes, ...newPublicacoes]);
            }
            
            setPaginaPublicacoes(pag)
        }catch(error){
        } finally{
            setIsLoading(false)
            setLoadingMorePublicacoes(false)
            setIsLoadingRefresh(false)
        }
    }

    const [ statusList, setStatusList] = useState([])
    const getStatusList = async () => {
        try{
            const response = await api.get(`leitura-status`)
            setStatusList(response.data)
        }catch(error){

        } 
    }

    function refresh(){
        setIsLoadingRefresh(true)
        setPagina(1)
        setObras([])
        getObras(1) 
        setPaginaPublicacoes(1)
        setPublicacoes([])
        getPublicacoes(1)
        setListas([])
        getListas()
    }
    
    useEffect(() => {
        if(!id){
            navigation.setOptions({
                headerRight : () => (
                    <TouchableOpacity 
                        style={{
                            marginRight: 25,
                            
                        }}
                        onPress={handleLogout}
                    >
                        <Text style={{color: '#EC4A55'}}>
                            Sair
                        </Text>
                    </TouchableOpacity>
                )
            })
        }
       
    },[])

    const [ user, setUser] = useState(null)
    const [ isLoadingMe, setIsLoadingMe] = useState(false)
    const getUser = async () => {
        try{
            const response = await api.get(`usuarios/${id || 'me'}`)
            setUser(response.data)
            getPublicacoes(1, response.data.id)
            getObras(1,filtros, id || response.data.id)
            getListas()
            setImageError(false)
        }catch(error){
        } finally {
            setIsLoadingMe(false)
        }
    }

    const totais = {
        1: user?.obras?.total_interessadas,
        2: user?.obras?.total_lendo,
        3: user?.obras?.total_lidos
    }

    const imagePath = `${imageUrl}usuarios/${user?.id}/${user?.imagem}`;
    const [imageError, setImageError] = useState(false)

    const [ isLoadingSeguindo, setIsLoadingSeguindo] = useState(false)
    const handleSeguir = async () => {
        setIsLoadingSeguindo(true)
        try{
            await api.post(`usuarios/${user?.id}/seguir`)
            getUser()
        }catch(error){
        } finally {
            setIsLoadingSeguindo(false)
        }
    }

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

    // ref
    const bottomSheetModalRef = useRef(null);

    
    const [nomeLista, setNomeLista] = useState("");
    const textoListaRef = useRef();
    const snapPoints = useMemo(() => ['50%', '55%'], []);


    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index) => {
        if(index> 0){
            textoListaRef.current.focus()
        }
        // console.log('handleSheetChanges', index);
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
            handleBackPress()
        }catch(error){
        } finally {
            setCriandoLista(false)
        }
    }

    return(
        <>
            <FlatList
                data={{
                   obras, 
                   publicacoes,
                   listas
                }[listMode]}
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
                    <View style={{width: '100%'}}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',   gap: 20, padding: 10}}> 
                            <View>
                                {
                                    isLoadingMe  ? <Skeleton style={{ width: 200 , height: 16}}/> :
                                    <Text style={styles.me_nome}>
                                        { user?.nome }
                                    </Text>
                                }
                                {
                                    isLoadingMe ? <Skeleton style={{ width: 80 , height: 18}}/> :
                                    (
                                        !!user?.nick &&
                                        <Text style={styles.nick}>
                                            @{ user?.nick }
                                        </Text>
                                    )
                                }
                                <View style={{flexDirection: 'row' , gap: 10}}>
                                {
                                    isLoadingMe ? <Skeleton style={{ width: 70 , height: 15}}/> :
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.navigate('seguidores', { id: id || usuario.id })
                                        }}
                                    >
                                        <Text style={styles.total_seg}>
                                            { user?.total_seguidores || 0 } seguidores
                                        </Text>
                                    </TouchableOpacity>
                                }
                                 {
                                    isLoadingMe ? <Skeleton style={{ width: 70 , height: 15}}/> :
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.navigate('seguidores', { id: id || usuario.id, seguindo: true })
                                        }}
                                    >
                                        <Text style={styles.total_seg}>
                                            { user?.total_seguindo || 0 } seguindo
                                        </Text>
                                    </TouchableOpacity>
                                }
                                </View>
                               
                                   
                            </View>
                            {
                                 isLoadingMe ? <Skeleton style={{ width: 60 , height: 60, borderRadius: 200 }}/>:
                                 (
                                    user?.imagem && !imageError ?
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
                                        size={60} 
                                        style={{
                                            backgroundColor: user?.nome ? gerarCorPorString(user?.nome) : defaultColors.activeColor
                                        }}
                                        label={ user?.nome?.split(' ')?.slice(0 , 2)?.map(t => t[0])?.join('') } 
                                    />
                                 )
                                
                            }
                            
                        </View>
                        {
                            user?.id && usuario.id != user?.id ? 
                            <Chip
                                style={{
                                    backgroundColor: user.seguindo ? defaultColors.primary : '#fff',
                                    width: '50%',
                                    paddingVertical: 8,
                                    marginBottom: 40,
                                }}
                                onPress={handleSeguir}
                                isSelected={false}
                                isLoading={isLoadingSeguindo}
                            >
                                <Text 
                                    style={{
                                       color: !user.seguindo ? defaultColors.primary : '#fff',
                                    }} 
                                >
                                    { user.seguindo ? 'Deixar de seguir' : 'Seguir' }
                                </Text>
                            </Chip>
                            :
                            (
                                isLoadingMe ? <Skeleton style={{ width: 170 , height: 30}}/>:
                                <Chip
                                    label={"Editar perfil"}
                                    style={{
                                        width: '50%',
                                        paddingVertical: 8,
                                        marginBottom: 40,
                                    }}
                                    onPress={() => {
                                        navigation.navigate('editar-perfil')
                                    }}
                                    isLoading={isLoadingMe}
                                    isSelected={false}
                                />
                            )
                           
                        }

                        <View style={styles.containerTab}>
                            <Chip
                                label="Minhas obras"
                                style={[styles.tab,{
                                    borderColor: listMode == 'obras' ? "#fff" : "#666"
                                }]}
                                onPress={() => {
                                    setListMode('obras')
                                }}
                            >
                                <Text 
                                    style={{ color: listMode == 'obras' ? '#fff' : defaultColors.gray}}
                                >
                                  Leituras
                                </Text>
                            </Chip>
                            <Chip
                                label="Publicações"
                                style={[styles.tab,{
                                    borderColor: listMode == 'publicacoes' ? "#fff" : "#666"
                                }]}
                                onPress={() => {
                                    setListMode('publicacoes')
                                }}
                            >
                                <Text 
                                    style={{ color: listMode == 'publicacoes' ? '#fff' : defaultColors.gray}}
                                >Publicações</Text>
                            </Chip>
                            <Chip
                                label="Listas"
                                style={[styles.tab,{
                                    borderColor: listMode == 'listas' ? "#fff" : "#666"
                                }]}
                                onPress={() => {
                                    setListMode('listas')
                                }}
                            >
                                <Text 
                                    style={{ color: listMode == 'listas' ? '#fff' : defaultColors.gray}}
                                >Listas</Text>
                            </Chip>
                        </View>
                        {
                            listMode == "obras" && 
                            <View style={styles.statusList}>
                                {
                                    statusList?.map((status, index) => (
                                        <Chip
                                            key={index}
                                            value={status.id}
                                            onPress={(status) => {
                                                let newStatusleitura = [...filtros.statusleitura];
                                                if (newStatusleitura.includes(status)) {
                                                    newStatusleitura = newStatusleitura.filter(tag => tag !== status);
                                                } else {
                                                    newStatusleitura = [...newStatusleitura, status];
                                                }
                                                handleChange({ statusleitura: newStatusleitura });
                                            }}
                                            isSelected={filtros.statusleitura.includes(status.id)}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    color :filtros.statusleitura.includes(status.id) ? '#000' : defaultColors.gray
                                                }}
                                            >
                                                {`(${totais[status.id] || 0}) ${status.nome}`}
                                            </Text>
                                        </Chip>
                                    ))
                                }
                            </View> 
                        }
                        {
                            loading && listMode == "obras" && (
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
                    delete item.total_usuarios_lendo
                    if(listMode == "obras") return ( <CardObra obra={item} />)
                    else if(listMode == "listas") return ( <CardLista lista={item} />) 
                    else return ( <CardPublicacao publicacao={item} />) 
                }}
                ListEmptyComponent={
                    loading ? 
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color="#fff" size={30}/>
                    </View>
                    :
                    <View style={{ paddingVertical: 140, alignItems: 'center', justifyContent: 'center' }}>
                        <Text allowFontScaling={ false } style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
                            {  
                                ({
                                    "obras" :  'Nenhum leitura ainda!',
                                    "publicacoes" : 'Nenhum publicação ainda!',
                                    "listas" : "Crie uma lista para categorizar suas leituras!"
                                }[listMode]) 
                             }
                        </Text>
                    </View>
                }
                keyExtractor={(item, index) => {  return `${item.numero}-${index}` }}
                onEndReached={() => {
                    if(!loadingMore && !enReached && !loading && !loadingRefresh){
                        if(listMode == "obras"){
                            setLoadingMorePublicacoes(true)
                            getPublicacoes(paginaPublicacoes + 1)
                        }else if(listMode == "publicacoes"){
                            setLoadingMore(true)
                            getObras(pagina + 1, filtros)
                        }
                    }
                }}
                ListFooterComponent={() => {
                    // if(!enReached && obras.length > 0) return (
                    //     <></>
                    //     <ActivityIndicator color={defaultColors.activeColor} size={30} style={{flex: 1, marginVertical: 15}}/>
                    // )
                    
                    return (
                        <>
                          {
                                listMode == "listas" &&
                                <CustomButton
                                    onPress={() =>{
                                        handlePresentModalPress()
                                    }}
                                    style={styles.buttonNovaLista}
                                    mode="outlined"
                                >
                                    Nova lista
                                </CustomButton>
                            }
                        </>
                    )
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
                <View style={{ padding: 20 }}>
                    <InputText
                        height={60}
                        placeholder="Nome da lista"
                        containerStyle={{ marginBottom: 50}}
                        ref={textoListaRef}
                        value={nomeLista}
                        onChange={(nome) => {
                            setNomeLista(nome)
                            setErrorNome(false)
                        }}
                        error={erroNome}
                        errorText="Insira o nome da lista"
                    />
                    <CustomButton 
                        isLoading={criandoLista}
                        onPress={() => {
                            criarLista(nomeLista)
                        }}
                        style={styles.buttonNovaLista}
                        
                    >
                        Criar lista
                    </CustomButton>
                </View>
                
            </BottomSheetModal>
        </>
    )
}
const styles = StyleSheet.create({
    view: {
      padding: 10,
      height : height - 60
    },
    me_nome:{
        color: "#fff",
        fontSize: 16,
        marginBottom: 5
    },
    nick: {
       color: defaultColors.gray,
       marginBottom: 8
    },
    total_seg:{
        color: defaultColors.gray,
        fontSize: 12
    },
    statusList: {
        display: 'flex',
        flexDirection: 'row',
        gap: 5
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
    numeros:{
        flexDirection: 'row',
        gap: 8
    },
    imageContainer:{
        width: 60,
        height: 60,
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
    containerTab:{
        flexDirection: 'row',
        width: '100%'
    },
    tab: {
        flex: 1,
        borderWidth: 0 ,
        borderBottomWidth: 1,
        marginHorizontal: 0,
        paddingHorizontal: 0,
        marginRight: 0 
    },
    modalContainer:{
        backgroundColor: '#191919',
        padding: 30
    },
    buttonNovaLista:{
        height: 51,
        justifyContent: 'center',
        marginTop: 50,
        borderColor: '#312E2E'
    },
});