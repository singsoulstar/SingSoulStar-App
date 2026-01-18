import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');
const VISUALIZER_HEIGHT = 150;
const SEGMENT_WIDTH = 20;

// Mock Pitch Data Pattern (Curve)
const MOCK_PITCH_DATA = [
    50, 55, 60, 65, 70, 75, 70, 60, 50, 45, 40, 45, 55, 70, 85, 90, 85, 70, 60, 50,
    55, 60, 65, 70, 75, 70, 60, 50, 45, 40, 45, 55, 70, 85, 90, 85, 70, 60, 50
];

const PitchVisualizer = ({ currentTime, isRecording }) => {
    const scrollX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isRecording) {
            // Animate the pitch line scrolling
            Animated.loop(
                Animated.timing(scrollX, {
                    toValue: -SEGMENT_WIDTH * MOCK_PITCH_DATA.length,
                    duration: 10000, // Speed of scroll
                    useNativeDriver: true,
                })
            ).start();
        } else {
            scrollX.stopAnimation();
        }
    }, [isRecording]);

    // Create a smooth bezier-like path from data points
    const createCurvePath = () => {
        let path = `M 0 ${VISUALIZER_HEIGHT / 2}`;
        MOCK_PITCH_DATA.forEach((val, index) => {
            const x = index * SEGMENT_WIDTH;
            const y = VISUALIZER_HEIGHT - val; // Invert for SVG coords
            path += ` L ${x} ${y}`;
            // Note: For true Bezier, we'd calculate control points, 
            // but LineTo (L) with dense points creates a decent approximation for MVP
        });
        return path;
    };

    return (
        <View style={styles.container}>
            <View style={styles.pitchLane}>
                {/* Guides to look like musical staff */}
                <View style={styles.staffLine} />
                <View style={[styles.staffLine, { top: '40%' }]} />
                <View style={[styles.staffLine, { top: '60%' }]} />

                <Animated.View style={{ transform: [{ translateX: scrollX }], width: SEGMENT_WIDTH * MOCK_PITCH_DATA.length * 2, flexDirection: 'row' }}>
                    <Svg height={VISUALIZER_HEIGHT} width={SEGMENT_WIDTH * MOCK_PITCH_DATA.length}>
                        <Defs>
                            <LinearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={COLORS.primary} stopOpacity="1" />
                                <Stop offset="1" stopColor={COLORS.accent} stopOpacity="1" />
                            </LinearGradient>
                        </Defs>
                        <Path
                            d={createCurvePath()}
                            stroke="url(#pitchGrad)"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                    {/* Repeat pattern for loop illusion */}
                    <Svg height={VISUALIZER_HEIGHT} width={SEGMENT_WIDTH * MOCK_PITCH_DATA.length}>
                        <Path
                            d={createCurvePath()}
                            stroke="url(#pitchGrad)"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </Animated.View>

                {/* Current Pitch Indıcator (The "Ball" that jumps) */}
                <View style={styles.pitchIndicator} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: VISUALIZER_HEIGHT,
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    pitchLane: {
        flex: 1,
        justifyContent: 'center',
    },
    staffLine: {
        position: 'absolute',
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: '20%',
    },
    pitchIndicator: {
        position: 'absolute',
        left: 50, // Fixed position where the "voice" hits
        top: '50%', // Dynamic in real app based on mic input
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFF',
        elevation: 5,
        shadowColor: COLORS.accent,
        shadowRadius: 5,
        shadowOpacity: 1,
    }
});

export default PitchVisualizer;
