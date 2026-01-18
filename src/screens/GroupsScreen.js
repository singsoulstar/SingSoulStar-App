import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_FAMILIES = [
    { id: '1', name: 'Elite Singers', members: 1205, rank: 1, cover: 'https://via.placeholder.com/150?text=Elite' },
    { id: '2', name: 'Latin Vibes', members: 890, rank: 2, cover: 'https://via.placeholder.com/150?text=Latin' },
    { id: '3', name: 'Rock Legends', members: 540, rank: 3, cover: 'https://via.placeholder.com/150?text=Rock' },
    { id: '4', name: 'K-Pop Stans', members: 320, rank: 4, cover: 'https://via.placeholder.com/150?text=KPop' },
];

const GroupsScreen = () => {
    const renderFamily = ({ item, index }) => (
        <View style={styles.card}>
            <View style={styles.rankBadge}>
                <Text style={[styles.rankText, index < 3 && styles.topRank]}>{item.rank}</Text>
            </View>
            <Image source={{ uri: item.cover }} style={styles.cover} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.members}>{item.members} members</Text>
            </View>
            <TouchableOpacity style={styles.joinBtn}>
                <Text style={styles.joinText}>Join</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Families</Text>
                <TouchableOpacity>
                    <Ionicons name="search" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.banner}>
                <LinearGradient colors={GRADIENTS.primary} style={styles.bannerGradient}>
                    <View>
                        <Text style={styles.bannerTitle}>Family Battle!</Text>
                        <Text style={styles.bannerSub}>Join a family and win rewards.</Text>
                    </View>
                    <Ionicons name="trophy" size={40} color="#FFD700" />
                </LinearGradient>
            </View>

            <FlatList
                data={MOCK_FAMILIES}
                renderItem={renderFamily}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
    title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    banner: { padding: 20, paddingTop: 0 },
    bannerGradient: { borderRadius: 15, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    bannerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    bannerSub: { color: 'white', opacity: 0.8 },
    list: { padding: 20 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginBottom: 15, padding: 15, borderRadius: 12 },
    rankBadge: { width: 30, alignItems: 'center' },
    rankText: { color: COLORS.textMuted, fontWeight: 'bold', fontSize: 16 },
    topRank: { color: '#FFD700', fontSize: 20 },
    cover: { width: 50, height: 50, borderRadius: 10, marginHorizontal: 15 },
    info: { flex: 1 },
    name: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    members: { color: COLORS.textMuted, fontSize: 12 },
    joinBtn: { borderColor: COLORS.primary, borderWidth: 1, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
    joinText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },
});

export default GroupsScreen;
