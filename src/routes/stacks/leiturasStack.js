import React, { createContext, useContext, useEffect, useState } from 'react';
import { TouchableOpacity, StatusBar, Linking, Image, View, Text} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();
import { navigationRef  } from '../../../App'
import { defaultStyles } from '../../utils';


import FiltrarPage from '../../pages/filtrar';
import { useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import LeiturasPage from '../../pages/leituras';


export const useFiltrar = () => useContext(FiltrarContext);

const LeiturasStack = ({ navigation }) => {

  return ( 
      <Stack.Navigator >
        <Stack.Screen 
          name="leituras" 
          component={LeiturasPage} 
          options={{
            headerTitle:  "Suas leituras",
            headerTitleAlign: 'left',
            headerLeft: () => null,
            headerShown: true, 
            // headerTransparent: true,
            headerStyle: defaultStyles.defaultHeaderStyles,
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
  
  )
}


export default LeiturasStack;
