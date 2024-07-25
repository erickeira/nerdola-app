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
import CustomButton from "../../components/CustomButton";
import CardPedido from "../../components/CardPedido";

const { height, width }  = Dimensions.get('screen');

export default function PedidosPage(){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const [ pedidos , setPedidos] = useState([])
    const [ tags , setTags] = useState([])
    const [loading, setIsLoading] = useState(false)
    const [ posicaoNaTela, setPosicaoNaTela ] = useState(0)
    const [ showIrTopo, setShowIrTopo] = useState(false)
    const [loadingRefresh, setIsLoadingRefresh] = useState(false)

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
        setIsLoading(true)
    },[])

    useEffect(() =>{
       if(isFocused){
        getPedidos()
       }
    },[isFocused])

    const getPedidos = async () => {
        // if(loading) return
        try{
            const response = await api.get(`pedido/me`)
            setPedidos(response.data)
        }catch(error){
            console.log(error)
        } finally{
            setIsLoading(false)
            setIsLoadingRefresh(false)
        }
    }

    const [ isLoadingPedido, setIsLoadingPedido] = useState(null)
    const handleDelete = async (id) => {
        setIsLoadingPedido(id)
        try{
            const response = await api.delete(`pedido/${id}`)
            getPedidos()
        }catch(error){
            
        } finally{
            setIsLoadingPedido(null)
        }
    }


    function refresh(){
        setIsLoadingRefresh(true)
        setPedidos([])
        getPedidos() 
    }

    return(
        <>
            <FlatList
                data={pedidos}
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
                        <CardPedido
                            pedido={item}
                            onEdit={() => {
                                navigation.navigate('pedido', { id : item.id } )
                            }}
                            onDelete={() => {
                              handleDelete(item.id)
                            }}
                            isLoading={isLoadingPedido == item.id}
                            // isLoading={true}
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
                            {  'Nenhum pedido realizado!'  }
                        </Text>
                    </View>
                }
                keyExtractor={(item, index) => {  return `${item.numero}-${index}` }}

            />
             <View >
                <CustomButton
                    style={{
                        position: 'absolute',
                        zIndex: 10,
                        bottom: 10,
                        right:  10,
                        borderColor: '#312E2E',
                        borderWidth: 1,
                        paddingHorizontal: 20,
                        backgroundColor: defaultColors.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                    }}
                    onPress={() => {
                        navigation.navigate('pedido')
                    }}
                >
                    Novo pedido
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
    textInput:{
        backgroundColor: '#191919',
        borderWidth: 0
    }
});