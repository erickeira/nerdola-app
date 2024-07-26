/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { onMessageReceived } from './notifications.js';
// import messaging from "@react-native-firebase/messaging";
// import 'react-native-gesture-handler';


// messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//     onMessageReceived(remoteMessage)
// })


AppRegistry.registerComponent(appName, () => App);
