import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

type UpcomingReservationProps = {
    userId?: string;
};

type ReservationData = {
    dinner_date: string;
    theme: string;
    district: string;
    venue_image_url: string;
    time: string;
};

export const UpcomingReservation = ({ userId }: UpcomingReservationProps) => {
    const [reservation, setReservation] = useState<ReservationData | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUpcomingReservation();
    }, [userId]);

    useEffect(() => {
        if (reservation?.dinner_date) {
            const timer = setInterval(() => {
                updateCountdown();
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [reservation]);

    const fetchUpcomingReservation = async () => {
        try {
            const uid = userId || (await supabase.auth.getUser()).data.user?.id;
            if (!uid) {
                setLoading(false);
                return;
            }

            // Query reservations joined with clusters
            const { data, error } = await supabase
                .from('reservations')
                .select(`
          *,
          clusters:cluster_id (
            dinner_date,
            restaurant_name,
            district,
            venue_image_url
          )
        `)
                .eq('user_id', uid)
                .eq('status', 'CONFIRMED')
                .gt('clusters.dinner_date', new Date().toISOString())
                .order('clusters.dinner_date', { ascending: true })
                .limit(1)
                .single();

            if (error) {
                console.error('No upcoming reservations:', error);
                setReservation(null);
            } else if (data && data.clusters) {
                const cluster = data.clusters as any;
                const dinnerDate = new Date(cluster.dinner_date);

                setReservation({
                    dinner_date: cluster.dinner_date,
                    theme: cluster.restaurant_name || 'KRETS Dinner',
                    district: cluster.district || 'Stockholm',
                    venue_image_url: cluster.venue_image_url || 'https://placehold.co/600x400/111/FFF?text=Venue',
                    time: dinnerDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
                });
            }
        } catch (err) {
            console.error('Reservation fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateCountdown = () => {
        if (!reservation?.dinner_date) return;

        const now = new Date();
        const dinnerTime = new Date(reservation.dinner_date);
        const diff = dinnerTime.getTime() - now.getTime();

        if (diff <= 0) {
            setTimeLeft('Starting soon!');
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            setTimeLeft(`${days}d ${hours}h`);
        } else if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m`);
        } else {
            setTimeLeft(`${minutes}m`);
        }
    };

    const handleAddToCalendar = () => {
        // TODO: Implement calendar export (ICS format)
        console.log('Add to calendar pressed');
        alert('Calendar export coming soon!');
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!reservation) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>No upcoming reservations</Text>
                <Text style={styles.emptySubtext}>Select a dinner to join the circle</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerLabel}>NEXT ASSEMBLY</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>IN THE CIRCLE</Text>
                </View>
            </View>

            {/* Venue Image (Blurred) */}
            <Image
                source={{ uri: reservation.venue_image_url }}
                style={styles.venueImage}
                blurRadius={10}
            />

            {/* Details */}
            <View style={styles.details}>
                <Text style={styles.themeText}>{reservation.theme}</Text>
                <Text style={styles.timeText}>{reservation.time}</Text>

                {/* Countdown */}
                <View style={styles.countdownContainer}>
                    <Text style={styles.countdownLabel}>TIME UNTIL ASSEMBLY</Text>
                    <Text style={styles.countdownValue}>{timeLeft}</Text>
                </View>

                {/* Add to Calendar Button */}
                <TouchableOpacity
                    style={styles.calendarButton}
                    onPress={handleAddToCalendar}
                    activeOpacity={0.8}
                >
                    <Text style={styles.calendarButtonText}>ADD TO CALENDAR</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerLabel: {
        color: '#999',
        fontSize: 10,
        letterSpacing: 2,
        fontFamily: Platform.select({
            web: 'JetBrains Mono, monospace',
            default: 'monospace'
        }),
    },
    statusBadge: {
        backgroundColor: '#FFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 2,
    },
    statusText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        fontFamily: Platform.select({
            web: 'JetBrains Mono, monospace',
            default: 'monospace'
        }),
    },
    venueImage: {
        width: '100%',
        height: 160,
        backgroundColor: '#111',
    },
    details: {
        padding: 16,
    },

    themeText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '300',
        marginBottom: 4,
        letterSpacing: 1,
    },
    timeText: {
        color: '#CCC',
        fontSize: 14,
        marginBottom: 16,
    },
    countdownContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    countdownLabel: {
        color: '#666',
        fontSize: 9,
        letterSpacing: 1.5,
        fontFamily: Platform.select({
            web: 'JetBrains Mono, monospace',
            default: 'monospace'
        }),
        marginBottom: 6,
    },
    countdownValue: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: '200',
        fontFamily: Platform.select({
            web: 'JetBrains Mono, monospace',
            default: 'monospace'
        }),
    },
    calendarButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        paddingVertical: 12,
        borderRadius: 4,
        alignItems: 'center',
    },
    calendarButtonText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 2,
        fontFamily: Platform.select({
            web: 'JetBrains Mono, monospace',
            default: 'monospace'
        }),
    },
    loadingText: {
        color: '#666',
        fontSize: 14,
        padding: 32,
        textAlign: 'center',
    },
    emptyText: {
        color: '#666',
        fontSize: 14,
        padding: 32,
        textAlign: 'center',
        fontWeight: '600',
    },
    emptySubtext: {
        color: '#444',
        fontSize: 12,
        paddingHorizontal: 32,
        paddingBottom: 32,
        textAlign: 'center',
    },
});
