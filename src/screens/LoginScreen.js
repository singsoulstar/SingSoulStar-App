import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, TextInput, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (!email) return alert('Please enter an email (Try admin@singsoulstar.com)');
        login(email, password);
    };

    const handleMockLogin = (role) => {
        if (role === 'admin') login('admin@singsoulstar.com', '123456');
        else if (role === 'assistant') login('assistant@singsoulstar.com', '123456');
        else login('user@test.com', '123456');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background (Mocking a video background with gradient overlay) */}
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=1000&auto=format&fit=crop' }}
                style={styles.backgroundImage}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', COLORS.background]}
                    style={StyleSheet.absoluteFill}
                />
            </ImageBackground>

            <View style={styles.content}>
                {/* Logo Area */}
                <View style={styles.logoContainer}>
                    <Ionicons name="mic-circle" size={80} color={COLORS.primary} />
                    <Text style={styles.appName}>SingSoulStar</Text>
                    <Text style={styles.tagline}>Sing your heart out!</Text>
                </View>

                {/* Form Area */}
                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="white" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Email / Phone"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="white" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            style={styles.input}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                        <LinearGradient
                            colors={GRADIENTS.primary}
                            start={[0, 0]}
                            end={[1, 0]}
                            style={styles.gradientBtn}
                        >
                            <Text style={styles.loginBtnText}>Log In</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={styles.forgotPassword}>Forgot Password?</Text>

                    {/* Quick Dev Login Buttons (For Demo) */}
                    <View style={styles.devTools}>
                        <Text style={styles.devText}>Dev Quick Login:</Text>
                        <View style={styles.devButtons}>
                            <TouchableOpacity onPress={() => handleMockLogin('admin')} style={[styles.devBtn, { borderColor: 'red' }]}>
                                <Text style={{ color: 'red' }}>Admin</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleMockLogin('assistant')} style={[styles.devBtn, { borderColor: 'orange' }]}>
                                <Text style={{ color: 'orange' }}>Assistant</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleMockLogin('user')} style={[styles.devBtn, { borderColor: 'green' }]}>
                                <Text style={{ color: 'green' }}>User</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Social Login */}
                    <View style={styles.socialContainer}>
                        <Text style={styles.socialText}>Or login with</Text>
                        <View style={styles.socialButtons}>
                            <TouchableOpacity
                                style={styles.socialBtn}
                                onPress={() => {
                                    Alert.alert('Google Sign-In', 'Simulating zero-cost Google OAuth flow...');
                                    setTimeout(() => login('google_user@gmail.com', ''), 1000);
                                }}
                            >
                                <Ionicons name="logo-google" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialBtn} onPress={() => Alert.alert('Facebook', 'Feature coming soon (Zero-cost simulation)')}>
                                <Ionicons name="logo-facebook" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialBtn} onPress={() => Alert.alert('Apple', 'Feature coming soon (Zero-cost simulation)')}>
                                <Ionicons name="logo-apple" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={{ marginTop: 30 }} onPress={() => navigation.navigate('Register')}>
                        <Text style={{ color: COLORS.primary, textAlign: 'center', fontWeight: 'bold' }}>
                            ¿Eres nuevo en SingSoulStar? <Text style={{ color: 'white' }}>Regístrate Gratis</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    backgroundImage: {
        width: width,
        height: height * 0.6,
        position: 'absolute',
        top: 0,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
        height: height * 0.4,
        justifyContent: 'center',
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 10,
    },
    tagline: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
    },
    formContainer: {
        backgroundColor: COLORS.background, // Solid background for form area
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 30,
        paddingTop: 40,
        minHeight: height * 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        marginBottom: 20,
        paddingBottom: 10,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: 'white',
        fontSize: 16,
    },
    loginBtn: {
        marginTop: 20,
        borderRadius: 25,
        overflow: 'hidden',
    },
    gradientBtn: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    loginBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 15,
    },
    socialContainer: {
        marginTop: 40,
        alignItems: 'center',
    },
    socialText: {
        color: COLORS.textMuted,
        marginBottom: 20,
    },
    socialButtons: {
        flexDirection: 'row',
        width: '60%',
        justifyContent: 'space-between',
    },
    socialBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    devTools: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
    },
    devText: {
        color: 'gray',
        fontSize: 12,
        marginBottom: 5,
        textAlign: 'center',
    },
    devButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    devBtn: {
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    }
});

export default LoginScreen;
