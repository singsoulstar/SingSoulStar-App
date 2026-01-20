import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';

export const RecordingService = {
    /**
     * Uploads a user recording (cover) to Supabase
     * @param {Object} recordingData - Metadata (song_id, effect, mode, duration)
     * @param {Object} audioFile - The recorded audio file {uri, name}
     */
    uploadRecording: async (recordingData, audioFile) => {
        try {
            console.log("--- INICIANDO SUBIDA DE GRABACIÓN ---");

            // 1. Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Debes estar logueado para publicar un cover.");

            // 2. Prepare Audio Blob
            const getBlob = async (uri) => {
                const response = await fetch(uri);
                return await response.blob();
            };

            const audioBlob = await getBlob(audioFile.uri);
            const fileExt = audioFile.uri.split('.').pop() || 'm4a';
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `covers/${fileName}`;

            // 3. Upload to Storage (singsoulstar-assets bucket)
            console.log("Subiendo archivo a storage...");
            const { error: uploadError } = await supabase.storage
                .from('singsoulstar-assets')
                .upload(filePath, audioBlob, {
                    contentType: audioBlob.type || 'audio/mp4',
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const audioUrl = supabase.storage.from('singsoulstar-assets').getPublicUrl(filePath).data.publicUrl;

            // 4. Insert into 'recordings' table
            console.log("Insertando metadatos en tabla 'recordings'...");
            const { data, error: dbError } = await supabase
                .from('recordings')
                .insert([{
                    user_id: user.id,
                    song_id: recordingData.songId,
                    audio_url: audioUrl,
                    effect: recordingData.effect || 'Studio',
                    mode: recordingData.mode || 'Solo',
                    duration: recordingData.duration || 0,
                    parent_id: recordingData.parent_id || null,
                    is_open_collab: recordingData.is_open_collab || false,
                    collab_part: recordingData.collab_part || null,
                    created_at: new Date()
                }])
                .select();

            if (dbError) {
                // If table doesn't exist or columns missing, we fallback to a console warning
                console.warn("Error al insertar en DB (¿Existen las columnas de collab?):", dbError);
                throw dbError;
            }

            console.log("¡Grabación publicada con éxito!");
            return data[0];

        } catch (e) {
            console.error("Error en uploadRecording:", e);
            throw e;
        }
    },

    /**
     * Get recordings for a specific song (to show common duets/covers)
     */
    getRecordingsForSong: async (songId) => {
        try {
            const { data, error } = await supabase
                .from('recordings')
                .select(`
                    *,
                    profiles:user_id (username, avatar_url)
                `)
                .eq('song_id', songId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Error al obtener grabaciones:", e);
            return [];
        }
    },

    /**
     * Get user's own recordings
     */
    getUserRecordings: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('recordings')
                .select(`
                    *,
                    songs:song_id (title, artist, cover_url)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Error al obtener grabaciones del usuario:", e);
            return [];
        }
    }
};
