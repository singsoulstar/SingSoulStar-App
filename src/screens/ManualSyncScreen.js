import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { SongService } from '../services/SongService';

const ManualSyncScreen = ({ route, navigation }) => {
    const { songData } = route.params;
    const [lines, setLines] = useState(songData.rawLyrics.split('\n').filter(l => l.trim() !== ''));
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [syncedLyrics, setSyncedLyrics] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timer, setTimer] = useState(0);
    const [sound, setSound] = useState();

    // Load Audio
    useEffect(() => {
        async function loadAudio() {
            try {
                // Ensure audio playback is enabled in background/silent switch if needed
                await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

                const { sound: playbackObject } = await Audio.Sound.createAsync(
                    { uri: songData.audioFile.uri },
                    { shouldPlay: false }
                );
                setSound(playbackObject);

                // Status Update Loop for precise timer
                playbackObject.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded) {
                        setTimer(status.positionMillis);
                        setIsPlaying(status.isPlaying);
                        if (status.didJustFinish) {
                            setIsPlaying(false);
                            Alert.alert("Audio Finished", "Song ended. Submit sync?", [
                                { text: "No", style: 'cancel' },
                                { text: "Submit", onPress: saveSong }
                            ]);
                        }
                    }
                });
            } catch (error) {
                console.error("Error loading audio", error);
                Alert.alert("Error", "Could not load audio file.");
            }
        }

        loadAudio();

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    const togglePlay = async () => {
        if (!sound) return;
        if (isPlaying) {
            await sound.pauseAsync();
        } else {
            await sound.playAsync();
        }
    };

    const markLine = () => {
        if (currentLineIndex < lines.length) {
            let lineText = lines[currentLineIndex];
            let singer = 'Both';

            // Detect Singer Prefix
            if (lineText.startsWith('[A]') || lineText.startsWith('A:')) {
                singer = 'A';
                lineText = lineText.replace(/^(\[A\]|A:)\s*/, '');
            } else if (lineText.startsWith('[B]') || lineText.startsWith('B:')) {
                singer = 'B';
                lineText = lineText.replace(/^(\[B\]|B:)\s*/, '');
            }

            const newSyncLine = {
                time: timer,
                text: lineText,
                singer: singer
            };
            setSyncedLyrics([...syncedLyrics, newSyncLine]);
            setCurrentLineIndex(currentLineIndex + 1);
        } else {
            saveSong();
        }
    };

    const saveSong = async () => {
        if (sound) await sound.stopAsync();

        try {
            Alert.alert('Subiendo...', 'Tu canción se está enviando a la nube.');
            const metadata = {
                title: songData.title,
                artist: songData.artist,
                lyrics: syncedLyrics
            };
            await SongService.uploadSong(metadata, songData.audioFile, songData.coverFile);
            Alert.alert('¡Éxito!', 'Canción publicada en el catálogo global.', [
                { text: 'Genial', onPress: () => navigation.navigate('MainTabs') }
            ]);
        } catch (e) {
            console.error("Upload Error:", e);
            Alert.alert('Error', 'Hubo un problema al subir la canción.');
        }
    };

    const handleExit = () => {
        Alert.alert(
            "Cancelar Sincronización",
            "¿Estás seguro que quieres salir? Se perderá el progreso.",
            [
                { text: "Seguir Editando", style: "cancel" },
                {
                    text: "Salir sin guardar",
                    style: "destructive",
                    onPress: async () => {
                        if (sound) await sound.stopAsync();
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleExit}>
                    <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sync Lyrics</Text>
                <Text style={styles.timer}>{formatTime(timer)}</Text>
            </View>

            <View style={styles.lyricsPreview}>
                <ScrollView
                    contentContainerStyle={{ alignItems: 'center', paddingVertical: 100 }}
                    ref={ref => { this.scrollView = ref }}
                    onContentSizeChange={() => this.scrollView?.scrollToEnd({ animated: true })}
                >
                    {/* Show synced lines faded */}
                    {syncedLyrics.map((line, index) => (
                        <Text key={`synced-${index}`} style={styles.syncedLine}>
                            {line.text}
                        </Text>
                    ))}

                    {/* Show current line BIG */}
                    {currentLineIndex < lines.length && (
                        <Text style={styles.activeLine}>
                            {lines[currentLineIndex]}
                        </Text>
                    )}

                    {/* Show future lines */}
                    {lines.slice(currentLineIndex + 1, currentLineIndex + 3).map((line, index) => (
                        <Text key={`future-${index}`} style={styles.futureLine}>
                            {line}
                        </Text>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.controls}>
                <Text style={styles.instruction}>
                    {currentLineIndex < lines.length
                        ? `Tap "SYNC" when the line starts`
                        : "All lines synced! Press SAVE."}
                </Text>

                <View style={styles.buttonsRow}>
                    <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={30} color={COLORS.primary} />
                    </TouchableOpacity>

                    {currentLineIndex < lines.length ? (
                        <TouchableOpacity
                            style={styles.syncButton}
                            onPress={markLine}
                        >
                            <LinearGradient
                                colors={GRADIENTS.singButton}
                                style={styles.syncGradient}
                            >
                                <Text style={styles.syncText}>TAP LINE</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.syncButton, { backgroundColor: COLORS.success }]}
                            onPress={saveSong}
                        >
                            <View style={styles.syncGradient}>
                                <Text style={styles.syncText}>SAVE SONG</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const millis = Math.floor((ms % 1000) / 100);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${millis}`;
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' }, // Dark interface for Studio feel
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    timer: { color: COLORS.accent, fontSize: 20, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

    lyricsPreview: { flex: 1, justifyContent: 'center' },
    lyricLine: { fontSize: 18, marginVertical: 10, textAlign: 'center', paddingHorizontal: 20 },
    activeLine: { color: COLORS.accent, fontWeight: 'bold', fontSize: 26, textAlign: 'center', marginVertical: 20 },
    syncedLine: { color: '#666', fontSize: 16, textAlign: 'center' },
    futureLine: { color: '#999', fontSize: 14, textAlign: 'center', opacity: 0.5 },

    controls: { height: 180, backgroundColor: '#1A1A1A', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, justifyContent: 'space-around' },
    instruction: { color: '#ccc', textAlign: 'center', fontSize: 14 },
    buttonsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    playButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
    syncButton: { flex: 1, marginLeft: 20, height: 60, borderRadius: 30, overflow: 'hidden' },
    syncGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    syncText: { color: 'white', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
});

export default ManualSyncScreen;
