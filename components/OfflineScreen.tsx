import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { Colors } from '@/src/constants/constant';

const OfflineScreen = () => {
  const handleTryAgain = () => {
    NetInfo.fetch();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.innerContainer}>
          <Feather name="wifi-off" size={64} color={Colors.black} />
          <Text style={styles.messageText}>
            Check your connection and try again.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.tryAgainButton}
          onPress={handleTryAgain}
        >
          <Text style={styles.tryAgainText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  messageText: {
    color: Colors.white,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
  },
  tryAgainButton: {
    backgroundColor: Colors.black,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 32,
    alignSelf: 'center',
  },
  tryAgainText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default OfflineScreen;