import { Dimensions, StyleSheet, Text, View, BackHandler  } from "react-native";

import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
    TouchableOpacity,
    BottomSheetFlatList 
  } from '@gorhom/bottom-sheet';
import { defaultColors } from "../utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Checkbox, Icon } from "react-native-paper";
  
const { height, width }  = Dimensions.get('screen');

export default function InputSelect({
    label,
    placeholder,
    value,
    options = [],
    isMulti,
    onChange,
    inputStyle,
    labelStyle,
    itemStyle,
    checkStyle,
    modalStyle,
    containerStyle,
    snap
}){
    const [inputValue, setInputValue] = useState(value)

    const handleChange = (newValue) => {
        setInputValue(newValue)
        if(onChange) onChange(newValue)
        if (!isMulti &&bottomSheetModalRef.current) {
            bottomSheetModalRef.current.dismiss();
        }
    }

    useEffect(() => {
        if(isMulti) {
            if(value?.length != inputValue?.length) setInputValue(value)
        }else{
            if(value != inputValue) setInputValue(value)
        }
    },[value])

    // ref
    const bottomSheetModalRef = useRef(null);

    // variables
    const snapPoints = useMemo(() => ['25%', (snap || '65%')], []);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index) => {
        // console.log('handleSheetChanges', index);
    }, []);

    const handleBackPress = () => {
        if (bottomSheetModalRef.current) {
            bottomSheetModalRef.current.dismiss();
            return true; 
        }
        return false;
    };

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", handleBackPress);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
        };
    }, []);

    const renderItem =  ({ item }) => (
        <TouchableOpacity 
            style={[styles.itemContainer, itemStyle]}
            onPress={() => {
                if(isMulti) {
                    let newValues = inputValue &&  Array.isArray(inputValue) ? [...inputValue] : [];
                    if (newValues.includes(item.id)) {
                        newValues = newValues.filter(v => v !== item.id);
                    } else {
                        newValues = [...newValues, item.id];
                    }
                    handleChange(newValues);
                }else{
                    handleChange(inputValue == item.id ? "" : item.id);
                }
                
            }}
        >
            <View style={{ flexDirection: 'row' , alignItems: 'center', gap: 8}}>
                { !!item.icon && item.icon}
                <Text style={{color: '#fff'}}>{item.nome}</Text>
            </View>
           
            <Checkbox 
                status={
                    inputValue == item.id || (Array.isArray(inputValue) && inputValue.includes(item.id)) ? 
                    'checked' : 'unchecked'
                } 
                style={checkStyle}
                color={defaultColors.activeColor}
            />
        </TouchableOpacity>
    )

    const selected = isMulti ? options.filter(opt => inputValue?.includes(opt.id)) : options.find(opt => inputValue == opt.id) 
    const getSelectedText = () => {
        if (!isMulti) {
            return selected?.nome || '';
        }
        const names = selected.map(opt => opt.nome);
        const totalLength = names.reduce((acc, name) => acc + name.length, 0);
        const maxLength = 23; // Maximum length before truncating

        if (totalLength > maxLength) {
            let truncatedText = '';
            let currentLength = 0;
            for (let i = 0; i < names.length; i++) {
                if (currentLength + names[i].length <= maxLength) {
                    truncatedText += `${names[i]}, `;
                    currentLength += names[i].length;
                } else {
                    return `${truncatedText.trimEnd()} mais ${names.length - i} `;
                }
            }
        }
        return names.join(', ');
    };
    return(
        <View style={[styles.view, containerStyle]}>
            {
                !!label &&
                <Text style={[styles.label, labelStyle]}>
                    {label}
                </Text>
            }
            <TouchableOpacity onPress={handlePresentModalPress} style={[styles.input,inputStyle]} >
                <View style={styles.inputItems}>
                    {
                        ( isMulti ? !inputValue?.length > 0  : !inputValue) ?
                        <Text>
                            { placeholder }
                        </Text>
                        :(
                            
                            <Text 
                                style={styles.selected}
                                numberOfLines={1}
                                // ellipsizeMode="tail"
                            >
                                { getSelectedText()}
                            </Text>
                        )                    
                    }
                </View>
                <View style={{flexDirection: 'row' , gap : 20}}>
                    {
                        ( isMulti ? inputValue?.length > 0  : !!inputValue) &&
                        <TouchableOpacity
                            onPress={() => {
                                handleChange(isMulti ? [] : "")
                            }}
                            hitSlop={{
                                left: 10,
                                top: 8,
                                bottom: 8
                            }}
                        >
                            <Icon source="close" size={18}/>
                        </TouchableOpacity>
                    }
                    <Icon source="chevron-down" size={18}/>
                </View>
              
            </TouchableOpacity>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                backgroundStyle={[styles.modalContainer, modalStyle]}
                handleIndicatorStyle={{
                    backgroundColor: defaultColors.gray
                }}
            >
                <BottomSheetFlatList
                    data={options}
                    keyExtractor={(i) => i.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.contentContainer}
                />
            </BottomSheetModal>
        </View>
    )
}
const styles = StyleSheet.create({
    view: {
      marginBottom: 10
    },
    label:{
        fontSize: 13,
        color: defaultColors.gray,
        marginBottom: 8
    },
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: 'grey',
    },
    input:{
        backgroundColor: '#191919',
        borderWidth: 0,
        width: "100%",
        minHeight: 50,
        borderRadius: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    inputItems:{
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        width: '80%'
    },
    itemContainer: {
        padding: 6,
        paddingHorizontal: 20,
        margin: 6,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    modalContainer:{
        backgroundColor: '#191919'
    },
    selected:{
        width: '93%',
        color: '#fff' 
    }
});