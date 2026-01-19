import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import LyricsView from '../components/LyricsView';
import PitchVisualizer from '../components/PitchVisualizer';

const RecordingScreen = ({ route, navigation }) => {
    const { song, mode = 'Solo' } = route.params || { song: { title: 'Unknown', artist: 'Unknown', lyrics: [] }, mode: 'Solo' };
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [recording, setRecording] = useState(null);
    const [sound, setSound] = useState(null);
    const [showPostRecord, setShowPostRecord] = useState(false);

    // Audio Permission
    useEffect(() => {
        (async () => {
            try {
                if (Platform.OS !== 'web') {
                    const { status } = await Audio.requestPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('Permission needed', 'Microphone access is required to record.');
                    }
                }
            } catch (e) {
                console.warn("Permissions Error:", e);
            }
        })();
    }, []);

    // Timer logic
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setDuration(prev => prev + 100);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    async function startRecording() {
        try {
            if (Platform.OS !== 'web') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                setRecording(recording);
            }
            setIsRecording(true);
            if (mode === 'Duet') {
                Alert.alert('Duet Mode', 'Partner voice will be simulated for this recording (Zero Cost).');
            }
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopRecording() {
        setIsRecording(false);
        try {
            if (recording) {
                await recording.stopAndUnloadAsync();
                const { sound } = await recording.createNewLoadedSoundAsync();
                setSound(sound);
            }
            setShowPostRecord(true);
        } catch (error) {
            setShowPostRecord(true);
        }
    }

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: song.cover || 'https://via.placeholder.com/400' }}
                style={styles.backgroundImage}
                blurRadius={20}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', COLORS.background]}
                    style={styles.overlay}
                >
                    <SafeAreaView style={styles.safeArea}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                            <View style={styles.headerInfo}>
                                <Text style={styles.songTitle}>{song.title}</Text>
                                <Text style={styles.songArtist}>{song.artist} • {mode}</Text>
                            </View>
                            <TouchableOpacity style={styles.settingsBtn}>
                                <Ionicons name="settings-outline" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Duet Visual Info */}
                        {mode === 'Duet' && (
                            <View style={styles.duetIndicator}>
                                <View style={styles.sqAvatar}>
                                    <Text style={{ color: 'white', fontSize: 10 }}>Me</Text>
                                </View>
                                <View style={[styles.sqAvatar, { backgroundColor: '#FF00A2' }]}>
                                    <Text style={{ color: 'white', fontSize: 10 }}>Join</Text>
                                </View>
                            </View>
                        )}

                        {/* Pitch Visualizer (Modern StarMaker Curve) */}
                        <View style={styles.pitchContainer}>
                            <PitchVisualizer currentTime={duration} isRecording={isRecording} />
                        </View>

                        {/* Lyrics Area */}
                        <View style={styles.lyricsContainer}>
                            <LyricsView lyrics={song.lyrics || []} currentTime={duration} mode={mode} />
                        </View>

                        {/* Controls */}
                        <View style={styles.controls}>
                            <View style={styles.timerContainer}>
                                <Text style={styles.timerText}>{formatTime(duration)}</Text>
                            </View>

                            <View style={styles.buttonsRow}>
                                <TouchableOpacity style={styles.controlBtn}>
                                    <Ionicons name="headset-outline" size={28} color="white" />
                                    <Text style={styles.btnLabel}>Monitor</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.recordOuter}
                                    onPress={isRecording ? stopRecording : startRecording}
                                >
                                    <LinearGradient
                                        colors={isRecording ? ['#ff4b1f', '#ff9068'] : ['#EB3349', '#F45C43']}
                                        style={styles.recordInner}
                                    >
                                        <Ionicons name={isRecording ? "stop" : "mic"} size={32} color="white" />
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.controlBtn}>
                                    <Ionicons name="videocam-outline" size={28} color="white" />
                                    <Text style={styles.btnLabel}>Camera</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </SafeAreaView>
                </LinearGradient>
            </ImageBackground>

            {/* Post-Recording Edit Modal */}
            <Modal visible={showPostRecord} animationType="slide" transparent={true}>
                <View style={styles.editModal}>
                    <View style={styles.editContent}>
                        <Text style={styles.editTitle}>Studio Effects</Text>

                        <View style={styles.effectRow}>
                            <EffectButton name="None" active />
                            <EffectButton name="Pop" />
                            <EffectButton name="Studio" />
                            <EffectButton name="R&B" />
                        </View>

                        <View style={styles.sliderRow}>
                            <Text style={styles.sliderLabel}>Reverb</Text>
                            <View style={styles.sliderLine} />
                        </View>
                        <View style={styles.sliderRow}>
                            <Text style={styles.sliderLabel}>Echo</Text>
                            <View style={styles.sliderLine} />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setShowPostRecord(false)} style={styles.secondaryBtn}>
                                <Text style={{ color: 'white' }}>Discard</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setShowPostRecord(false);
                                Alert.alert('Saved!', 'Your recording has been saved to your profile.');
                                navigation.goBack();
                            }} style={styles.primaryBtn}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Save & Post</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const EffectButton = ({ name, active }) => (
    <View style={[styles.effectBtn, active && styles.effectActive]}>
        <Ionicons name="options" size={20} color={active ? 'white' : '#888'} />
        <Text style={[styles.effectText, active && { color: 'white' }]}>{name}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    backgroundImage: { flex: 1, width: '100%' },
    overlay: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        justifyContent: 'space-between',
    },
    headerInfo: { alignItems: 'center' },
    songTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    songArtist: { color: '#ccc', fontSize: 12 },
    duetIndicator: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
    sqAvatar: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#00D4FF', justifyContent: 'center', alignItems: 'center', marginHorizontal: 10, borderWidth: 2, borderColor: 'white' },
    pitchContainer: { height: 150, marginTop: 10 },
    lyricsContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    controls: { paddingBottom: 30, alignItems: 'center' },
    timerText: { color: COLORS.accent, fontSize: 32, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 20 },
    buttonsRow: { flexDirection: 'row', alignItems: 'center', width: '80%', justifyContent: 'space-between' },
    controlBtn: { alignItems: 'center' },
    btnLabel: { color: 'white', fontSize: 10, marginTop: 5 },
    recordOuter: {
        width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center',
    },
    recordInner: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },

    // Modal
    editModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
    editContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '50%' },
    editTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    effectRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
    effectBtn: { alignItems: 'center', padding: 10, borderRadius: 10, backgroundColor: COLORS.surfaceLight },
    effectActive: { backgroundColor: COLORS.primary },
    effectText: { color: '#888', marginTop: 5, fontSize: 10 },
    sliderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    sliderLabel: { color: 'white', width: 60 },
    sliderLine: { flex: 1, height: 4, backgroundColor: '#555', borderRadius: 2 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto' },
    secondaryBtn: { padding: 15 },
    primaryBtn: { backgroundColor: COLORS.accent, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
});

export default RecordingScreen;
