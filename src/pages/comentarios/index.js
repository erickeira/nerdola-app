import { useEffect, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Animated, RefreshControl } from "react-native";
import Comentarios from "../../components/Comentarios";

const { height, width }  = Dimensions.get('screen');

export default function ComentariosPage({ route }){

    return(
        <>
            <Comentarios route={route}/>
        </>
    )
}
