import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { defaultColors } from '../utils';
import Skeleton from './Skeleton';
const { height, width }  = Dimensions.get('screen');

export default function CardObraSkeleton(){

    return (
        <View style={styles.container}>
          <Skeleton
            style={{
                width:  100,
                height: ((100) * (4.3 / 3)),   
            }} 
           />
           <View>
                <Skeleton style={{ height: 10, width: 60}}/>
                <Skeleton style={{ height: 20, width: 180}}/>
                <Skeleton style={{ height: 10, width: 100}}/>
           </View>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        padding: 10,
        borderRadius: 8,
        marginVertical: 8,
        flexDirection: 'row', 
        gap: 5
      },
      skeleton: {
        backgroundColor: defaultColors.gray,
        borderRadius: 4,
        marginBottom: 10,
      },
      line: {
        height: 20,
      },
      shortLine: {
        height: 20,
        width: '60%',
      },
    });