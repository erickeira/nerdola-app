import React, { createContext, useContext, useEffect, useState } from 'react';
import { TouchableOpacity, StatusBar, Linking, Image } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();
import { navigationRef  } from '../../../App'
import { defaultStyles } from '../../utils';


import HomePage from '../../pages/home';
import FiltrarPage from '../../pages/filtrar';
import { useRoute } from '@react-navigation/native';


export const useFiltrar = () => useContext(FiltrarContext);

const HomeStack = ({ navigation }) => {
  const currentRouteName = navigationRef?.current?.getCurrentRoute().name;
  const route = useRoute()
  const fullScreens = ["Busca"]
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: fullScreens.includes(currentRouteName) ? 'none' : 'block' }
    })
  },[ route ])
  
  return ( 
      <Stack.Navigator >
        <Stack.Screen 
          name="home" 
          component={HomePage} 
          options={{
            headerTitle:  "Explorar obras",
            headerTitleAlign: 'left',
            headerLeft: () => null,
            headerShown: true, 
            // headerTransparent: true,
            headerStyle: defaultStyles.defaultHeaderStyles,
            headerTintColor: '#fff'      
          }}
        />
        <Stack.Screen 
          name="filtrar" 
          component={FiltrarPage} 
          options={{
            headerTitle:  "Filtrar obras",
            headerTitleAlign: 'left',
            headerShown: true, 
            // headerTransparent: true,
            headerStyle: defaultStyles.defaultHeaderStyles,
            headerTintColor: '#fff'      
          }}
        />

      </Stack.Navigator>
  
  )
}


export default HomeStack;
