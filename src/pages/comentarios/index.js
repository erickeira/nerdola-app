import { useEffect, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Animated, RefreshControl } from "react-native";
import Comentarios from "../../components/Comentarios";
import { useNavigation } from "@react-navigation/native";

const { height, width }  = Dimensions.get('screen');

export default function ComentariosPage({ route }){
    const navigation = useNavigation()
    useEffect(() => {
        if(route?.params?.publicacao){
            navigation.setOptions({
                headerTitle: 'Comentários'
            })
        }
    },[])

    return(
        <>
            <Comentarios 
                publicacao={route?.params?.publicacao}
                capitulo={route?.params?.capitulo}
                comentario={route?.params?.comentario}
            />
        </>
    )
}
