import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

// Types (should eventually be in a shared types file)
type AssemblyMember = {
    user_id: string;
    role: string;
    full_name: string | null;
    avatar_url: string | null;
    primary_archetype: string;
    linkedin_handle: string | null;
    instagram_handle: string | null;
    is_unlocked: boolean;
};

type Assembly = {
    cluster_id: string;
    dinner_date: string;
    restaurant_name: string;
    members: AssemblyMember[];
};

export const AssemblyHistory = () => {
    const [assemblies, setAssemblies] = useState<Assembly[]>([]);
    const [loading, setLoading] = useState(true);
    const [mySentFeedback, setMySentFeedback] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 0. Fetch my sent feedback
            const { data: feedbackData } = await supabase
                .from('user_feedback')
                .select('to_user_id')
                .eq('from_user_id', user.id)
                .eq('is_positive', true);

            if (feedbackData) {
                setMySentFeedback(new Set(feedbackData.map(f => f.to_user_id)));
            }

            // 1. Get past confirmed reservations
            const { data: myReservations, error: resError } = await supabase
                .from('reservations')
                .select(`
                    cluster_id,
                    clusters (
                        id,
                        dinner_date,
                        restaurant_name
                    )
                `)
                .eq('user_id', user.id)
                .eq('status', 'CONFIRMED')
                .not('clusters', 'is', null);

            if (resError || !myReservations) {
                console.error('Error fetching history:', resError);
                setLoading(false);
                return;
            }

            const history: Assembly[] = [];

            // 2. For each cluster, get members
            for (const res of myReservations) {
                const clusterData: any = res.clusters; // Explicit CAST to avoid Array/Object ambiguity
                const cluster = Array.isArray(clusterData) ? clusterData[0] : clusterData;

                if (!cluster) continue;

                const { data: members, error: memError } = await supabase
                    .from('cluster_members')
                    .select(`
                        role,
                        user_id,
                        users (
                            id,
                            full_name,
                            avatar_url,
                            primary_archetype,
                            linkedin_handle,
                            instagram_handle
                        )
                    `)
                    .eq('cluster_id', cluster.id);

                if (memError) continue;

                const assemblyMembers: AssemblyMember[] = (members || []).map((m: any) => {
                    const u = m.users;
                    const isUnlocked = !!u.full_name;

                    return {
                        user_id: u.id,
                        role: m.role,
                        full_name: u.full_name,
                        avatar_url: u.avatar_url,
                        primary_archetype: u.primary_archetype,
                        linkedin_handle: u.linkedin_handle,
                        instagram_handle: u.instagram_handle,
                        is_unlocked: isUnlocked
                    };
                });

                const others = assemblyMembers.filter(m => m.user_id !== user.id);

                history.push({
                    cluster_id: cluster.id,
                    dinner_date: cluster.dinner_date,
                    restaurant_name: cluster.restaurant_name,
                    members: others
                });
            }

            setAssemblies(history);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (targetUserId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('user_feedback')
                .insert({
                    from_user_id: user.id,
                    to_user_id: targetUserId,
                    is_positive: true
                });

            if (error) {
                if (error.code === '23505') { // Unique violation
                    Alert.alert('Info', 'You already connected with this person.');
                } else {
                    Alert.alert('Error', 'Could not send connection request.');
                    console.error(error);
                }
                return;
            }

            setMySentFeedback(prev => new Set(prev).add(targetUserId));
            Alert.alert('Connected', 'You marked this interaction as positive. If they do the same, details will unlock.');

        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return <Text style={styles.loadingText}>Loading history...</Text>;
    }

    if (assemblies.length === 0) {
        return (
            <Text style={styles.emptyText}>
                No past assemblies found. Your journey begins soon.
            </Text>
        );
    }

    return (
        <View style={styles.container}>
            {assemblies.map((assembly) => (
                <View key={assembly.cluster_id} style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.restaurant}>{assembly.restaurant_name || 'Secret Location'}</Text>
                        <Text style={styles.date}>
                            {new Date(assembly.dinner_date).toLocaleDateString()}
                        </Text>
                    </View>

                    <View style={styles.membersRow}>
                        {assembly.members.map((member) => (
                            <View key={member.user_id} style={styles.memberContainer}>
                                <View style={[styles.avatarShell, member.is_unlocked && styles.unlockedShell]}>
                                    <Image
                                        source={{ uri: member.avatar_url || 'https://via.placeholder.com/50' }}
                                        style={styles.avatar}
                                    />
                                </View>

                                <View style={styles.info}>
                                    {member.is_unlocked ? (
                                        <>
                                            <Text style={styles.name}>{member.full_name}</Text>
                                            <View style={styles.socials}>
                                                {member.linkedin_handle && (
                                                    <TouchableOpacity onPress={() => Linking.openURL(`https://linkedin.com/in/${member.linkedin_handle}`)}>
                                                        <Text style={styles.socialLink}>LI</Text>
                                                    </TouchableOpacity>
                                                )}
                                                {member.instagram_handle && (
                                                    <TouchableOpacity onPress={() => Linking.openURL(`https://instagram.com/${member.instagram_handle}`)}>
                                                        <Text style={styles.socialLink}>IG</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </>
                                    ) : (
                                        <View style={styles.lockedContainer}>
                                            <Text style={styles.archetype}>
                                                {member.primary_archetype?.replace('THE_', '')}
                                            </Text>

                                            {mySentFeedback.has(member.user_id) ? (
                                                <Text style={styles.pendingText}>Pending Match</Text>
                                            ) : (
                                                <TouchableOpacity
                                                    style={styles.connectButton}
                                                    onPress={() => handleConnect(member.user_id)}
                                                >
                                                    <Text style={styles.connectText}>CONNECT</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    loadingText: {
        color: '#666',
        fontFamily: Platform.select({ web: 'monospace', default: 'monospace' }),
        textAlign: 'center',
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 16,
        padding: 16,
        borderRadius: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingBottom: 8,
    },
    restaurant: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    date: {
        color: '#AAA',
        fontSize: 12,
    },
    membersRow: {
        flexDirection: 'column',
        gap: 16
    },
    memberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarShell: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    unlockedShell: {
        borderColor: '#00F0FF', // Cyberpunk cyan for unlocked
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
    },
    archetype: {
        color: '#666',
        fontSize: 10,
        letterSpacing: 1,
        marginBottom: 4,
    },
    socials: {
        flexDirection: 'row',
        marginTop: 4,
        gap: 12,
    },
    socialLink: {
        color: '#00F0FF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    lockedContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    connectButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    connectText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    pendingText: {
        color: '#AAA',
        fontSize: 10,
        fontStyle: 'italic',
    }
});
