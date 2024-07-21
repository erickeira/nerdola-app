import { ActivityIndicator, View } from "react-native"
import { Button } from "react-native-paper"

export default function CustomButton({
    children,
    isLoading,
    ...others
}){
    return(
        <View>
            <Button {...others}>
                { 
                    isLoading?
                    <ActivityIndicator color="#fff"/>
                    :
                    children 
                }
            </Button>
        </View>
    )
}