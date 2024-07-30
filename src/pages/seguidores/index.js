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

const { height, width }  = Dimensions.get('screen');

export default function SeguidoresPage({ route }){
    const id = route?.params?.id 
    const seguindo = route?.params?.seguindo
    const navigation = useNavigation()
    const { usuario, handleLogout } = useAuth()
    const isFocused = useIsFocused()
    const [ seguidores , setSeguidores] = useState([])
    const [pagina, setPagina] = useState(0)
    const [limite, setLimite] = useState(20)
    const [loading, setIsLoading] = useState(false)
    const [loadingRefresh, setIsLoadingRefresh] = useState(false)
    const [ posicaoNaTela, setPosicaoNaTela ] = useState(0)
    const [ showIrTopo, setShowIrTopo] = useState(false)
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
        getSeguidores(1)
        navigation.setOptions({
            headerTitle:  seguindo ? "Seguindo" : "Seguidores"
        })
    },[])

    useEffect(() =>{
        if(seguidores.length > 0){
            getSeguidores()
            
        }
    },[isFocused])

    const getSeguidores = async () => {
        if(loading ) return
        try{
            const response = await api.get(`usuarios/${id}/${ seguindo ? "seguindo" : "seguidores" }`)
            console.log(response.data)
            setSeguidores(response.data)            
            setPagina(pag)
        }catch(error){
        } finally{
            setIsLoading(false)
        }
    }

    function refresh(){
        setPagina(1)
        setSeguidores([])
        getSeguidores(1) 
    }

    const [ isLoadingSeguindo, setIsLoadingSeguindo] = useState(false)
    const handleSeguir = async (id) => {
        setIsLoadingSeguindo(true)
        try{
            await api.post(`usuarios/${id}/seguir`)
            getSeguidores()
        }catch(error){
        } finally {
            setIsLoadingSeguindo(false)
        }
    }
    

    return(
        <>
            <FlatList
                data={seguidores}
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
                    return ( <CardSeguidor usuario={item} handleSeguir={() => handleSeguir(item.id)}/>) 
                }}
                ListEmptyComponent={
                    loading ? 
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color="#fff" size={30}/>
                    </View>
                    :
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <Text allowFontScaling={ false } style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
                            Nenhum seguidor ainda!
                        </Text>
                    </View>
                }
                keyExtractor={(item, index) => {  return `${item.numero}-${index}` }}
                ListFooterComponent={() => {
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