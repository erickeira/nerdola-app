import React, { useEffect } from 'react';
import { TouchableOpacity, StatusBar } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();
import { navigationRef  } from '../../../App'
import { defaultStyles } from '../../utils';

import { useRoute } from '@react-navigation/native';
import PedidosPage from '../../pages/pedidos';

const PedidosStack = ({ navigation }) => {
  const currentRouteName = navigationRef?.current?.getCurrentRoute().name;
  const route = useRoute()
  const fullScreens = ["pedido"]
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: fullScreens.includes(currentRouteName) ? 'none' : 'block' }
    })
  },[ route ])
  
  return ( 
  <Stack.Navigator >
      <Stack.Screen 
        name="perfil" 
        component={PedidosPage} 
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

    </Stack.Navigator>
  )
}


export default PedidosStack;
