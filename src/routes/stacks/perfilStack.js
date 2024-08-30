import React, { useEffect } from 'react';
import { TouchableOpacity, StatusBar } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();
import { navigationRef  } from '../../../App'
import { defaultStyles } from '../../utils';

import { useRoute } from '@react-navigation/native';
import PerfilPage from '../../pages/perfil';
import EditarPerfilPage from '../../pages/editar-perfil';
import SeguidoresPage from '../../pages/seguidores';
import MeuPerfilPage from '../../pages/meu-perfil';

const PerfilStack = ({ navigation }) => {
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
        name="meuperfil" 
        component={MeuPerfilPage} 
        options={{
          headerTitle:  "Perfil",
          headerTitleAlign: 'left',
          headerLeft: () => null,
          // headerRight: ()  => (
          //   <TouchableOpacity onPress={() => navigation.navigate('Busca')} hitSlop={{left: 20, bottom: 20}} style={{marginRight: 12}}>
          //     <Icon name="search" size={24}  color={"#fff"}/>
          //   </TouchableOpacity>
          // ),
          headerShown: true, 
          // headerTransparent: true,
          headerStyle: defaultStyles.defaultHeaderStyles,
          headerTintColor: '#fff'      
        }}
      />
      <Stack.Screen 
        name="editar-perfil" 
        component={EditarPerfilPage} 
        options={{
          headerTitle: "Editar Perfil",
          headerTitleAlign: 'left',
          // headerRight: ()  => (
          //   <TouchableOpacity onPress={() => navigation.navigate('Busca')} hitSlop={{left: 20, bottom: 20}} style={{marginRight: 12}}>
          //     <Icon name="search" size={24}  color={"#fff"}/>
          //   </TouchableOpacity>
          // ),
          headerShown: true, 
          // headerTransparent: true,
          headerStyle: defaultStyles.defaultHeaderStyles,
          headerTintColor: '#fff'      
        }}
      />
    </Stack.Navigator>
  )
}


export default PerfilStack;
