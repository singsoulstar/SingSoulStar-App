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
    const { user, logout } = useAuth(); // Current Admin User
    const [activeTab, setActiveTab] = useState('Users');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // User Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Form States
    const [targetRole, setTargetRole] = useState('user');
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (activeTab === 'Users') {
            fetchUsers();
        } else {
            // loadPendingSongs (Existing logic - kept for now)
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(50); // Cap for now

            if (error) throw error;
            setUsers(data || []);
        } catch (e) {
            console.error("Error fetching users:", e);
            Alert.alert("Error", "No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (u) => {
        setSelectedUser(u);
        setTargetRole(u.role || 'user');
        setIsVerified(u.is_verified || false);
        setModalVisible(true);
    };

    const saveChanges = async () => {
        if (!selectedUser) return;

        try {
            const updates = {
                role: targetRole,
                is_verified: isVerified,
                updated_at: new Date(),
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', selectedUser.id);

            if (error) throw error;

            Alert.alert("Éxito", "Usuario actualizado.");
            setModalVisible(false);
            fetchUsers(); // Refresh list
        } catch (e) {
            console.error("Error updating user:", e);
            Alert.alert("Error", "No tienes permisos o falló la red.");
        }
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleUserClick(item)}>
            <View style={styles.avatarCircle}>
                {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                ) : (
                    <Text style={styles.avatarText}>{item.username ? item.username[0].toUpperCase() : '?'}</Text>
                )}
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>
                    {item.full_name || item.name || item.username || 'Sin Nombre'}
                    {item.is_verified && <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />}
                </Text>
                <Text style={styles.subtext}>{item.id.substring(0, 8)}... • {item.role || 'user'}</Text>
            </View>
            <View style={[styles.badge,
            item.role === 'admin' ? styles.badgeAdmin :
                item.role === 'assistant' ? styles.badgeAssistant :
                    styles.badgeUser
            ]}>
                <Text style={styles.badgeText}>{item.role ? item.role.toUpperCase() : 'USER'}</Text>
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

            {/* User Edit Modal */}
            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Gestionar: {selectedUser?.username || selectedUser?.name || 'Usuario'}</Text>

                        <View style={styles.switchRow}>
                            <Text style={styles.label}>Verificado</Text>
                            <Switch value={isVerified} onValueChange={setIsVerified} trackColor={{ true: COLORS.accent }} />
                        </View>

                        <View style={styles.permsBox}>
                            <Text style={styles.permTitle}>Rol de Usuario</Text>
                            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                                {['user', 'assistant', 'admin'].map(role => (
                                    <TouchableOpacity
                                        key={role}
                                        style={[
                                            styles.roleBtn,
                                            targetRole === role && styles.roleBtnActive
                                        ]}
                                        onPress={() => setTargetRole(role)}
                                    >
                                        <Text style={[
                                            styles.roleBtnText,
                                            targetRole === role && styles.roleBtnTextActive
                                        ]}>{role.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.btnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={saveChanges} style={styles.saveBtn}>
                                <Text style={styles.btnText}>Guardar</Text>
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
    avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden' },
    avatarText: { color: 'white', fontWeight: 'bold' },
    info: { flex: 1 },
    name: { color: 'white', fontWeight: 'bold' },
    subtext: { color: COLORS.textMuted, fontSize: 12 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeUser: { backgroundColor: '#444' },
    badgeAssistant: { backgroundColor: COLORS.primary },
    badgeAdmin: { backgroundColor: '#FFD700' },
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

    roleBtn: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#555', marginBottom: 5 },
    roleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    roleBtnText: { color: '#888', fontSize: 12 },
    roleBtnTextActive: { color: 'white', fontWeight: 'bold' }
});

export default AdminScreen;

