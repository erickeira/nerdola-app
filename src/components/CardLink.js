import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { defaultColors } from "../utils";
import { Icon } from "react-native-paper";

export default function CardLink({
    link,
    onPress
}) {
    return(
        <TouchableOpacity onPress={onPress}>
            <View  style={styles.view}>
                <View style={{width: '90%'}}>
                    <Text style={styles.siteNome}>
                        {link?.site?.nome}
                    </Text>
                    <Text 
                        style={styles.url}
                        numberOfLines={1} // Define o número máximo de linhas
                        ellipsizeMode='tail'
                    >
                        {link?.url}
                    </Text>
                </View>
                <Icon source={"chevron-right"} color={"#fff"} size={20}/>
            </View>
            
        </TouchableOpacity>
       
    )
}

const styles = StyleSheet.create({
    view: {
        padding: 10,
        borderColor: '#312E2E',
        borderWidth: 0.3,
        marginHorizontal: 10,
        flexDirection: 'row' , 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 5,
        marginBottom: 10
    },
    siteNome:{
        color: '#fff',
        marginBottom: 5
    },
    url:{
        color: defaultColors.activeColor,
         maxWidth: '95%'
    }

});