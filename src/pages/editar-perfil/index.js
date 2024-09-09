import { useEffect, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView } from "react-native";
import { Avatar, Button, Icon } from 'react-native-paper';
import InputText from "../../components/InputText";
import CustomButton  from "../../components/CustomButton";
import Logo from '../../../assets/logo.png'
import Nerd from '../../../assets/nerd.png'
import api from "../../utils/api";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { imageUrl, isValidEmail } from "../../utils";
import Chip from "../../components/Chip";
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import { assets } from "../../../react-native.config";
import { useSnackbar } from "../../context/SnackbarContext";

const { height, width }  = Dimensions.get('screen');

export default function EditarPerfilPage(){
    const navigation = useNavigation()
    const [ formulario, setFormulario] = useState({
        nome: '',
        email: '',
        senha: ''
    })
    const [dadosAlterados, setDadosAlterados] = useState({})
    const [ errors, setErrors] = useState({})
    const [ isLoadingCadastro, setLoadingCadastro] = useState(false)
    const [oldNick, setOldNick] = useState("")
    const snackbar = useSnackbar()    

    const [ isLoadingMe, setIsLoadingMe] = useState(false)
    const getMe = async () => {
        setIsLoadingMe(true)
        try{
            const response = await api.get('usuarios/me')
            setFormulario(response.data)
            setOldNick(response.data.nick)
        }catch(error){
        } finally {
            setIsLoadingMe(false)
        }
    }

    const isFocused = useIsFocused()
    useEffect(() => {
        getMe()
    },[isFocused])


    const handleValidateForm = async (form) => {
        const newErrors = { 
            nome:  !form.nome?.trim() ? "Infome o seu nome" : false,
            email:  !form.email || !isValidEmail(form.email) ? "Infome o seu e-mail" : false,
            telefone:  !form.telefone || form.telefone.legth < 10  ? "Infome o seu telefone" : false,
            nick:    !form.nick ? "Informe seu nick" : ( form.nick?.trim()?.split(' ')?.length > 1 ? "Seu nick não pode conter espaços" : false )
        }
        if(form.hasOwnProperty('nick') && form.nick != oldNick){
            const isValid = await handleCheckNick(form.nick)
            newErrors.nick = !isValid ? 'Nick já está sendo utilizado' : false
        }
        setErrors(newErrors)
        return !Object.entries(newErrors).some(([chave, valor]) => !!valor)
      }

    const handleChange = (dado) => {
        setErrors({})
        setFormulario((prevFormulario) => ({...prevFormulario, ...dado}))
        setDadosAlterados((prevFormulario) => ({...prevFormulario, ...dado}))
    }

    const handleCadastrar = async () => {
        const isValid = await handleValidateForm({ ...formulario, ...dadosAlterados})
        if(!isValid || isLoadingCadastro) return 
        setLoadingCadastro(true)
        try{
           const response = await api.patch(`usuarios/me`, dadosAlterados )
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

    const handleCheckNick = async (nick) => {
        try{
            await api.post('usuarios/check-nick',{  nick })
            return true
        }catch{
            return false
        }
    }

    const imagePath = formulario?.imagem?.endsWith('jpg') ? `${imageUrl}usuarios/${formulario?.id}/${formulario?.imagem}` : `data:image/jpeg;base64,${formulario?.imagem}`;
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
                    placeholder="Nick"
                    value={formulario.nick}
                    onChange={(nick) => {
                        handleChange({ nick : nick.toLowerCase().trim() })
                    }}
                    onStopType={async (nick) => {
                        if(nick != formulario?.nick){
                            const isValid = await handleCheckNick(nick)
                            setErrors({ ...errors,
                                nick: !isValid ? 'Nick já está sendo utilizado' : false
                            })
                        }
                        
                    }}
                    containerStyle={styles.textInput}
                    height={67}
                    error={!!errors.nick}
                    errorText={errors.nick}
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
                        label={formulario?.imagem ? "Remover" : "Adicionar"}
                        style={{
                            height: 40
                        }}
                        onPress={async () => {
                            if(formulario?.imagem){
                                handleChange({ imagem : "" })
                            }else{
                                try{
                                    const options = {
                                        mediaType: 'photo',
                                        quality: 0.8,
                                        includeBase64: true
                                    }
                                    const result = await launchImageLibrary(options);
                                    const imagem = result.assets[0]?.base64
                                    handleChange({ imagem })
                                    setImageError(false)
                                }catch(error){

                                }
                            }
                        }}
                    />
                </View>
                
                <CustomButton 
                    mode="contained"
                    style={styles.buttonEntrar}
                    onPress={handleCadastrar}
                    isLoading={isLoadingCadastro}
                    isDisabled={isLoadingCadastro}
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