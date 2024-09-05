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
import CardPublicacaoSkeleton from "../../components/CardPublicacaoSkeleton";


const { height, width }  = Dimensions.get('screen');


export default function MeuPerfilPage({ route }){
    const id = route?.params?.id 
    const navigation = useNavigation()
    const { usuario, handleLogout } = useAuth()
    const isFocused = useIsFocused()
    const [ publicacoes , setPublicacoes] = useState([])
    const [paginaPublicacoes, setPaginaPublicacoes] = useState(0)
    const [limite, setLimite] = useState(20)
    const [loading, setIsLoading] = useState(false)
    const [loadingRefresh, setIsLoadingRefresh] = useState(false)
    const [ enReachedPublicacoes , setEnReachedPublicacoes ] = useState(false)
    const [loadingMorePublicacoes, setLoadingMorePublicacoes] = useState(false)

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
        setIsLoadingMe(true)
        getUser()
    },[])

    useEffect(() =>{
        getUser()
    },[isFocused])

    useEffect(() => {
        setIsLoading(true)
        if(user?.id){
            getPublicacoes(1, user.id)
        }
    },[filtros])

    
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


    function refresh(){
        setIsLoadingRefresh(true)
        setPagina(1)
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
                data={publicacoes}
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
                        {
                            loading  && (
                                <>
                                    <CardPublicacaoSkeleton/>
                                    <CardPublicacaoSkeleton/>
                                    <CardPublicacaoSkeleton/>
                                </>
                            )
                        }
                    </View>
                )}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                renderItem={({item, index}) => {
                    return ( <CardPublicacao publicacao={item} />) 
                }}
                ListEmptyComponent={
                    loading ? 
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color="#fff" size={30}/>
                    </View>
                    :
                    <View style={{ paddingVertical: 140, alignItems: 'center', justifyContent: 'center' }}>
                        <Text allowFontScaling={ false } style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
                           Nenhuma publicação ainda!
                        </Text>
                    </View>
                }
                keyExtractor={(item, index) => {  return `${item.numero}-${index}` }}
                onEndReached={() => {
                    if(!loadingMorePublicacoes && !enReachedPublicacoes && !loading && !loadingRefresh){
                            setLoadingMorePublicacoes(true)
                            getPublicacoes(paginaPublicacoes + 1)
                    }
                }}
                ListFooterComponent={() => {
                    // if(!enReached && obras.length > 0) return (
                    //     <></>
                    //     <ActivityIndicator color={defaultColors.activeColor} size={30} style={{flex: 1, marginVertical: 15}}/>
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
   
});