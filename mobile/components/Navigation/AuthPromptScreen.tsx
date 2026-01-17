import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';

type AuthPromptScreenProps = {
    onSignIn: () => void;
    onCancel?: () => void;
};

export const AuthPromptScreen = ({ onSignIn, onCancel }: AuthPromptScreenProps) => {
    return (
        <View style={styles.container}>
            {/* Message */}
            <Text style={styles.message}>
                KRETS uses Google Identity to ensure a seamless connection. Your data remains private; your presence remains the priority.
            </Text>

            {/* Sign In Button */}
            <TouchableOpacity
                style={styles.button}
                onPress={onSignIn}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>SECURE IDENTITY VIA GOOGLE</Text>
            </TouchableOpacity>

            {/* Cancel Option */}
            {onCancel && (
                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        zIndex: 9998,
    },
    message: {
        color: '#999',
        fontSize: 16,
        lineHeight: 26,
        textAlign: 'center',
        marginBottom: 48,
        maxWidth: 400,
        fontFamily: Platform.select({
            web: 'Satoshi, sans-serif',
            default: 'System'
        }),
    },
    button: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 2,
        minWidth: 280,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 2,
        fontFamily: Platform.select({
            web: 'JetBrains Mono, monospace',
            default: 'monospace'
        }),
    },
    cancelButton: {
        marginTop: 24,
        padding: 12,
    },
    cancelText: {
        color: '#666',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});
