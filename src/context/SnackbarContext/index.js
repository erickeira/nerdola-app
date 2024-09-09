import React,{useState, createContext, useEffect, useRef, useContext} from "react";
import { View } from "react-native";
import { Snackbar } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const SnackbarContext = createContext({})

export default function SnackbarProvider({children}){
    const [visible, setVisible] = React.useState(false);
    const [conteudo, setConteudo] = useState(null)
    const [acao, setAcao] = useState(null)
    const [duracao, setDuracao] = useState(null)
  
    const show = async ({
        text,
        duration = null,
        action
    }) => {
        setConteudo(text)
        setAcao(action)
        setDuracao(duration)
        setVisible(true)
    }

    const onDismiss = () => {
        setAcao(null)
        setConteudo(null)
        setVisible(false)
        setDuracao(null)
    }

    return(
        <SnackbarContext.Provider 
            value={{show}}
        >
            <SafeAreaProvider>
                { children }
                <Snackbar
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.8)'
                    }}
                    visible={visible}
                    onDismiss={onDismiss}
                    duration={duracao || 1000}
                    action={{
                        label: !duracao && acao ? acao?.text : '',
                        onPress: acao?.onPress || (() => {
                            setVisible(false)
                        }),
                    }}>
                    {conteudo}
                </Snackbar>
            </SafeAreaProvider>
           
        </SnackbarContext.Provider>
    )
}


export const useSnackbar = () => useContext(SnackbarContext);