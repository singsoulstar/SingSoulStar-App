import { supabase } from '../lib/supabase';

export const CollaborationService = {
    /**
     * Get recordings that are marked as open for collaboration for a specific song
     * @param {string} songId 
     */
    getOpenCollabs: async (songId) => {
        try {
            const { data, error } = await supabase
                .from('recordings')
                .select(`
                    id,
                    created_at,
                    mode,
                    collab_part,
                    audio_url,
                    duration,
                    profiles:user_id (username, avatar_url)
                `)
                .eq('song_id', songId)
                .eq('is_open_collab', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching open collabs:", error);
            return [];
        }
    },

    /**
     * Get details of a parent recording to join
     * @param {string} recordingId 
     */
    getParentRecording: async (recordingId) => {
        try {
            const { data, error } = await supabase
                .from('recordings')
                .select('*')
                .eq('id', recordingId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error fetching parent recording:", error);
            return null;
        }
    }
};
