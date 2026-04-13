import { Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

if (Platform.OS === 'web') {
	require('core-js/stable');
	require('regenerator-runtime/runtime');
}

registerRootComponent(App);
