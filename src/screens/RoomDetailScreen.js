import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, TextInput, FlatList, Animated, Dimensions, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { RoomService } from '../services/RoomService';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const INITIAL_SEATS = Array(9).fill(null).map((_, i) => ({
    id: i.toString(),
    index: i,
    name: i === 0 ? 'Host' : 'Empty',
    avatar: i === 0 ? 'https://i.pravatar.cc/150?u=host' : null,
    isHost: i === 0,
    mic: i === 0,
    user_id: i === 0 ? 'host' : null
}));

const RoomDetailScreen = ({ route, navigation }) => {
    const { room } = route.params || { room: { id: 'test_room', name: 'Live Room', host: 'Host', cover: 'https://via.placeholder.com/400' } };
    const { user } = useAuth();

    // State
    const [seats, setSeats] = useState(INITIAL_SEATS);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [giftAnimation, setGiftAnimation] = useState(new Animated.Value(0));
    const [showGift, setShowGift] = useState(false);
    const [channel, setChannel] = useState(null);

    const chatRef = useRef(null);

    useEffect(() => {
        // Subscribe to Realtime Room
        const newChannel = RoomService.subscribeToRoom(
            room.id,
            (msg) => setMessages(prev => [...prev, msg]),
            (seatPayload) => updateSeatState(seatPayload),
            (giftPayload) => triggerGiftAnimation(giftPayload)
        );
        setChannel(newChannel);

        // System Welcome Message
        setMessages([{ id: 'sys', user: 'System', text: `Welcome to ${room.name}!`, type: 'system' }]);

        return () => {
            if (newChannel) supabase.removeChannel(newChannel);
        };
    }, [room.id]);

    const updateSeatState = ({ index, user: seatUser }) => {
        setSeats(prev => prev.map(seat => {
            if (seat.index === index) {
                return {
                    ...seat,
                    name: seatUser ? seatUser.name : 'Empty',
                    avatar: seatUser ? seatUser.avatar : null,
                    user_id: seatUser ? seatUser.id : null,
                    mic: !!seatUser
                };
            }
            return seat;
        }));
    };

    const triggerGiftAnimation = (payload) => {
        // Could show who sent what
        // console.log("Gift received", payload);
        setShowGift(true);
        Animated.sequence([
            Animated.spring(giftAnimation, { toValue: 1, useNativeDriver: true }),
            Animated.delay(1000),
            Animated.timing(giftAnimation, { toValue: 0, duration: 500, useNativeDriver: true })
        ]).start(() => setShowGift(false));
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;
        if (!user) {
            Alert.alert("Login Required", "Please login to chat.");
            return;
        }

        await RoomService.sendMessage(channel, user, inputText);
        // Optimistic update handled by broadcast subscription usually, 
        // but since we allow self-broadcast in RoomService, we wait for it to come back.
        setInputText('');
    };

    const sendGift = async () => {
        if (!user) return;
        await RoomService.sendGift(channel, user, 'Heart');
    };

    const handleSeatPress = async (seat) => {
        // Logic: If empty, take it. If mine, leave it.
        if (!user) return;

        // Check if I'm already in a seat
        const myCurrentSeat = seats.find(s => s.user_id === user.id);

        if (seat.user_id === user.id) {
            // Leave seat
            Alert.alert("Leave Seat", "Do you want to step down?", [
                { text: "Cancel", style: "cancel" },
                { text: "Leave", onPress: () => RoomService.updateSeat(channel, seat.index, null) }
            ]);
        } else if (!seat.user_id) {
            // Take seat (only if I'm not seated elsewhere)
            if (myCurrentSeat) {
                Alert.alert("Info", "You are already seated.");
            } else {
                await RoomService.updateSeat(channel, seat.index, user);
            }
        }
    };

    const renderSeat = ({ item }) => (
        <TouchableOpacity
            style={styles.seatContainer}
            onPress={() => handleSeatPress(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.seatCircle, item.mic && { borderColor: COLORS.success }]}>
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
                {item.user_id && item.mic && (
                    <View style={styles.micBadge}>
                        <Ionicons name="mic" size={10} color="white" />
                    </View>
                )}
            </View>
            <Text style={styles.seatName} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
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
                                <Text style={styles.roomTitle} numberOfLines={1}>{room.name}</Text>
                                <Text style={styles.roomId}>ID: {room.id.substring(0, 6)}</Text>
                            </View>
                            <TouchableOpacity style={styles.followBtn}>
                                <Text style={styles.followText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.headerRight}>
                            <View style={styles.onlinePill}>
                                <Text style={styles.onlineText}>LIVE</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Seats Grid */}
                    <View style={styles.seatsGrid}>
                        <FlatList
                            data={seats}
                            renderItem={renderSeat}
                            keyExtractor={item => item.id}
                            numColumns={3}
                            scrollEnabled={false}
                            columnWrapperStyle={styles.seatRow}
                        />
                    </View>

                    {/* Middle Spacer */}
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
                            onContentSizeChange={() => chatRef.current?.scrollToEnd()}
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
    onlinePill: { backgroundColor: 'rgba(255,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginRight: 10 },
    onlineText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    closeBtn: { padding: 5 },

    seatsGrid: { marginTop: 20, paddingHorizontal: 20 },
    seatRow: { justifyContent: 'space-around', marginBottom: 20 },
    seatContainer: { alignItems: 'center', width: width / 3.5 },
    seatCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    seatAvatar: { width: '100%', height: '100%', borderRadius: 30 },
    seatName: { color: 'white', fontSize: 10, marginTop: 4 },
    hostBadge: { position: 'absolute', bottom: -5, backgroundColor: COLORS.primary, paddingHorizontal: 4, borderRadius: 4 },
    hostText: { color: 'white', fontSize: 8, fontWeight: 'bold' },
    micBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.success, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

    chatContainer: { height: 200, paddingHorizontal: 15, paddingBottom: 10 },
    chatList: { flex: 1 },
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
