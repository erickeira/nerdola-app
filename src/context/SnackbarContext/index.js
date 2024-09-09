import React,{useState, createContext, useEffect, useRef, useContext} from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Snackbar } from "react-native-paper";
// import { Snackbar } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

const { height, width }  = Dimensions.get('screen');

export const SnackbarContext = createContext({})

console.log(SnackbarContext)

export default function SnackbarProvider({children}){
    const [visible, setVisible] = useState(false);
    const [conteudo, setConteudo] = useState("teste")
    const [acao, setAcao] = useState(null)
    const [duracao, setDuracao] = useState(1500)
  
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

    useEffect(() => {
        if(duracao && visible){
            setTimeout(() => {
                onDismiss()
            },duracao)
        }
    },[visible])

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [visible]);

    return(
        <SnackbarContext.Provider 
            value={{show}}
        >
            { children }          
            <Animated.View 
                style={[
                    styles.view,
                    {
                        opacity: fadeAnim,
                        pointerEvents: visible ? 'auto' : 'none',
                    },
                ]}
                
            >
                <TouchableOpacity
                    onPress={onDismiss}
                >
                    {
                        typeof conteudo == 'string' ? 
                        <Text style={styles.text}>
                            {conteudo}
                        </Text>
                        :
                        conteudo
                    }
                </TouchableOpacity>
               
            </Animated.View>
        </SnackbarContext.Provider>
    )
}


export const useSnackbar = () => useContext(SnackbarContext);

const styles = StyleSheet.create({
    view: {
      width: width - 20,
      position: 'absolute',
      bottom: 10,
      paddingVertical: 12,
      paddingHorizontal: 10,
    //   backgroundColor: 'rgba(0,0,0,0.9)',
      opacity: 0.8,
      backgroundColor: '#000',
      borderRadius: 5,
      marginHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    text:{
        color: '#fff',
        fontSize: 14
    }
});