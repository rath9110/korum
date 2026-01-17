import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QuizContainer } from './components/VibeQuiz/QuizContainer';
import { ProfileScreen } from './components/Profile/ProfileScreen';
import { MemberHeader } from './components/Navigation/MemberHeader';
import { ProfileDrawer } from './components/Navigation/ProfileDrawer';
import { AuthPromptScreen } from './components/Navigation/AuthPromptScreen';
import { StyleSheet, View } from 'react-native';
import { supabase, signInWithGoogle } from './lib/supabase';

export default function App() {
  const [authState, setAuthState] = useState < 'guest' | 'member' > ('guest');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [userProfile, setUserProfile] = useState < any > (null);

  useEffect(() => {
    // Check initial auth state
    checkAuthState();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setAuthState('member');
        setShowAuthPrompt(false);
        fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setAuthState('guest');
        setUserProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setAuthState('member');
      fetchUserProfile(session.user.id);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleAuthRequired = () => {
    setShowAuthPrompt(true);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Member Header (only for authenticated users) */}
      {authState === 'member' && userProfile && (
        <MemberHeader
          district={userProfile.district || 'KRETS'}
          avatarUrl={userProfile.avatar_url || 'https://via.placeholder.com/32'}
          onProfilePress={() => setShowProfileDrawer(true)}
        />
      )}

      {/* Main Content */}
      <View style={[styles.content, authState === 'member' && styles.contentWithHeader]}>
        <QuizContainer onAuthRequired={handleAuthRequired} />
      </View>

      {/* Auth Prompt Screen */}
      {showAuthPrompt && (
        <AuthPromptScreen
          onSignIn={handleGoogleSignIn}
          onCancel={() => setShowAuthPrompt(false)}
        />
      )}

      {/* Profile Drawer */}
      {showProfileDrawer && userProfile && (
        <ProfileDrawer
          visible={showProfileDrawer}
          onClose={() => setShowProfileDrawer(false)}
          user={{
            fullName: userProfile.full_name || 'KRETS Member',
            avatarUrl: userProfile.avatar_url || 'https://via.placeholder.com/80',
            archetype: userProfile.primary_archetype || 'UNKNOWN',
            karma: userProfile.social_karma || 0.0,
          }}
        />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  contentWithHeader: {
    marginTop: 60, // Height of MemberHeader
  },
});
