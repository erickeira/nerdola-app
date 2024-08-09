import React, { useEffect } from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'


import { defaultColors } from '../utils';
import IconPerfilOutlined from '../../assets/icons/perfil-outlined.png';
import IconPerfilFilled from '../../assets/icons/perfil-filled.png';
import IconHomeOutlined from '../../assets/icons/home-outlined.png';
import IconHomeFilled from '../../assets/icons/home-filled.png';

import { Image, StyleSheet, View } from 'react-native';


import PerfilStack from './stacks/perfilStack';
import HomeStack from './stacks/homeStack';
import PedidosStack from './stacks/pedidosStack';
import { Icon } from 'react-native-paper';
import PublicacoesStack from './stacks/publicacoesStack';
import { navigationRef } from '../../App';
import { useRoute } from '@react-navigation/native';
import PublicarStack from './stacks/publicarStack';

import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

const Tab = createMaterialBottomTabNavigator();

const TabNavigation = ({ navigation }) =>{

    return(
      <BottomSheetModalProvider>
        <Tab.Navigator 
          screenOptions={{
            tabBarHideOnKeyboard: 'true',
            tabBarStyle: {
              borderTopColor: 'transparent',
              borderTopWidth: 0,
              elevation: 0 
            },
          }} 
          activeColor={"transparent"}
          inactiveColor='#adadad'
          activeIndicatorStyle={{
            backgroundColor: 'transparent'
          }}
          barStyle={{ 
            backgroundColor: defaultColors.primary 
          }}
          labeled={false}
          // shifting={true}
        >
              <Tab.Screen 
                name="PublicacoesTab"  
                component={ PublicacoesStack }   
                options={{ 
                  headerTitleStyle: { opacity: 0 }, 
                  headerShown: true, 
                  headerTransparent: true,
                  tabBarLabel: 'Publicações',
                  tabBarBadge: false,
                  tabBarIcon: ({focused, color}) => (  
                    <Icon 
                      source={"timeline-text"} 
                      size={25} 
                      color={focused? defaultColors.activeColor : "#666"}
                    />
                  )
                }}  
              />
              <Tab.Screen 
                name="HomeTab"  
                component={ HomeStack }   
                options={{ 
                  headerTitleStyle: { opacity: 0 }, 
                  headerShown: true, 
                  headerTransparent: true,
                  tabBarLabel: 'Início',
                  tabBarBadge: false,
                  tabBarIcon: ({focused, color}) => (  
                    <Icon 
                      source={"book"} 
                      size={25} 
                      color={focused? defaultColors.activeColor : "#666"}
                    />
                  )
                }}  
              />
              <Tab.Screen 
                name="PublicarTab"  
                component={ PublicarStack }   
                options={{ 
                  // headerTitleStyle: { opacity: 0 }, 
                  headerShown: true, 
                  // headerTransparent: true,
                  title: 'Publicar',
                  tabBarLabel: 'Publicar',
                  tabBarBadge: false,
                  tabBarIcon: ({focused, color}) => (  
                    <Icon 
                      source={"tooltip-plus-outline"} 
                      size={25} 
                      color={focused? defaultColors.activeColor : "#666"}
                    />
                  ),
                }}  
              />
              <Tab.Screen 
                name="Pedidos"  
                component={ PedidosStack }   
                options={{ 
                  headerTitleStyle: { opacity: 0 }, 
                  headerShown: true, 
                  headerTransparent: true,
                  tabBarLabel: 'Pedidos',
                  tabBarBadge: false,
                  tabBarIcon: ({focused, color}) => (  
                    <Icon 
                      source={"inbox"} 
                      size={25} 
                      color={focused? defaultColors.activeColor : "#666"}
                    />
                  ),
                }}  
              />
              <Tab.Screen 
                name="PerfilTab"  
                component={ PerfilStack }   
                options={{ 
                  headerTitleStyle: { opacity: 0 }, 
                  headerShown: true, 
                  headerTransparent: true,
                  tabBarLabel: 'Perfil',
                  tabBarBadge: false,
                  tabBarIcon: ({focused, color}) => (  
                    <Icon 
                      source={"account"} 
                      size={25} 
                      color={focused? defaultColors.activeColor : "#666"}
                    />
                  ),
                }}  
              />
        </Tab.Navigator>  
      </BottomSheetModalProvider>
    )
  } 

export default TabNavigation;

const styles = StyleSheet.create({
  icon:{
      objectFit: 'contain',
      width: 25,
      height: 25
  },
});

