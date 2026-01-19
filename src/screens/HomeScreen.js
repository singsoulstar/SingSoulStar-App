import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MOCK_MOMENTS = [
    { id: '1', user: 'Maria S.', avatar: 'https://i.pravatar.cc/150?u=2', title: 'My new cover of Halo!', time: '2m ago', likes: 24, comments: 5, cover: 'https://via.placeholder.com/300?text=Halo' },
    { id: '2', user: 'Juan P.', avatar: 'https://i.pravatar.cc/150?u=1', title: 'Duet with @Ana', time: '1h ago', likes: 120, comments: 34, cover: 'https://via.placeholder.com/300?text=Duet' },
    { id: '3', user: 'Carlos L.', avatar: 'https://i.pravatar.cc/150?u=3', title: 'Just practicing...', time: '3h ago', likes: 5, comments: 0, cover: 'https://via.placeholder.com/300?text=Practice' },
];

const HomeScreen = ({ navigation }) => {
    const renderMoment = ({ item }) => (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View>
                    <Text style={styles.username}>{item.user}</Text>
                    <Text style={styles.timestamp}>{item.time}</Text>
                </View>
                <TouchableOpacity style={styles.followBtn}>
                    <Text style={styles.followText}>+ Follow</Text>
                </TouchableOpacity>
            </View>

            {/* Description */}
            <Text style={styles.postTitle}>{item.title}</Text>

            {/* Content (Video/Image) */}
            <View style={styles.mediaContainer}>
                <Image source={{ uri: item.cover }} style={styles.media} />
                <View style={styles.playOverlay}>
                    <Ionicons name="play-circle" size={50} color="rgba(255,255,255,0.8)" />
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
                <View style={styles.socialAction}>
                    <Ionicons name="heart-outline" size={24} color="white" />
                    <Text style={styles.actionText}>{item.likes}</Text>
                </View>
                <View style={styles.socialAction}>
                    <Ionicons name="chatbubble-outline" size={24} color="white" />
                    <Text style={styles.actionText}>{item.comments}</Text>
                </View>
                <View style={styles.socialAction}>
                    <Ionicons name="share-social-outline" size={24} color="white" />
                </View>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.giftBtn}>
                    <LinearGradient colors={['#FFD700', '#FF8C00']} style={styles.giftGradient}>
                        <Ionicons name="gift" size={16} color="white" />
                        <Text style={styles.giftText}>Gift</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header with Tabs */}
            <View style={styles.topHeader}>
                <TouchableOpacity><Text style={styles.headerTabInactive}>Following</Text></TouchableOpacity>
                <View style={styles.activeTabContainer}>
                    <Text style={styles.headerTabActive}>Popular</Text>
                    <View style={styles.activeIndicator} />
                </View>
                <TouchableOpacity><Text style={styles.headerTabInactive}>Live</Text></TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 'auto' }}>
                    <Ionicons name="notifications-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_MOMENTS}
                renderItem={renderMoment}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.feed}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    topHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingBottom: 5 },
    headerTabActive: { color: 'white', fontSize: 18, fontWeight: 'bold', marginHorizontal: 15 },
    headerTabInactive: { color: COLORS.textMuted, fontSize: 16, fontWeight: '600', marginHorizontal: 15 },
    activeTabContainer: { alignItems: 'center' },
    activeIndicator: { width: 20, height: 3, backgroundColor: COLORS.primary, marginTop: 4, borderRadius: 2 },

    feed: { paddingBottom: 80 },
    card: { marginBottom: 20, backgroundColor: COLORS.surface, borderRadius: 0, paddingBottom: 15 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    username: { color: 'white', fontWeight: 'bold' },
    timestamp: { color: COLORS.textMuted, fontSize: 12 },
    followBtn: { marginLeft: 'auto', borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15 },
    followText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },
    postTitle: { color: 'white', paddingHorizontal: 15, marginBottom: 10 },
    mediaContainer: { width: '100%', height: 300, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
    media: { width: '100%', height: '100%', opacity: 0.8 },
    playOverlay: { position: 'absolute' },

    actionRow: { flexDirection: 'row', padding: 15, alignItems: 'center' },
    socialAction: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    actionText: { color: 'white', marginLeft: 5, fontSize: 14 },
    giftBtn: { overflow: 'hidden', borderRadius: 15 },
    giftGradient: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
    giftText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
});

export default HomeScreen;
