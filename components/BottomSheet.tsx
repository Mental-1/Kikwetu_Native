import React, { useEffect, useCallback } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
  LayoutChangeEvent,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedReaction,
  useAnimatedKeyboard,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: string[];
  initialSnapPoint?: number;
  enableDynamicSizing?: boolean;
  closeOnBackdropPress?: boolean;
  backdropColor?: string;
  onSnapPointChange?: (index: number) => void;
  keyboardAvoidanceEnabled?: boolean;
  handleStyle?: 'default' | 'none';
}

export default function BottomSheet({
  visible,
  onClose,
  children,
  snapPoints = ['90%'],
  initialSnapPoint = 0,
  enableDynamicSizing = false,
  closeOnBackdropPress = true,
  backdropColor = 'rgba(0, 0, 0, 0.5)',
  onSnapPointChange,
  keyboardAvoidanceEnabled = true,
  handleStyle = 'default',
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const windowHeight = useSharedValue(Dimensions.get('window').height);

  const translateY = useSharedValue(windowHeight.value);
  const backdropOpacity = useSharedValue(0);
  const currentSnapIndex = useSharedValue(initialSnapPoint);
  const contentHeight = useSharedValue(0);
  const offset = useSharedValue(0);

  const keyboard = useAnimatedKeyboard();

  const parsePercentage = useCallback((val: string): number => {
    'worklet';
    return val.endsWith('%') ? parseFloat(val) / 100 : parseFloat(val);
  }, []);

  const getSnapPosition = useCallback((index: number): number => {
    'worklet';
    if (enableDynamicSizing && contentHeight.value > 0) {
      const available = windowHeight.value - insets.top - insets.bottom;
      const needed = contentHeight.value + 80;
      return windowHeight.value - Math.min(available, needed);
    }

    const percentage = parsePercentage(snapPoints[index]);
    const availableHeight = windowHeight.value - insets.top;
    return availableHeight * (1 - percentage);
  }, [enableDynamicSizing, insets.top, insets.bottom, snapPoints, parsePercentage, contentHeight, windowHeight]);

  const closeSheet = () => {
    'worklet';
    backdropOpacity.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(windowHeight.value, { duration: 300 }, () => {
      'worklet';
      scheduleOnRN(onClose);
    });
  };

  const snapTo = (index: number) => {
    'worklet';
    currentSnapIndex.value = index;
    const target = getSnapPosition(index);
    translateY.value = withTiming(target, { duration: 300 }, () => {
      'worklet';
      if (onSnapPointChange) {
        scheduleOnRN(onSnapPointChange, index);
      }
    });
  };

  const findNearestSnapPoint = (position: number, velocity: number): number => {
    'worklet';
    if (velocity > 800 || position > windowHeight.value * 0.55) return -1;

    let closest = 0;
    let minDist = Math.abs(position - getSnapPosition(0));

    for (let i = 1; i < snapPoints.length; i++) {
      const dist = Math.abs(position - getSnapPosition(i));
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }

    if (velocity < -800) return snapPoints.length - 1;
    return closest;
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      offset.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = Math.max(0, offset.value + e.translationY);
    })
    .onEnd((e) => {
      const targetIndex = findNearestSnapPoint(translateY.value, e.velocityY);
      if (targetIndex === -1) closeSheet();
      else snapTo(targetIndex);
    });

  // Keyboard avoidance
  useAnimatedReaction(
    () => keyboard.height.value,
    (height) => {
      if (!keyboardAvoidanceEnabled || height === 0) {
        translateY.value = withTiming(getSnapPosition(currentSnapIndex.value));
      } else {
        const target = getSnapPosition(currentSnapIndex.value);
        translateY.value = withTiming(Math.max(target - height + 40, insets.top));
      }
    }
  );

  // Open/close
  useEffect(() => {
    if (visible) {
      currentSnapIndex.value = initialSnapPoint;
      const target = getSnapPosition(initialSnapPoint);
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(target, { duration: 350 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(windowHeight.value, { duration: 300 });
    }
  }, [visible, initialSnapPoint, getSnapPosition, translateY, currentSnapIndex,windowHeight, backdropOpacity]);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      windowHeight.value = window.height;
      if (visible) {
        translateY.value = withTiming(getSnapPosition(currentSnapIndex.value));
      }
    });
    return () => sub?.remove();
  }, [visible, getSnapPosition, translateY, currentSnapIndex,windowHeight, backdropOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const onContentLayout = (e: LayoutChangeEvent) => {
    if (enableDynamicSizing) {
      contentHeight.value = e.nativeEvent.layout.height;
      if (visible) translateY.value = withTiming(getSnapPosition(currentSnapIndex.value));
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={closeSheet}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle, { backgroundColor: backdropColor }]}>
          {closeOnBackdropPress && <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />}
        </Animated.View>

        <Animated.View style={[styles.sheet, sheetStyle]}>
          {handleStyle === 'default' && (
            <GestureDetector gesture={gesture}>
              <View style={styles.handleWrapper}>
                <View style={styles.handle} />
              </View>
            </GestureDetector>
          )}

          <View onLayout={onContentLayout} style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
    maxHeight: '95%',
  },
  handleWrapper: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});