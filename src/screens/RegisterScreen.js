import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, TextInput, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
    const { register, isLoading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        if (!name || !email || !password) {
            return Alert.alert('Error', 'Por favor rellena todos los campos');
        }
        try {
            await register(name, email, password);
            Alert.alert('¡Bienvenido!', 'Tu cuenta ha sido creada con éxito.');
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000' }}
                style={styles.backgroundImage}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', COLORS.background]}
                    style={StyleSheet.absoluteFill}
                />
            </ImageBackground>

            <View style={styles.content}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Crea tu cuenta</Text>
                    <Text style={styles.subtitle}>Únete a la mayor comunidad de karaoke</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputBox}>
                        <Ionicons name="person-outline" size={20} color="white" style={styles.icon} />
                        <TextInput
                            placeholder="Nombre de Usuario"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputBox}>
                        <Ionicons name="mail-outline" size={20} color="white" style={styles.icon} />
                        <TextInput
                            placeholder="Correo Electrónico"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputBox}>
                        <Ionicons name="lock-closed-outline" size={20} color="white" style={styles.icon} />
                        <TextInput
                            placeholder="Contraseña"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            style={styles.input}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity style={styles.regBtn} onPress={handleRegister} disabled={isLoading}>
                        <LinearGradient colors={GRADIENTS.primary} style={styles.gradient}>
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.regText}>Registrarse Gratis</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
                        <Text style={styles.loginText}>¿Ya tienes cuenta? <Text style={{ color: COLORS.primary }}>Entrar</Text></Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    backgroundImage: { width, height: height * 0.4, position: 'absolute', top: 0 },
    content: { flex: 1, padding: 30, justifyContent: 'center' },
    backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
    header: { marginBottom: 40, marginTop: 100 },
    title: { color: 'white', fontSize: 32, fontWeight: 'bold' },
    subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: 5 },
    form: { marginTop: 20 },
    inputBox: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', marginBottom: 25, paddingBottom: 10 },
    icon: { marginRight: 15 },
    input: { flex: 1, color: 'white', fontSize: 16 },
    regBtn: { borderRadius: 25, overflow: 'hidden', marginTop: 20 },
    gradient: { paddingVertical: 15, alignItems: 'center' },
    regText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    loginLink: { marginTop: 30, alignItems: 'center' },
    loginText: { color: COLORS.textMuted, fontSize: 14 }
});

export default RegisterScreen;
