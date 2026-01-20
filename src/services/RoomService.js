import { supabase } from '../lib/supabase';

export const RoomService = {
    // Suscribirse a una sala (Canal Realtime)
    subscribeToRoom: (roomId, onMessage, onSeatUpdate, onGift) => {
        const channel = supabase.channel(`room:${roomId}`, {
            config: {
                broadcast: { self: true }, // Recibir mis propios mensajes
                presence: { key: roomId },
            },
        });

        channel
            .on('broadcast', { event: 'msg' }, ({ payload }) => {
                if (onMessage) onMessage(payload);
            })
            .on('broadcast', { event: 'seat_update' }, ({ payload }) => {
                if (onSeatUpdate) onSeatUpdate(payload);
            })
            .on('broadcast', { event: 'gift' }, ({ payload }) => {
                if (onGift) onGift(payload);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // console.log('Conectado a la sala', roomId);
                }
            });

        return channel;
    },

    // Enviar mensaje de chat
    sendMessage: async (channel, user, text) => {
        if (!channel) return;
        await channel.send({
            type: 'broadcast',
            event: 'msg',
            payload: {
                id: Date.now().toString(),
                user: user.name || 'Usuario',
                text,
                type: 'msg',
                avatar: user.avatar
            },
        });
    },

    // Enviar regalo (Animación)
    sendGift: async (channel, user, giftType) => {
        if (!channel) return;
        await channel.send({
            type: 'broadcast',
            event: 'gift',
            payload: {
                user: user.name,
                gift: giftType,
                count: 1
            },
        });
    },

    // Ocupar/Liberar Asiento (Simulado por ahora con Broadcast, idealmente persistido en DB)
    updateSeat: async (channel, seatIndex, user) => {
        if (!channel) return;
        await channel.send({
            type: 'broadcast',
            event: 'seat_update',
            payload: {
                index: seatIndex,
                user: user // user o null para liberar
            },
        });
    },

    // Función para crear sala en DB (Si se requiere persistencia futura)
    createRoom: async (name, type, hostId) => {
        // Mock success por ahora, o implementar insert en 'rooms'
        return { id: Date.now().toString(), name, type };
    }
};
