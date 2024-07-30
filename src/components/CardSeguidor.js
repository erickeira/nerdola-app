import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { defaultColors, imageUrl, proporcaoCard } from "../utils";
import { useEffect, useState } from "react";
import { Icon, ProgressBar, Checkbox, Avatar  } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Snackbar from "react-native-snackbar";
import CustomButton from "./CustomButton";
import Chip from "./Chip";
const { height, width }  = Dimensions.get('screen');

export default function CardSeguidor({
    usuario,
    handleSeguir
}){
    const navigation = useNavigation()
    const imagePath = `${imageUrl}usuarios/${usuario?.id}/${usuario?.imagem}`;
    const [imageError, setImageError] = useState(false)



    return(
        <TouchableOpacity 
            onPress={() => {
                navigation.navigate('perfil', { usuario })
            }}
        >
            <View style={styles.view}>
                <View style={styles.imageContainer}>
                    {
                        usuario?.imagem && !imageError ?
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
                            color="#000"
                            label={ usuario?.nome?.split(' ')?.slice(0 , 2)?.map(t => t[0])?.join('') } 
                        />
                    }
                
                </View>
                <View style={{ flex: 1  }}>
                    <Text style={[styles.nome]}>
                        {usuario?.nome}
                    </Text>
                    <Text style={[styles.numero]}>
                        {usuario.total_seguidores} { usuario.total_seguidores == 1 ? 'seguidor' : 'seguidores' }
                    </Text>
                </View>
                <Chip
                    style={{
                        backgroundColor: usuario.seguindo ? defaultColors.primary : '#fff',
                        paddingVertical: 8,
                    }}
                    onPress={handleSeguir}
                    isSelected={false}
                >
                    <Text 
                        style={{
                            color: !usuario.seguindo ? defaultColors.primary : '#fff',
                            fontSize: 11
                        }} 
                    >
                        { usuario.seguindo ? 'Deixar de seguir' : 'Seguir' }
                    </Text>
                </Chip>
            
            </View>
            
 
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    view: {
      padding: 10,
      width: width - 10,
      overflow: 'scroll',
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center'
    },
    imageContainer:{
        width: 40,
        height: 40,
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
    nome:{
        fontSize: 15,
        flexWrap: 'wrap',
        color: '#fff',
    },
    numero:{
        fontSize: 10,
        flexWrap: 'wrap',
        color: defaultColors.gray,
    },
});