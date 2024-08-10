import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { defaultColors } from '../utils';
import Skeleton from './Skeleton';
const { height, width }  = Dimensions.get('screen');

export default function CardPublicacaoSkeleton(){

    return (
        <View style={styles.container}>
          <Skeleton
            style={{
                width:  30,
                height: 30,  
                borderRadius: 100 
            }} 
           />
           <View style={{width: '90%'}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View>
                <Skeleton style={{ height: 20, width: 180}}/>
                <Skeleton style={{ height: 10, width: 80}}/>
                
              </View>
              <Skeleton style={{ height: 10, width: 80}}/>
            </View>
            <Skeleton style={{ height: 120, width: '95%'}}/>
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