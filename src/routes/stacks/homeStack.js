import React, { createContext, useContext, useEffect, useState } from 'react';
import { TouchableOpacity, StatusBar, Linking, Image, View, Text} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();
import { navigationRef  } from '../../../App'
import { defaultStyles } from '../../utils';


import HomePage from '../../pages/home';
import FiltrarPage from '../../pages/filtrar';
import { useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';


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
            headerTintColor: '#fff',
            // headerRight: ()  =>  (
            //   <View style={{flexDirection: 'row' , alignItems: 'center', gap: 20, marginRight: 30}}>
            //     <TouchableOpacity 
            //         onPress={async () => {
            //           await Linking.openURL("https://storage.nerdola.com.br/apks/nerdola.apk");
            //         }} 
            //         hitSlop={{left: 20, bottom: 20}} 
            //     >
            //         <Icon
            //           source="download"
            //           size={24}
            //         />
            //     </TouchableOpacity>
            //   </View>
            // ),      
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
