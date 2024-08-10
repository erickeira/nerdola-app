import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Chip from "../../components/Chip";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { defaultColors } from "../../utils";
import InputSelect from "../../components/InputSelect";
import CustomButton from "../../components/CustomButton";
import { CommonActions, useIsFocused, useNavigation } from "@react-navigation/native";
import { Checkbox } from "react-native-paper";

const { height, width }  = Dimensions.get('screen');

export default function FiltrarPage({ route }){
    const navigation = useNavigation()
    const isFocused = useIsFocused()
    const [ filtros, setFiltros ] = useState({
        tags:[],
        site: "",
        formato: "",
        ...route?.params?.filtros
    })
    const handleChange = (dado) => {
      setFiltros((prevFiltros) => ({...prevFiltros, ...dado}))
    }
    const [ tags , setTags] = useState([])
    const [ sites , setSites] = useState([])
    const [ obraStatus, setObraStatus] = useState([])
    const [ formatos, setFormatos] = useState([])
    const [loading, setIsLoading] = useState(false)

    
    
    useEffect(() => {
        setFiltros({...filtros,  ...route?.params?.filtros})
     },[isFocused])

    useEffect(() =>{
        setIsLoading(true)
        getTags()
        getSites()
        getObraStatus()
        getFormatos()
    },[])

    const getTags = async () => {
        try{
            const response = await api.get(`tags`, {
                params: {
                    tageds: true
                }
            })
            setTags(response.data)
        }catch(error){

        } 
    }

    const getSites = async () => {
        try{
            const response = await api.get(`site`)
            setSites(response.data)
        }catch(error){

        } 
    }

    const getObraStatus = async () => {
        try{
            const response = await api.get(`obra-status`)
            setObraStatus(response.data)
        }catch(error){

        } 
    }

    const getFormatos = async () => {
        try{
            const response = await api.get(`formato`, {
                params: {
                    tageds: true
                }
            })
            setFormatos(response.data)
        }catch(error){

        } 
    }

    return(
        <ScrollView style={styles.view}>
            
            <InputSelect
                label={"Formato"}
                placeholder="Selecione"
                options={formatos}
                value={filtros.formato}
                onChange={(formato) => {
                    handleChange({formato})
                }}
                containerStyle={{marginBottom: 25}}
                snap="40%"
            />
            <InputSelect
                label={"Status da obra"}
                placeholder="Selecione"
                options={obraStatus}
                value={filtros.status}
                onChange={(status) => {
                    handleChange({status})
                }}
                containerStyle={{marginBottom: 25}}
                snap="40%"
            />
            <InputSelect
                label={"Site"}
                placeholder="Selecione"
                options={sites}
                value={filtros.site}
                onChange={(site) => {
                    handleChange({site})
                }}
                containerStyle={{marginBottom: 25}}
            />
            <InputSelect
                label={"Tags"}
                placeholder="Selecione"
                options={tags}
                value={filtros.tags}
                isMulti
                onChange={(tags) => {
                    handleChange({tags})
                }}
                containerStyle={{marginBottom: 25}}
            />
            
            <TouchableOpacity 
                style={{ flexDirection: 'row' , alignItems: 'center', gap: 8}}
                onPress={() => {
                    handleChange({temPaginas : !filtros.temPaginas})
                }}
            >
                <Checkbox 
                    status={
                        filtros.temPaginas ? 
                        'checked' : 'unchecked'
                    } 
                    color={defaultColors.activeColor}
                    
                />
                <Text style={{color: '#fff'}}>
                    Leitura disponível
                </Text>
                    
            </TouchableOpacity>
           
            <CustomButton 
                mode="contained"
                style={{
                    marginTop: 40, 
                    height: 50,
                    justifyContent: 'center',
                }}
                onPress={() => {
                    navigation.navigate("home", { filtros })
               
                }}
            >
                Filtrar
            </CustomButton>
            <CustomButton 
                mode="outlined"
                style={{
                    marginTop: 10, 
                    height: 50,
                    justifyContent: 'center',
                    borderWidth: 0,
                    
                }}
                onPress={() => {
                    setFiltros({ string: "", tags: [], site: "", formato: "", status: "", temPaginas: false })
                }}

            >
                <Text style={{color : '#fff', fontSize: 12}}>
                    Limpar filtros
                </Text>
            </CustomButton>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    view: {
      padding: 20,
      height : height - 60
    },
    tags: {
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        height: 50
    },
    tag: {
     marginRight: 10,
     height: 50
    },
});