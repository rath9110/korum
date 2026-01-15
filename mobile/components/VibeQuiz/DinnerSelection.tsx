import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur'; // Or simulated if web
import { StatusBar } from 'expo-status-bar';

type DinnerEvent = {
    id: string;
    date: string;
    time: string;
    district: string;
    theme: string;
    price: string;
    image: string;
};

const DINNER_EVENTS: DinnerEvent[] = [
    {
        id: '1',
        date: 'Wednesday, Oct 24',
        time: '20:00',
        district: 'Vasastan',
        theme: 'The Glass & Concrete Table',
        price: '100 SEK',
        image: 'https://placehold.co/600x400/111/FFF?text=Vasastan'
    },
    {
        id: '2',
        date: 'Friday, Oct 26',
        time: '19:30',
        district: 'Södermalm',
        theme: 'Neon & Noise',
        price: '100 SEK',
        image: 'https://placehold.co/600x400/111/FFF?text=Soder'
    },
    {
        id: '3',
        date: 'Saturday, Oct 27',
        time: '20:00',
        district: 'Östermalm',
        theme: 'Velvet Silence',
        price: '150 SEK',
        image: 'https://placehold.co/600x400/111/FFF?text=Ostermalm'
    }
];

export const DinnerSelection = ({ onSelect }: { onSelect: (event: DinnerEvent) => void }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>SELECT YOUR CIRCLE</Text>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {DINNER_EVENTS.map((event) => (
                    <TouchableOpacity
                        key={event.id}
                        style={styles.card}
                        activeOpacity={0.9}
                        onPress={() => onSelect(event)}
                    >
                        <Image source={{ uri: event.image }} style={styles.cardInfo} />
                        <View style={styles.overlay}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{event.district}</Text>
                            </View>
                            <Text style={styles.themeName}>{event.theme}</Text>
                            <View style={styles.row}>
                                <Text style={styles.detailText}>{event.date} • {event.time}</Text>
                                <Text style={styles.priceText}>{event.price}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
        paddingTop: 60,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        textAlign: 'center',
        letterSpacing: 2,
        marginBottom: 30,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 2,
        marginBottom: 20,
        overflow: 'hidden',
        height: 200,
    },
    cardInfo: {
        width: '100%',
        height: '100%',
        opacity: 0.6,
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    badge: {
        backgroundColor: '#FFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        borderRadius: 2,
        marginBottom: 8,
    },
    badgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    themeName: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailText: {
        color: '#CCC',
        fontSize: 14,
    },
    priceText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
