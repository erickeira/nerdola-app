import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../../utils/api";
import { botUrl, imageUrl } from "../../utils";
import { Icon, IconButton,  Menu, Divider, PaperProvider  } from "react-native-paper";
import LinearGradient from 'react-native-linear-gradient';
import CardObra from "../../components/CardObra";
import CardCapitulo from "../../components/CardCapitulo";
import Chip from "../../components/Chip";
import CustomButton from "../../components/CustomButton";
import Snackbar from "react-native-snackbar";
import axios from "axios";
import CardLink from "../../components/CardLink";
const { height, width }  = Dimensions.get('screen');

export default function ObraPage({ route }){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const [ isLoading, setIsLoading ] = useState(true)
    const [ obra, setObra] = useState({})
    const [ capitulosRef, setCapitulosRef ] = useState(null)
    const { id } = route.params
    const{
        nome,
        imagem,
        descricao,
        leitura,
        links
    } = obra
    const imagePath = `${imageUrl}obras/${id}/${imagem}`;
    const [imageError, setImageError] = useState(false)
    const [ondeLer, setOndeLer] = useState(false)
   
    const getObra = async () => {
        try{
            const response = await api.get(`obras/${id}`)
            setObra({ ...obra, ...response.data})
           
        }catch(error){

        } finally{
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setIsLoading(true)
        getObra()
        getStatusList()
    },[])

    useEffect(() => {
        if(isFocused) getObra()
    },[isFocused])

    const [ statusList, setStatusList] = useState([])
    const getStatusList = async () => {
        try{
            const response = await api.get(`leitura-status`)
            setStatusList(response.data)
        }catch(error){

        } 
    }

    const [isLoadingLeitura, setIsLoadingLeitura] = useState(false)

    const handleRemoveLeitura = async () => {
        if(isLoadingLeitura) return
        setIsLoadingLeitura(true)
        try{
            const response = await api.delete(`usuario-leitura/${leitura.id}`, {
                obra : id,
                status: 1
            })
            getObra()
        }catch(error){
        } finally{
            setIsLoadingLeitura(false)
        }
    }
    
    const handleAddLeitura = async (status) => {
        if(isLoadingLeitura) return
        setIsLoadingLeitura(true)
        try{
            const response = await api.post(`usuario-leitura`, {
                obra : id,
                status
            })
            getObra()
        }catch(error){
        } finally{
            setIsLoadingLeitura(false)
        }
    }

   
    const handleUpdateLeitura = async (status) => {
        if(isLoadingLeitura) return
        setIsLoadingLeitura(true)
        try{
            const response = await api.patch(`usuario-leitura/${leitura.id}`, {
                status
            })
            getObra()
        }catch(error){
        } finally{
            setIsLoadingLeitura(false)
        }
    }

    const [isLoadingCapitulo, setIsLoadingCapitulo] = useState(null)
    const handlePressCapitulo = async (capitulo, marcarLido = true) => {
        setIsLoadingCapitulo(capitulo)
        try{
            let response = null
            if(marcarLido){
                response = await api.post(`usuarios-capitulos-lidos`, {
                    leitura: leitura.id,
                    capitulo
                })
                console.log(obra.total_capitulos == (obra.total_lidos + 1))
                if(obra.total_capitulos == (obra.total_lidos + 1) && leitura?.status.id != 3){
                    await api.patch(`usuario-leitura/${leitura.id}`, {
                        status : 3
                    })
                }
            }else{
                response = await api.delete(`usuarios-capitulos-lidos/${leitura.id}/${capitulo}`)
            }
           
        }catch(error){
        } finally{
            getObra()
            setIsLoadingCapitulo(null)
        }
    }    

    const [isLoadingInformar, setIsLoadingInformar] = useState(false)
    const [informado, setInformado] = useState(false)
    const handleInformar = async () => {
        setIsLoadingInformar(true)
        try{
            const response = await axios.post(botUrl,{
                content: "Obra desatualizada, por favor inserir novo capitulo!\n_ _",
                embeds: [
                  {
                    "title": nome,
                    "description": `Último capitulo:  ${ obra?.capitulos ? obra?.capitulos[ obra?.capitulos.length - 1]?.numero : ''}`,
                    "url": `https://admin.nerdola.com.br/capitulos/${id}`,
                    "color": 5814783,
                    "thumbnail": {
                      "url": imagePath
                    }
                  }
                ],
                attachments: []
            })
            setIsLoadingInformar(false)
            Snackbar.show({
                text: "Obrigado por nos informar",
                duration: 2000,
                action: {
                    text: 'OK',
                    textColor: 'green',
                    onPress: () => { /* Do something. */ },
                },
            });
            setInformado(true)
        }catch(err){

        }
    }

    const [ordem, setOrdem] = useState("ascending")

    if(isLoading) return (
        <View style={{ paddingVertical: 100, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" size={30} style={{marginTop: 100}}/>
        </View>
    )
    return(
        <SafeAreaView style={styles.view}>
          <FlatList
            extraData={leitura}
            data={ ondeLer ? links : (ordem == "ascending" ? obra?.capitulos : obra?.capitulos.reverse())} 
            ref={ref => setCapitulosRef(ref)}
            ListHeaderComponent={(
              <View >
                 <View style={styles.imageContainer}>
                    {
                        !imageError && !isLoading ?
                        <Image
                            style={styles.imagem}
                            source={{ uri : imagePath }}
                            onError={(error) => {
                                setImageError(true)
                            }}
                        />
                        :
                        <View style={{marginTop: 100}}>
                            <Icon 
                                source="image-off-outline" 
                                color="#312E2E" 
                                size={30}
                            />
                        </View>
                    }

                </View>
                <LinearGradient 
                    colors={[
                        'rgba(13, 13, 13, 0.8)', 
                        'rgba(13, 13, 13, 1)', 
                        'rgba(13, 13, 13, 1)', 
                        'rgba(13, 13, 13, 1 )'
                    ]} 
                    style={styles.gradiente}
                >
                {
                    !!obra.id && (
                        <View style={styles.details}>
                            <CardObra obra={obra}/>
                            <View style={styles.statusList}>
                                {
                                    statusList?.map((status) => (
                                        <Chip 
                                            key={status.id}
                                            label={status?.nome}
                                            value={status.id}
                                            isSelected={leitura.status.id == status.id}
                                            onPress={(id) => {
                                                if(leitura.status.id == id){
                                                    handleRemoveLeitura()
                                                }else if(!!leitura.id){
                                                    handleUpdateLeitura(id)
                                                }else{
                                                    handleAddLeitura(id)
                                                }
                                            }}
                                        />
                                    ))
                                }
                                
                            </View>
                            {
                                !!descricao  && 
                                <Text style={styles.descricao}>
                                    {descricao}
                                </Text>
                            }
                        </View>
                    )
                }
                   
                </LinearGradient>
                <View style={{ width: '100%',flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', flexWrap: 'wrap'}}>
                    <Chip
                        onPress={() => {
                            navigation.navigate('publicar', {
                                obra
                            })
                        }}
                        style={{ paddingVertical: 3, height: 45}} 
                    >
                        <Text>
                            Publicar no feed
                        </Text>
                    </Chip>
                    {
                        !ondeLer ? 
                        <Chip 
                            label={""}
                            isSelected={false}
                            onPress={(id) => {
                                setOndeLer(true)
                            }}
                            style={{ alignItems: 'center' }}
                        >
                            
                            <Text>
                                Onde ler
                            </Text>
                            <Icon source="web" size={15}/>
                        </Chip>
                        :
                        <Chip 
                            label={""}
                            isSelected={false}
                            onPress={(id) => {
                                setOndeLer(false)
                            }}
                            style={{ alignItems: 'center' }}
                        >
                            
                            <Text>
                                Capitulos
                            </Text>
                            <Icon source="format-list-checkbox" size={15}/>
                        </Chip>
                    }
                   
                    <Chip 
                        label={""}
                        isSelected={false}
                        onPress={(id) => {
                            if(ordem == "ascending") setOrdem("descending")
                            else setOrdem("ascending")
                        }}
                        style={{ width: 100}}
                    >
                        <Icon 
                            source={ordem == "ascending" ? "sort-ascending" : "sort-descending"} 
                            color="#fff" size={18} 
                        />
                    </Chip>
                </View>
              
                <Text style={styles.capitulos}>
                     { ondeLer?  'Onde ler' :'Capitulos' }
                </Text>
              </View>
            )}
            renderItem={({item, index}) => {
                if(ondeLer){
                    return (
                        <CardLink 
                            link={item} 
                            onPress={() => {
                                Linking.openURL(item.url)
                            }}    
                        />
                    )
                }
                return (
                    <CardCapitulo
                        onLido={handlePressCapitulo}
                        isLoading={isLoadingCapitulo}
                        capitulo={item}
                        leitura={leitura}
                        obra={obra}
                    />
                )
            }}
            ListEmptyComponent={
                <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                    <Text allowFontScaling={ false } style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
                        { ondeLer ? 'Nenhum link informado!' : 'Nenhum capitulo ainda!' }
                    </Text>
                </View>
            }
            keyExtractor={(item, index) => {  return `${item.id}-${index}` }}
            ListFooterComponent={() => (
                !informado &&  !ondeLer &&
                <CustomButton 
                    mode="outlined"
                    style={styles.buttonInformar}
                    onPress={handleInformar}
                    isLoading={isLoadingInformar}
                >
                    Obra desatualizada?
                </CustomButton>
            )}
          />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    view: {
    },
    imageContainer:{
        width: width,
        minHeight: (width) * (4.3 / 3),
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
        paddingHorizontal: 15
    },
    gradiente:{
        width: width,
        minHeight: (width) * (4.3 / 3),
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
    }
});