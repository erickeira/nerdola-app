import React, { useEffect } from 'react';
import { TouchableOpacity, StatusBar, Linking, Image, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();
import { navigationRef  } from '../../../App'
import { defaultStyles } from '../../utils';

import { useRoute } from '@react-navigation/native';
import PublicacoesPage from '../../pages/publicacoes';
import ComentariosPage from '../../pages/comentarios';
import { Icon } from 'react-native-paper';

import Discord from '../../../assets/discord.png'

const PublicacoesStack = ({ navigation }) => {
  const currentRouteName = navigationRef?.current?.getCurrentRoute().name;
  const route = useRoute()
  const fullScreens = ["comentarios"]
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: fullScreens.includes(currentRouteName) ? 'none' : 'block' }
    })
  },[ route ])
  
  return ( 
  <Stack.Navigator >
      <Stack.Screen 
        name="publicacoes" 
        component={PublicacoesPage} 
        options={{
          headerTitle:  "Feed",
          headerTitleAlign: 'left',
          headerLeft: () => null,
          headerRight: ()  =>  (
            <View style={{flexDirection: 'row' , alignItems: 'center', gap: 20, marginRight: 30}}>
              <TouchableOpacity
                
                onPress={() => {
                  navigation.navigate('usuarios')
                }}
              >
                <Icon source="account-search-outline" color='#fff' size={25}/>
              </TouchableOpacity>
              {/* <TouchableOpacity 
                  onPress={async () => {
                    await Linking.openURL("https://discord.gg/4ErYfkvQPD");
                  }} 
                  hitSlop={{left: 20, bottom: 20}} 
              >
                  <Image
                  style={{
                      width: 40,
                      height: 30,
                      objectFit: 'cover'
                  }}
                  source={Discord}
                  />
              </TouchableOpacity> */}
            </View>
           
          ),
          headerShown: true, 
          // headerTransparent: true,
          headerStyle: defaultStyles.defaultHeaderStyles,
          headerTintColor: '#fff'      
        }}
      />
    </Stack.Navigator>
  )
}


export default PublicacoesStack;
