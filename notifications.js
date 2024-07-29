import React, { useContext, createRef } from 'react';
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { navigationRef } from './App';

// export const navigationRef = createRef();

export function navigate(name, params) {
    navigationRef?.current?.navigate(name, params);
    
}

export function setParams(params) {
    navigationRef?.current?.setParams(params);
}

export async function onClickMensagem(mensagem){
    if(mensagem?.data?.rota){
        const rota = mensagem?.data?.rota;
        const params = mensagem?.data?.params? JSON.parse(mensagem?.data?.params) : {}
        console.log('params', params)
        navigate(rota, { ...params})
    }

}
export const onMessageReceived = async (mensagemRemota, lida = 0) => {
    console.log('mensagemRemota', mensagemRemota)
}

const ConfigurandoNotificacoes = () => {
    messaging()
        .onMessage(async (mensagemRemota) => {
            onMessageReceived(mensagemRemota)
        } );
    messaging()
        .onNotificationOpenedApp((mensagemRemota) => {
            onMessageReceived(mensagemRemota, 1)
            onClickMensagem(mensagemRemota)
        });
}

export async function getMensagemInicial(){
    messaging()
    .getInitialNotification().then(async (mensagemRemota) => {
        onMessageReceived(mensagemRemota, 1)
        onClickMensagem(mensagemRemota)
    });
}

ConfigurandoNotificacoes()


