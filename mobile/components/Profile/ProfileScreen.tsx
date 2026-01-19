import React from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { IdentityHeader } from './IdentityHeader';
import { UpcomingReservation } from './UpcomingReservation';

export const ProfileScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Module 1: Identity Header */}
                <IdentityHeader />

                {/* Module 2: Upcoming Reservations */}
                <UpcomingReservation />

                {/* TODO: Module 3: Assembly History */}
                {/* TODO: Module 4: Feedback Loop */}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Pure black
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
});
