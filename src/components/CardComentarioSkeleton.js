import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { defaultColors } from '../utils';
import Skeleton from './Skeleton';
const { height, width }  = Dimensions.get('screen');

export default function CardComentarioSkeleton(){

    return (
        <View style={styles.container}>
          <Skeleton
            style={{
                width:  30,
                height: 30,  
                borderRadius: 100,
                backgroundColor : '#666'
            }} 
           />
           <View style={{width: '90%'}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View>
                <Skeleton style={{ height: 20, width: 180, backgroundColor : '#666'}}/>
              </View>
              <Skeleton style={{ height: 10, width: 80, backgroundColor : '#666'}}/>
            </View>
            <Skeleton style={{ height: 50, width: '95%', backgroundColor : '#666'}}/>
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
        gap: 5,
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