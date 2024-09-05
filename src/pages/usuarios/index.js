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
import CardSeguidor from "../../components/CardSeguidor";
import CustomButton from "../../components/CustomButton";

const { height, width }  = Dimensions.get('screen');

export default function UsuariosPage({ route }){
    const navigation = useNavigation()
    const { usuario, handleLogout } = useAuth()
    const isFocused = useIsFocused()
    const [ usuarios , setUsuarios] = useState([])
    const [pagina, setPagina] = useState(1)
    const [limite, setLimite] = useState(20)
    const [loading, setIsLoading] = useState(false)
    const [loadingRefresh, setIsLoadingRefresh] = useState(false)
    const [ enReached , setEnReached ] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [ posicaoNaTela, setPosicaoNaTela ] = useState(0)
    const [ showIrTopo, setShowIrTopo] = useState(false)
    const [ filtros , setFiltros] = useState({
        string: '',
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
        getUsuarios(1)
    },[])

    useEffect(() =>{
        if(usuarios.length > 0){
            getUsuarios()
        }
    },[isFocused])

    useEffect(() => {
        setIsLoading(true)
        getUsuarios(1 , filtros)
    },[filtros])

    const getUsuarios = async (pag = 1, filtros = {}) => {
        if(loading ) return
        try{
            const response = await api.get(`usuarios`, {
                params: {
                    ...filtros,
                    pagina: pag?.toString(),
                    limite: limite?.toString()
                }
            })
            
            if(response.data?.length < limite){
                setEnReached(true)
            }
            if(pag == 1){
                setUsuarios([])
                setUsuarios(response.data)
                setEnReached(false)
            }else{
                const existingIds = usuarios.map(usuario => usuario.id); 
                const newObras = response.data.filter(usuario => !existingIds.includes(usuario.id));
                setUsuarios([...usuarios, ...newObras]);
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
        setPagina(1)
        setUsuarios([])
        getUsuarios(1) 
    }

    const [ isLoadingSeguindo, setIsLoadingSeguindo] = useState(false)
    const handleSeguir = async (id) => {
        setIsLoadingSeguindo(id)
        try{
            const response = await api.post(`usuarios/${id}/seguir`)
            console.log(response.data)
            getUsuarios()
        }catch(error){
        } finally {
            setIsLoadingSeguindo(false)
        }
    }
    

    return(
        <>
            <FlatList
                data={usuarios}
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
                ListHeaderComponent={(
                    <View >
                        <InputText
                            placeholder="Pesquisar leitor"
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
                renderItem={({item, index}) => {
                    return ( <CardSeguidor usuario={item} handleSeguir={() => handleSeguir(item.id)} isLoading={isLoadingSeguindo == item.id}/>) 
                }}
                ListEmptyComponent={
                    loading ? 
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color="#fff" size={30}/>
                    </View>
                    :
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <Text allowFontScaling={ false } style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
                        { filtros.string.length > 0 ?  'Nenhum usuario encontrada!' : 'Nenhum usuario ainda!'  }
                        </Text>
                    </View>
                }
                keyExtractor={(item, index) => {  return `${item.numero}-${index}` }}
                onEndReached={() => {
                    if(!loadingMore && !enReached && !loading && !loadingRefresh){
                        setLoadingMore(true)
                        getUsuarios(pagina + 1)
                    }
                }}
                ListFooterComponent={() => {
                    if(!enReached && usuarios.length > 0) return (
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
                            borderWidth: 0,
                            paddingHorizontal: 20,
                            flexDirection: 'row',
                            backgroundColor: defaultColors.primary,
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.4)',
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