import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Platform } from 'react-native';

type MemberHeaderProps = {
    district: string;
    avatarUrl: string;
    onProfilePress: () => void;
};

export const MemberHeader = ({ district, avatarUrl, onProfilePress }: MemberHeaderProps) => {
    return (
        <View style={styles.container}>
            {/* Left: District Label */}
            <Text style={styles.districtText}>{district.toUpperCase()}</Text>

            {/* Right: Profile Avatar */}
            <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8}>
                <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#000',
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255, 255, 255, 0.4)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 44 : 0, // Safe area for iOS
        zIndex: 1000,
    },
    districtText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 2,
        fontFamily: Platform.select({
            web: 'JetBrains Mono, monospace',
            default: 'monospace'
        }),
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
});
