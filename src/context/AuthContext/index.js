import React,{useState, createContext, useEffect, useRef, useContext} from "react";
import { ActivityIndicator, View } from "react-native";
import { defaultColors } from "../../utils";
import api from "../../utils/api";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';




export const AuthContext = createContext({})

export default function AuthProvider({children}){
    const navigation = useNavigation()
    const [ isLoadingCheckAuth, setLoadingCheckAuth] = useState(true)
    const [ usuario, setUsuario] = useState(null)
    const isAuthenticated = !!usuario

    const handleCheckAuth = async () => {
        setLoadingCheckAuth(true)
        try{
            await api.get('usuarios/me')
            // navigation.navigate('tabs')
            navigation.dispatch(
                CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'tabs' },
                ],
                })
            );
        }catch(error){
        } finally {
            setLoadingCheckAuth(false)
        }
    }

    useEffect(() => {
        handleCheckAuth()
    },[])

    return(
        <AuthContext.Provider 
            value={{
                handleCheckAuth,
                isAuthenticated,
                isLoadingCheckAuth
            }}
        >
            { children }
        </AuthContext.Provider>
    )
}


export const useAuth = () => useContext(AuthContext);