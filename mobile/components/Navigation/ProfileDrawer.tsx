import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

type ProfileDrawerProps = {
    visible: boolean;
    onClose: () => void;
    user: {
        fullName: string;
        avatarUrl: string;
        archetype: string;
        karma: number;
    };
};

export const ProfileDrawer = ({ visible, onClose, user }: ProfileDrawerProps) => {
    const translateY = useSharedValue(-1000);

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                duration: 300,
                easing: Easing.out(Easing.ease),
            });
        } else {
            translateY.value = withTiming(-1000, {
                duration: 250,
                easing: Easing.in(Easing.ease),
            });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    if (!visible) return null;

    const archetypeDisplay = user.archetype?.replace(/_/g, ' ') || 'UNKNOWN';

    return (
        <View style={styles.overlay}>
            {/* Backdrop - tap to close */}
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={onClose}
            />

            {/* Drawer Content */}
            <Animated.View style={[styles.drawer, animatedStyle]}>
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>

                        {/* Avatar */}
                        <Image source={{ uri: user.avatarUrl }} style={styles.largeAvatar} />

                        {/* Full Name */}
                        <Text style={styles.nameText}>{user.fullName}</Text>

                        {/* Archetype */}
                        <Text style={styles.archetypeText}>{archetypeDisplay}</Text>

                        {/* Social Karma */}
                        <View style={styles.karmaContainer}>
                            <Text style={styles.karmaLabel}>SOCIAL KARMA</Text>
                            <Text style={styles.karmaValue}>{user.karma.toFixed(1)}</Text>
                        </View>

                        {/* Previous Assemblies Section */}
                        <View style={styles.assembliesSection}>
                            <Text style={styles.assembliesTitle}>PREVIOUS ASSEMBLIES</Text>
                            <Text style={styles.assembliesEmpty}>
                                Complete your first dinner to unlock connections
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        ...Platform.select({
            web: {
                backdropFilter: 'blur(20px)',
            } as any,
        }),
    },
    drawer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.98)',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 24,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '300',
    },
    largeAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 16,
    },
    nameText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '300',
        marginBottom: 8,
    },
    archetypeText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '300',
        letterSpacing: 4,
        fontFamily: Platform.select({
            web: 'JetBrains Mono, monospace',
            default: 'monospace'
        }),
        textAlign: 'center',
        marginBottom: 32,
    },
    karmaContainer: {
        alignItems: 'center',
        marginBottom: 48,
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
    assembliesSection: {
        width: '100%',
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
        paddingTop: 24,
    },
    assembliesTitle: {
        color: '#FFF',
        fontSize: 12,
        letterSpacing: 2,
        fontFamily: Platform.select({
            web: 'JetBrains Mono, monospace',
            default: 'monospace'
        }),
        marginBottom: 16,
    },
    assembliesEmpty: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
});
