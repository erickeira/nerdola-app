import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomButton from "./CustomButton";
import { useNavigation } from "@react-navigation/native";
import { defaultColors } from "../utils";
import { ActivityIndicator, Icon } from "react-native-paper";

export default function CardPedido({ pedido, onDelete , onEdit, isLoading }){
    const navigation = useNavigation()
    const statusData ={
        em_analise:{
            color: 'yellow',
            label: 'Em analise'
        },
        publicado: {
            color: 'green',
            label: 'Publicado'
        },
        reprovado: {
            color: '#DB4C4C',
            label: 'Reprovado'
        }
    }
    
    return(
        <TouchableOpacity 
            style={styles.view}
            onPress={() => {
                if(pedido.status == 'publicado' && pedido?.obra?.id && !isLoading){
                    navigation.navigate('obra', { id : pedido?.obra?.id})
                }
                
            }}
        >
            <View style={{width: '65%'}}>
                <Text style={styles.nome}>{pedido?.nome}</Text>
                <Text style={styles.onde_ler}>{pedido?.onde_ler}</Text>
                <Text style={[styles.status, {
                    borderColor: statusData[pedido.status]?.color,
                    color: statusData[pedido.status]?.color,
                }]}>{statusData[pedido.status]?.label}</Text>
            </View>
                
            <View style={styles.divider}/> 
            <View style={styles.buttons}>
                { pedido.status == 'em_analise' && !isLoading &&
                    <>
                        <TouchableOpacity style={styles.button} onPress={onEdit}>
                            <Icon source="pencil" color="#fff" size={20}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={onDelete}>
                            <Icon source="delete-outline" color="#DB4C4C" size={20}/>
                        </TouchableOpacity>
                    </>
                }
                { pedido.status == 'publicado' && pedido?.obra?.id && !isLoading  &&
                    <>
                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={() => {
                                navigation.navigate('obra', { id : pedido?.obra?.id})
                            }}
                        >
                            <Icon source="chevron-right" color="#fff" size={20}/>
                        </TouchableOpacity>
                    </>
                }
                { pedido.status == 'reprovado' &&  !isLoading &&
                    <>
                       <TouchableOpacity style={styles.button} onPress={onDelete}>
                            <Icon source="delete-outline" color="#DB4C4C" size={20}/>
                        </TouchableOpacity>
                    </>
                }
                {
                    isLoading &&
                    <ActivityIndicator/>
                }
            </View>
            
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    view: {
        padding: 10,
        borderColor: '#312E2E',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    criado_em:{
        color: '#d1d1d1',
        fontSize: 11
    },
    nome: {
        color: '#fff',
        fontSize: 15
    },
    onde_ler: {
        color: '#d1d1d1',
        marginBottom: 8
    },
    status:{
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderWidth: 0.3,
        borderRadius: 5,
        textAlign: 'center',
        width: 100,
        fontSize: 10
    },
    divider:{
        borderColor: '#312E2E',
        borderBottomWidth: 1,
        marginVertical: 13
    },
    buttons:{
        flexDirection: 'row',
        height: 40
    },
    button:{
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        borderRadius: 200
    },
    visualizar: {
        color: defaultColors.activeColor
    }
});