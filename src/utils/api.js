
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Snackbar from 'react-native-snackbar';
import { production } from './index'
import { navigationRef } from '../../App';
import { CommonActions } from '@react-navigation/native';
import * as Sentry from "@sentry/react-native";

// const apiUrl = production ? "https://api.nerdola.com.br/" : "http://192.168.1.14:3000/"
const apiUrl = production ? "https://api.nerdola.com.br/" : "http://192.168.1.100:3000/"

const api = axios.create({
    baseURL: apiUrl,
    headers: { 'Content-Type': 'application/json' },
});

api?.interceptors?.request.use(async function (config) {
    const token =  await AsyncStorage.getItem('token')
    config.headers['Authorization'] = `Bearer ${token || 'empty'}`;
    Sentry.setContext("Resquest", { request : JSON.stringify(config.data) });
    return config;
  }, function (error) {
      console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

api?.interceptors?.response.use(function (response) {
    let { data , headers }  = response
    Sentry.setContext("Response ", { response: JSON.stringify(data)});
    return response;    
}, async function (error) {
    let data  = error?.response?.data
    let status = error?.response?.status

    Sentry.setContext("Response Error", { response: JSON.stringify(error?.response?.data)});

    if (status == 401) {
        const currentRoute = navigationRef?.current?.getCurrentRoute();
        const currentRouteName = currentRoute?.name;
    
        if (currentRouteName !== 'login' && currentRouteName !== 'cadastro') {
            navigationRef?.current.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [
                        { name: 'login' },
                    ],
                })
            );
            await AsyncStorage.removeItem('token');
        }
    }
    if(status != 401){
        Snackbar.show({
            text: data?.message || 'Erro inesperado tente novamente!',
            duration: 3000,
            action: {
              text: 'OK',
              textColor: 'white',
              onPress: () => { /* Do something. */ },
            },
        });
    }
   
    return Promise.reject(error);
});

export default api