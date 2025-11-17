import React, { useEffect } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const { height } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const translateY = useSharedValue(height);
  const offset = useSharedValue(0);
  const keyboard = useAnimatedKeyboard();

  const gesture = Gesture.Pan()
    .onStart(() => {
      offset.value = translateY.value;
    })
    .onUpdate((event) => {
      const newTranslateY = offset.value + event.translationY;
      translateY.value = Math.max(0, newTranslateY);
    })
    .onEnd((event) => {
      if (event.velocityY > 500 || translateY.value > height / 3) {
        translateY.value = withTiming(height, { duration: 200 }, () => {
          scheduleOnRN(onClose);
        });
      } else {
        translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const keyboardHeight = keyboard.height.value;
    const adjustedTranslateY = translateY.value - (keyboardHeight > 0 ? keyboardHeight - (Platform.OS === 'ios' ? 34 : 0) : 0);

    return {
      transform: [{ translateY: adjustedTranslateY }],
    };
  });

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    } else {
      translateY.value = withTiming(height, { duration: 250 });
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Pressable style={styles.overlay} onPress={onClose} />
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.handle} />
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
});
