import React, {useContext, useEffect} from 'react';
import Tabs from './tabs';

import { createStackNavigator } from '@react-navigation/stack';



import LoginPage from '../pages/login';
import CadastroPage from '../pages/cadastros';
import { defaultColors, defaultHeaderProps } from '../utils';
import ObraPage from '../pages/obra';

const Stack = createStackNavigator();
export default function Routes() {
    return(
        <Stack.Navigator screenOptions={{tabBarActiveTintColor: 'blue',labelStyle: {fontSize: 12}}} >
            <Stack.Screen 
                name="login" 
                component={LoginPage} 
                options={{  headerShown: false }}
            />
            <Stack.Screen 
                name="cadastro"  
                component={CadastroPage} 
                options={{  
                    headerTitle: "Crie sua conta!",
                    ...defaultHeaderProps
                }}
            />
            <Stack.Screen 
                name="tabs" 
                component={Tabs} 
                options={{  headerShown: false }}
            />
            <Stack.Screen 
                name="obra"  
                component={ObraPage} 
                options={{  
                    headerTransparent: true,
                    headerTitle: '',
                    headerTintColor: '#fff',
                }}
            />
        </Stack.Navigator>
    )
}