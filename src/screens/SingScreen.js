import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import SongCard from '../components/SongCard';
import { SongService } from '../services/SongService';

const SingScreen = ({ navigation }) => {
    const [songs, setSongs] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMode, setActiveMode] = useState('Solo'); // 'Solo' or 'Duet'

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
            // Reset and search
            setLoading(true);
            const results = await SongService.searchSongs(text);
            setSongs(results);
            setHasMore(false); // Disable infinite scroll for search results in this mock
            setLoading(false);
        } else if (text.length === 0) {
            // Reset to feed
            setPage(1);
            setSongs([]);
            setHasMore(true);
            loadSongs();
        }
    };

    const renderItem = ({ item }) => (
        <SongCard
            title={item.title}
            artist={item.artist}
            cover={item.cover}
            onSing={() => navigation.navigate('Recording', { song: item, mode: activeMode })}
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 90, // Above tab bar
        right: 20,
        backgroundColor: COLORS.accent,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 16,
        paddingTop: 10,
    },
    modeTabs: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
    },
    modeTabText: {
        color: COLORS.textMuted,
        fontSize: 18,
        fontWeight: 'bold',
    },
    activeTabText: {
        color: 'white',
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: COLORS.primary,
        paddingBottom: 5,
    },
    badge: {
        position: 'absolute',
        top: -10,
        right: -35,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceLight,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        color: COLORS.white,
        fontSize: 14,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    listContent: {
        paddingBottom: 80, // Space for Bottom Tab
    },
});

export default SingScreen;
