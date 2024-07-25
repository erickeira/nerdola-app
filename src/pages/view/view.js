import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const ViewPage = ({ route }) => {
  return (
        <WebView source={{ uri: route.params.url }} style={{ flex: 1 }} />
    )
}

export default ViewPage;