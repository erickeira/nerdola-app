import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, Image } from "react-native";
import InputText from "./InputText";
import { defaultColors, imageUrl } from "../utils";
import { Checkbox, Divider, Icon, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
const { height, width }  = Dimensions.get('screen');

export default function CardLista({ lista, add, onAdd ,isLoading }){
    const navigation = useNavigation()


    return(
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10}}>
            <TouchableOpacity 
                onPress={() => {
                    if(add) onAdd()
                    else navigation.navigate('lista', { lista })
                }}
                style={styles.view}
            >
                <View style={{flexDirection: 'row', gap: 20, alignItems: 'center'}}>
                    {
                        lista.obras?.length > 0 ? 
                        <View
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: 3,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#232323',
                                position: 'relative',
                            }}
                        >
                            {
                                lista.obras?.map((obr, index) => {
                                    const imagePath = `${imageUrl}obras/${obr.id}/${obr.imagem}`;
                                    const distance = {
                                        0: 0,
                                        1: 2.5,
                                        2: 6
                                    }
                                    return(
                                    
                                            <Image 
                                                key={index}
                                                source={{ uri : imagePath }} 
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    position: 'absolute',
                                                    bottom: - distance[index],
                                                    right: - distance[index],
                                                    borderRadius: 3
                                                }}
                                            />
                                    
                                    )}
                                )
                            }
                        </View>
                        :
                        <View
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: 3,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#232323'
                            }}
                        >
                            <Icon source="bookmark" color={defaultColors.gray} size={25}/>
                        </View>
                    }
                    
                    <View>
                        <Text style={{ color : "#fff", marginBottom: 3, fontSize: 16}}>
                            {lista.nome}
                        </Text>
                        <Text style={{ color : defaultColors.gray, fontSize: 13 }}>
                            {lista.total_obras} { lista.total_obras == 1 ?  "obra" :  "obras" } 
                        </Text>
                    </View>
                </View>
                
            </TouchableOpacity>
            <View style={{flexDirection: 'row' ,gap: 5, alignItems: 'center'}}>
                {
                    !!isLoading && (
                        <ActivityIndicator color={defaultColors.activeColor}/>
                    )
                }
                {
                    !!add &&
                    <Checkbox 
                        status={lista.hasObra ? 'checked' : 'unchecked'} 
                        color={defaultColors.activeColor}
                        onPress={onAdd}
                    />
                }
            </View>
           
           
        </View>
    )
}

const styles = StyleSheet.create({
    view: {
      minHeight : 65,
      flex: 1,
      borderRadius: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    input:{
        borderWidth: 0,
        borderColor: "#191919"
    }
});