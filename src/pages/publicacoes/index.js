import { useEffect, useState } from "react";
import {  Dimensions, StyleSheet, View, Text, Image, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Animated, RefreshControl } from "react-native";
import Publicacoes from "../../components/Publicacoes";

const { height, width }  = Dimensions.get('screen');

export default function PublicacoesPage({ route }){


    return(
        <>
          <Publicacoes route={route}/>
        </>
    )
}