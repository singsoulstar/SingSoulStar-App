import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform, Alert, Modal, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import LyricsView from '../components/LyricsView';
import PitchVisualizer from '../components/PitchVisualizer';
import { RecordingService } from '../services/RecordingService';
import { ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get('window');

const RecordingScreen = ({ route, navigation }) => {
    // metadata coming from Supabase or Local Sync
    const { song, mode = 'Solo', isJoining = false, isNewCollab = false, role = 'Both', parentRecording = null } = route.params || {};

    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [recording, setRecording] = useState(null);
    const [backingTrack, setBackingTrack] = useState(null);
    const [parentSound, setParentSound] = useState(null); // Audio of the person we are joining
    const [playbackStatus, setPlaybackStatus] = useState(null);
    const [showPostRecord, setShowPostRecord] = useState(false);
    const [audioEffect, setAudioEffect] = useState('Studio');
    const [recordingUri, setRecordingUri] = useState(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [userPart, setUserPart] = useState(mode === 'Duet' ? role : 'Both');
    const [isVideoMode, setIsVideoMode] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

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

                // Pre-load backing track (The instrumental or full song)
                const audioUrl = song.audio_url || (song.audioFile ? song.audioFile.uri : null);
                if (audioUrl) {
                    const { sound } = await Audio.Sound.createAsync(
                        { uri: audioUrl },
                        { shouldPlay: false, volume: isJoining ? 0.8 : 1.0 }, // Lower volume slightly if joining to hear vocals? Actually usually instrumental is quiet.
                        onPlaybackStatusUpdate
                    );
                    setBackingTrack(sound);
                }

                // Pre-load Parent Recording (The vocals of the person we join)
                if (isJoining && parentRecording?.audio_url) {
                    const { sound } = await Audio.Sound.createAsync(
                        { uri: parentRecording.audio_url },
                        { shouldPlay: false, volume: 1.0 }
                    );
                    setParentSound(sound);
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
            if (parentSound) parentSound.unloadAsync();
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
            // 1. Start Backing Tracks (Sync)
            if (backingTrack) {
                await backingTrack.setPositionAsync(0);
                await backingTrack.playAsync();
            }
            if (parentSound) {
                await parentSound.setPositionAsync(0);
                await parentSound.playAsync();
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
            // 1. Stop Backing Tracks
            if (backingTrack) await backingTrack.stopAsync();
            if (parentSound) await parentSound.stopAsync();

            // 2. Stop Recording
            if (recording) {
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();
                setRecordingUri(uri);
            }
            setShowPostRecord(true);
        } catch (error) {
            console.error("Stop error:", error);
            setShowPostRecord(true);
        }
    }

    const handlePublish = async () => {
        if (!recordingUri) {
            Alert.alert("Error", "No hay grabación para publicar.");
            return;
        }

        setIsPublishing(true);
        try {
            await RecordingService.uploadRecording(
                {
                    songId: song.id,
                    effect: audioEffect,
                    mode: mode,
                    duration: duration,
                    // Duet Metadata
                    parent_id: isJoining ? parentRecording.id : null,
                    is_open_collab: isNewCollab, // If starting a new collab, this is TRUE
                    collab_part: userPart
                },
                { uri: recordingUri }
            );

            setShowPostRecord(false);
            Alert.alert(
                "¡Éxito!",
                isNewCollab ? "Tu dueto está abierto. ¡Otros podrán unirse!" : "Tu cover ha sido publicado correctamente."
            );
            navigation.navigate('Main');
        } catch (error) {
            console.error("Publish error:", error);
            Alert.alert("Error de Publicación", "Hubo un problema al subir tu cover.");
        } finally {
            setIsPublishing(false);
        }
    };

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
                {isVideoMode && permission?.granted ? (
                    <CameraView style={StyleSheet.absoluteFill} facing="front" />
                ) : (
                    <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'rgba(23,21,32,0.95)']}
                        style={styles.overlay}
                    />
                )}

                <View style={[styles.overlay, isVideoMode && { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                    <SafeAreaView style={styles.safeArea}>
                        {/* Custom Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                                <Ionicons name="chevron-down" size={28} color="white" />
                            </TouchableOpacity>
                            <View style={styles.songInfo}>
                                <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                                <Text style={styles.songArtist}>
                                    {isJoining ? `Duet with ${parentRecording?.profiles?.username || 'Star'}` : song.artist}
                                </Text>
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
                                    <TouchableOpacity
                                        style={[styles.participant, userPart === 'A' && styles.activeParticipant, { borderColor: '#00D4FF' }]}
                                        onPress={() => !isJoining && setUserPart('A')} // Lock if joining
                                        disabled={isJoining}
                                    >
                                        <Text style={styles.participantText}>SINGER A</Text>
                                        {((isJoining && role === 'A') || (!isJoining && userPart === 'A')) && <View style={styles.meBadge}><Text style={styles.meText}>ME</Text></View>}
                                    </TouchableOpacity>
                                    <View style={styles.duetVS}>
                                        <Text style={styles.vsText}>VS</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.participant, userPart === 'B' && styles.activeParticipant, { borderColor: '#FF00A2' }]}
                                        onPress={() => !isJoining && setUserPart('B')} // Lock if joining
                                        disabled={isJoining}
                                    >
                                        <Text style={styles.participantText}>SINGER B</Text>
                                        {((isJoining && role === 'B') || (!isJoining && userPart === 'B')) && <View style={styles.meBadge}><Text style={styles.meText}>ME</Text></View>}
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Pitch Visualizer */}
                            <View style={styles.pitchHost}>
                                <PitchVisualizer currentTime={duration} isRecording={isRecording} />
                            </View>

                            {/* Lyrics View */}
                            <View style={styles.lyricsWrapper}>
                                <LyricsView
                                    lyrics={song.lyrics || []}
                                    currentTime={duration}
                                    mode={mode}
                                    userPart={userPart}
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
                                <TouchableOpacity
                                    style={styles.sideBtn}
                                    onPress={async () => {
                                        if (!permission?.granted) {
                                            const { status } = await requestPermission();
                                            if (status === 'granted') setIsVideoMode(!isVideoMode);
                                            else Alert.alert("Permiso Denegado", "Se necesita cámara para el modo video.");
                                        } else {
                                            setIsVideoMode(!isVideoMode);
                                        }
                                    }}
                                >
                                    <View style={[styles.iconCircle, isVideoMode && styles.activeIconCircle]}>
                                        <Ionicons name={isVideoMode ? "videocam" : "videocam-outline"} size={24} color="white" />
                                    </View>
                                    <Text style={styles.sideText}>{isVideoMode ? 'On' : 'Off'}</Text>
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

                                <TouchableOpacity style={styles.sideBtn} onPress={() => setAudioEffect('Reverb')}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="options-outline" size={24} color="white" />
                                    </View>
                                    <Text style={styles.sideText}>Efectos</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>
            </ImageBackground>

            {/* Studio Effects Modal */}
            <Modal visible={showPostRecord} animationType="slide" transparent={true}>
                <View style={styles.modalBg}>
                    <View style={styles.modalSheet}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>Estudio de Sonido</Text>

                        <View style={styles.effectsGrid}>
                            <EffectCard name="Original" icon="musical-notes" active={audioEffect === 'Original'} onPress={() => setAudioEffect('Original')} />
                            <EffectCard name="Pop" icon="sparkles" active={audioEffect === 'Pop'} onPress={() => setAudioEffect('Pop')} />
                            <EffectCard name="Estudio" icon="business" active={audioEffect === 'Studio'} onPress={() => setAudioEffect('Studio')} />
                            <EffectCard name="Reverb" icon="water" active={audioEffect === 'Reverb'} onPress={() => setAudioEffect('Reverb')} />
                        </View>

                        <View style={styles.saveSection}>
                            <TouchableOpacity style={styles.discardBtn} onPress={() => setShowPostRecord(false)}>
                                <Text style={styles.discardText}>Descartar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.finishBtn, isPublishing && styles.disabledBtn]}
                                onPress={handlePublish}
                                disabled={isPublishing}
                            >
                                <LinearGradient colors={GRADIENTS.primary} style={styles.finishGradient}>
                                    {isPublishing ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.finishText}>
                                            {isNewCollab ? "Abrir Colabo" : "Publicar"}
                                        </Text>
                                    )}
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
    participant: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
    activeParticipant: { opacity: 1, backgroundColor: 'rgba(255,255,255,0.2)', transform: [{ scale: 1.1 }] },
    participantText: { color: 'white', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
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
    disabledBtn: { opacity: 0.6 },

    meBadge: { position: 'absolute', bottom: -10, backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#fff' },
    meText: { color: 'white', fontSize: 8, fontWeight: 'bold' },
});

export default RecordingScreen;
