import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import InputText from "./InputText";
import { defaultColors } from "../utils";
import { Divider, Icon } from "react-native-paper";
const { height, width }  = Dimensions.get('screen');
export default function CardLista({ lista }){
    return(
        <>
            <TouchableOpacity style={styles.view}>
                <View style={{flexDirection: 'row', gap: 15, alignItems: 'center'}}>
                    <Icon source="bookmark" color={defaultColors.gray} size={20}/>
                    <View>
                        <Text style={{ color : "#fff", marginBottom: 3}}>
                            {lista.nome}
                        </Text>
                        <Text style={{ color : defaultColors.gray, fontSize: 11 }}>
                            {lista.total_obras} { lista.total_obras == 1 ?  "obra" :  "obras" } 
                        </Text>
                    </View>
                </View>
               
                <View 
                    style={styles.button} 
                    onPress={() => {
                        navigation.navigate('obra', { id : pedido?.obra?.id})
                    }}
                >
                    <Icon source="chevron-right" color="#fff" size={20}/>
                </View>
                
            </TouchableOpacity>
            <Divider/>
        </>
    )
}

const styles = StyleSheet.create({
    view: {
      padding: 10,
      minHeight : 65,
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