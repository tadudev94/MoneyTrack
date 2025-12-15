import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { DatabaseProvider } from './src/contexts/DatabaseContext';
import { MenuProvider } from 'react-native-popup-menu';
import Toast from 'react-native-toast-message';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import RootStack from './src/navigation/RootStack';
import SettingsScreen from './src/screens/SettingScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FundScreen from './src/screens/FundScreen/FundScreen';
import TransactionScreen from './src/screens/TransactionScreen/TransactionScreen';
import TagScreen from './src/screens/TagScreen/TagScreen';
import DeptDetailScreen from './src/screens/DeptDetailScreen/DeptDetailScreen';
import ExpensePlanScreen from './src/screens/ExpensePlanScreen/ExpensePlanScreen';
import ConfigScreen from './src/screens/ConfigScreen/ConfigScreen';
import FundDetailScreen from './src/screens/FundDetailScreen/FundDetailScreen';
import IncomeFilterScreen from './src/screens/TransactionScreen/IncomeFilterScreen';
import SnapshotScreen from './src/screens/SnapshotScreen/SnapshotScreen'
import DeptScreen from './src/screens/DeptScreen/DeptScreen'
import SnapshotDetailScreen from './src/screens/SnapshotScreen/SnapshotDetailScreen'
import ReportScreen from './src/screens/ReportScreen/ReportScreen';
import { AlertProvider } from './src/providers/Alert';
import './src/locales/index'; // phải init trước
import React, { useEffect } from 'react';
import { useGroupStore } from './src/store/groupStore';
import MemberSettingsScreen from './src/screens/MemberScreen/MemberSettingsScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createChannel, scheduleDaily, checkExactAlarmPermission} from './src/services/notification.service'

const Tab = createBottomTabNavigator();
const RootStackNavigator = createStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white', // fix nền toàn app
    surface: 'white', // fix nền TextInput, Card
    text: 'red', // fix chữ
    primary: '#2ea88eff', // màu chính app
    placeholder: '#82ada4ff', // màu placeholder
  },
};

function RootNavigator() {
  return (
    <RootStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <RootStackNavigator.Screen name="MainTabs" component={MainTabs} />
      <RootStackNavigator.Screen
        name="FundDetail"
        component={FundDetailScreen}
      />
      <RootStackNavigator.Screen name="Config" component={ConfigScreen} />
      <RootStackNavigator.Screen
        name="MemberSettings"
        component={MemberSettingsScreen}
      />
      <RootStackNavigator.Screen
        name="IncomeFilter"
        component={IncomeFilterScreen}
      />
      <RootStackNavigator.Screen
        name="SnapshotDetail"
        component={SnapshotDetailScreen}
      />
      <RootStackNavigator.Screen
        name="Tag"
        component={TagScreen}
      />
      <RootStackNavigator.Screen
        name="ExpensePlan"
        component={ExpensePlanScreen}
      />
      <RootStackNavigator.Screen
        name="ExpensePlanDetail"
        component={TransactionScreen}
      />
      <RootStackNavigator.Screen
        name="Dept"
        component={DeptScreen}
      />
      <RootStackNavigator.Screen
        name="DeptDetail"
        component={DeptDetailScreen}
      />
      <RootStackNavigator.Screen name="Report" component={ReportScreen} />
    </RootStackNavigator.Navigator>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={RootStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
          title: t('tab_home'),
        }}
      />
      <Tab.Screen
        name="Fund"
        component={FundScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="wallet" color={color} size={size} />
          ),
          title: t('tab_funds'),
        }}
      />
      <Tab.Screen
        name="Income"
        component={TransactionScreen}
        initialParams={{ typeInput: 'income' }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cash-plus" color={color} size={size} />
          ),
          title: t('tab_income'),
        }}
      />
      <Tab.Screen
        name="Expense"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cash-minus" color={color} size={size} />
          ),
          title: t('tab_expense'),
        }}
        component={TransactionScreen}
        initialParams={{ typeInput: 'expense' }}
      />
      <Tab.Screen
        name="Member"
        component={SnapshotScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="camera-plus" color={color} size={size} />
          ),
          title: t('tab_member'),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    checkExactAlarmPermission();
    createChannel();

    // ví dụ: đổi từ 10h sang 12h
    scheduleDaily(13, 1);
  }, []);

  return (
    <DatabaseProvider>
      <PaperProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <MenuProvider>
              <AlertProvider>
                <NavigationContainer>
                  <RootNavigator />
                  <Toast />
                </NavigationContainer>
              </AlertProvider>
            </MenuProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PaperProvider>
    </DatabaseProvider>
  );
}
