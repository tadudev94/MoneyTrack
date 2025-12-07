import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoadingScreen from '../screens/LoadingScreen';
import SetupGroupScreen from '../screens/SetupGroupScreen';
import HomeStack from './HomeStack';

const Stack = createNativeStackNavigator();

const RootStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Loading" component={LoadingScreen} />
    <Stack.Screen
      name="SetupGroup"
      component={SetupGroupScreen}
      options={{ title: 'Tạo nhóm' }}
    />
    <Stack.Screen name="HomeStack" component={HomeStack} />
   
  </Stack.Navigator>
);

export default RootStack;
