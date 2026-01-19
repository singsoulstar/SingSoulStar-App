import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform, Alert, Modal, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import LyricsView from '../components/LyricsView';
import PitchVisualizer from '../components/PitchVisualizer';

const { width, height } = Dimensions.get('window');

const RecordingScreen = ({ route, navigation }) => {
    // metadata coming from Supabase or Local Sync
    const { song, mode = 'Solo' } = route.params || {};

    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [recording, setRecording] = useState(null);
    const [backingTrack, setBackingTrack] = useState(null);
    const [playbackStatus, setPlaybackStatus] = useState(null);
    const [showPostRecord, setShowPostRecord] = useState(false);
    const [audioEffect, setAudioEffect] = useState('Studio');

    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Permissions & Audio Setup
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Audio.requestPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permiso necesario', 'Necesitamos acceso al micrófono para grabar tu voz.');
                }

                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                    shouldRouteThroughEarpieceAndroid: false,
                });

                // Pre-load backing track
                const audioUrl = song.audio_url || (song.audioFile ? song.audioFile.uri : null);
                if (audioUrl) {
                    const { sound } = await Audio.Sound.createAsync(
                        { uri: audioUrl },
                        { shouldPlay: false },
                        onPlaybackStatusUpdate
                    );
                    setBackingTrack(sound);
                }
            } catch (e) {
                console.error("Setup Error:", e);
            }
        })();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
        }).start();

        return () => {
            if (backingTrack) backingTrack.unloadAsync();
            if (recording) recording.stopAndUnloadAsync();
        };
    }, []);

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setPlaybackStatus(status);
            setDuration(status.positionMillis);
            if (status.didJustFinish) {
                stopRecording();
            }
        }
    };

    async function startRecording() {
        try {
            // 1. Start Backing Track
            if (backingTrack) {
                await backingTrack.playAsync();
            }

            // 2. Start Microphone Recording
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert("Error", "No se pudo iniciar la grabación.");
        }
    }

    async function stopRecording() {
        setIsRecording(false);
        try {
            // 1. Stop Backing Track
            if (backingTrack) {
                await backingTrack.stopAsync();
            }

            // 2. Stop Recording
            if (recording) {
                await recording.stopAndUnloadAsync();
            }
            setShowPostRecord(true);
        } catch (error) {
            console.error("Stop error:", error);
            setShowPostRecord(true);
        }
    }

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const progress = playbackStatus?.durationMillis
        ? (playbackStatus.positionMillis / playbackStatus.durationMillis) * 100
        : 0;

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: song.cover_url || 'https://via.placeholder.com/800' }}
                style={styles.backgroundImage}
                blurRadius={Platform.OS === 'web' ? 10 : 30}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'rgba(23,21,32,0.95)']}
                    style={styles.overlay}
                >
                    <SafeAreaView style={styles.safeArea}>
                        {/* Custom Header (StarMaker Style) */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                                <Ionicons name="chevron-down" size={28} color="white" />
                            </TouchableOpacity>
                            <View style={styles.songInfo}>
                                <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                                <Text style={styles.songArtist}>{song.artist}</Text>
                            </View>
                            <TouchableOpacity style={styles.headerIcon}>
                                <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Progress Bar Top */}
                        <View style={styles.progressTopContainer}>
                            <View style={[styles.progressLine, { width: `${progress}%` }]} />
                        </View>

                        {/* Middle Content: Lyrics & Pitch */}
                        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
                            {/* Duet Participant Indicators */}
                            {mode === 'Duet' && (
                                <View style={styles.duetHeader}>
                                    <View style={[styles.participant, { borderColor: '#00D4FF' }]}>
                                        <Text style={styles.participantText}>TÚ</Text>
                                    </View>
                                    <View style={styles.duetVS}>
                                        <Text style={styles.vsText}>VS</Text>
                                    </View>
                                    <View style={[styles.participant, { borderColor: '#FF00A2', opacity: 0.5 }]}>
                                        <Text style={styles.participantText}>JOIN</Text>
                                    </View>
                                </View>
                            )}

                            {/* Pitch Visualizer */}
                            <View style={styles.pitchHost}>
                                <PitchVisualizer currentTime={duration} isRecording={isRecording} />
                            </View>

                            {/* New StarMaker Lyrics Layout */}
                            <View style={styles.lyricsWrapper}>
                                <LyricsView
                                    lyrics={song.lyrics || []}
                                    currentTime={duration}
                                    mode={mode}
                                />
                            </View>
                        </Animated.View>

                        {/* Premium Bottom Controls */}
                        <View style={styles.bottomControls}>
                            <View style={styles.timeInfo}>
                                <Text style={styles.timerLarge}>{formatTime(duration)}</Text>
                                <Text style={styles.totalTime}> / {playbackStatus?.durationMillis ? formatTime(playbackStatus.durationMillis) : '0:00'}</Text>
                            </View>

                            <View style={styles.actionsRow}>
                                <TouchableOpacity style={styles.sideBtn}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="videocam-outline" size={24} color="white" />
                                    </View>
                                    <Text style={styles.sideText}>Video</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.mainRecordBtn}
                                    onPress={isRecording ? stopRecording : startRecording}
                                >
                                    <LinearGradient
                                        colors={isRecording ? ['#FF416C', '#FF4B2B'] : GRADIENTS.primary}
                                        style={styles.recordGradient}
                                    >
                                        <View style={styles.recordHole}>
                                            <Ionicons name={isRecording ? "stop" : "mic"} size={36} color="white" />
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.sideBtn}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="options-outline" size={24} color="white" />
                                    </View>
                                    <Text style={styles.sideText}>Efectos</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </ImageBackground>

            {/* Studio Effects Modal (StarMaker Style) */}
            <Modal visible={showPostRecord} animationType="slide" transparent={true}>
                <View style={styles.modalBg}>
                    <View style={styles.modalSheet}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>Estudio de Sonido</Text>

                        <View style={styles.effectsGrid}>
                            <EffectCard name="Original" icon="musical-notes" active={audioEffect === 'Original'} onPress={() => setAudioEffect('Original')} />
                            <EffectCard name="Pop" icon="sparkles" active={audioEffect === 'Pop'} onPress={() => setAudioEffect('Pop')} />
                            <EffectCard name="Estudio" icon="business" active={audioEffect === 'Studio'} onPress={() => setAudioEffect('Studio')} />
                            <EffectCard name="Reverberación" icon="water" active={audioEffect === 'Reverb'} onPress={() => setAudioEffect('Reverb')} />
                        </View>

                        <View style={styles.saveSection}>
                            <TouchableOpacity style={styles.discardBtn} onPress={() => setShowPostRecord(false)}>
                                <Text style={styles.discardText}>Descartar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.finishBtn}
                                onPress={() => {
                                    setShowPostRecord(false);
                                    Alert.alert("¡Grabación Guardada!", "Tu cover se ha publicado en tu perfil.");
                                    navigation.goBack();
                                }}
                            >
                                <LinearGradient colors={GRADIENTS.primary} style={styles.finishGradient}>
                                    <Text style={styles.finishText}>Publicar Cover</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const EffectCard = ({ name, icon, active, onPress }) => (
    <TouchableOpacity style={[styles.effectCard, active && styles.activeCard]} onPress={onPress}>
        <View style={[styles.effectIcon, active && styles.activeIconCircle]}>
            <Ionicons name={icon} size={24} color={active ? 'white' : '#888'} />
        </View>
        <Text style={[styles.effectLabel, active && styles.activeLabel]}>{name}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111' },
    backgroundImage: { flex: 1 },
    overlay: { flex: 1 },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, justifyContent: 'space-between' },
    headerIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    songInfo: { flex: 1, alignItems: 'center' },
    songTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 2 },
    songArtist: { color: '#bbb', fontSize: 13, marginTop: 2 },

    progressTopContainer: { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 15 },
    progressLine: { height: '100%', backgroundColor: COLORS.primary },

    mainContent: { flex: 1 },
    duetHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    participant: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    participantText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    duetVS: { marginHorizontal: 15 },
    vsText: { color: 'white', fontWeight: 'bold', fontStyle: 'italic' },

    pitchHost: { height: 120, marginVertical: 20 },
    lyricsWrapper: { flex: 1, paddingHorizontal: 20 },

    bottomControls: { paddingBottom: 40, alignItems: 'center' },
    timeInfo: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 25 },
    timerLarge: { color: 'white', fontSize: 40, fontWeight: '300' },
    totalTime: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },

    actionsRow: { flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'space-around' },
    sideBtn: { alignItems: 'center', gap: 5 },
    iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    sideText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

    mainRecordBtn: { width: 90, height: 90, borderRadius: 45, padding: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
    recordGradient: { flex: 1, borderRadius: 42, justifyContent: 'center', alignItems: 'center' },
    recordHole: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },

    // Modal
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: '#1C1B21', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 50 },
    sheetHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    sheetTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
    effectsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
    effectCard: { alignItems: 'center', gap: 10 },
    effectIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    activeIconCircle: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    effectLabel: { color: '#888', fontSize: 12 },
    activeLabel: { color: 'white', fontWeight: 'bold' },

    saveSection: { flexDirection: 'row', gap: 15, alignItems: 'center' },
    discardBtn: { flex: 1, paddingVertical: 18, alignItems: 'center' },
    discardText: { color: '#888', fontSize: 16 },
    finishBtn: { flex: 2, borderRadius: 30, overflow: 'hidden' },
    finishGradient: { paddingVertical: 18, alignItems: 'center' },
    finishText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default RecordingScreen;


export default RecordingScreen;
