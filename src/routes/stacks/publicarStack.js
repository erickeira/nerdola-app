import React, { useEffect } from 'react';
import { TouchableOpacity, StatusBar, Linking, Image } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();
import { navigationRef  } from '../../../App'
import { defaultStyles } from '../../utils';

import { useRoute } from '@react-navigation/native';
import PublicacoesPage from '../../pages/publicacoes';
import ComentariosPage from '../../pages/comentarios';
import PublicarPage from '../../pages/publicar';

const PublicarStack = ({ navigation }) => {
  const currentRouteName = navigationRef?.current?.getCurrentRoute().name;
  const route = useRoute()
  const fullScreens = ["publicar"]
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: fullScreens.includes(currentRouteName) ? 'none' : 'block' }
    })
  },[ route ])
  
  return ( 
  <Stack.Navigator >
      <Stack.Screen 
        name="publicar" 
        component={PublicarPage} 
        options={{
          headerTitle:  "Publicar",
          headerTitleAlign: 'left',
          headerLeft: () => null,
          headerRight: ()  => null,
          headerShown: true, 
          // headerTransparent: true,
          headerStyle: defaultStyles.defaultHeaderStyles,
          headerTintColor: '#fff'      
        }}
      />
    </Stack.Navigator>
  )
}


export default PublicarStack;
