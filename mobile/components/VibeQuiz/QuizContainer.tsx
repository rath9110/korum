import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { VibeCard } from './VibeCard';
import { QUIZ_DATA } from '../../constants/QuizData';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';

export const QuizContainer = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [completed, setCompleted] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSwipe = (direction: 'left' | 'right') => {
        const currentQuestion = QUIZ_DATA[currentIndex];
        const archetype = direction === 'left' ? currentQuestion.leftOption.archetype : currentQuestion.rightOption.archetype;

        setAnswers([...answers, archetype]);

        if (currentIndex < QUIZ_DATA.length - 1) {
            setTimeout(() => setCurrentIndex(currentIndex + 1), 200); // Small delay for animation
        } else {
            setCompleted(true);
            saveResult([...answers, archetype]);
        }
    };

    const saveResult = async (finalAnswers: string[]) => {
        setSaving(true);
        // Calculate mode
        const frequency: Record<string, number> = {};
        let maxFreq = 0;
        let result = '';

        finalAnswers.forEach(a => {
            frequency[a] = (frequency[a] || 0) + 1;
            if (frequency[a] > maxFreq) {
                maxFreq = frequency[a];
                result = a;
            }
        });

        try {
            // 1. Sign in anonymously
            const { data: { user }, error: authError } = await supabase.auth.signInAnonymously();
            if (authError) throw authError;

            if (user) {
                // 2. Create/Update user profile
                // Note: In a real app, we'd use BankID data. 
                // For now, we use a random hash to satisfy the NOT NULL constraint on personal_number_hash
                const randomHash = Math.random().toString(36).substring(7);

                const { error: dbError } = await supabase
                    .from('users')
                    .upsert({
                        id: user.id,
                        full_name: 'Anonymous User',
                        personal_number_hash: `anon_${randomHash}`,
                        primary_archetype: result,
                        district: 'Vasastan', // Default for now
                        is_active_for_week: false
                    });

                if (dbError) {
                    console.error('DB Error:', dbError);
                    Alert.alert('Error', 'Failed to save your vibe.');
                }
            }
        } catch (e: any) {
            console.error('Auth Error:', e);
            Alert.alert('Error', e.message);
        } finally {
            setSaving(false);
        }
    };

    if (completed) {
        // Re-calculating for display
        const frequency: Record<string, number> = {};
        let maxFreq = 0;
        let result = '';
        answers.forEach(a => {
            frequency[a] = (frequency[a] || 0) + 1;
            if (frequency[a] > maxFreq) {
                maxFreq = frequency[a];
                result = a;
            }
        });

        return (
            <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>YOUR VIBE</Text>
                <Text style={styles.archetype}>{result.replace('_', ' ')}</Text>

                {saving ? (
                    <Text style={styles.savingText}>Saving to the grid...</Text>
                ) : (
                    <TouchableOpacity style={styles.button} onPress={() => {
                        setAnswers([]);
                        setCurrentIndex(0);
                        setCompleted(false);
                    }}>
                        <Text style={styles.buttonText}>RETAKE</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.progress}>
                    {currentIndex + 1} / {QUIZ_DATA.length}
                </Text>
            </View>

            <View style={styles.cardsContainer}>
                {QUIZ_DATA.map((item, index) => {
                    if (index < currentIndex) return null;
                    if (index > currentIndex + 1) return null;

                    const isTop = index === currentIndex;
                    return (
                        <View key={item.id} style={[styles.cardWrapper, { zIndex: QUIZ_DATA.length - index }]}>
                            {isTop ? (
                                <VibeCard
                                    data={item}
                                    onSwipeLeft={() => handleSwipe('left')}
                                    onSwipeRight={() => handleSwipe('right')}
                                />
                            ) : (
                                <View style={styles.placeholderCard} />
                            )}
                        </View>
                    );
                })}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    progress: {
        color: '#666',
        fontFamily: 'Courier',
        marginTop: 20,
    },
    cardsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardWrapper: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderCard: {
        width: '85%',
        height: '68%',
        backgroundColor: '#111',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        top: 10,
    },
    resultContainer: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultTitle: {
        color: '#666',
        fontSize: 16,
        fontFamily: 'Courier',
        marginBottom: 20,
        letterSpacing: 2,
    },
    archetype: {
        color: '#FFF',
        fontSize: 32,
        fontFamily: 'Courier',
        marginBottom: 40,
        letterSpacing: 1,
    },
    savingText: {
        color: '#666',
        fontFamily: 'Courier',
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        backgroundColor: '#FFF',
        borderRadius: 30,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontFamily: 'Courier',
    },
});
