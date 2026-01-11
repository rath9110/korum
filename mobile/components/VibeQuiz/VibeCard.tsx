import React from 'react';
import { StyleSheet, Text, View, Dimensions, Image, Platform } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
};

type VibeCardProps = {
    data: {
        text: string;
        leftOption: { text: string; image: string };
        rightOption: { text: string; image: string };
    };
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
};

export const VibeCard = ({ data, onSwipeLeft, onSwipeRight }: VibeCardProps) => {
    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onStart(() => {
            startX.value = translateX.value;
        })
        .onUpdate((event) => {
            translateX.value = startX.value + event.translationX;
        })
        .onEnd((event) => {
            if (event.translationX < -SWIPE_THRESHOLD) {
                translateX.value = withSpring(-width * 1.5);
                runOnJS(onSwipeLeft)();
                runOnJS(triggerHaptic)();
            } else if (event.translationX > SWIPE_THRESHOLD) {
                translateX.value = withSpring(width * 1.5);
                runOnJS(onSwipeRight)();
                runOnJS(triggerHaptic)();
            } else {
                translateX.value = withSpring(0);
            }
        });

    const cardStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            translateX.value,
            [-width / 2, 0, width / 2],
            [-15, 0, 15],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { translateX: translateX.value },
                { rotate: `${rotate}deg` }
            ],
        };
    });

    const leftOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]),
    }));

    const rightOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0]),
    }));

    return (
        <View style={styles.container}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.card, cardStyle]}>
                    <LinearGradient
                        colors={['#1a1a1a', '#000000']}
                        style={StyleSheet.absoluteFillObject}
                    />

                    <View style={styles.content}>
                        <Text style={styles.question}>{data.text}</Text>

                        <View style={styles.options}>
                            <View style={styles.option}>
                                <Image source={{ uri: data.leftOption.image }} style={styles.image} />
                                <Text style={styles.optionText}>{data.leftOption.text}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.option}>
                                <Image source={{ uri: data.rightOption.image }} style={styles.image} />
                                <Text style={styles.optionText}>{data.rightOption.text}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Overlay Labels */}
                    <Animated.View style={[styles.overlay, { right: 20 }, leftOpacity]}>
                        <Text style={styles.overlayText}>RIGHT</Text>
                    </Animated.View>
                    <Animated.View style={[styles.overlay, { left: 20 }, rightOpacity]}>
                        <Text style={styles.overlayText}>LEFT</Text>
                    </Animated.View>

                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: width * 0.9,
        height: '70%',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
        elevation: 5,
    },
    content: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    question: {
        fontSize: 24,
        color: '#FFF',
        fontFamily: 'Courier', // Placeholder for monospace
        marginBottom: 40,
        textAlign: 'center',
        letterSpacing: 2,
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    option: {
        width: '45%',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 10,
        marginBottom: 10,
        opacity: 0.8,
    },
    optionText: {
        color: '#FFF',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Courier',
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: '#333',
    },
    overlay: {
        position: 'absolute',
        top: 50,
        padding: 10,
        borderWidth: 2,
        borderColor: '#FFF',
        borderRadius: 5,
    },
    overlayText: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
});
