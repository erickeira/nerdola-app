import React,{useState, createContext, useEffect, useRef, useContext} from "react";
import { ActivityIndicator, View } from "react-native";
import { defaultColors } from "../../utils";
import api from "../../utils/api";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import  messaging  from "@react-native-firebase/messaging";
import Snackbar from 'react-native-snackbar';

export const NotificationContext = createContext({})

export default function NotificationProvider({children}){

    useEffect(() => {
        verificaToken()
    },[])

    async function verificaToken(){
        let enabled = await messaging().hasPermission()
        if(enabled != 1) {  
          const authorizationStatus = await messaging().requestPermission();
          if (authorizationStatus) verificaToken()
          return
        }
        let tokenNotificacao = ''
        if (enabled == 1) tokenNotificacao = await messaging().getToken()
        AsyncStorage.setItem(`push_token`, tokenNotificacao)
        console.log(tokenNotificacao)
      }

    return(
        <NotificationContext.Provider 
            value={{}}
        >
            { children }
        </NotificationContext.Provider>
    )
}


export const useNotification = () => useContext(NotificationContext);