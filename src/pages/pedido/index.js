import { useEffect, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView } from "react-native";
import { Button } from 'react-native-paper';
import InputText from "../../components/InputText";
import CustomButton  from "../../components/CustomButton";
import Logo from '../../../assets/logo.png'
import Nerd from '../../../assets/nerd.png'
import api from "../../utils/api";
import { useNavigation } from "@react-navigation/native";
import { useSnackbar } from "../../context/SnackbarContext";

const { height, width }  = Dimensions.get('screen');

export default function PedidoPage({ route }){
    const navigation = useNavigation()
    const [ formulario, setFormulario] = useState({
        nome: '',
        onde_ler: ''
    })
    const id  = route?.params?.id
    const [ errors, setErrors] = useState({})
    const [ isLoadingPedido, setLoadingPedido] = useState(false)
    const snackbar = useSnackbar()

    const handleValidateForm = (form) => {
        const newErrors = { 
            nome:  !form.nome ? "Infome o seu nome da obra" : false,
        }
        setErrors(newErrors)
        return !Object.entries(newErrors).some(([chave, valor]) => !!valor)
      }

    const handleChange = (dado) => {
        setErrors({})
        setFormulario((prevFormulario) => ({...prevFormulario, ...dado}))
    }

    const handleCadastrar = async () => {
        if(!handleValidateForm(formulario) || isLoadingPedido) return 
        setLoadingPedido(true)
        try{
            let response = {}
            if(id){
                response = await api.patch(`pedido/${id}`, formulario )
            }else{
                response = await api.post('pedido', formulario )
            }
           
           snackbar.show({
            text: response.data?.message,
            duration: 2000,
            action: {
              text: 'OK',
              textColor: 'green',
              onPress: () => { /* Do something. */ },
            },
          });
          navigation.goBack()
        }catch(error){
        } finally {
            setTimeout(() => {
                setLoadingPedido(false)
            }, 3000);
            
        }
    }


    

    useEffect(() => {
       if(id) getPedido(id)
    },[id])

    const getPedido = async (id) => {
        try{
            const response = await api.get(`pedido/${id}`)
            setFormulario(response.data)
        }catch(error){
            
        } finally{
        }
    }


    return(
        <ScrollView keyboardShouldPersistTaps="handled" style={{ flex : 1}} showsVerticalScrollIndicator={false}>
            <View style={styles.view}>
                <InputText
                    placeholder="Nome da obra"
                    value={formulario.nome}
                    onChange={(nome) => {
                        handleChange({ nome })
                    }}
                    containerStyle={styles.textInput}
                    height={67}
                    error={!!errors.nome}
                    errorText={errors.nome}
                />
                <InputText
                    placeholder="Onde ler"
                    value={formulario.onde_ler}
                    onChange={(onde_ler) => {
                        handleChange({ onde_ler })
                    }}
                    containerStyle={styles.textInput}
                    height={67}
                    error={!!errors.onde_ler}
                    errorText={errors.onde_ler}
                />
                <CustomButton 
                    mode="contained"
                    style={styles.buttonEntrar}
                    onPress={handleCadastrar}
                    isLoading={isLoadingPedido}
                >
                    { !!id ? 'Salvar pedido'  : 'Realizar pedido'  }
                </CustomButton>
            </View>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    view: {
      padding: 30,
      height : height - 60,
    },
    logo:{
        fontSize: 50,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        marginBottom: 50
    },
    textInput:{
        
    },
    buttonEntrar:{
        height: 51,
        justifyContent: 'center',
        marginBottom: 10
    },
    buttonCadastrar:{
        height: 51,
        justifyContent: 'center',
        marginBottom: 100,
        borderColor: '#312E2E'
    }
});