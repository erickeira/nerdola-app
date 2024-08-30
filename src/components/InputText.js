import React, { useEffect, useRef, useState,forwardRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaskInput, { Masks, createNumberMask } from 'react-native-mask-input';
import { Icon } from 'react-native-paper';
import { defaultColors } from '../utils';

const InputText = forwardRef(({
    label,
    placeholder,
    value,
    onChange,
    onStopType,
    mode = 'outlined',
    containerStyle,
    tipo,
    style,
    onPressIn,
    capitalize,
    height = 40,
    error,
    errorText,
    mb = 16,
    leftElement,
    rghtElement,
    maxWidth,
    numberOfLines,
    maxLength,
    clearEnable,
    ...others
}, ref) => {
  const [text, setText] = useState({ semMascara : value || "" });
  const [mostrarSenha, setMostrarSenha] = useState( tipo == `senha`)
  const textoRef = useRef();

  useEffect(() => {
    if(value != text) setText({ semMascara : value || "" })
  },[value])


  const handleChange = (comMascara, semMascara) => {
    setText({comMascara, semMascara})
    if(text && onChange) onChange(comMascara, semMascara)
  }

  useEffect(() => {
    const timeOut = setTimeout(() => {
      handleStopType()
    }, 1000);
    return () => clearTimeout(timeOut);
  }, [text]);

  const handleStopType = () => {
    if (onStopType) {
      onStopType(text.semMascara || '');
    }
  } 

  const mascara = {
    moeda:  Masks.BRL_CURRENCY,
    telefone   : () => {
      const telFixo = ["(",/\d/,/\d/,")"," ",/\d/,/\d/,/\d/,/\d/,"-",/\d/,/\d/,/\d/,/\d/,/\d/]
      if(others?.value?.length < 15){
        return telFixo   
      }
      return Masks.BRL_PHONE
    },
    number:  createNumberMask({
        delimiter: '',
        separator: '',
    }),
    cpfcnpj:  Masks.BRL_CPF_CNPJ,
    cep :     Masks.ZIP_CODE,
    cnpj:     Masks.BRL_CNPJ,
    cpf:      Masks.BRL_CPF,
    cartao :  Masks.CREDIT_CARD,
    data:     Masks.DATE_DDMMYYYY,
    datamesano: [/\d/,/\d/,"/",/\d/,/\d/],
    metro: createNumberMask({
        delimiter: '.',
        separator: ',',
        precision: 2,
    })
  }


  const verificaTeclado = () => {
    tiposNumberPad = ['moeda', `telefone`,`number`,`metro`, `cpf`,`data`,`cep`,`cnpj`,`cartao`,`cvv`,`cvv2`]
    if(tiposNumberPad.includes(tipo)){
      return `number-pad`
    }
    if(tipo == `email`){
      return `email-address`
    }
    return `default`
  }

  return (
    <View 
      style={{
        marginBottom: error ? 25: mb, 
        maxWidth: maxWidth || '100%', 
      }}>
        { !!label && <Text style={styles.label}>{label}</Text> }
        <View
            style={{...styles.view, ...containerStyle, ... {
                height: tipo != 'area' ?  height + 5 : null,
                maxHeight: 250,
                borderColor: error ? "#DB4C4C" : '#312E2E'
            }}}
        >
            {leftElement}
            <MaskInput
                placeholder={placeholder}
                onPressIn={() => {
                    if(onPressIn) onPressIn()
                }}
                mask={mascara[tipo?.toLowerCase()]}
                ref={ref || textoRef}
                onChangeText={(comMascara, semMascara) => handleChange(comMascara, semMascara)}
                value={text.semMascara}
                placeholderTextColor='#666'
                style={[styles.campoTexto, style, {
                    height : tipo != 'area' ?  height : null,
                    minHeight: height || (tipo == 'area' ? 80 : '40'),
                    // maxHeight: 130
                }]}
                secureTextEntry={mostrarSenha}
                // autoCorrect={false}
                autoCapitalize={capitalize || ( tipo == `area` ? `sentences` : `none`)}
                multiline={tipo == 'area' ? true : false}
                keyboardType={verificaTeclado()}
                numberOfLines={numberOfLines || 1}
                maxLength={maxLength}
            />
            {rghtElement}
            {
              clearEnable && text?.semMascara?.length> 0 && 
              <TouchableOpacity 
                    onPress={() => onStopType("")} 
                    style={{
                        position: 'absolute', 
                        height: '100%',
                        justifyContent:'center',
                        right: 25,
                    }}
                    hitSlop={{
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }}
                >
                    <Icon
                        source= { 'close'}
                        color={"#fff"}
                        size={20}
                    />
                </TouchableOpacity>
            }
            {
                tipo == `senha` && 
                <TouchableOpacity 
                    onPress={() => setMostrarSenha(!mostrarSenha)} 
                    style={{
                        position: 'absolute', 
                        height: '100%',
                        justifyContent:'center',
                        right: 25,
                    }}
                    hitSlop={{
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }}
                >
                    <Icon
                        source= { mostrarSenha ? 'eye-off' : 'eye'}
                        color={"#fff"}
                        size={25}
                    />
                </TouchableOpacity>
            }
        </View>
        {
          !!error && !!errorText && (
            <Text style={styles.errorText}>
              {errorText}
            </Text>
          )
        }
    </View>
  );
});

export default InputText;

const styles = StyleSheet.create({
    view: {
        padding: 3,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 5
    },
    label:{
      fontSize: 13,
      color: defaultColors.gray,
      marginBottom: 8
    },
    campoTexto: {
      width: '100%',
      color: '#fff'
    },
    errorText: {
      position: 'absolute',
      bottom: -18,
      fontSize: 12,
      color: '#DB4C4C'
    }
});