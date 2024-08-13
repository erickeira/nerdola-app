import { Dimensions, StyleSheet, Text, View } from "react-native";
import InputText from "./InputText";
import { defaultColors } from "../utils";
const { height, width }  = Dimensions.get('screen');
export default function CardLista({ lista }){
    return(
        <View style={styles.view}>
            {
                lista.new ? (
                    <InputText
                        placeholder="Nome"
                        style={styles.input}
                    />
                ):
                <Text style={{ color : "#fff"}}>
                    {lista.nome}
                </Text>
            }

        </View>
    )
}

const styles = StyleSheet.create({
    view: {
      padding: 10,
      height : 60,
      borderRadius: 5,
      backgroundColor: "#191919"
    },
    input:{
        borderWidth: 0,
        borderColor: "#191919"
    }
});