import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Dimensions, ActivityIndicator, Image, ScrollView, Platform } from 'react-native';
import { VibeCard } from './VibeCard';
import { DinnerSelection } from './DinnerSelection';
import { QUIZ_DATA, QuizOption, Archetype } from '../../constants/QuizData';
import { ARCHTYPE_DATA } from '../../constants/ArchetypeData';
import { StatusBar } from 'expo-status-bar';
import { supabase, signInWithGoogle } from '../../lib/supabase';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay, Easing } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Storage Helper for Persisting State across Redirects
const savePendingDinner = async (id: string) => {
    if (Platform.OS === 'web') {
        localStorage.setItem('pendingDinnerId', id);
    } else {
        // Native persistence if needed
    }
};

const getPendingDinner = async () => {
    if (Platform.OS === 'web') {
        return localStorage.getItem('pendingDinnerId');
    }
    return null;
};

const clearPendingDinner = async () => {
    if (Platform.OS === 'web') {
        localStorage.removeItem('pendingDinnerId');
    }
};

// Initial Scores
const initialScores: Record<Archetype, number> = {
    THE_BRUTALIST: 0,
    THE_EPICUREAN: 0,
    THE_CATALYST: 0,
    THE_OBSERVER: 0,
    THE_MODERNIST: 0,
};

type FlowState = 'QUIZ' | 'ANALYZING' | 'REVEAL' | 'DINNERS' | 'CONFIRMATION';

export const QuizContainer = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scores, setScores] = useState<Record<Archetype, number>>({ ...initialScores });
    const [flowState, setFlowState] = useState<FlowState>('QUIZ');
    const [bookedDinnerId, setBookedDinnerId] = useState<string | undefined>(undefined);

    // Animation Values
    const progressWidth = useSharedValue(0);

    const progressStyle = useAnimatedStyle(() => ({
        width: progressWidth.value,
    }));

    useEffect(() => {
        // Initialization Check
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            // 1. Check for pending dinner (User returning from Auth)
            const pendingId = await getPendingDinner();

            if (session) {
                console.log("Session found on Init");
                // User is logged in.
                if (pendingId) {
                    console.log("Found Pending Dinner matching:", pendingId);
                    setBookedDinnerId(pendingId);
                    await clearPendingDinner(); // Clear it so we don't re-trigger
                    setFlowState('DINNERS');
                } else {
                    // If logged in generally, where do we go? 
                    // For now, if no pending booking, we stay at QUIZ or go to REVEAL if user data existed.
                    // Simplifying: if session exists, let's assume they might be returning user. State management is complex here.
                    // But strictly for the "Booked" flow:
                }
            }
        };
        initSession();
    }, []);

    useEffect(() => {
        // Update progress bar
        const progress = ((currentIndex + 1) / QUIZ_DATA.length) * width;
        progressWidth.value = withTiming(progress, { duration: 500 });
    }, [currentIndex]);

    const handleOptionSelect = async (option: QuizOption) => {
        // 1. Update Scores
        const newScores = { ...scores };
        Object.entries(option.weights).forEach(([key, weight]) => {
            const archetype = key as Archetype;
            if (weight) newScores[archetype] += weight;
        });
        setScores(newScores);

        // 2. Check for "Refining..." Transition (After Q4)
        if (currentIndex === 3) {
            setFlowState('ANALYZING');
            // Simulate analysis delay
            setTimeout(() => {
                setFlowState('QUIZ');
                setCurrentIndex(prev => prev + 1);
            }, 500);
        } else if (currentIndex < QUIZ_DATA.length - 1) {
            // Normal Transition
            setCurrentIndex(prev => prev + 1);
        } else {
            // 3. Completion
            finishQuiz(newScores);
        }
    };

    const finishQuiz = async (finalScores: Record<Archetype, number>) => {
        setFlowState('REVEAL');

        // Note: Identity calculated but saved only after Authentication in Dinner Flow
        const winner: Archetype = Object.keys(finalScores).reduce((a, b) =>
            finalScores[a as Archetype] > finalScores[b as Archetype] ? a : b
        ) as Archetype;
    };

    const handleDinnerSelect = async (event: any) => {
        console.log("Selected Dinner:", event.theme);

        // 1. Persist ID for retrieval after redirect
        await savePendingDinner(event.id);
        // Do NOT set bookedDinnerId here yet. Only after Auth confirmation.

        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Auth Failed", error);
        }
    };

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                console.log("Auth Event: SIGNED_IN");

                // Check pending again in case this listener fires before Init or during active usage
                const pendingId = await getPendingDinner();
                if (pendingId) {
                    setBookedDinnerId(pendingId);
                    await clearPendingDinner();
                    setFlowState('DINNERS');
                }
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Render "Analyzing..." Interstitial
    if (flowState === 'ANALYZING') {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FFF" />
                <Text style={styles.analyzingText}>Refining your Circle...</Text>
            </View>
        );
    }

    // Render Dinner Selection
    if (flowState === 'DINNERS') {
        return <DinnerSelection onSelect={handleDinnerSelect} bookedEventId={bookedDinnerId} />;
    }

    // Render Confirmation
    if (flowState === 'CONFIRMATION') {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.archetypeTitle}>SEAT SECURED</Text>
                <Text style={styles.analyzingText}>See you at the table.</Text>
            </View>
        );
    }

    // Render Completion / Reveal
    if (flowState === 'REVEAL') {
        // Find winner for display
        const winnerKey: Archetype = Object.keys(scores).reduce((a, b) =>
            scores[a as Archetype] > scores[b as Archetype] ? a : b
        ) as Archetype;

        const archetype = ARCHTYPE_DATA[winnerKey];

        return (
            <View style={styles.resultContainer}>
                <StatusBar style="light" />

                {/* Visual Anchoring: Background Layer */}
                <Image
                    source={{ uri: archetype.image }}
                    style={[StyleSheet.absoluteFillObject, { opacity: 0.15 }]}
                    blurRadius={Platform.OS === 'web' ? 10 : 5}
                />

                {/* Scrollable Content for Result */}
                <Animated.ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerSpacer} />

                    <Text style={styles.revealTagline}>YOU ARE</Text>
                    <Text style={styles.revealTitle}>{archetype.name.split('').join(' ')}</Text>

                    <Text style={styles.poeticTagline}>"{archetype.tagline}"</Text>

                    <Text style={styles.descriptionText}>{archetype.description}</Text>

                    {/* Blueprint Style Role Container */}
                    <View style={styles.roleWrapper}>
                        <Text style={styles.roleLabel}>AT THE TABLE</Text>
                        <View style={styles.roleContainer}>
                            <Text style={styles.roleText}>{archetype.tableRole}</Text>
                        </View>
                    </View>

                    {/* Compatibility */}
                    <View style={styles.compatibilityContainer}>
                        <View style={styles.glassWrapper}>
                            <Text style={styles.compatTitle}>PAIRS BEST WITH</Text>
                            <View style={styles.compatBadges}>
                                {archetype.pairsWith.map((pair, index) => (
                                    <View key={index} style={styles.compatBadge}>
                                        <Text style={styles.compatText}>{pair}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.actionSection}>
                        {/* Ghost Button CTA */}
                        <TouchableOpacity
                            style={styles.findKretsButton}
                            onPress={() => setFlowState('DINNERS')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.findKretsText}>Find your KRETS</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {
                            setScores({ ...initialScores });
                            setCurrentIndex(0);
                            setFlowState('QUIZ');
                        }}>
                            <Text style={styles.retakeLink}>Retake Analysis</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footerSpacer} />
                </Animated.ScrollView>
            </View>
        );
    }

    const currentQuestion = QUIZ_DATA[currentIndex];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Thread Progress Bar */}
            <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBar, progressStyle]} />
            </View>

            <VibeCard
                data={currentQuestion}
                onOptionSelect={handleOptionSelect}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContainer: {
        flex: 1,
        backgroundColor: '#0D0D0D', // KRETS Dark Mode
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    analyzingText: {
        color: '#FFF',
        marginTop: 20,
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        fontSize: 16,
        letterSpacing: 2,
    },
    progressBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#333',
        zIndex: 10,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FFF',
    },
    vibeTitle: {
        color: '#666',
        fontSize: 14,
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        letterSpacing: 2,
        marginBottom: 20,
    },
    archetypeTitle: {
        color: '#FFF',
        fontSize: 32,
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        fontWeight: 'bold',
        marginBottom: 60,
        textAlign: 'center',
    },
    retakeLink: {
        color: '#666',
        marginTop: 20,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
    // Styles for Reveal UI
    resultContainer: {
        flex: 1,
        backgroundColor: '#000', // Deep black base
    },
    scrollContent: {
        paddingHorizontal: 30, // More breathing room
        alignItems: 'center',
    },
    headerSpacer: {
        height: 80,
    },
    revealTagline: {
        color: '#666',
        fontSize: 12,
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        letterSpacing: 3,
        marginBottom: 12,
    },
    revealTitle: {
        color: '#FFF',
        fontSize: 24, // Smaller but spaced out
        fontWeight: '300', // Light weight
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        textAlign: 'center',
        marginBottom: 20,
        // Letter spacing handled mainly by the .join(' ') in logic, but standard spacing added here too
        letterSpacing: 2,
    },
    poeticTagline: {
        color: '#DDD',
        fontSize: 20,
        fontFamily: Platform.select({ web: 'Times New Roman', default: 'serif' }),
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 40,
        paddingHorizontal: 10,
    },
    descriptionText: {
        color: '#CCC',
        fontSize: 16,
        lineHeight: 26,
        textAlign: 'center',
        marginBottom: 40,
        fontWeight: '300',
    },
    roleWrapper: {
        width: '100%',
        marginBottom: 40,
    },
    roleLabel: {
        color: '#666',
        fontSize: 10,
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        marginBottom: 8,
        letterSpacing: 2,
        alignSelf: 'flex-start',
    },
    roleContainer: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.03)', // Very subtle fill
        borderColor: 'rgba(255,255,255,0.4)', // The 0.5px off-white border
        borderWidth: 0.5,
        padding: 24,
        borderRadius: 2,
    },
    roleText: {
        color: '#FFF',
        fontSize: 15,
        fontStyle: 'italic',
        fontFamily: Platform.select({ web: 'Times New Roman', default: 'serif' }),
        lineHeight: 22,
    },
    compatibilityContainer: {
        width: '100%', // Full width to center the glass box
        marginBottom: 60,
        alignItems: 'center',
    },
    glassWrapper: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 24,
        paddingHorizontal: 32,
        borderRadius: 4,
        alignItems: 'center',
        width: '100%',
        // Web-specific backdrop filter for glassmorphism
        ...Platform.select({
            web: {
                backdropFilter: 'blur(20px)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            } as any
        })
    },
    compatTitle: {
        color: '#FFF', // Brighter to pop against glass
        fontSize: 10,
        letterSpacing: 2,
        marginBottom: 16,
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        paddingHorizontal: 4,
        backgroundColor: 'transparent', // Ensure no bg
    },
    compatBadges: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap', // Verification safety
        justifyContent: 'center',
    },
    compatBadge: {
        borderColor: 'rgba(255,255,255,0.6)', // Lighter border for glass look
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 100,
        backgroundColor: 'rgba(0,0,0,0.2)', // Contrast behind text
    },
    compatText: {
        color: '#EEE',
        fontSize: 11,
        letterSpacing: 1,
    },
    actionSection: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 0,
        borderTopWidth: 0,
    },
    findKretsButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)', // Ghost Button
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 2,
        width: '100%',
        alignItems: 'center',
    },
    findKretsText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    footerSpacer: {
        height: 80,
    }
});
