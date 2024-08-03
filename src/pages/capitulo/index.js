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
import AutoHeightImage from "react-native-auto-height-image";
const { height, width }  = Dimensions.get('screen');

const CustomImage = ( { imagem, obra, capitulo }) => {
    const imagePath = `${imageUrl}obras/${obra?.id}/capitulos/${capitulo.numero}/${imagem?.src}`;
    const [imageError, setImageError] = useState(false)

    console.log(imagePath)
    return(
        <>
            {
                imagem && !imageError ?
                    <AutoHeightImage
                        width={width}
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
        </>
    )
}

export default function CapituloPage({ route }){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const [ isLoading, setIsLoading ] = useState(true)
    const [ capitulo, setCapitulo] = useState({})
    const [ capitulosRef, setCapitulosRef ] = useState(null)
    const [ posicaoNaTela, setPosicaoNaTela ] = useState(0)
    const [ showIrTopo, setShowIrTopo] = useState(false)
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

    
    const upButtonHandler = () => {
        capitulosRef?.scrollToOffset({ 
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
        if(id) getCapitulo(id)
    },[id])

    useEffect(() => {
        if(isFocused){
            if(id) getCapitulo()
        }
    },[isFocused])

    const [isLoadingCapitulo, setIsLoadingCapitulo] = useState(null)
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
    },[])



    if(isLoading) return (
        <View style={{ paddingVertical: 100, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" size={30} style={{marginTop: 100}}/>
        </View>
    )
    return(
        <>
          <FlatList
            data={capitulo.paginas} 
            ref={ref => setCapitulosRef(ref)}
            onScroll={scrollHandler}
            renderItem={({item, index}) => {
              return (
                <CustomImage 
                    imagem={item}
                    obra={obra}
                    capitulo={capitulo}
                />
              )
            }}
            ListEmptyComponent={
                <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                    <Text allowFontScaling={ false } style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
                       Nenhuma página ainda!
                    </Text>
                </View>
            }
            keyExtractor={(item, index) => {  return `${item.src}-${index}` }}
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
        height: height
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