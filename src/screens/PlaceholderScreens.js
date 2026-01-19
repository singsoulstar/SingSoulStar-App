import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const ScreenWrapper = ({ title }) => (
    <View style={styles.container}>
        <Text style={styles.text}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export const HomeScreen = () => <ScreenWrapper title="Moments" />;
export const PartyScreen = () => <ScreenWrapper title="Party" />;
export const MessageScreen = () => <ScreenWrapper title="Message" />;
export const ProfileScreen = () => <ScreenWrapper title="Me" />;
