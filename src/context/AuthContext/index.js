import React,{useState, createContext, useEffect, useRef, useContext} from "react";
import { ActivityIndicator, View } from "react-native";
import { defaultColors } from "../../utils";
import api from "../../utils/api";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";




export const AuthContext = createContext({})

export default function AuthProvider({children}){
    const navigation = useNavigation()
    const [ isLoadingCheckAuth, setLoadingCheckAuth] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)

    const handleCheckAuth = async () => {
        setLoadingCheckAuth(true)
        try{
            const response = await api.get('usuarios/me')
            // navigation.navigate('tabs')
            navigation.dispatch(
                CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'tabs' },
                ],
                })
            );

            setUsuario(response.data)
            setAuthenticated(true)
        }catch(error){
        } finally {
            setLoadingCheckAuth(false)
        }
    }

    useEffect(() => {
        handleCheckAuth()
    },[])

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token')
        navigation.dispatch(
            CommonActions.reset({
            index: 1,
            routes: [
                { name: 'login' },
            ],
            })
        );
    }

    return(
        <AuthContext.Provider 
            value={{
                handleCheckAuth,
                handleLogout,
                isLoadingCheckAuth,
                setAuthenticated,
                authenticated
            }}
        >
            { children }
        </AuthContext.Provider>
    )
}


export const useAuth = () => useContext(AuthContext);