import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { defaultColors } from '../utils';

export default function Chip({ 
    label, 
    value,
    onPress, 
    style, 
    textStyle, 
    icon,
    isSelected,
    children
}){

    return (
        <TouchableOpacity 
            onPress={() => {
                if(onPress) onPress(value)
            }} 
            style={[styles.view,  {
                backgroundColor : isSelected ? '#fff': 'transparent',
            },style]}
        >
            {
                children ||
               (!!label &&
                <Text style={[styles.label, textStyle, {
                    color:  isSelected ? defaultColors.primary: '#ffff',
                }]}>
                    {label}
                </Text>)
            }
          
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    view: {
      borderColor: '#312E2E',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
      borderWidth: 0.3,
      paddingHorizontal: 20,
      paddingVertical: 13,
      borderRadius: 5,
      marginVertical: 10,
      marginRight: 8,
    },
    label:{
        color: '#fff',
        fontSize: 12
    }
});