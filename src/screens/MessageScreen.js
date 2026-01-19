import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const MOCK_CHATS = [
    { id: '1', user: 'System Notification', message: 'Welcome to SingSoulStar!', time: 'Now', avatar: 'https://via.placeholder.com/100?text=Sys', badge: 1 },
    { id: '2', user: 'Maria S.', message: 'Loved your cover! 🎵', time: '5m', avatar: 'https://i.pravatar.cc/150?u=2', badge: 2 },
    { id: '3', user: 'Juan P.', message: 'Let\'s duet soon.', time: '1h', avatar: 'https://i.pravatar.cc/150?u=1', badge: 0 },
];

const MessageScreen = () => {
    const renderChat = ({ item }) => (
        <TouchableOpacity style={styles.chatItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.info}>
                <View style={styles.topRow}>
                    <Text style={styles.username}>{item.user}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.message} numberOfLines={1}>{item.message}</Text>
            </View>
            {item.badge > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Messages</Text>
                <View style={styles.icons}>
                    <TouchableOpacity><Ionicons name="person-add-outline" size={24} color="white" style={{ marginRight: 20 }} /></TouchableOpacity>
                    <TouchableOpacity><Ionicons name="settings-outline" size={24} color="white" /></TouchableOpacity>
                </View>
            </View>

            <View style={styles.tabs}>
                <Text style={styles.activeTab}>Chats</Text>
                <Text style={styles.inactiveTab}>Calls</Text>
                <Text style={styles.inactiveTab}>Requests</Text>
            </View>

            <FlatList
                data={MOCK_CHATS}
                renderItem={renderChat}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingBottom: 10, alignItems: 'center' },
    title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    icons: { flexDirection: 'row' },
    tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
    activeTab: { color: 'white', fontSize: 16, fontWeight: 'bold', marginRight: 20, borderBottomWidth: 2, borderBottomColor: COLORS.primary, paddingBottom: 5 },
    inactiveTab: { color: COLORS.textMuted, fontSize: 16, fontWeight: 'bold', marginRight: 20 },
    list: { paddingHorizontal: 20 },
    chatItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
    info: { flex: 1 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    username: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    time: { color: COLORS.textMuted, fontSize: 12 },
    message: { color: COLORS.textMuted, fontSize: 14 },
    badge: { backgroundColor: COLORS.primary, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
});

export default MessageScreen;
