import { useEffect, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView } from "react-native";
import { Avatar, Button, Icon } from 'react-native-paper';
import InputText from "../../components/InputText";
import CustomButton  from "../../components/CustomButton";
import Logo from '../../../assets/logo.png'
import Nerd from '../../../assets/nerd.png'
import api from "../../utils/api";
import Snackbar from 'react-native-snackbar';
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { imageUrl } from "../../utils";
import Chip from "../../components/Chip";

const { height, width }  = Dimensions.get('screen');

export default function EditarPerfilPage(){
    const navigation = useNavigation()
    const [ formulario, setFormulario] = useState({
        nome: '',
        email: '',
        senha: ''
    })
    const [ errors, setErrors] = useState({})
    const [ isLoadingCadastro, setLoadingCadastro] = useState(false)

    const [ isLoadingMe, setIsLoadingMe] = useState(false)
    const getMe = async () => {
        setIsLoadingMe(true)
        try{
            const response = await api.get('usuarios/me')
            setFormulario(response.data)
        }catch(error){
        } finally {
            setIsLoadingMe(false)
        }
    }

    const isFocused = useIsFocused()
    useEffect(() => {
        getMe()
    },[isFocused])


    const handleValidateForm = (form) => {
        const newErrors = { 
            nome:  !form.nome ? "Infome o seu nome" : false,
            email:  !form.email ? "Infome o seu e-mail" : false,
            telefone:  !form.telefone  ? "Infome o seu telefone" : false
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
           const response = await api.patch(`usuarios/me`, formulario )
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

    const imagePath = `${imageUrl}usuarios/${formulario?.id}/${formulario?.imagem}`;
    const [imageError, setImageError] = useState(false)

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
                <Text style={{ marginBottom: 10}}>Imagem</Text>
                <View style={{ flexDirection: 'row', gap: 20}}>
                    <View style={styles.imageContainer}>
                        {
                            formulario?.imagem && !imageError ?
                                <Image
                                    style={styles.imagem}
                                    source={{ uri : imagePath }}
                                    onError={(error) => {
                                        setImageError(true)
                                    }}
                                />
                            :
                            
                            <Icon 
                                source="image-off-outline" 
                                color="#312E2E" 
                                size={30}
                            />
                        }
                    </View>
                    <Chip
                        label="Adicionar"
                        style={{
                            height: 40
                        }}
                        onPress={() => {
                            Snackbar.show({
                                text: 'Desabilitado por enquanto',
                                duration: 2000,
                                action: {
                                    text: 'OK',
                                    textColor: 'green',
                                    onPress: () => { /* Do something. */ },
                                },
                            });
                        }}
                    />
                </View>
                
                <CustomButton 
                    mode="contained"
                    style={styles.buttonEntrar}
                    onPress={handleCadastrar}
                    isLoading={isLoadingCadastro}
                >
                    Salvar edição
                </CustomButton>
            </View>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    view: {
      padding: 30,
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
    },
    imageContainer:{
        width: 100,
        height: 100,
        borderColor: '#312E2E',
        borderWidth: 1,
        marginBottom: 5,
        borderRadius: 100,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30
    },
    imagem:{
        width: '100%',
        height: '100%'
    },
});