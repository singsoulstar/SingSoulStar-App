import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { SongService } from '../services/SongService';

const UploadScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [lrcFile, setLrcFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const pickAudio = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
            if (!result.canceled && result.assets) {
                setAudioFile(result.assets[0]);
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const pickImage = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: 'image/*' });
            if (!result.canceled && result.assets) {
                setCoverImage(result.assets[0]);
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const pickLrc = async () => {
        try {
            // Pick any file, usually .lrc or .txt
            const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
            if (!result.canceled && result.assets) {
                const file = result.assets[0];
                if (file.name.endsWith('.lrc') || file.name.endsWith('.txt')) {
                    setLrcFile(file);
                    // Clear manual lyrics if LRC is picked to avoid confusion
                    setLyrics('');
                } else {
                    Alert.alert('Invalid File', 'Please select a .lrc or .txt file');
                }
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const handleNext = async () => {
        if (!title || !artist || !audioFile) {
            Alert.alert('Missing Fields', 'Title, Artist, and Audio are required.');
            return;
        }

        if (lrcFile) {
            // AUTO SYNC FLOW
            setIsUploading(true);
            try {
                // Read LRC content
                // For web compatibility with Expo Document Picker, fetching the URI usually gives the blob/text
                const response = await fetch(lrcFile.uri);
                const lrcContent = await response.text();

                const parsedLyrics = SongService.parseLrc(lrcContent);

                if (parsedLyrics.length === 0) {
                    throw new Error("Could not parse lyrics. Check file format.");
                }

                const metadata = {
                    title,
                    artist,
                    lyrics: parsedLyrics
                };

                await SongService.uploadSong(metadata, audioFile, coverImage);

                Alert.alert('¡Éxito!', 'Canción con letra sincronizada subida correctamente.', [
                    { text: 'OK', onPress: () => navigation.navigate('MainTabs') }
                ]);

            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to process LRC file or upload song.');
            } finally {
                setIsUploading(false);
            }

        } else if (lyrics) {
            // MANUAL SYNC FLOW
            navigation.navigate('ManualSync', {
                songData: {
                    title,
                    artist,
                    audioFile: audioFile,
                    coverFile: coverImage,
                    rawLyrics: lyrics,
                }
            });
        } else {
            Alert.alert('Lyrics Missing', 'Please either paste lyrics OR select an LRC file.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Creator Studio</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Upload New Song</Text>
                <Text style={styles.subtitle}>Contribuye al catálogo de SingSoulStar</Text>

                {/* Metadata Form */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Song Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Bohemian Rhapsody"
                        placeholderTextColor={COLORS.textMuted}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Artist Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Queen"
                        placeholderTextColor={COLORS.textMuted}
                        value={artist}
                        onChangeText={setArtist}
                    />
                </View>

                {/* File Pickers */}
                <View style={styles.row}>
                    <TouchableOpacity style={[styles.fileButton, audioFile && styles.fileSelected]} onPress={pickAudio}>
                        <Ionicons name={audioFile ? "musical-notes" : "musical-note-outline"} size={24} color={audioFile ? COLORS.primary : COLORS.textMuted} />
                        <Text style={styles.fileButtonText}>{audioFile ? 'Audio Added' : 'Add Audio'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.fileButton, coverImage && styles.fileSelected]} onPress={pickImage}>
                        <Ionicons name={coverImage ? "image" : "image-outline"} size={24} color={coverImage ? COLORS.primary : COLORS.textMuted} />
                        <Text style={styles.fileButtonText}>{coverImage ? 'Cover Added' : 'Add Cover'}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.dividerText}>--- LYRICS (Choose One) ---</Text>

                {/* LRC Picker */}
                <TouchableOpacity style={[styles.lrcButton, lrcFile && styles.lrcSelected]} onPress={pickLrc}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="document-text-outline" size={24} color={lrcFile ? "white" : COLORS.text} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={[styles.lrcTitle, lrcFile && { color: 'white' }]}>
                                {lrcFile ? lrcFile.name : 'Upload .LRC File'}
                            </Text>
                            <Text style={[styles.lrcSubtitle, lrcFile && { color: 'rgba(255,255,255,0.8)' }]}>
                                Auto-sync lyrics instantly
                            </Text>
                        </View>
                    </View>
                    {lrcFile && <Ionicons name="checkmark-circle" size={24} color="white" />}
                </TouchableOpacity>

                {/* Manual Lyrics Input */}
                {!lrcFile && (
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>OR Paste Lyrics Manually</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Paste text here if you don't have an LRC file..."
                            placeholderTextColor={COLORS.textMuted}
                            multiline
                            textAlignVertical="top"
                            value={lyrics}
                            onChangeText={setLyrics}
                        />
                    </View>
                )}

                <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={isUploading}>
                    <LinearGradient
                        colors={GRADIENTS.primary}
                        style={styles.gradientBtn}
                    >
                        <Text style={styles.nextButtonText}>
                            {isUploading ? 'Uploading...' : (lrcFile ? 'Upload Song' : 'Next: Sync Lyrics')}
                        </Text>
                        {!isUploading && <Ionicons name="arrow-forward" size={20} color="white" />}
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background }, // Should be white now
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },
    sectionTitle: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    subtitle: { color: COLORS.textSecondary, marginBottom: 30 },
    formGroup: { marginBottom: 20 },
    label: { color: COLORS.text, marginBottom: 8, fontWeight: '600' },
    input: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 15, color: COLORS.text, fontSize: 16 },
    textArea: { height: 150 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    fileButton: { flex: 0.48, backgroundColor: '#F2F2F7', padding: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
    fileSelected: { borderColor: COLORS.primary, backgroundColor: '#E3F2FD' },
    fileButtonText: { color: COLORS.textMuted, marginTop: 10, fontSize: 12 },

    dividerText: { textAlign: 'center', color: COLORS.textMuted, marginVertical: 15, fontWeight: 'bold', fontSize: 12 },

    lrcButton: {
        backgroundColor: '#F2F2F7', padding: 15, borderRadius: 12, marginBottom: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
    },
    lrcSelected: { backgroundColor: COLORS.success }, // Green for success
    lrcTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: 16 },
    lrcSubtitle: { color: COLORS.textMuted, fontSize: 12 },

    nextButton: { marginTop: 20, borderRadius: 30, overflow: 'hidden' },
    gradientBtn: { paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    nextButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
});

export default UploadScreen;
