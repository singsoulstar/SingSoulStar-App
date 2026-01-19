import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Data for Users
const MOCK_USERS = [
    { id: '1', name: 'Juan Perez', email: 'juan@test.com', role: 'user', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', name: 'Maria Garcia', email: 'maria@test.com', role: 'assistant', permissions: ['moderate_chat'], avatar: 'https://i.pravatar.cc/150?u=2' },
];

const AdminScreen = ({ navigation }) => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('Users'); // 'Users' or 'Content'
    const [users, setUsers] = useState(MOCK_USERS);
    const [pendingSongs, setPendingSongs] = useState([]);
    const [loading, setLoading] = useState(false);

    // User Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isAssistant, setIsAssistant] = useState(false);
    const [permChat, setPermChat] = useState(false);
    const [permSongs, setPermSongs] = useState(false);
    const [permBan, setPermBan] = useState(false);

    useEffect(() => {
        if (activeTab === 'Content') {
            loadPendingSongs();
        }
    }, [activeTab]);

    const loadPendingSongs = async () => {
        setLoading(true);
        try {
            const data = await AsyncStorage.getItem('user_songs');
            if (data) {
                const songs = JSON.parse(data);
                setPendingSongs(songs.filter(s => s.status === 'pending_review'));
            } else {
                setPendingSongs([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveSong = async (songId) => {
        try {
            const data = await AsyncStorage.getItem('user_songs');
            if (data) {
                const songs = JSON.parse(data);
                const updated = songs.map(s => s.id === songId ? { ...s, status: 'approved' } : s);
                await AsyncStorage.setItem('user_songs', JSON.stringify(updated));
                setPendingSongs(prev => prev.filter(s => s.id !== songId));
                Alert.alert('Success', 'Song approved and published!');
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to approve song');
        }
    };

    const handleRejectSong = async (songId) => {
        try {
            const data = await AsyncStorage.getItem('user_songs');
            if (data) {
                const songs = JSON.parse(data);
                const updated = songs.map(s => s.id === songId ? { ...s, status: 'rejected' } : s);
                await AsyncStorage.setItem('user_songs', JSON.stringify(updated));
                setPendingSongs(prev => prev.filter(s => s.id !== songId));
                Alert.alert('Rejected', 'Song has been rejected.');
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to reject song');
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setIsAssistant(user.role === 'assistant');
        setPermChat(user.permissions?.includes('moderate_chat') || false);
        setPermSongs(user.permissions?.includes('approve_songs') || false);
        setPermBan(user.permissions?.includes('ban_users') || false);
        setModalVisible(true);
    };

    const saveChanges = () => {
        const updatedUsers = users.map(u => {
            if (u.id === selectedUser.id) {
                const newRole = isAssistant ? 'assistant' : 'user';
                const newPerms = isAssistant ? [
                    ...(permChat ? ['moderate_chat'] : []),
                    ...(permSongs ? ['approve_songs'] : []),
                    ...(permBan ? ['ban_users'] : [])
                ] : [];
                return { ...u, role: newRole, permissions: newPerms };
            }
            return u;
        });
        setUsers(updatedUsers);
        setModalVisible(false);
        Alert.alert('Success', `Role updated for ${selectedUser.name}`);
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleUserClick(item)}>
            <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.subtext}>{item.email}</Text>
            </View>
            <View style={[styles.badge, item.role === 'assistant' ? styles.badgeAssistant : styles.badgeUser]}>
                <Text style={styles.badgeText}>{item.role.toUpperCase()}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderSongItem = ({ item }) => (
        <View style={styles.card}>
            <Ionicons name="musical-notes" size={30} color={COLORS.accent} style={{ marginRight: 15 }} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.title}</Text>
                <Text style={styles.subtext}>{item.artist}</Text>
            </View>
            <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => handleRejectSong(item.id)} style={styles.rejectBtn}>
                    <Ionicons name="close-circle" size={24} color="#FF5252" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleApproveSong(item.id)} style={styles.approveBtn}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Dashboard</Text>
                <TouchableOpacity onPress={logout}>
                    <Ionicons name="log-out-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Users' && styles.activeTab]}
                    onPress={() => setActiveTab('Users')}
                >
                    <Text style={[styles.tabText, activeTab === 'Users' && styles.activeTabText]}>Users</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Content' && styles.activeTab]}
                    onPress={() => setActiveTab('Content')}
                >
                    <Text style={[styles.tabText, activeTab === 'Content' && styles.activeTabText]}>Content</Text>
                    {pendingSongs.length > 0 && <View style={styles.dot} />}
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={activeTab === 'Users' ? users : pendingSongs}
                    renderItem={activeTab === 'Users' ? renderUserItem : renderSongItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No {activeTab.toLowerCase()} found.</Text>
                    }
                />
            )}

            {/* User Edit Modal (existing logic) */}
            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Manage {selectedUser?.name}</Text>

                        <View style={styles.switchRow}>
                            <Text style={styles.label}>Is Assistant?</Text>
                            <Switch value={isAssistant} onValueChange={setIsAssistant} trackColor={{ true: COLORS.accent }} />
                        </View>

                        {isAssistant && (
                            <View style={styles.permsBox}>
                                <Text style={styles.permTitle}>Permissions</Text>
                                <View style={styles.switchRow}><Text style={styles.sublabel}>Moderate Chat</Text><Switch value={permChat} onValueChange={setPermChat} /></View>
                                <View style={styles.switchRow}><Text style={styles.sublabel}>Approve Songs</Text><Switch value={permSongs} onValueChange={setPermSongs} /></View>
                                <View style={styles.switchRow}><Text style={styles.sublabel}>Ban Users</Text><Switch value={permBan} onValueChange={setPermBan} /></View>
                            </View>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={saveChanges} style={styles.saveBtn}>
                                <Text style={styles.btnText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
    title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    tabBar: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10 },
    tab: { paddingVertical: 10, marginRight: 25, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: COLORS.primary },
    tabText: { color: COLORS.textMuted, fontWeight: 'bold' },
    activeTabText: { color: 'white' },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent, position: 'absolute', top: 10, right: -10 },
    list: { padding: 20 },
    card: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
    avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarText: { color: 'white', fontWeight: 'bold' },
    info: { flex: 1 },
    name: { color: 'white', fontWeight: 'bold' },
    subtext: { color: COLORS.textMuted, fontSize: 12 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeUser: { backgroundColor: '#444' },
    badgeAssistant: { backgroundColor: COLORS.primary },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    actionRow: { flexDirection: 'row' },
    approveBtn: { marginLeft: 15 },
    rejectBtn: {},
    emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 50 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: COLORS.surface, width: '85%', borderRadius: 20, padding: 20 },
    modalHeader: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    label: { color: 'white', fontSize: 16 },
    sublabel: { color: COLORS.textMuted },
    permsBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 15, marginBottom: 20 },
    permTitle: { color: COLORS.accent, fontWeight: 'bold', marginBottom: 10 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
    cancelBtn: { padding: 10, marginRight: 10 },
    saveBtn: { backgroundColor: COLORS.accent, paddingVertical: 10, paddingHorizontal: 25, borderRadius: 20 },
    btnText: { color: 'white', fontWeight: 'bold' },
});

export default AdminScreen;

