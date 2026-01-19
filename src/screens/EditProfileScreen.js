import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const EditProfileScreen = ({ navigation }) => {
    const { user, updateProfile } = useAuth();

    // Form State
    const [name, setName] = useState(user?.name || '');
    const [gender, setGender] = useState(user?.gender || 'Secreto');
    const [birthday, setBirthday] = useState(user?.birthday || '11.12 Escorpio'); // Mock default if empty
    const [relationship, setRelationship] = useState(user?.relationship || 'Secreto');
    const [hometown, setHometown] = useState(user?.hometown || 'Cerca de Shibuya');
    const [bio, setBio] = useState(user?.bio || '');
    const [education, setEducation] = useState(user?.education || '');
    const [profession, setProfession] = useState(user?.profession || '');

    // Modals for editing single fields
    const [modalVisible, setModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState(null); // 'name', 'bio', etc.
    const [tempValue, setTempValue] = useState('');

    const openEdit = (field, currentValue) => {
        setCurrentField(field);
        setTempValue(currentValue);
        setModalVisible(true);
    };

    const saveField = async () => {
        const updates = {};
        updates[currentField] = tempValue;

        // Optimistic UI update
        if (currentField === 'name') setName(tempValue);
        if (currentField === 'bio') setBio(tempValue);
        if (currentField === 'education') setEducation(tempValue);
        if (currentField === 'profession') setProfession(tempValue);

        // Persist
        await updateProfile(updates);
        setModalVisible(false);
    };

    const ListItem = ({ label, value, onPress, isAvatar }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.valueContainer}>
                {isAvatar ? (
                    <Image source={{ uri: user?.avatar || 'https://i.pravatar.cc/300' }} style={styles.avatarMini} />
                ) : (
                    <Text style={styles.value} numberOfLines={1}>{value}</Text>
                )}
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar perfil</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    {/* Could be a Save button, but StarMaker usually saves on field exit or has generic back */}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Big Avatar Header */}
                <View style={styles.avatarHeader}>
                    <TouchableOpacity style={styles.avatarWrapper} onPress={() => Alert.alert('Cambiar Avatar', 'Pronto podrás subir tu foto aquí.')}>
                        <Image source={{ uri: user?.avatar || 'https://i.pravatar.cc/300' }} style={styles.avatarBig} />
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.changeAvatarText}>Presiona aquí para cambiar el avatar</Text>
                </View>

                {/* Fields */}
                <View style={styles.listContainer}>
                    <ListItem label="Nombre de usuario" value={name} onPress={() => openEdit('name', name)} />
                    <ListItem label="ID" value={user?.id?.substring(0, 10) || 'Unknown'} onPress={() => Alert.alert('ID', 'Tu ID es único y no se puede cambiar.')} />
                    <ListItem label="Sexo" value={gender} onPress={() => Alert.alert('Sexo', 'Selector de género (Próximamente)')} />
                    <ListItem label="Cumpleaños" value={birthday} onPress={() => Alert.alert('Cumpleaños', 'Selector de fecha (Próximamente)')} />
                    <ListItem label="Relación" value={relationship} onPress={() => Alert.alert('Relación', 'Selector de estado (Próximamente)')} />
                    <ListItem label="Ciudad natal" value={hometown} onPress={() => openEdit('hometown', hometown)} />
                    <ListItem label="Origen Étnico" value="Selecciona tu origen étnico" />
                    <ListItem label="Firma" value={bio || "Sin firma"} onPress={() => openEdit('bio', bio)} />
                    <ListItem label="Educación" value={education || "Ingresa tu formación educativa"} onPress={() => openEdit('education', education)} />
                    <ListItem label="Profesión" value={profession || "Ingresa tu profesión"} onPress={() => openEdit('profession', profession)} />
                </View>

            </ScrollView>

            {/* Simple Edit Input Modal */}
            <Modal visible={modalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Editar {currentField}</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={tempValue}
                            onChangeText={setTempValue}
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnTextCancel}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnSave} onPress={saveField}>
                                <Text style={styles.btnTextSave}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    header: {
        height: 100,
        paddingTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        backgroundColor: 'white',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { paddingBottom: 50 },

    avatarHeader: { alignItems: 'center', backgroundColor: 'white', paddingBottom: 20, marginBottom: 10 },
    avatarWrapper: { position: 'relative' },
    avatarBig: { width: 80, height: 80, borderRadius: 40 },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 12 },
    changeAvatarText: { color: COLORS.textMuted, fontSize: 12, marginTop: 10 },

    listContainer: { backgroundColor: 'white' },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    label: { fontSize: 16, color: 'black', fontWeight: '500' },
    valueContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end', marginLeft: 20 },
    value: { color: '#888', fontSize: 14, marginRight: 5, textAlign: 'right' },
    avatarMini: { width: 30, height: 30, borderRadius: 15, marginRight: 5 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
    modalCard: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textTransform: 'capitalize' },
    modalInput: { borderBottomWidth: 1, borderColor: COLORS.primary, fontSize: 16, padding: 5, marginBottom: 20 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
    btnTextCancel: { color: '#666', fontSize: 16 },
    btnTextSave: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' }
});

export default EditProfileScreen;
