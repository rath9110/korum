import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Dimensions, ActivityIndicator, Image, ScrollView, Platform } from 'react-native';
import { VibeCard } from './VibeCard';
import { DinnerSelection } from './DinnerSelection';
import { QUIZ_DATA, QuizOption, Archetype } from '../../constants/QuizData';
import { ARCHTYPE_DATA } from '../../constants/ArchetypeData';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay, Easing } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Initial Scores
const initialScores: Record<Archetype, number> = {
    THE_BRUTALIST: 0,
    THE_EPICUREAN: 0,
    THE_CATALYST: 0,
    THE_OBSERVER: 0,
    THE_MODERNIST: 0,
};

type FlowState = 'QUIZ' | 'ANALYZING' | 'REVEAL' | 'DINNERS';

export const QuizContainer = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scores, setScores] = useState<Record<Archetype, number>>({ ...initialScores });
    const [flowState, setFlowState] = useState<FlowState>('QUIZ');

    // Animation Values
    const progressWidth = useSharedValue(0);

    const progressStyle = useAnimatedStyle(() => ({
        width: progressWidth.value,
    }));

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
            }, 1200);
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

        // Find Primary Identity
        const winner: Archetype = Object.keys(finalScores).reduce((a, b) =>
            finalScores[a as Archetype] > finalScores[b as Archetype] ? a : b
        ) as Archetype;

        // Save to Supabase (Anonymous)
        try {
            const { data: { user }, error: authError } = await supabase.auth.signInAnonymously();
            if (user) {
                const randomHash = Math.random().toString(36).substring(7);
                await supabase.from('users').upsert({
                    id: user.id,
                    full_name: 'Anonymous KRETS',
                    personal_number_hash: `anon_${randomHash}`,
                    primary_archetype: winner,
                    district: 'Vasastan',
                    is_active_for_week: false
                });
            }
        } catch (e) {
            console.error("Save error", e);
        }
    };

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
        return <DinnerSelection onSelect={(event) => console.log('Selected', event)} />;
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

                {/* Scrollable Content for Result */}
                <Animated.ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerSpacer} />

                    <Text style={styles.revealTagline}>YOU ARE</Text>
                    <Text style={styles.revealTitle}>{archetype.name}</Text>

                    <Text style={styles.poeticTagline}>"{archetype.tagline}"</Text>

                    {/* The Digital Polaroid - Smaller Size */}
                    <View style={styles.polaroidContainer}>
                        <View style={styles.polaroidFrame}>
                            <Image
                                source={{ uri: archetype.image }}
                                style={styles.polaroidImage}
                            />
                            <View style={styles.polaroidFooter}>
                                <Text style={styles.polaroidText}>{archetype.name}</Text>
                                <Text style={styles.polaroidDate}>EST. 2026</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.descriptionText}>{archetype.description}</Text>

                    <View style={styles.roleContainer}>
                        <Text style={styles.roleTitle}>AT THE TABLE</Text>
                        <Text style={styles.roleText}>{archetype.tableRole}</Text>
                    </View>

                    {/* Compatibility */}
                    <View style={styles.compatibilityContainer}>
                        <Text style={styles.compatTitle}>PAIRS BEST WITH</Text>
                        <View style={styles.compatBadges}>
                            {archetype.pairsWith.map((pair, index) => (
                                <View key={index} style={styles.compatBadge}>
                                    <Text style={styles.compatText}>{pair}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={styles.findKretsButton}
                            onPress={() => setFlowState('DINNERS')}
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
        backgroundColor: '#0D0D0D',
    },
    scrollContent: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerSpacer: {
        height: 60,
    },
    revealTagline: {
        color: '#666',
        fontSize: 12, // Smaller
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        letterSpacing: 2,
        marginBottom: 8,
    },
    revealTitle: {
        color: '#FFF',
        fontSize: 28, // Slightly smaller title to balance
        fontWeight: 'bold',
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        textAlign: 'center',
        marginBottom: 16,
    },
    poeticTagline: {
        color: '#DDD',
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 10,
    },
    polaroidContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        marginBottom: 32,
        transform: [{ rotate: '-2deg' }],
    },
    polaroidFrame: {
        backgroundColor: '#EEE',
        padding: 8, // Reduced padding
        paddingBottom: 24, // Reduced bottom padding
        borderRadius: 2,
    },
    polaroidImage: {
        width: width * 0.45, // Much smaller (~45% of screen width)
        height: width * 0.45,
        backgroundColor: '#333',
        marginBottom: 6,
    },
    polaroidFooter: {
        position: 'absolute',
        bottom: 6,
        left: 8,
        right: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    polaroidText: {
        color: '#222',
        fontSize: 12, // Smaller text
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        fontWeight: 'bold',
    },
    polaroidDate: {
        color: '#666',
        fontSize: 8, // Smaller date
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
    },
    descriptionText: {
        color: '#CCC',
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24,
    },
    roleContainer: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20,
        borderRadius: 8,
        marginBottom: 24,
    },
    roleTitle: {
        color: '#888',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: 1,
    },
    roleText: {
        color: '#FFF',
        fontSize: 14,
        fontStyle: 'italic',
    },
    compatibilityContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    compatTitle: {
        color: '#666',
        fontSize: 11,
        letterSpacing: 1,
        marginBottom: 12,
    },
    compatBadges: {
        flexDirection: 'row',
        gap: 8,
    },
    compatBadge: {
        borderColor: '#444',
        borderWidth: 1,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    compatText: {
        color: '#AAA',
        fontSize: 11,
    },
    actionSection: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    findKretsButton: {
        backgroundColor: '#FFF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 2, // Sharp corners for brutalist feel
        width: '100%',
        alignItems: 'center',
    },
    findKretsText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    footerSpacer: {
        height: 60,
    }
});
