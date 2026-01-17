import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform, AppState } from 'react-native';
import * as AuthSession from 'expo-auth-session';

const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
        if (Platform.OS === 'web') {
            if (typeof localStorage === 'undefined') return Promise.resolve(null);
            return Promise.resolve(localStorage.getItem(key));
        }
        return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
        if (Platform.OS === 'web') {
            if (typeof localStorage === 'undefined') return Promise.resolve();
            localStorage.setItem(key, value);
            return Promise.resolve();
        }
        return SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
        if (Platform.OS === 'web') {
            if (typeof localStorage === 'undefined') return Promise.resolve();
            localStorage.removeItem(key);
            return Promise.resolve();
        }
        return SecureStore.deleteItemAsync(key);
    },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true, // Required for OAuth redirects on web
    },
});

// Auth Helper for Google
export const signInWithGoogle = async () => {
    try {
        const redirectUrl = AuthSession.makeRedirectUri();

        const response = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            },
        });

        if (response.error) {
            console.error('Error signing in:', response.error.message);
            throw response.error;
        }

        return response.data;
    } catch (error) {
        console.error("Google Signin Error", error);
        throw error;
    }
};

// Handle App State for Auth
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});
