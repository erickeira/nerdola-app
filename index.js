/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import 'react-native-gesture-handler';

import { onMessageReceived } from './notifications.js';
import messaging from "@react-native-firebase/messaging";

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    onMessageReceived(remoteMessage)
})


AppRegistry.registerComponent(appName, () => App);
