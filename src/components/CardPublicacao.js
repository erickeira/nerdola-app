import { 
    StyleSheet,
    BackHandler, 
    Text, 
    View , 
    TouchableOpacity, 
    Image, 
    Dimensions, 
    Modal, 
    Pressable, 
    ActivityIndicator,
} from "react-native";
import { Avatar, Icon, IconButton } from "react-native-paper";
import { defaultColors, gerarCorAleatoriaRGBA, gerarCorPorString, imageUrl } from "../utils";
import { 
    useEffect, 
    useState,
    useMemo,
    useCallback,
    useRef
 } from "react";
import CardCapituloPublicacao from "./CardCapituloPublicacao";
import { useNavigation } from "@react-navigation/native";
import { Button, Menu, Divider, PaperProvider } from 'react-native-paper';
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import AutoHeightImage from 'react-native-auto-height-image';

import  dayjs from 'dayjs'
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';
import CardObra from "./CardObra";
dayjs.extend(relativeTime);
dayjs.locale("pt-br");

import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
    BottomSheetFlatList 
} from '@gorhom/bottom-sheet';
import CustomButton from "./CustomButton";
import FastImage from "react-native-fast-image";

const { height, width }  = Dimensions.get('screen');

const CustomImage = ({ imagem, publicacao, onPress, exibir, maxHeight = 250 }) => {
    const imagePath = `${imageUrl}publicacoes/${publicacao?.id}/${publicacao.imagem}`;
    const [imageError, setImageError] = useState(false)
    const [imageWidth, setImageWidth] = useState(0);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (publicacao.imagem) {
            Image.getSize(imagePath, (width, height) => {
                const scaleFactor = height / maxHeight;
                const imageWidth = width / scaleFactor;
                setImageWidth(imageWidth);
                setLoading(false);
                setImageError(false);
            }, (error) => {
                setImageError(true);
                setLoading(false);
            });
        }
    }, [imagePath]);

    useEffect(() => {
        setImageError(false);
    },[publicacao])

    return(
         <View style={{minWidth: 50, width: imageWidth, height: maxHeight,maxHeight, marginVertical: 20 }}>
            {loading ? (
                <View style={{ width : 250, height: 250, flexDirection: 'row' , alignItems: 'center', justifyContent: 'center'}}>
                    <ActivityIndicator color={defaultColors.activeColor} />
                </View>
                
            ) : (
                publicacao.imagem && !imageError ? (
                    <FastImage
                        style={{ width: imageWidth, height: maxHeight }}
                        source={{
                            uri: imagePath,
                            priority: FastImage.priority.high,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                        onError={() => setImageError(true)}
                        onPress={onPress}
                        onTouchEnd={onPress}
                    />
                ) : (
                    <Icon
                        name="image-off-outline"
                        type="material-community"
                        color="#312E2E"
                        size={30}
                    />
                )
            )}
        </View>
    )
}

export default function CardPublicacao({ 
    publicacao : oldPublicacao,
    handleExcluir,
    handleReportar
}){
    const { usuario } = useAuth()
    const [publicacao, setPublicacao] = useState(oldPublicacao)
    const navigation = useNavigation()
    const [ curtido, setCurtido] = useState(publicacao.curtido);
    const [modalVisible, setModalVisible] = useState(false);
    

    const handleCurtir = async () => {
        
        setPublicacao({
            ...publicacao,
            total_curtidas : curtido ? publicacao.total_curtidas - 1  : publicacao.total_curtidas + 1
        })
        setCurtido(!curtido)
        try{
            await api.post(`publicacoes/${publicacao.id}/curtir`)
        }catch(error){
            console.log(error)
        } finally{
        }
    }

    const handleClick = (capitulo, obra) => {
        navigation.navigate('capitulo', { id: capitulo?.id, obra })
    }

    const handleComentarios = async () => {
        navigation.navigate('comentarios', { publicacao })
    }
    const imagePath = `${imageUrl}usuarios/${publicacao?.usuario?.id}/${publicacao?.usuario?.imagem}`;
    const [imageError, setImageError] = useState(false)

    const bottomSheetModalRef = useRef(null);
    const snapPoints = useMemo(() => ['34%', '35%'], []);

    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
        BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    }, []);

    const handleSheetChanges = useCallback((index) => {
        if(index < 0){
            BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
        }
        // console.log('handleSheetChanges', index);
    }, []);

    const handleBackPress = () => {
        if (bottomSheetModalRef.current) {
            bottomSheetModalRef.current.dismiss();
            return true; 
        }
        return false;
    };
    

    return(
        <View style={styles.view}>
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate('verperfil', { id : publicacao?.usuario?.id })
                }}
            >
                {
                    publicacao?.usuario?.imagem && !imageError ?
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
                        size={30} 
                        style={{
                            backgroundColor: gerarCorPorString(publicacao?.usuario?.nome)
                        }}
                        label={ publicacao?.usuario?.nome?.split(' ')?.slice(0 , 2)?.map(t => t[0])?.join('') } 
                    />
                }
            </TouchableOpacity>
            <View style={{width: '95%'}}>
                <View style={styles.head}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('verperfil', { id : publicacao?.usuario?.id })
                        }}
                        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 3}}
                    >
                        <View>
                            <Text style={styles.nome}>
                                { publicacao?.usuario?.nome }
                            </Text>
                            { !!publicacao?.usuario?.nick  && (
                                <Text style={styles.nick}>
                                    @{ publicacao?.usuario?.nick }
                                </Text>
                                )
                            }
                            
                        </View>
                    </TouchableOpacity>
                    <View style={{flexDirection: 'row', gap: 10}}>
                        <Text style={styles.criada_em}>
                            { dayjs(dayjs(publicacao.criada_em)).fromNow() }
                        </Text>
                       
                        <TouchableOpacity 
                            onPress={handlePresentModalPress}
                            hitSlop={{
                                left: 15,
                                bottom: 15
                            }}
                        >
                            <Icon source="dots-horizontal" size={17} color="#fff"/>
                        </TouchableOpacity>
                    </View>
                    
                </View>
                <TouchableOpacity onPress={handleComentarios}>
                    <Text style={styles.conteudo}>
                        { publicacao?.conteudo }
                    </Text>
                </TouchableOpacity>
                
                {
                    !!publicacao?.capitulo?.id && (
                        <CardCapituloPublicacao
                            obra={publicacao?.obra}
                            capitulo={publicacao?.capitulo}
                            handleClick={() => handleClick(publicacao?.capitulo, publicacao?.obra)}
                        />
                    )
                }

                {
                    !publicacao?.capitulo?.id && publicacao?.obra?.id && (
                        <CardObra
                            obra={publicacao?.obra}
                            feed
                        />
                    )
                }
                {
                    !!publicacao?.imagem && (
                        <TouchableOpacity 
                            onPress={() => setModalVisible(true)}
                        >
                             <CustomImage
                                style={styles.imagemPublicacao}
                                publicacao={publicacao}
                                height={"100%"}
                                imagePath={imagePath}
                            />
                        </TouchableOpacity>
                       
                    )
                }

                <View style={styles.buttons}>
                    <TouchableOpacity 
                        onPress={handleCurtir}
                        hitSlop={{
                            left: 5,
                            right: 5,
                            top: 5,
                            bottom: 5
                        }}
                        style={{
                            flexDirection: 'row',
                            gap: 3,
                            width: 40
                        }}
                    >
                        <Icon 
                            source={ curtido? "heart" : "heart-outline"} 
                            size={20} 
                            color={ curtido ? "#EC4A55" : "#fff"}
                        />
                        <Text style={{color: '#fff'}}>
                           { publicacao.total_curtidas }
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={handleComentarios}
                        hitSlop={{
                            left: 5,
                            right: 5,
                            top: 5,
                            bottom: 5
                        }}
                        style={{
                            flexDirection: 'row',
                            gap: 3
                        }}
                    >
                        <Icon 
                            source={ "chat-outline"} 
                            size={20} 
                            color={ "#fff"}
                        />
                        <Text style={{color: '#fff'}}>
                        { publicacao.total_comentarios }
                        </Text>
                    </TouchableOpacity>
                </View >
            </View>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                backgroundStyle={[styles.modalContainer]}
                handleIndicatorStyle={{
                    backgroundColor: defaultColors.gray
                }}
                contentHeight={200}
            >
                <View style={{flex: 1, justifyContent: 'flex-end', padding: 20, gap: 5}}>
                    <CustomButton
                        style={[styles.buttonModal, ]}
                        labelStyle={{ color: "#fff"}}
                        onPress={() => {
                            handleReportar()
                            handleBackPress()
                        }}
                        icon="alert-octagon"
                    >
                        Reportar
                    </CustomButton>
                    {
                        (publicacao?.usuario?.id == usuario?.id || usuario?.id == 1) &&
                        <CustomButton
                            style={[styles.buttonModal, ]}
                            labelStyle={{ color: "#DB4C4C"}}
                            onPress={() => {
                                handleExcluir()
                                handleBackPress()
                            }}
                            icon="delete"
                        >
                            Remover
                        </CustomButton>
                    }
                    
                    <Divider style={{marginVertical: 8}}/>
                    <CustomButton
                        style={[styles.buttonModal, ]}
                        labelStyle={{ color: defaultColors.gray}}
                        onPress={() => {
                            handleBackPress()
                        }}
                        icon="close"
                    >
                        Cancelar
                    </CustomButton>
                </View>
            </BottomSheetModal>
            <Modal
                // animationType="slide"
                transparent={true}
                visible={modalVisible}
                statusBarTranslucent={true}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                    <View style={styles.centeredView}>
                        <IconButton
                            icon="close"
                            iconColor="#fff"
                            onPress={() => setModalVisible(!modalVisible)}
                            style={{
                                position: 'absolute',
                                top: 20,
                                right: 20,
                                zIndex: 2
                            }}
                        />
                        <CustomImage
                            style={styles.imagemPublicacao}
                            publicacao={publicacao}
                            imagePath={imagePath}
                            maxHeight={height - 200}
                        />
                    </View>
                
            </Modal>
        </View>
        
    )
}


const styles = StyleSheet.create({
    view: {
        padding: 10,
        paddingVertical: 20,
        gap: 10,
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 0.2,
        borderBottomColor: '#262626'
    },
    head:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '94%',
        marginBottom: 5
    },
    nome:{
        color: '#fff',
        fontSize: 15
    },
    nick:{
        fontSize: 11,
    },
    criada_em :{
        color: defaultColors.gray,
        fontSize: 11
    },
    conteudo:{
        fontSize: 13,
        fontWeight: '400',
        width: '90%',
        color: '#fff'
    },
    buttons:{
        flexDirection: 'row',
        paddingTop:20,
        gap: 20
    },
    imageContainer:{
        width: 30,
        height: 30,
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
    imagemPublicacao:{
        marginTop: 20,
        objectFit: 'contain'
    },
    modalContainer:{
        backgroundColor: 'rgba(0,0,0,1)',
    },
    buttonModal:{
        alignItems: 'flex-start',
        paddingVertical: 6,
        flex: 1
    },
    centeredView: {
        flex: 1,
        height,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 20
    },
    
});