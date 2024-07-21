import { useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView } from "react-native";
import { Button } from 'react-native-paper';
import InputText from "../../components/InputText";
import CustomButton  from "../../components/CustomButton";
import Logo from '../../../assets/logo.png'
import Nerd from '../../../assets/nerd.png'
import api from "../../utils/api";
import Snackbar from 'react-native-snackbar';
import { useNavigation } from "@react-navigation/native";

const { height, width }  = Dimensions.get('screen');

export default function CadastroPage(){
    const navigation = useNavigation()
    const [ formulario, setFormulario] = useState({
        nome: '',
        email: '',
        senha: ''
    })
    const [ errors, setErrors] = useState({})
    const [ isLoadingCadastro, setLoadingCadastro] = useState(false)

    const handleValidateForm = (form) => {
        const newErrors = { 
            nome:  !form.email ? "Infome o seu nome" : false,
            email:  !form.email ? "Infome o seu e-mail" : false,
            telefone:  !form.senha  ? "Infome o seu telefone" : false,
            senha:  !form.senha  ? "Infome o sua senha" : false,
        }
        setErrors(newErrors)
        return !Object.entries(newErrors).some(([chave, valor]) => !!valor)
      }

    const handleChange = (dado) => {
        setErrors({})
        setFormulario((prevFormulario) => ({...prevFormulario, ...dado}))
    }

    const handleCadastrar = async () => {
        if(!handleValidateForm(formulario) || isLoadingCadastro) return 
        setLoadingCadastro(true)
        try{
           const response = await api.post('usuarios', formulario )
           Snackbar.show({
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
            console.error('Erro na requisição:', error);
            if (error.response) {
              console.error('Dados do erro:', error.response.data);
              console.error('Status do erro:', error.response.status);
            } else if (error.request) {
              console.error('Requisição feita, mas sem resposta:', error.request);
            } else {
              console.error('Erro ao configurar a requisição:', error.message);
            }
        } finally {
            setTimeout(() => {
                setLoadingCadastro(false)
            }, 3000);
            
        }
    }

    return(
        <ScrollView keyboardShouldPersistTaps="handled" style={{ flex : 1}} showsVerticalScrollIndicator={false}>
            <View style={styles.view}>
                <InputText
                    placeholder="Nome"
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
                    placeholder="E-mail"
                    value={formulario.email}
                    onChange={(email) => {
                        handleChange({ email })
                    }}
                    containerStyle={styles.textInput}
                    tipo="email"
                    height={67}
                    error={!!errors.email}
                    errorText={errors.email}
                />
                <InputText
                    placeholder="Telefone"
                    value={formulario.telefone}
                    onChange={(v, telefone) => {
                        handleChange({ telefone })
                    }}
                    containerStyle={styles.textInput}
                    tipo="telefone"
                    height={67}
                    error={!!errors.telefone}
                    errorText={errors.telefone}
                />
                <InputText
                    placeholder="Senha"
                    value={formulario.senha}
                    onChange={(senha) => {
                        handleChange({ senha })
                    }}
                    containerStyle={styles.textInput}
                    tipo="senha"
                    height={67}
                    error={!!errors.senha}
                    errorText={errors.senha}
                />

                <CustomButton 
                    mode="contained"
                    style={styles.buttonEntrar}
                    onPress={handleCadastrar}
                    isLoading={isLoadingCadastro}
                >
                    Criar conta
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