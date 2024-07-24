import React from 'react';
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

const Tab = createMaterialBottomTabNavigator();

const TabNavigation = ({ navigation }) =>{
    return(
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
          name="HomeTab"  
          component={ HomeStack }   
          options={{ 
            headerTitleStyle: { opacity: 0 }, 
            headerShown: true, 
            headerTransparent: true,
            tabBarLabel: 'Início',
            tabBarBadge: false,
            tabBarIcon: ({focused, color}) => (  
              focused? 
              <Image
                style={styles.icon}
                source={IconHomeFilled}
              />:
              <Image
                style={styles.icon}
                source={IconHomeOutlined}
              />
            )
          }}  
        />
        <Tab.Screen 
          name="Pedidos"  
          component={ PedidosStack }   
          options={{ 
            headerTitleStyle: { opacity: 0 }, 
            headerShown: true, 
            headerTransparent: true,
            tabBarLabel: 'Início',
            tabBarBadge: false,
            tabBarIcon: ({focused, color}) => (  
              focused? 
              <Image
                style={styles.icon}
                source={IconPerfilFilled}
              />:
              <Image
                style={styles.icon}
                source={IconPerfilOutlined}
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
            tabBarLabel: 'Início',
            tabBarBadge: false,
            tabBarIcon: ({focused, color}) => (  
              focused? 
              <Image
                style={styles.icon}
                source={IconPerfilFilled}
              />:
              <Image
                style={styles.icon}
                source={IconPerfilOutlined}
              />
            ),
          }}  
        />
      </Tab.Navigator>  
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

