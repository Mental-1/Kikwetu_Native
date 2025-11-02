import { useAuth } from '@/contexts/authContext';
import SignIn from '@/src/app/(screens)/(auth)/signin';
import SignUp from '@/src/app/(screens)/(auth)/signup';
import { Colors } from '@/src/constants/constant';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    // Only show sign-in modal if auth is loaded and user is not authenticated
    if (!loading && !user) {
      setShowSignIn(true);
    }
  }, [loading, user]);

  const handleSwitchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  const handleClose = () => {
    setShowSignIn(false);
    setShowSignUp(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <View style={styles.loadingContainer}>
      {showSignIn && (
        <SignIn
          visible={showSignIn}
          onClose={handleClose}
          onSwitchToSignUp={handleSwitchToSignUp}
        />
      )}
      {showSignUp && (
        <SignUp
          visible={showSignUp}
          onClose={handleClose}
          onSwitchToSignIn={handleSwitchToSignIn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.grey,
  },
});

export default AuthGuard;
