import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'


import { defaultColors } from '../utils';
import IconPerfilOutlined from '../../assets/icons/perfil-outlined.png';
import IconPerfilFilled from '../../assets/icons/perfil-filled.png';
import IconHomeOutlined from '../../assets/icons/home-outlined.png';
import IconHomeFilled from '../../assets/icons/home-filled.png';

import { Image, View } from 'react-native';


import PerfilStack from './stacks/perfilStack';
import HomeStack from './stacks/homeStack';

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
                source={IconHomeFilled}
              />:
              <Image
                source={IconHomeOutlined}
              />
            )
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
                source={IconPerfilFilled}
              />:
              <Image
                source={IconPerfilOutlined}
              />
            ),
          }}  
        />
      </Tab.Navigator>  
    )
  } 

export default TabNavigation;


