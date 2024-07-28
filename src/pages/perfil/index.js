import { useEffect, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Animated, RefreshControl } from "react-native";
import InputText from "../../components/InputText";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import Chip from "../../components/Chip";
import CardObra from "../../components/CardObra";
import { Avatar, Icon } from "react-native-paper";
import { defaultColors, imageUrl } from "../../utils";

const { height, width }  = Dimensions.get('screen');

export default function PerfilPage({ route }){
    const id = route?.params?.id 
    const navigation = useNavigation()
    const { usuario, handleLogout } = useAuth()
    const isFocused = useIsFocused()
    const [ obras , setObras] = useState([])
    const [pagina, setPagina] = useState(0)
    const [limite, setLimite] = useState(20)
    const [loading, setIsLoading] = useState(false)
    const [loadingRefresh, setIsLoadingRefresh] = useState(false)
    const [ enReached , setEnReached ] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [ posicaoNaTela, setPosicaoNaTela ] = useState(0)
    const [ showIrTopo, setShowIrTopo] = useState(false)
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
        getObras(1)
        getStatusList()
        getUser()
    },[])

    useEffect(() =>{
        if(obras.length > 0){
            getStatusList()
            getObras()
            
        }
        getUser()
    },[isFocused])

    useEffect(() => {
        setIsLoading(true)
        getObras(1 , filtros)
    },[filtros])

    const getObras = async (pag = 1, filtros = {}) => {
        if(loading || loadingRefresh) return
        const params =  {
            ...filtros,
            pagina: pag?.toString(),
            limite: limite?.toString(),
            statusleitura : (filtros.statusleitura?.length ? filtros.statusleitura : statusList.map(st => st.id)),
            temCapitulo :true,
        }
        if(id) params.usuario = id
        else params.minhas = true

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
        setIsLoadingMe(true)
        try{
            const response = await api.get(`usuarios/${id || 'me'}`)
            setUser(response.data)
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
                    <View style={{width: '100%'}}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',   gap: 20, padding: 10}}> 
                            <View>
                                <Text style={styles.me_nome}>
                                    { user?.nome }
                                </Text>
                                <Text style={styles.email}>
                                    { user?.email }
                                </Text>
                                <View style={{flexDirection: 'row' , gap: 10}}>
                                    <Text style={styles.total_seg}>
                                        { user?.total_seguidores || 0 } seguidores
                                    </Text>
                                    <Text style={styles.total_seg}>
                                        { user?.total_seguindo || 0 } seguindo
                                    </Text>
                                </View>
                               
                                   
                            </View>
                            {
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
                                    color="#000"
                                    label={ user?.nome?.split(' ')?.slice(0 , 2)?.map(t => t[0])?.join('') } 
                                />
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
                                isSelected={false}
                            />
                        }

                        
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusList}>
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
                            {  filtros.string.length > 0 || filtros.statusleitura.length > 0 ?  'Nenhum leitura ainda!' : 'Nenhum leitura ainda!'  }
                        </Text>
                    </View>
                }
                keyExtractor={(item, index) => {  return `${item.numero}-${index}` }}
                onEndReached={() => {
                    if(!loadingMore && !enReached && !loading && !loadingRefresh){
                        setLoadingMore(true)
                        getObras(pagina + 1)
                    }
                }}
                ListFooterComponent={() => {
                    if(!enReached && obras.length > 0) return (
                        <></>
                        // <ActivityIndicator color={defaultColors.activeColor} size={30} style={{flex: 1, marginVertical: 15}}/>
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
    me_nome:{
        color: "#fff",
        fontSize: 16,
        marginBottom: 5
    },
    email: {
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
        gap: 10
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
});