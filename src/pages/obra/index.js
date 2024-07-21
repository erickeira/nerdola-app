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
            }else{
                response = await api.delete(`usuarios-capitulos-lidos/${leitura.id}/${capitulo}`)
            }
            console.log(response)
            getObra()
        }catch(error){
        } finally{
            setIsLoadingCapitulo(null)
        }
    }

 


    if(isLoading) return (
        <View style={{ paddingVertical: 100, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" size={30} style={{marginTop: 100}}/>
        </View>
    )
    return(
        <SafeAreaView style={styles.view}>
          <FlatList
            extraData={leitura}
            data={obra?.capitulos} 
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
                <Text style={styles.capitulos}>
                    Capitulos
                </Text>
              </View>
            )}
            renderItem={({item, index}) => {
              return (
                <CardCapitulo
                    onPress={handlePressCapitulo}
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
          />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    view: {
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
    }
});