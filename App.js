import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, Platform,Modal, SafeAreaView,View, Image, Dimensions,Text, TextInput,Linking, AppState, ActivityIndicator } from 'react-native';
import Routes from './src/routes'
import {  NavigationContainer, DefaultTheme  } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import codePush from "react-native-code-push";
import AuthProvider from './src/context/AuthContext'
import { defaultColors } from './src/utils';

const height = Dimensions.get('screen').height;

if (Text.defaultProps == null) {
    Text.defaultProps = {};
    Text.defaultProps.allowFontScaling = false;
}

if (TextInput.defaultProps == null) {
    TextInput.defaultProps = {};
    TextInput.defaultProps.allowFontScaling = false;
}

export const navigationRef = React.createRef();

function App() {
    const [ connectionOff, setConnectionOff ] = useState(false);
    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);
    const [navigationReady, setNavigationReady] = useState(false )
  
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (event) => {
            if(event == 'active') setAppStateVisible(event);
        });
        return () => {
            subscription.remove();
        };
    },[])
   
	useEffect(() => {
        if(Platform.OS == 'android') StatusBar.setBackgroundColor(defaultColors.primary, true);
        StatusBar.setBarStyle('light-content', true);
 
		const unsubscribe = NetInfo.addEventListener(state => {
			if (state.isConnected) {
				setConnectionOff(false);
			} else {
				setConnectionOff(true);
			}
		});       
        return () => unsubscribe();
	},[]);

    return (
        <NavigationContainer 
            ref={navigationRef} 
            theme={theme}
            onReady={() => {
                setTimeout(() => {
                    setNavigationReady(true)
                }, 50)
            }}
         >
            {
                !navigationReady || appStateVisible != 'active' ? 
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: defaultColors.primary
                    }}
                >
                    <ActivityIndicator size={50} color={"#fff"}/>
                </View>
                : 
                <AuthProvider>
                    <Routes/>
                </AuthProvider>
            }
           
        </NavigationContainer>
    )
    
}

const codePushOptions = {
    checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
    installMode: codePush.InstallMode.ON_NEXT_RESUME
};

// export default App;
export default codePush(codePushOptions)(App);

const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: defaultColors.primary,
      secondaryContainer: defaultColors.secundary,
    },
};