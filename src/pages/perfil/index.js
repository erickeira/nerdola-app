import { useEffect, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Animated, RefreshControl } from "react-native";
import InputText from "../../components/InputText";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import Chip from "../../components/Chip";
import CardObra from "../../components/CardObra";
import { Avatar, Icon } from "react-native-paper";
import { defaultColors } from "../../utils";

const { height, width }  = Dimensions.get('screen');

export default function PerfilPage(){
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
        statusleitura: [1,2,3]
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
        getMe()
    },[])

    useEffect(() =>{
        if(obras.length > 0){
            getStatusList()
            getObras()
            
        }
        getMe()
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
                    pagina: pag?.toString(),
                    limite: limite?.toString(),
                    statusleitura : (filtros.statusleitura?.length ? filtros.statusleitura : statusList.map(st => st.id)),
                    temCapitulo :true
                }
            })
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
    },[])

    const [ me, setMe] = useState(null)
    const [ isLoadingMe, setIsLoadingMe] = useState(false)
    const getMe = async () => {
        setIsLoadingMe(true)
        try{
            const response = await api.get('usuarios/me')
            setMe(response.data)
        }catch(error){
        } finally {
            setIsLoadingMe(false)
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
                    <View >
                        <View style={{ flexDirection: 'row', alignItems: 'center',  marginBottom: 40, gap: 20}}> 
                            <Avatar.Text size={60} label={ me?.nome?.split(' ')?.slice(0 , 2)?.map(t => t[0])?.join('') } />
                            <View>
                                <Text style={styles.me_nome}>
                                    { me?.nome }
                                </Text>
                                <Text style={styles.email}>
                                    { me?.email }
                                </Text>
                            </View>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusList}>
                            {
                                statusList?.map((status, index) => (
                                    <Chip
                                        key={index}
                                        label={status.nome}
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
                            {  filtros.string.length > 0 || filtros.statusleitura.length > 0 ?  'Nenhum obra encontrada!' : 'Nenhum obra publicada!'  }
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
    me_nome:{
        color: "#fff",
        fontSize: 16,
        marginBottom: 5
    },
    email: {
       
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
    }
});