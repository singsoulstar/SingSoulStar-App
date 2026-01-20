import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                mapSessionToUser(session);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                mapSessionToUser(session);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const mapSessionToUser = async (session) => {
        const { user } = session;

        // Default profile from metadata
        let profile = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email.split('@')[0],
            avatar: user.user_metadata?.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
            role: 'user',
            permissions: [],
            bio: '¡Hola! Soy nuevo en SingSoulStar.'
        };

        // Try to fetch real profile from DB
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data && !error) {
                profile = {
                    ...profile,
                    name: data.username || data.full_name || profile.name,
                    avatar: data.avatar_url || profile.avatar,
                    role: data.role || 'user',
                    is_verified: data.is_verified,
                    bio: data.bio || profile.bio,
                    hometown: data.hometown,
                    gender: data.gender,
                    profession: data.profession
                };
            }
        } catch (e) {
            console.warn("DB Profile fetch failed, using metadata only", e);
        }

        // Static fallback for specific emails (Emergency Override)
        const ADMIN_EMAILS = ['admin@singsoulstar.com', 'gnomoochenta@gmail.com', 'manuelubianvillarreal@gmail.com'];
        if (ADMIN_EMAILS.includes(profile.email.toLowerCase())) {
            profile.role = 'admin';
        }

        setUser(profile);
        setIsLoading(false);
    };

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (e) {
            console.error(e);
            throw e; // Propagate to screen for Alert
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name } // Store name in metadata
                }
            });
            if (error) throw error;
            // Note: If email confirmation is enabled, user won't be logged in immediately unless auto-confirm is on.
            // We'll let the UI handle the "Check email" message if needed, but for now we assume it might work or show the alert.
        } catch (e) {
            console.error(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        console.log("Iniciando cierre de sesión...");
        try {
            await supabase.auth.signOut();
            console.log("Sesión de Supabase cerrada.");
        } catch (e) {
            console.error("Error al cerrar sesión en Supabase:", e);
        } finally {
            // SIEMPRE limpiamos el estado local para permitir volver al Login
            setUser(null);
            setIsLoading(false);
            console.log("Estado local de usuario limpiado.");
        }
    };

    const updateProfile = async (updatedData) => {
        if (!user) return;
        try {
            const { error } = await supabase.auth.updateUser({
                data: { ...updatedData }
            });

            if (error) throw error;

            // Local state update checks onAuthStateChange usually, but we can force update
            setUser(prev => ({ ...prev, ...updatedData }));
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
