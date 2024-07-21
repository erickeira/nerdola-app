import { useEffect, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView, ActivityIndicator } from "react-native";
import { Button } from 'react-native-paper';
import InputText from "../../components/InputText";
import CustomButton  from "../../components/CustomButton";
import Logo from '../../../assets/logo.png'
import Nerd from '../../../assets/nerd.png'
import Snackbar from 'react-native-snackbar';
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from "../../utils/api";
import { defaultColors } from "../../utils";
import { useAuth } from "../../context/AuthContext";

const { height, width }  = Dimensions.get('screen');

export default function LoginPage(){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const { isLoadingCheckAuth, handleCheckAuth } = useAuth()
    const [ formulario, setFormulario] = useState({
        email: '',
        senha: ''
    })
    const [ errors, setErrors] = useState({})
    const [ isLoadingLogin, setLoadingLogin] = useState(false)

    const handleValidateForm = (form) => {
        const newErrors = { 
            email:  !form.email ? "Infome o seu e-mail" : false,
            senha:  !form.senha  ? "Infome o sua senha" : false,
        }
        setErrors(newErrors)
        return !Object.entries(newErrors).some(([chave, valor]) => !!valor)
      }

    const handleChange = (dado) => {
        setErrors({})
        setFormulario((prevFormulario) => ({...prevFormulario, ...dado}))
    }

    const handleLogin = async () => {
        if(!handleValidateForm(formulario) || isLoadingLogin) return 
        setLoadingLogin(true)
        try{
           const response = await api.post('usuarios/login', formulario )
           Snackbar.show({
            text: response.data?.message,
            duration: 2000,
            action: {
              text: 'OK',
              textColor: 'green',
              onPress: () => { /* Do something. */ },
            },
          });
          await AsyncStorage.setItem('token' , response.data.token )
          handleCheckAuth()
        }catch(error){

        } finally {
            setTimeout(() => {
                setLoadingLogin(false)
            }, 3000);
            
        }
    }

    const handleCadastrar = () => {
        navigation.navigate('cadastro')
    }

    useEffect(() => {
        if(!isLoadingCheckAuth) handleCheckAuth()
    },[isFocused])

    if(isLoadingCheckAuth) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: defaultColors.primary
                }}
            >
                <ActivityIndicator size={50} color={"#fff"}/>
            </View>
        )
    }
    return(
        <ScrollView keyboardShouldPersistTaps="handled" style={{ flex : 1}} showsVerticalScrollIndicator={false}>
            <View style={styles.view}>
                <Image
                    style={styles.logo}
                    source={Logo}
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
                    onPress={handleLogin}
                    isLoading={isLoadingLogin}
                >
                    Entrar
                </CustomButton>
                <CustomButton 
                    mode="outlined"
                    style={styles.buttonCadastrar}
                    onPress={handleCadastrar}
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
      justifyContent: 'flex-end',
    },
    logo:{
        fontSize: 50,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        marginBottom: 0,
        objectFit: 'contain',
        width: 200,
        height: 300
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