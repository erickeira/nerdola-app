import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { defaultColors } from '../utils';
const { height, width }  = Dimensions.get('screen');

export default function Skeleton({ style, ...props}){
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, [opacity]);

    return (
         <Animated.View 
            style={[styles.skeleton, styles.line, { opacity } , style]} 
            {...props}
         />

      );
    }
    
    const styles = StyleSheet.create({
      skeleton: {
        backgroundColor: "#191919",
        borderRadius: 4,
        marginBottom: 10,
      },
    });