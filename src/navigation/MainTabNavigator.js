import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import PartyScreen from '../screens/PartyScreen';
import MessageScreen from '../screens/MessageScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SingScreen from '../screens/SingScreen';

const Tab = createBottomTabNavigator();

// Keep CustomButton defined but unused for now to check compilation
const CustomTabBarButton = ({ children, onPress }) => (
    <TouchableOpacity
        style={{
            top: -20,
            justifyContent: 'center',
            alignItems: 'center',
            ...styles.shadow
        }}
        onPress={onPress}
    >
        <LinearGradient
            colors={GRADIENTS.singButton}
            style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {children}
        </LinearGradient>
    </TouchableOpacity>
);

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarShowLabel: true,
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                    backgroundColor: COLORS.tabBar,
                    borderTopColor: COLORS.border,
                    height: 60,
                    paddingBottom: 5,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
            }}
        >
            <Tab.Screen
                name="Moments"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? "planet" : "planet-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Party"
                component={PartyScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Sing"
                component={SingScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Ionicons name="mic" size={35} color="white" />
                    ),
                    // Custom Button DISABLED for now
                    tabBarButton: (props) => (
                        <CustomTabBarButton {...props} />
                    ),
                    tabBarLabel: () => null,
                }}
            />
            <Tab.Screen
                name="Message"
                component={MessageScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Me"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
});

export default MainTabNavigator;
