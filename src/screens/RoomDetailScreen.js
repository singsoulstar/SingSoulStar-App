import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, TextInput, FlatList, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SEATS = [
    { id: '1', name: 'Host', avatar: 'https://i.pravatar.cc/150?u=host', isHost: true, mic: true },
    { id: '2', name: 'User 1', avatar: 'https://i.pravatar.cc/150?u=2', mic: false },
    { id: '3', name: 'User 2', avatar: 'https://i.pravatar.cc/150?u=3', mic: false },
    { id: '4', name: 'Empty', avatar: null },
    { id: '5', name: 'Empty', avatar: null },
    { id: '6', name: 'Empty', avatar: null },
    { id: '7', name: 'Empty', avatar: null },
    { id: '8', name: 'Empty', avatar: null },
    { id: '9', name: 'Empty', avatar: null },
];

const MOCK_CHAT = [
    { id: '1', user: 'System', text: 'Welcome to the room! Follow the rules.', type: 'system' },
    { id: '2', user: 'Juan', text: 'Hello everyone! 👋', type: 'msg' },
    { id: '3', user: 'Maria', text: 'Can I sing next?', type: 'msg' },
];

const RoomDetailScreen = ({ route, navigation }) => {
    const { room } = route.params || { room: { name: 'Live Room', host: 'Host', cover: 'https://via.placeholder.com/400' } };
    const [messages, setMessages] = useState(MOCK_CHAT);
    const [inputText, setInputText] = useState('');
    const [giftAnimation, setGiftAnimation] = useState(new Animated.Value(0));
    const [showGift, setShowGift] = useState(false);

    const chatRef = useRef(null);

    const sendMessage = () => {
        if (!inputText.trim()) return;
        const newMsg = { id: Date.now().toString(), user: 'Me', text: inputText, type: 'msg' };
        setMessages([...messages, newMsg]);
        setInputText('');
    };

    const sendGift = () => {
        setShowGift(true);
        Animated.sequence([
            Animated.spring(giftAnimation, { toValue: 1, useNativeDriver: true }),
            Animated.delay(1000),
            Animated.timing(giftAnimation, { toValue: 0, duration: 500, useNativeDriver: true })
        ]).start(() => setShowGift(false));
    };

    const renderSeat = ({ item, index }) => (
        <View style={styles.seatContainer}>
            <View style={styles.seatCircle}>
                {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.seatAvatar} />
                ) : (
                    <Ionicons name="add" size={24} color="rgba(255,255,255,0.3)" />
                )}
                {item.isHost && (
                    <View style={styles.hostBadge}>
                        <Text style={styles.hostText}>Host</Text>
                    </View>
                )}
                {item.mic && (
                    <View style={styles.micBadge}>
                        <Ionicons name="mic" size={10} color="white" />
                    </View>
                )}
            </View>
            <Text style={styles.seatName}>{item.name}</Text>
        </View>
    );

    const renderMessage = ({ item }) => (
        <View style={[styles.chatBubble, item.type === 'system' && styles.systemBubble]}>
            <Text style={[styles.chatUser, item.type === 'system' && styles.systemText]}>
                {item.user}: <Text style={styles.chatText}>{item.text}</Text>
            </Text>
        </View>
    );

    return (
        <ImageBackground source={{ uri: room.cover }} style={styles.container} blurRadius={30}>
            <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']} style={styles.overlay}>
                <SafeAreaView style={styles.safeArea}>

                    {/* Top Bar */}
                    <View style={styles.header}>
                        <View style={styles.roomInfoPill}>
                            <Image source={{ uri: room.cover }} style={styles.roomThumb} />
                            <View>
                                <Text style={styles.roomTitle}>{room.name}</Text>
                                <Text style={styles.roomId}>ID: 123456</Text>
                            </View>
                            <TouchableOpacity style={styles.followBtn}>
                                <Text style={styles.followText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.headerRight}>
                            <View style={styles.onlinePill}>
                                <Text style={styles.onlineText}>124</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Seats Grid */}
                    <View style={styles.seatsGrid}>
                        <FlatList
                            data={SEATS}
                            renderItem={renderSeat}
                            keyExtractor={item => item.id}
                            numColumns={3}
                            scrollEnabled={false}
                            columnWrapperStyle={styles.seatRow}
                        />
                    </View>

                    {/* Middle Spacer (Lyrics/Game area) */}
                    <View style={{ flex: 1 }} />

                    {/* Chat Area */}
                    <View style={styles.chatContainer}>
                        <FlatList
                            ref={chatRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={item => item.id}
                            style={styles.chatList}
                            contentContainerStyle={{ paddingBottom: 10 }}
                            onContentSizeChange={() => chatRef.current.scrollToEnd()}
                        />
                    </View>

                    {/* Bottom Bar */}
                    <View style={styles.bottomBar}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="chatbox-ellipses-outline" size={24} color="white" />
                        </TouchableOpacity>

                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Say hi..."
                                placeholderTextColor="#ccc"
                                style={styles.input}
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={sendMessage}
                            />
                        </View>

                        <TouchableOpacity style={styles.micBtn}>
                            <Ionicons name="mic-outline" size={24} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.giftBtn} onPress={sendGift}>
                            <LinearGradient colors={['#FFD700', '#FF8C00']} style={styles.giftGradient}>
                                <Ionicons name="gift" size={24} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Gift Animation Overlay */}
                    {showGift && (
                        <Animated.View style={[styles.giftOverlay, {
                            opacity: giftAnimation,
                            transform: [{ scale: giftAnimation }]
                        }]}>
                            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4213/4213958.png' }} style={styles.giftImage} />
                            <Text style={styles.giftTextCombo}>x1</Text>
                        </Animated.View>
                    )}

                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    overlay: { flex: 1 },
    safeArea: { flex: 1 },

    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'flex-start' },
    roomInfoPill: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 4, alignItems: 'center', paddingRight: 10 },
    roomThumb: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
    roomTitle: { color: 'white', fontSize: 12, fontWeight: 'bold', maxWidth: 100 },
    roomId: { color: '#ccc', fontSize: 10 },
    followBtn: { backgroundColor: COLORS.accent, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 5 },
    followText: { color: 'white', fontWeight: 'bold' },

    headerRight: { flexDirection: 'row', alignItems: 'center' },
    onlinePill: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginRight: 10 },
    onlineText: { color: 'white', fontSize: 12 },
    closeBtn: { padding: 5 },

    seatsGrid: { marginTop: 20, paddingHorizontal: 20 },
    seatRow: { justifyContent: 'space-around', marginBottom: 20 },
    seatContainer: { alignItems: 'center', width: width / 3.5 },
    seatCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    seatAvatar: { width: '100%', height: '100%', borderRadius: 30 },
    seatName: { color: 'white', fontSize: 10, marginTop: 4 },
    hostBadge: { position: 'absolute', bottom: -5, backgroundColor: COLORS.primary, paddingHorizontal: 4, borderRadius: 4 },
    hostText: { color: 'white', fontSize: 8, fontWeight: 'bold' },
    micBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'blue', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

    chatContainer: { height: 200, paddingHorizontal: 15, paddingBottom: 10 },
    chatBubble: { backgroundColor: 'rgba(0,0,0,0.4)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginBottom: 5, maxWidth: '80%' },
    systemBubble: { backgroundColor: 'transparent', alignSelf: 'center' },
    chatUser: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },
    chatText: { color: 'white', fontWeight: 'normal' },
    systemText: { color: COLORS.accent, fontStyle: 'italic' },

    bottomBar: { flexDirection: 'row', padding: 10, alignItems: 'center', paddingBottom: 20 },
    iconBtn: { padding: 10 },
    inputContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, paddingHorizontal: 15, marginHorizontal: 10, height: 40, justifyContent: 'center' },
    input: { color: 'white' },
    micBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    giftBtn: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
    giftGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    giftOverlay: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center' },
    giftImage: { width: 100, height: 100 },
    giftTextCombo: { color: COLORS.accent, fontSize: 32, fontWeight: 'bold', textShadowColor: 'black', textShadowRadius: 10 },
});

export default RoomDetailScreen;
