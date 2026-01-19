import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const SongCard = ({ title, artist, coverUrl, onSing }) => {
    return (
        <View style={styles.container}>
            <View style={styles.coverContainer}>
                {coverUrl ? (
                    <Image source={{ uri: coverUrl }} style={styles.coverImage} />
                ) : (
                    <View style={styles.placeholderCover}>
                        <Ionicons name="musical-note" size={24} color={COLORS.textMuted} />
                    </View>
                )}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{artist}</Text>
            </View>

            <TouchableOpacity style={styles.singButton} onPress={onSing}>
                <Text style={styles.singButtonText}>Sing</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceLight,
    },
    coverContainer: {
        marginRight: 12,
    },
    placeholderCover: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    infoContainer: {
        flex: 1,
    },
    title: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    artist: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    singButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.textSecondary,
    },
    singButtonText: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '500',
    },
});

export default SongCard;
