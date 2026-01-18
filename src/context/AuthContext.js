import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const userData = await AsyncStorage.getItem('user_session');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            // Check in registered users first
            const registeredUsersData = await AsyncStorage.getItem('registered_users');
            const registeredUsers = registeredUsersData ? JSON.parse(registeredUsersData) : [];

            let foundUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (foundUser) {
                await AsyncStorage.setItem('user_session', JSON.stringify(foundUser));
                setUser(foundUser);
                setIsLoading(false);
                return;
            }

            // Fallback to hardcoded roles for demo if not found in registered
            let mockUser = {
                id: 'u_' + Date.now(),
                name: 'User ' + Math.floor(Math.random() * 1000),
                email: email,
                avatar: 'https://i.pravatar.cc/150?u=' + email,
                role: 'user',
                permissions: []
            };

            if (email.toLowerCase() === 'admin@singsoulstar.com') {
                mockUser.name = 'Super Admin';
                mockUser.role = 'admin';
                mockUser.permissions = ['all'];
            } else if (email.toLowerCase().includes('assistant')) {
                mockUser.name = 'Assistant User';
                mockUser.role = 'assistant';
                mockUser.permissions = ['moderate_chat', 'approve_songs'];
            }

            await AsyncStorage.setItem('user_session', JSON.stringify(mockUser));
            setUser(mockUser);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setIsLoading(true);
        try {
            const registeredUsersData = await AsyncStorage.getItem('registered_users');
            const registeredUsers = registeredUsersData ? JSON.parse(registeredUsersData) : [];

            if (registeredUsers.some(u => u.email === email)) {
                throw new Error("User already exists");
            }

            const newUser = {
                id: 'u_' + Date.now(),
                name,
                email,
                avatar: 'https://i.pravatar.cc/150?u=' + email,
                role: 'user',
                permissions: [],
                bio: '¡Hola! Soy nuevo en SingSoulStar.'
            };

            const updatedUsers = [...registeredUsers, newUser];
            await AsyncStorage.setItem('registered_users', JSON.stringify(updatedUsers));

            // Auto login after registration
            await AsyncStorage.setItem('user_session', JSON.stringify(newUser));
            setUser(newUser);
        } catch (e) {
            console.error(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (updatedData) => {
        if (!user) return;
        try {
            const newUserState = { ...user, ...updatedData };

            // Update session
            await AsyncStorage.setItem('user_session', JSON.stringify(newUserState));

            // Update in global users list
            const registeredUsersData = await AsyncStorage.getItem('registered_users');
            if (registeredUsersData) {
                const registeredUsers = JSON.parse(registeredUsersData);
                const updatedList = registeredUsers.map(u => u.id === user.id ? newUserState : u);
                await AsyncStorage.setItem('registered_users', JSON.stringify(updatedList));
            }

            setUser(newUserState);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.removeItem('user_session');
            setUser(null);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
