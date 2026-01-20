import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TextInput, ActivityIndicator, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import SongCard from '../components/SongCard';
import { SongService } from '../services/SongService';
import { CollaborationService } from '../services/CollaborationService';
import { LinearGradient } from 'expo-linear-gradient';

const SingScreen = ({ navigation }) => {
    const [songs, setSongs] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMode, setActiveMode] = useState('Solo'); // 'Solo' or 'Duet'

    // Duet Modal State
    const [duetModalVisible, setDuetModalVisible] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [openCollabs, setOpenCollabs] = useState([]);
    const [loadingCollabs, setLoadingCollabs] = useState(false);

    useEffect(() => {
        loadSongs();
    }, []);

    const loadSongs = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const newSongs = await SongService.getSongs(page);
            if (newSongs.length === 0) {
                setHasMore(false);
            } else {
                setSongs(prev => [...prev, ...newSongs]);
                setPage(prev => prev + 1);
            }
        } catch (error) {
            console.warn(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (text) => {
        setSearchQuery(text);
        if (text.length > 2) {
            setLoading(true);
            const results = await SongService.searchSongs(text);
            setSongs(results);
            setHasMore(false);
            setLoading(false);
        } else if (text.length === 0) {
            setPage(1);
            setSongs([]);
            setHasMore(true);
            loadSongs();
        }
    };

    const handleSingPress = async (song) => {
        if (activeMode === 'Solo') {
            navigation.navigate('Recording', { song, mode: 'Solo' });
        } else {
            // DUET MODE: Show options
            setSelectedSong(song);
            setDuetModalVisible(true);
            setLoadingCollabs(true);
            try {
                const collabs = await CollaborationService.getOpenCollabs(song.id);
                setOpenCollabs(collabs);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingCollabs(false);
            }
        }
    };

    const renderItem = ({ item }) => (
        <SongCard
            title={item.title}
            artist={item.artist}
            coverUrl={item.cover_url}
            onSing={() => handleSingPress(item)}
        />
    );

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {/* Mode Selector Tabs (StarMaker Style) */}
                <View style={styles.modeTabs}>
                    <TouchableOpacity onPress={() => setActiveMode('Solo')} style={activeMode === 'Solo' && styles.activeTab}>
                        <Text style={[styles.modeTabText, activeMode === 'Solo' && styles.activeTabText]}>Solo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveMode('Duet')} style={[activeMode === 'Duet' && styles.activeTab, { marginLeft: 30 }]}>
                        <Text style={[styles.modeTabText, activeMode === 'Duet' && styles.activeTabText]}>Duets</Text>
                        {activeMode === 'Duet' && <View style={styles.badge}><Text style={styles.badgeText}>HOT</Text></View>}
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={COLORS.textMuted} />
                    <TextInput
                        placeholder={activeMode === 'Solo' ? "Search millions of songs..." : "Join a duet now!"}
                        placeholderTextColor={COLORS.textMuted}
                        style={styles.input}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>
                    {activeMode === 'Solo' ? 'Recommended for You' : 'Top Duets to Join'}
                </Text>
                <FlatList
                    data={songs}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    onEndReached={loadSongs}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />
            </View>

            {/* Floating Upload Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Upload')}
            >
                <Ionicons name="cloud-upload" size={30} color="white" />
            </TouchableOpacity>

            {/* Duet Selection Modal */}
            <Modal visible={duetModalVisible} animationType="slide" transparent={true} onRequestClose={() => setDuetModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sing Duet</Text>
                            <TouchableOpacity onPress={() => setDuetModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.songTitleModal}>{selectedSong?.title}</Text>

                        <TouchableOpacity
                            style={styles.startNewBtn}
                            onPress={() => {
                                setDuetModalVisible(false);
                                navigation.navigate('Recording', { song: selectedSong, mode: 'Duet', isNewCollab: true, role: 'A' });
                            }}
                        >
                            <LinearGradient colors={GRADIENTS.primary} style={styles.startNewGradient}>
                                <Ionicons name="mic" size={24} color="white" style={{ marginRight: 10 }} />
                                <Text style={styles.startNewText}>Start New Duet (Sing Part A)</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={styles.joinTitle}>Or Join Others:</Text>

                        {loadingCollabs ? (
                            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                        ) : openCollabs.length === 0 ? (
                            <Text style={styles.noCollabsText}>No open duets found. Be the first!</Text>
                        ) : (
                            <FlatList
                                data={openCollabs}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.collabItem}
                                        onPress={() => {
                                            setDuetModalVisible(false);
                                            navigation.navigate('Recording', {
                                                song: selectedSong,
                                                mode: 'Duet',
                                                isJoining: true,
                                                role: 'B',
                                                parentRecording: item
                                            });
                                        }}
                                    >
                                        <Image source={{ uri: item.profiles?.avatar_url || 'https://i.pravatar.cc/150' }} style={styles.collabAvatar} />
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Text style={styles.collabUser}>{item.profiles?.username || 'User'}</Text>
                                            <Text style={styles.collabInfo}>Creating Part A • {new Date(item.created_at).toLocaleDateString()}</Text>
                                        </View>
                                        <View style={styles.joinBtn}>
                                            <Text style={styles.joinText}>Join</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute', bottom: 90, right: 20,
        backgroundColor: COLORS.accent, width: 60, height: 60, borderRadius: 30,
        justifyContent: 'center', alignItems: 'center', elevation: 5,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3,
    },
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: 16, paddingTop: 10 },
    modeTabs: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
    modeTabText: { color: COLORS.textMuted, fontSize: 18, fontWeight: 'bold' },
    activeTabText: { color: COLORS.text }, // In SingScreen context, maybe dark text if BG is light? Yes, container is COLORS.background which is white/light.
    activeTab: { borderBottomWidth: 3, borderBottomColor: COLORS.primary, paddingBottom: 5 },
    badge: { position: 'absolute', top: -10, right: -35, backgroundColor: COLORS.primary, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
    badgeText: { color: 'white', fontSize: 8, fontWeight: 'bold' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
    input: { flex: 1, marginLeft: 10, color: COLORS.text, fontSize: 14 },
    content: { flex: 1, paddingHorizontal: 16 },
    sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
    listContent: { paddingBottom: 80 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '60%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
    songTitleModal: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 20 },
    startNewBtn: { borderRadius: 25, overflow: 'hidden', marginBottom: 20 },
    startNewGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15 },
    startNewText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    joinTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.textMuted, marginBottom: 10 },
    noCollabsText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 20 },
    collabItem: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: COLORS.surface, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
    collabAvatar: { width: 40, height: 40, borderRadius: 20 },
    collabUser: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
    collabInfo: { fontSize: 12, color: COLORS.textMuted },
    joinBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 15 },
    joinText: { color: 'white', fontSize: 12, fontWeight: 'bold' }
});

export default SingScreen;
