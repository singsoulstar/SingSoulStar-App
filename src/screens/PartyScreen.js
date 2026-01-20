import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2;

const MOCK_ROOMS = [
    { id: '1', name: 'Karaoke Night! 🎤', host: 'Maria S.', users: 124, type: 'Sing', cover: 'https://via.placeholder.com/300?text=Karaoke' },
    { id: '2', name: 'Chill & Chat ☕', host: 'Juan P.', users: 45, type: 'Chat', cover: 'https://via.placeholder.com/300?text=Chill' },
    { id: '3', name: 'Talent Show 🌟', host: 'Star Official', users: 1205, type: 'Event', cover: 'https://via.placeholder.com/300?text=Talent' },
    { id: '4', name: 'Gaming Zone 🎮', host: 'GamerX', users: 89, type: 'Game', cover: 'https://via.placeholder.com/300?text=Game' },
    { id: '5', name: 'New Voices', host: 'Ana M.', users: 12, type: 'Sing', cover: 'https://via.placeholder.com/300?text=Voices' },
    { id: '6', name: 'Late Night Vibes', host: 'DJ Cool', users: 330, type: 'Chat', cover: 'https://via.placeholder.com/300?text=Vibes' },
];

const CATEGORIES = ['All', 'Singing', 'Chat', 'Games', 'Live'];

import { useAuth } from '../context/AuthContext';

const PartyScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [activeCat, setActiveCat] = useState('All');

    const handleCreateRoom = () => {
        if (!user) {
            // alert or login redirect
            return;
        }
        const newRoom = {
            id: `room_${user.id}_${Date.now()}`,
            name: `${user.name || 'User'}'s Party`,
            host: user.name || 'Host',
            cover: user.avatar || 'https://via.placeholder.com/300'
        };
        navigation.navigate('RoomDetail', { room: newRoom });
    };

    const renderRoom = ({ item }) => (
        <TouchableOpacity
            style={styles.roomCard}
            onPress={() => navigation.navigate('RoomDetail', { room: item })}
        >
            <View style={styles.coverContainer}>
                <Image source={{ uri: item.cover }} style={styles.roomCover} />
                <View style={styles.liveBadge}>
                    <Text style={styles.liveText}>LIVE</Text>
                    <View style={styles.equalizer}>
                        <View style={[styles.bar, { height: 6 }]} />
                        <View style={[styles.bar, { height: 10 }]} />
                        <View style={[styles.bar, { height: 5 }]} />
                    </View>
                </View>
                <View style={styles.roomTypeBadge}>
                    <Text style={styles.roomType}>{item.type}</Text>
                </View>
            </View>
            <View style={styles.roomInfo}>
                <Text style={styles.roomName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.hostRow}>
                    <Text style={styles.hostName}>{item.host}</Text>
                    <View style={styles.userCount}>
                        <Ionicons name="people" size={12} color={COLORS.textMuted} />
                        <Text style={styles.userCountText}>{item.users}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Party Rooms</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Groups')}>
                        <Ionicons name="trophy-outline" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="search" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={handleCreateRoom}>
                        <LinearGradient colors={GRADIENTS.primary} style={styles.createRoomBtn}>
                            <Ionicons name="add" size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
// ...

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.catPill, activeCat === cat && styles.activeCatPill]}
                            onPress={() => setActiveCat(cat)}
                        >
                            <Text style={[styles.catText, activeCat === cat && styles.activeCatText]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Room Grid */}
            <FlatList
                data={MOCK_ROOMS.filter(r => activeCat === 'All' || r.type === activeCat || (activeCat === 'Singing' && r.type === 'Sing'))}
                renderItem={renderRoom}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.gridContent}
                columnWrapperStyle={styles.columnWrapper}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    pageTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { marginLeft: 15 },
    createRoomBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

    categoriesContainer: { paddingBottom: 15 },
    catScroll: { paddingHorizontal: 20 },
    catPill: { marginRight: 10, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surfaceLight },
    activeCatPill: { backgroundColor: 'white' },
    catText: { color: COLORS.textMuted, fontWeight: '600' },
    activeCatText: { color: COLORS.background },

    gridContent: { paddingHorizontal: 15, paddingBottom: 100 },
    columnWrapper: { justifyContent: 'space-between' },

    roomCard: { width: COLUMN_WIDTH, marginBottom: 15, backgroundColor: COLORS.surface, borderRadius: 12, overflow: 'hidden' },
    coverContainer: { height: COLUMN_WIDTH, width: '100%' },
    roomCover: { width: '100%', height: '100%' },
    liveBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,0,0,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, flexDirection: 'row', alignItems: 'center' },
    liveText: { color: 'white', fontSize: 10, fontWeight: 'bold', marginRight: 4 },
    equalizer: { flexDirection: 'row', alignItems: 'flex-end', height: 10 },
    bar: { width: 2, backgroundColor: 'white', marginLeft: 1 },
    roomTypeBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    roomType: { color: 'white', fontSize: 10 },

    roomInfo: { padding: 10 },
    roomName: { color: 'white', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
    hostRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    hostName: { color: COLORS.textMuted, fontSize: 12 },
    userCount: { flexDirection: 'row', alignItems: 'center' },
    userCountText: { color: COLORS.textMuted, fontSize: 10, marginLeft: 2 },
});

export default PartyScreen;
