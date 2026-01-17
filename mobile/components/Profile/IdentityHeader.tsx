import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

type IdentityHeaderProps = {
    userId?: string;
};

type UserProfile = {
    primary_archetype: string;
    social_karma: number;
    full_name: string;
};

export const IdentityHeader = ({ userId }: IdentityHeaderProps) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            // Get current user if userId not provided
            const uid = userId || (await supabase.auth.getUser()).data.user?.id;

            if (!uid) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('users')
                .select('primary_archetype, social_karma, full_name')
                .eq('id', uid)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.container}>
                <Text style={styles.noDataText}>Complete the quiz to see your archetype</Text>
            </View>
        );
    }

    // Format archetype for display (e.g., "THE_MODERNIST" -> "THE MODERNIST")
    const archetypeDisplay = profile.primary_archetype?.replace(/_/g, ' ') || 'UNKNOWN';

    return (
        <View style={styles.container}>
            {/* Archetype Name */}
            <Text style={styles.archetypeText}>{archetypeDisplay}</Text>

            {/* Social Karma Score */}
            <View style={styles.karmaContainer}>
                <Text style={styles.karmaLabel}>SOCIAL KARMA</Text>
                <Text style={styles.karmaValue}>{profile.social_karma.toFixed(1)}</Text>
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
        paddingVertical: 32,
        paddingHorizontal: 24,
        marginBottom: 24,
        alignItems: 'center',
    },
    archetypeText: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: '300',
        letterSpacing: 4,
        fontFamily: Platform.select({
            web: 'JetBrains Mono, monospace',
            default: 'monospace'
        }),
        textAlign: 'center',
        marginBottom: 24,
    },
    karmaContainer: {
        alignItems: 'center',
    },
    karmaLabel: {
        color: '#666',
        fontSize: 10,
        letterSpacing: 2,
        fontFamily: Platform.select({
            web: 'JetBrains Mono, monospace',
            default: 'monospace'
        }),
        marginBottom: 8,
    },
    karmaValue: {
        color: '#FFF',
        fontSize: 36,
        fontWeight: '200',
        fontFamily: Platform.select({
            web: 'JetBrains Mono, monospace',
            default: 'monospace'
        }),
    },
    loadingText: {
        color: '#666',
        fontSize: 14,
        fontFamily: Platform.select({
            web: 'JetBrains Mono, monospace',
            default: 'monospace'
        }),
    },
    noDataText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: Platform.select({
            web: 'Satoshi, sans-serif',
            default: 'System'
        }),
    },
});
