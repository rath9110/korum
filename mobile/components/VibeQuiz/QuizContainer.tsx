import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { VibeCard } from './VibeCard';
import { QUIZ_DATA, QuizOption, Archetype } from '../../constants/QuizData';
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

export const QuizContainer = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scores, setScores] = useState<Record<Archetype, number>>({ ...initialScores });
    const [completed, setCompleted] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Animation Values
    const progressWidth = useSharedValue(0);
    const fadeAnim = useSharedValue(1);

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
            setIsAnalyzing(true);
            // Simulate analysis delay
            setTimeout(() => {
                setIsAnalyzing(false);
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
        setCompleted(true);

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
    if (isAnalyzing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FFF" />
                <Text style={styles.analyzingText}>Refining your Circle...</Text>
            </View>
        );
    }

    // Render Completion / Payment Trigger
    if (completed) {
        // Find winner for display
        const winner: Archetype = Object.keys(scores).reduce((a, b) =>
            scores[a as Archetype] > scores[b as Archetype] ? a : b
        ) as Archetype;

        return (
            <View style={styles.centerContainer}>
                <Text style={styles.vibeTitle}>INITIAL VIBE CAPTURED</Text>
                <Text style={styles.archetypeTitle}>{winner.replace('THE_', '').replace('_', ' ')}</Text>

                <View style={styles.paymentContainer}>
                    <Text style={styles.paymentText}>Secure your seat in the Circle.</Text>
                    <Text style={styles.detailsText}>Wednesday, 20:00 • Stockholm</Text>

                    <TouchableOpacity style={styles.swishButton}>
                        <Text style={styles.swishButtonText}>Swish 100 SEK</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => {
                    setScores({ ...initialScores });
                    setCurrentIndex(0);
                    setCompleted(false);
                }}>
                    <Text style={styles.retakeLink}>Retake Analysis</Text>
                </TouchableOpacity>
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
        fontFamily: 'Courier',
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
        fontFamily: 'Courier',
        letterSpacing: 2,
        marginBottom: 20,
    },
    archetypeTitle: {
        color: '#FFF',
        fontSize: 32,
        fontFamily: 'Courier',
        fontWeight: 'bold',
        marginBottom: 60,
        textAlign: 'center',
    },
    paymentContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 40,
    },
    paymentText: {
        color: '#FFF',
        fontSize: 18,
        marginBottom: 10,
    },
    detailsText: {
        color: '#888',
        fontSize: 14,
        marginBottom: 30,
    },
    swishButton: {
        backgroundColor: '#FFF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 4,
        width: '100%',
        alignItems: 'center',
    },
    swishButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    retakeLink: {
        color: '#666',
        marginTop: 20,
        textDecorationLine: 'underline',
    }
});
