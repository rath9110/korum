import React from 'react';
import { StyleSheet, Text, View, Dimensions, ImageBackground, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { QuizQuestion, QuizOption } from '../../constants/QuizData';

const { width, height } = Dimensions.get('window');

// Helper for Frosted Glass effect (Simulated with semi-transparent white/blur)
// In a real Expo app, we'd use expo-blur, but simple opacity works for MVP Web demo.
const FrostedButton = ({ text, onPress }: { text: string; onPress: () => void }) => (
    <TouchableOpacity
        style={styles.button}
        onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
        }}
        activeOpacity={0.8}
    >
        <View style={styles.glassLayer} />
        <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
);

type VibeCardProps = {
    data: QuizQuestion;
    onOptionSelect: (option: QuizOption) => void;
};

export const VibeCard = ({ data, onOptionSelect }: VibeCardProps) => {
    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: data.image }}
                style={styles.background}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={StyleSheet.absoluteFillObject}
                />

                <View style={styles.contentContainer}>
                    <Text style={styles.question}>{data.text}</Text>

                    <View style={styles.optionsContainer}>
                        {data.options.map((option, index) => (
                            <FrostedButton
                                key={index}
                                text={option.text}
                                onPress={() => onOptionSelect(option)}
                            />
                        ))}
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
        backgroundColor: '#0D0D0D',
    },
    background: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    contentContainer: {
        padding: 24,
        paddingBottom: 60,
        justifyContent: 'flex-end',
        minHeight: height * 0.4,
    },
    question: {
        color: '#FFF',
        fontSize: 28,
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        fontWeight: '500',
        marginBottom: 40,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    optionsContainer: {
        gap: 16,
    },
    button: {
        height: 60,
        borderRadius: 30, // Pill shape
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle glass
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    glassLayer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: Platform.select({ web: 'Courier', default: 'monospace' }),
        letterSpacing: 1,
    },
});
