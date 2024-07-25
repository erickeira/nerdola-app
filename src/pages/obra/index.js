import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../../utils/api";
import { imageUrl } from "../../utils";
import { Icon, IconButton,  Menu, Divider, PaperProvider  } from "react-native-paper";
import LinearGradient from 'react-native-linear-gradient';
import CardObra from "../../components/CardObra";
import CardCapitulo from "../../components/CardCapitulo";
import Chip from "../../components/Chip";
import CustomButton from "../../components/CustomButton";
import Snackbar from "react-native-snackbar";
const { height, width }  = Dimensions.get('screen');

export default function ObraPage({ route }){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const [ isLoading, setIsLoading ] = useState(true)
    const [ obra, setObra] = useState({})
    const [ capitulosRef, setCapitulosRef ] = useState(null)
    const { id } = route.params
    const{
        imagem,
        descricao,
        leitura
    } = obra
    const imagePath = `${imageUrl}obras/${id}/${imagem}`;
    const [imageError, setImageError] = useState(false)
   
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
    const handleInformar = () => {
        setIsLoadingInformar(true)
        setTimeout(() => {
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
        },2000)
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
            data={ ordem == "ascending" ? obra?.capitulos : obra?.capitulos.reverse()} 
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
                <View style={{ width: '100%', justifyContent: 'flex-end', alignItems: 'flex-end'}}>
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
                    Capitulos
                </Text>
              </View>
            )}
            renderItem={({item, index}) => {
              return (
                <CardCapitulo
                    onLido={handlePressCapitulo}
                    isLoading={isLoadingCapitulo}
                    capitulo={item}
                    leitura={leitura.status.id}
                />
              )
            }}
            ListEmptyComponent={
                <>
                
                </>
            }
            keyExtractor={(item, index) => {  return `${item.id}-${index}` }}
            ListFooterComponent={() => (
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
    }
});