import { StyleSheet, Text, View } from "react-native";
import CustomButton from "./CustomButton";
import { useNavigation } from "@react-navigation/native";

export default function CardPedido({ pedido }){
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
            color: 'red',
            label: 'Reprovado'
        }
    }
    
    return(
        <View style={styles.view}>
            <Text style={styles.nome}>{pedido?.nome}</Text>
            <Text style={styles.onde_ler}>{pedido?.onde_ler}</Text>
            <Text style={[styles.status, {
                borderColor: statusData[pedido.status]?.color,
                color: statusData[pedido.status]?.color,
            }]}>{statusData[pedido.status]?.label}</Text>
            { pedido.status != 'em_analise' ||  (pedido.status != 'publicado' && pedido?.obra?.id ) &&
                <View style={styles.buttons}>
                    { pedido.status != 'em_analise' && 
                        <>
                            <View style={styles.divider}/> 
                            <CustomButton style={styles.button}>
                                <Text style={styles.editar}>
                                    Editar
                                </Text>
                                
                            </CustomButton>
                            <CustomButton style={styles.button}>
                                <Text style={styles.excluir}>
                                    Excluir
                                </Text>
                            </CustomButton>
                        </>
                    }
                    { pedido.status != 'publicado' && pedido?.obra?.id &&
                        <>
                            <View style={styles.divider}/> 
                            <CustomButton 
                                style={styles.button}
                                onPress={() => {
                                    navigation.navigate('obra', { id : pedido?.obra?.id})
                                }}
                            >
                                <Text style={styles.visualizar}>
                                    Visualizar
                                </Text>
                                
                            </CustomButton>
                        </>
                    }
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    view: {
        padding: 10,
        borderColor: '#312E2E',
        borderWidth: 1,
        borderRadius: 5
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
        borderWidth: 1,
        borderRadius: 5,
        textAlign: 'center',
        width: 100,
        fontSize: 11
    },
    divider:{
        borderColor: '#312E2E',
        borderBottomWidth: 1,
        marginVertical: 12
    },
    buttons:{
        flexDirection: 'row',
        height: 40
    },
    button:{
        flex: 1,
    },
    editar:{
        color: '#fff',
        fontSize: 12
    },
    excluir:{
        color: '#DB4C4C',
        fontSize: 12
    },
    visualizar: {
        // color: '#fff'
    }
});