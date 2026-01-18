import AsyncStorage from '@react-native-async-storage/async-storage';

const GENERATE_LIMIT = 50;

export const SongService = {
    getSongs: async (page = 1, limit = 20) => {
        // First, check for approved user songs in local storage
        let userSongs = [];
        try {
            const data = await AsyncStorage.getItem('user_songs');
            if (data) {
                userSongs = JSON.parse(data).filter(s => s.status === 'approved');
            }
        } catch (e) {
            console.warn("Storage Error:", e);
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                const songs = [];

                // Add user songs if it's the first page
                if (page === 1) {
                    songs.push(...userSongs);
                }

                const startId = (page - 1) * limit;
                for (let i = 0; i < (limit - (page === 1 ? userSongs.length : 0)); i++) {
                    const id = startId + i;
                    songs.push({
                        id: `song_${id}`,
                        title: `Canción de Prueba ${id}`,
                        artist: `Artista Mock ${id}`,
                        cover: `https://via.placeholder.com/150?text=Song+${id}`,
                        plays: Math.floor(Math.random() * 1000000),
                        lyrics: [
                            { time: 1000, text: "Esta es una canción generada", singer: 'Both' },
                            { time: 3000, text: "Para pruebas de velocidad", singer: 'Both' },
                        ]
                    });
                }
                resolve(songs);
            }, 300);
        });
    },

    // Simulate search with "unlimited" results
    searchSongs: async (query) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (!query) resolve([]);
                const results = [];
                for (let i = 0; i < 10; i++) {
                    results.push({
                        id: `search_${query}_${i}`,
                        title: `${query} Remix ${i}`,
                        artist: `Unknown Artist`,
                        cover: `https://via.placeholder.com/150?text=${query}`,
                        plays: Math.floor(Math.random() * 5000),
                    });
                }
                resolve(results);
            }, 300);
        });
    }
};
