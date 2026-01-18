// Simulate a list of existing recordings that users can join for a duet
export const CollaborationService = {
    getJoinableRecordings: async (songId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const recordings = [
                    { id: 'rec_1', user: 'Maria S.', avatar: 'https://i.pravatar.cc/150?u=2', part: 'Part A', quality: 'A+', time: '2h ago' },
                    { id: 'rec_2', user: 'Juan P.', avatar: 'https://i.pravatar.cc/150?u=1', part: 'Part A', quality: 'S', time: '5h ago' },
                    { id: 'rec_3', user: 'Carlos L.', avatar: 'https://i.pravatar.cc/150?u=3', part: 'Part A', quality: 'A', time: '1d ago' },
                ];
                resolve(recordings);
            }, 300);
        });
    }
};
