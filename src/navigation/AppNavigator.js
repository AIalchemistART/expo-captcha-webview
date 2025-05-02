import React from 'react';
import { Text, View } from 'react-native';
import RoyalPurpleNavBarBackground from '../components/RoyalPurpleNavBarBackground';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OpulentBackArrow from '../components/OpulentBackArrow';
import HomeScreen from '../screens/HomeScreen';
import BibleScreen from '../screens/BibleScreen';
import JournalScreen from '../screens/JournalScreen';
import CommentaryScreen from '../screens/CommentaryScreen';
import DivineInspirationScreen from '../screens/DivineInspirationScreen';
import AuthStack from './AuthStack';
import { useAuth } from '../auth/useAuth';
import PremiumScreen from '../screens/PremiumScreen';
import ForgotPasswordScreen from '../auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

// AppNavigator always starts at HomeScreen, regardless of user auth state.
// AuthStack (login/signup) is only shown if user navigates to it explicitly.
const AppNavigator = () => {
  const { loading } = useAuth();
  if (loading) return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#2A004B'}}>
      <Text style={{color:'gold',fontSize:22,fontWeight:'bold'}}>Loading...</Text>
    </View>
  );
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{
          headerShown: false,
        }} />
        <Stack.Screen name="Premium" component={PremiumScreen} options={{
          headerStyle: {
            backgroundColor: 'transparent',
            borderBottomWidth: 3,
            borderBottomColor: 'gold',
            height: 0,
          },
          headerBackground: () => (
            <View style={{ position: 'absolute', left: -84, top: -40, width: '100%', height: '100%', zIndex: 0, transform: [{ scaleY: 1 }] }} pointerEvents="none">
              <RoyalPurpleNavBarBackground width={600} height={300} />
            </View>
          ),
          headerTitle: () => (
            <Text
              style={{
                fontFamily: 'Cardo-Bold',
                fontSize: 26,
                fontWeight: 'bold',
                letterSpacing: 1.2,
                textAlign: 'center',
                color: '#ffe066',
                textShadowColor: '#bfae66',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
              }}
            >
              Premium Features
            </Text>
          ),
          headerTitleAlign: 'center',
          headerTintColor: 'gold',
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          headerBackImage: ({ tintColor }) => <OpulentBackArrow color={tintColor || 'gold'} size={32} />, 
        }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{
          headerStyle: {
            backgroundColor: 'transparent',
            borderBottomWidth: 3,
            borderBottomColor: 'gold',
            height: 0,
          },
          headerBackground: () => (
            <View style={{ position: 'absolute', left: -84, top: -40, width: '100%', height: '100%', zIndex: 0, transform: [{ scaleY: 1 }] }} pointerEvents="none">
              <RoyalPurpleNavBarBackground width={600} height={300} />
            </View>
          ),
          headerTitle: () => (
            <Text
              style={{
                fontFamily: 'Cardo-Bold',
                fontSize: 26,
                fontWeight: 'bold',
                letterSpacing: 1.2,
                textAlign: 'center',
                color: '#ffe066',
                textShadowColor: '#bfae66',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
              }}
            >
              Reset Password
            </Text>
          ),
          headerTitleAlign: 'center',
          headerTintColor: 'gold',
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          headerBackImage: ({ tintColor }) => <OpulentBackArrow color={tintColor || 'gold'} size={32} />, 
        }} />
      <Stack.Screen name="Bible" component={BibleScreen} options={{
        headerStyle: {
          backgroundColor: 'transparent',
          borderBottomWidth: 3,
          borderBottomColor: 'gold',
          height: 0,
        },
        headerBackground: () => (
          <View style={{ position: 'absolute', left: -84, top: -40, width: '100%', height: '100%', zIndex: 0, transform: [{ scaleY: 1 }] }} pointerEvents="none">
            <RoyalPurpleNavBarBackground width={600} height={300} />
          </View>
        ),
        headerTitle: () => (
          <Text
            style={{
              fontFamily: 'Cardo-Bold',
              fontSize: 26,
              fontWeight: 'bold',
              letterSpacing: 1.2,
              textAlign: 'center',
              color: '#ffe066',
              textShadowColor: '#bfae66',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 8,
            }}
          >
            Bible
          </Text>
        ),
        headerTitleAlign: 'center',
        headerTintColor: 'gold',
        headerBackTitleVisible: false,
        headerShadowVisible: false,
        headerBackImage: ({ tintColor }) => <OpulentBackArrow color={tintColor || 'gold'} size={32} />, 
      }} />
      <Stack.Screen name="Journal" component={JournalScreen} options={{
        headerStyle: {
          backgroundColor: 'transparent',
          borderBottomWidth: 3,
          borderBottomColor: 'gold',
          height: 0,
        },
        headerBackground: () => (
          <View style={{ position: 'absolute', left: -84, top: -40, width: '100%', height: '100%', zIndex: 0, transform: [{ scaleY: 1 }] }} pointerEvents="none">
            <RoyalPurpleNavBarBackground width={600} height={300} />
          </View>
        ),
        headerTitle: () => (
          <Text
            style={{
              fontFamily: 'Cardo-Bold',
              fontSize: 26,
              fontWeight: 'bold',
              letterSpacing: 1.2,
              textAlign: 'center',
              color: '#ffe066',
              textShadowColor: '#bfae66',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 8,
            }}
          >
            Journal
          </Text>
        ),
        headerTitleAlign: 'center',
        headerTintColor: 'gold',
        headerBackTitleVisible: false,
        headerShadowVisible: false,
        headerBackImage: ({ tintColor }) => <OpulentBackArrow color={tintColor || 'gold'} size={32} />, 
      }} />
      <Stack.Screen name="DivineInspiration" component={DivineInspirationScreen} options={{
        headerStyle: {
          backgroundColor: 'transparent',
          borderBottomWidth: 3,
          borderBottomColor: 'gold',
          height: 0,
        },
        headerBackground: () => (
          <View style={{ position: 'absolute', left: -84, top: -40, width: '100%', height: '100%', zIndex: 0, transform: [{ scaleY: 1 }] }} pointerEvents="none">
            <RoyalPurpleNavBarBackground width={600} height={300} />
          </View>
        ),
        headerTitle: () => (
          <Text
            style={{
              fontFamily: 'Cardo-Bold',
              fontSize: 26,
              fontWeight: 'bold',
              letterSpacing: 1.2,
              textAlign: 'center',
              color: '#ffe066',
              textShadowColor: '#bfae66',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 8,
            }}
          >
            Divine Inspiration
          </Text>
        ),
        headerTitleAlign: 'center',
        headerTintColor: 'gold',
        headerBackTitleVisible: false,
        headerShadowVisible: false,
        headerBackImage: ({ tintColor }) => <OpulentBackArrow color={tintColor || 'gold'} size={32} />, 
      }} />
    </Stack.Navigator>
  </NavigationContainer>
  );
};

export default AppNavigator;
