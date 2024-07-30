import React, {useContext, useEffect} from 'react';
import Tabs from './tabs';

import { createStackNavigator } from '@react-navigation/stack';



import LoginPage from '../pages/login';
import CadastroPage from '../pages/cadastros';
import { defaultColors, defaultHeaderProps, defaultStyles } from '../utils';
import ObraPage from '../pages/obra';
import CapituloPage from '../pages/capitulo';
import ViewPage from '../pages/view/view';
import ComentariosPage from '../pages/comentarios';
import PublicacoesPage from '../pages/publicacoes';
import PublicacoesStack from './stacks/publicacoesStack';
import PublicarStack from './stacks/publicarStack';
import PublicarPage from '../pages/publicar';
import PerfilPage from '../pages/perfil';
import SeguidoresPage from '../pages/seguidores';

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
            <Stack.Screen 
                name="capitulo"  
                component={CapituloPage} 
                options={{  
                    headerTransparent: true,
                    headerTitle: '',
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen 
                name="view"  
                component={ViewPage} 
                options={{  
                    headerTitle: '',
                    headerTintColor: '#fff',
                    headerBackgroundContainerStyle:{
                        backgroundColor: defaultColors.primary
                    }
                }}
            />
            <Stack.Screen 
                name="comentarios" 
                component={ComentariosPage} 
                options={{
                headerTitle:  "Comentários",
                headerTitleAlign: 'left',
                headerRight: ()  => null,
                headerShown: true, 
                // headerTransparent: true,
                headerStyle: defaultStyles.defaultHeaderStyles,
                headerTintColor: '#fff'      
                }}
            />
            <Stack.Screen 
                name="publicar" 
                component={PublicarPage} 
                options={{
                headerTitle:  "Publicar",
                headerTitleAlign: 'left',
                // headerRight: ()  => null,
                headerShown: true, 
                // headerTransparent: true,
                headerStyle: defaultStyles.defaultHeaderStyles,
                headerTintColor: '#fff'      
                }}
            />
            <Stack.Screen 
                name="verperfil" 
                component={PerfilPage} 
                options={{
                headerTitle:  "",
                headerTitleAlign: 'left',
                // headerRight: ()  => null,
                headerShown: true, 
                // headerTransparent: true,
                headerStyle: defaultStyles.defaultHeaderStyles,
                headerTintColor: '#fff'      
                }}
            />
            <Stack.Screen 
                name="seguidores" 
                component={SeguidoresPage} 
                options={{
                headerTitle: "Seguidores",
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