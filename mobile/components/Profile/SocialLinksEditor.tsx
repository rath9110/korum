import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

export const SocialLinksEditor = () => {
    const [linkedin, setLinkedin] = useState('');
    const [instagram, setInstagram] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('users')
                .select('linkedin_handle, instagram_handle')
                .eq('id', user.id)
                .single();

            if (data) {
                setLinkedin(data.linkedin_handle || '');
                setInstagram(data.instagram_handle || '');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setInitialLoaded(true);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const { error } = await supabase
                .from('users')
                .update({
                    linkedin_handle: linkedin,
                    instagram_handle: instagram
                })
                .eq('id', user.id);

            if (error) throw error;
            Alert.alert('Success', 'Profile links updated.');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to update links.');
        } finally {
            setLoading(false);
        }
    };

    if (!initialLoaded) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>YOUR DIGITAL PRESENCE</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>LINKEDIN HANDLE</Text>
                <TextInput
                    style={styles.input}
                    value={linkedin}
                    onChangeText={setLinkedin}
                    placeholder="username"
                    placeholderTextColor="#444"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>INSTAGRAM HANDLE</Text>
                <TextInput
                    style={styles.input}
                    value={instagram}
                    onChangeText={setInstagram}
                    placeholder="username"
                    placeholderTextColor="#444"
                />
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleSave}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'SAVING...' : 'UPDATE LINKS'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        color: '#666',
        fontSize: 12,
        letterSpacing: 2,
        fontFamily: Platform.select({ web: 'monospace', default: 'monospace' }),
        marginBottom: 16,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        color: '#888',
        fontSize: 10,
        marginBottom: 4,
        letterSpacing: 1,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#FFF',
        padding: 12,
        borderRadius: 8,
        fontSize: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    button: {
        backgroundColor: '#FFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        letterSpacing: 1,
        fontSize: 12,
    }
});
