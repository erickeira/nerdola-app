import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../../utils/api";
import { defaultColors, imageUrl, proporcaoCard } from "../../utils";
import { Icon, IconButton,  Menu, Divider, PaperProvider, Checkbox  } from "react-native-paper";
import LinearGradient from 'react-native-linear-gradient';
import CardObra from "../../components/CardObra";
import CardCapitulo from "../../components/CardCapitulo";
import Chip from "../../components/Chip";
import CustomButton from "../../components/CustomButton";
import Snackbar from "react-native-snackbar";
import CardLink from "../../components/CardLink";
import Comentarios from "../../components/Comentarios";
import CardComentario from "../../components/CardComentario";
import InputText from "../../components/InputText";
const { height, width }  = Dimensions.get('screen');

export default function CapituloPage({ route }){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const [ isLoading, setIsLoading ] = useState(true)
    const [ capitulo, setCapitulo] = useState({})
    const [ capitulosRef, setCapitulosRef ] = useState(null)
    const { id, leitura, obra  } = route.params
    const{
        nome,
        numero,
        imagem,
        descricao,
        links
    } = capitulo
    const imagePath = `${imageUrl}obras/${id}/${imagem}`;
    const [imageError, setImageError] = useState(false)
    const [lido, setLido] = useState(route.params.lido)

    const getCapitulo = async () => {
        try{
            const response = await api.get(`capitulos/${id}`)
            setCapitulo({ ...capitulo, ...response.data})
            console.log(response.data)
        }catch(error){

        } finally{
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setIsLoading(true)
        getCapitulo()
        getStatusList()
    },[])

    useEffect(() => {
        if(isFocused) getCapitulo()
    },[isFocused])

    const [ statusList, setStatusList] = useState([])
    const getStatusList = async () => {
        try{
            const response = await api.get(`leitura-status`)
            setStatusList(response.data)
        }catch(error){

        } 
    }
    
    const [isLoadingCapitulo, setIsLoadingCapitulo] = useState(null)
    const handlePressCapitulo = async ( marcarLido = true) => {
        setIsLoadingCapitulo(true)
        try{
            let response = null
            if(marcarLido){
                response = await api.post(`usuarios-capitulos-lidos`, {
                    leitura: leitura.id.toString(),
                    capitulo: id.toString()
                })
            }else{
                response = await api.delete(`usuarios-capitulos-lidos/${leitura.id}/${id}`)
            }
            setLido(marcarLido)
            getCapitulo()
        }catch(error){
            console.log(error)
            setIsLoadingCapitulo(false)
        } finally{
            getCapitulo()
            setIsLoadingCapitulo(false)
        }
    }

    useEffect(() =>{
        setIsLoading(true)
        getComentarios()
    },[])

    useEffect(() => {
        if(isFocused){
            getComentarios()
        }
    },[isFocused])
    const [ comentarios , setComentarios] = useState([])

    const getComentarios = async (pag = 1) => {
        try{
            const response = await api.get(`comentarios`, {
                params: {
                    capitulo: id
                }
            })

            setComentarios([])
            setComentarios([...response.data])
            setEnReached(false)

        }catch(error){
            console.log(error)
        } finally{
            setIsLoading(false)
        }
    }

    const [comentario, setComentario] = useState("")
    const [isLoadingComentando, setIsLoadingComentando] = useState(false)
    
    const handleComentar = async () => {
        setIsLoadingComentando(true)
        try{
            await api.post(`comentarios`,{
                capitulo: id,
                comentario: comentario
            })
            getComentarios()
            getCapitulo()
            setComentario("")
            setTimeout(() => {
                downButtonHandler()
            }, 1000);
           
        }catch(error){
            console.log(error)
        } finally{
            setIsLoadingComentando(false)
        }
    }

    const handleExcluir = async (id) => {
        try{
            await api.delete(`comentarios/${id}`)
            getComentarios()
        }catch(error){
            console.log(error)
        } finally{
            setIsLoadingComentando(false)
        }
    }

    
    const downButtonHandler = () => {
        capitulosRef?.scrollToEnd({ 
          animated: true 
        });
    };


    if(isLoading) return (
        <View style={{ paddingVertical: 100, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" size={30} style={{marginTop: 100}}/>
        </View>
    )
    return(
        <>
          <FlatList
            extraData={leitura}
            data={comentarios} 
            ref={ref => setCapitulosRef(ref)}
            ListHeaderComponent={(
              <View>
                <View style={styles.viewCard}>
                    <View style={styles.imageContainerCard}>
                        {
                            !imageError ?
                            <Image
                                style={styles.imagem}
                                source={{ uri : imagePath }}
                                onError={(error) => {
                                    setImageError(true)
                                }}
                            />
                            :
                            <Icon 
                                source="image-off-outline" 
                                color="#312E2E" 
                                size={30}
                            />
                        }
                    </View>
                    <TouchableOpacity 
                        style={{ width: '100%'}}
                        onPress={() => {
                            navigation.navigate('obra', { id : obra.id})
                        }}
                    >
                        <View >
                            <Text style={styles.obraNome}>
                                {obra?.nome}
                            </Text>
                        </View>
                        <View style={{ width: '100%'}}>
                            <Text style={styles.nome}>
                                {nome}
                            </Text>
                        </View>
                        <View style={{ width: '100%'}}>
                            <Text style={styles.numero}>
                                Numero: {numero}
                            </Text>
                        </View>
                    </TouchableOpacity>
                   
                </View>
                <Text style={styles.descricao}>
                    {descricao}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10}}>
                        <Chip
                            onPress={() => {
                                navigation.navigate('publicar', {
                                    obra,
                                    capitulo,
                                })
                            }}
                            style={{ paddingVertical: 3, height: 40}} 
                        >
                            <Text>
                                Publicar no feed
                            </Text>
                        </Chip>
                        {
                            [2].includes(leitura?.status?.id) &&  
                            <Chip style={{ width: 200, paddingVertical: 3, height: 40}} onPress={() => handlePressCapitulo(!lido)}>
                                {
                                    isLoadingCapitulo ?
                                    <ActivityIndicator/>
                                    :
                                    <Text style={{color: defaultColors.activeColor, fontSize: 12}}>
                                        { lido ? "Desmarcar como lido " : "Marcar como lido" } 
                                    </Text>
                                }
                                
                                {
                                    !isLoadingCapitulo && (
                                        <Checkbox 
                                            status={ lido ? 'checked' : 'unchecked' } 
                                            color={defaultColors.activeColor}
                                            onPress={() => handlePressCapitulo(!lido)}
                                        />
                                    )
                                }
                            </Chip>
                        }
                    </View>
                
               
                <Text style={styles.capitulos}>
                { capitulo?.total_comentarios } comentarios
                </Text>
              </View>
            )}
            renderItem={({item, index}) => {
              return (
                <CardComentario 
                    comentario={item}
                    handleExcluir={() => handleExcluir(item.id)}
                />
              )
            }}
            ListEmptyComponent={
                <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                    <Text allowFontScaling={ false } style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
                       Nenhum comentário ainda
                    </Text>
                </View>
            }
            keyExtractor={(item, index) => {  return `${item.id}-${index}` }}
          />
          <View style={styles.containerComment}>
                <InputText
                    placeholder="Faça um comentário"
                    containerStyle={styles.input}
                    mb={0}
                    maxWidth={width - 130}
                    value={comentario}
                    onChange={(comentario) => {
                        setComentario(comentario)
                    }}
                />
                <CustomButton 
                    style={styles.button}
                    onPress={handleComentar}
                    isLoading={isLoadingComentando}
                    disabled={isLoadingComentando || comentario.length < 1}
                >
                    Publicar
                </CustomButton>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    view: {
        height: height
    },
    imageContainer:{
        width: width,
        height: (width) * (4.3 / 3),
        overflow: 'hidden',
        alignItems: 'center',
        position: 'absolute'
    },
    imagem:{
        width: '100%',
        height: '100%',
    },
    statusList:{
        paddingHorizontal: 15,
        flexDirection: 'row',
    },
    descricao:{
        fontSize: 13,
        flexWrap: 'wrap',
        color: '#fff',
        width: "100%",
        paddingHorizontal: 15,
        marginBottom: 30
    },
    gradiente:{
        width: width,
        height: (width) * (4.3 / 3),
    },
    details:{
        paddingTop: 120
    },
    capitulos:{
        paddingHorizontal: 15,
        marginBottom: 10,
        color: '#666'
    },
    buttonInformar:{
        height: 51,
        justifyContent: 'center',
        marginBottom: 100,
        borderColor: '#312E2E',
        borderRadius: 5,
        marginHorizontal: 10
    },
    viewCard:{
        marginTop: 40,
        padding: 10,
        width: width - 30, 
        overflow: 'scroll',
        flexDirection: 'row',
        gap: 10
    },
    imageContainerCard:{
        width: width * 0.18,
        height: width * 0.18,
        borderColor: '#312E2E',
        borderWidth: 1,
        marginBottom: 5,
        borderRadius: 5,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    obraNome:{
        fontSize: 15,
        flexWrap: 'wrap',
        color: defaultColors.gray,
        width: "70%",
    },
    nome:{
        fontSize: 18,
        flexWrap: 'wrap',
        color: '#fff',
        width: "70%",
        marginBottom: 5
    },
    numero:{
        fontSize: 12,
        flexWrap: 'wrap',
        color: defaultColors.gray,
        width: "70%",
    },
    buttons:{
        paddingHorizontal: 20,
        marginBottom: 10
    },
    containerComment:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        borderWidth: 0,
    },
    button:{
        width: 100,
        height: 40,
        justifyContent: 'center',
        backgroundColor: defaultColors.activeColor,
        marginRight: 20
    }
});