import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';

const ITEM_HEIGHT = 40; // Height of each lyric line

const LyricsView = ({ lyrics, currentTime, mode = 'Solo', userPart = 'Both' }) => {
    const scrollViewRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Find current lyric index based on time
    useEffect(() => {
        const index = lyrics.findIndex((line, i) => {
            const nextLine = lyrics[i + 1];
            return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
        });

        if (index !== -1 && index !== currentIndex) {
            setCurrentIndex(index);
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    y: index * ITEM_HEIGHT - 100,
                    animated: true,
                });
            }
        }
    }, [currentTime, lyrics]);

    const getLineStyle = (line, isActive) => {
        const isNotMyPart = mode === 'Duet' && userPart !== 'Both' && line.singer !== 'Both' && line.singer !== userPart;

        let style = { ...styles.text };
        if (isNotMyPart) {
            style.opacity = 0.3;
        }

        if (!isActive) return style;

        // StarMaker Color Coding:
        if (mode === 'Duet') {
            if (line.singer === 'A') return { ...style, color: '#00D4FF', fontSize: 22, fontWeight: 'bold', opacity: 1 };
            if (line.singer === 'B') return { ...style, color: '#FF00A2', fontSize: 22, fontWeight: 'bold', opacity: 1 };
        }
        return { ...style, color: COLORS.accent, fontSize: 22, fontWeight: 'bold', opacity: 1 };
    };

    return (
        <ScrollView
            ref={scrollViewRef}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ height: 100 }} />
            {lyrics.map((line, index) => {
                const isActive = index === currentIndex;
                const isPast = index < currentIndex;

                return (
                    <View key={index} style={[styles.line, { height: ITEM_HEIGHT }]}>
                        <Text style={[
                            getLineStyle(line, isActive),
                            isPast && styles.pastText
                        ]}>
                            {line.text}
                        </Text>
                        {mode === 'Duet' && line.singer && (
                            <Text style={styles.singerLabel}>{line.singer}</Text>
                        )}
                    </View>
                );
            })}
            <View style={{ height: 150 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    contentContainer: {
        alignItems: 'center',
    },
    line: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontSize: 16,
        opacity: 0.6,
        textAlign: 'center',
    },
    activeText: {
        color: COLORS.accent, // StarMaker proprietary pink/red
        fontSize: 22,
        fontWeight: 'bold',
        opacity: 1,
    },
    pastText: {
        color: COLORS.primary,
        opacity: 0.8,
    },
    singerLabel: {
        position: 'absolute',
        left: 20,
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default LyricsView;
