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
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedKeyboard,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Props for the BottomSheet component
 */
interface BottomSheetProps {
  /** Controls the visibility of the bottom sheet */
  visible: boolean;
  /** Callback invoked when the sheet should close */
  onClose: () => void;
  /** Content to render inside the bottom sheet */
  children: React.ReactNode;
  /** Array of snap point percentages. Example: ['40%', '60%', '90%'] */
  snapPoints?: string[];
  /** Index of the initial snap point from snapPoints array */
  initialSnapPoint?: number;
  /** Whether to size the sheet based on content height instead of using maxHeight */
  enableDynamicSizing?: boolean;
  /** Whether the backdrop can be pressed to close the sheet */
  closeOnBackdropPress?: boolean;
  /** Custom backdrop color with opacity. Default: 'rgba(0, 0, 0, 0.5)' */
  backdropColor?: string;
  /** Callback invoked when snap point changes */
  onSnapPointChange?: (index: number) => void;
  /** Whether to automatically adjust for keyboard. Default: true */
  keyboardAvoidanceEnabled?: boolean;
}

/**
 * A fully-featured bottom sheet component with gesture handling, snap points,
 * and smooth animations. Supports drag-to-dismiss, multiple snap positions,
 * automatic keyboard avoidance, and dynamic sizing.
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   visible={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   snapPoints={['40%', '90%']}
 *   initialSnapPoint={1}
 * >
 *   <Text>Sheet Content</Text>
 * </BottomSheet>
 * ```
 */
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
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const windowHeight = useSharedValue(Dimensions.get('window').height);
  const translateY = useSharedValue(windowHeight.value);
  const offset = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);
  const currentSnapIndex = useSharedValue(initialSnapPoint);

  const keyboard = useAnimatedKeyboard();

  /**
   * Parses a percentage string to a decimal value
   * @param percentage - String like '50%' or '0.5'
   * @returns Decimal value between 0 and 1
   */
  const parsePercentage = (percentage: string): number => {
    'worklet';
    if (percentage.includes('%')) {
      return parseFloat(percentage) / 100;
    }
    return parseFloat(percentage);
  };

  /**
   * Calculates the translateY position for a given snap point index
   * @param index - Index in the snapPoints array
   * @returns The Y position in pixels
   */
  const getSnapPosition = (index: number) => {
    'worklet';
    const percentage = parsePercentage(snapPoints[index]);
    return windowHeight.value * (1 - percentage);
  };

  /**
   * Finds the nearest snap point based on current position and velocity
   * @param position - Current translateY position
   * @param velocity - Vertical velocity of the gesture
   * @returns Snap point index, or -1 to close the sheet
   */
  const findNearestSnapPoint = (position: number, velocity: number) => {
    'worklet';
    const strongVelocityThreshold = 500;
    const closeThreshold = windowHeight.value * 0.7;

    // Close if dragged far down
    if (position > closeThreshold) {
      return -1;
    }

    // Handle strong velocity gestures
    if (Math.abs(velocity) > strongVelocityThreshold) {
      if (velocity > 0) {
        // Swiping down - move to next snap point or close
        const nextIndex = currentSnapIndex.value + 1;
        return nextIndex >= snapPoints.length ? -1 : nextIndex;
      } else {
        // Swiping up - move to previous snap point
        return Math.max(currentSnapIndex.value - 1, 0);
      }
    }

    // Find nearest snap point by distance
    let nearestIndex = 0;
    let nearestDistance = Math.abs(position - getSnapPosition(0));

    for (let i = 1; i < snapPoints.length; i++) {
      const snapPos = getSnapPosition(i);
      const distance = Math.abs(position - snapPos);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    return nearestIndex;
  };

  /**
   * Closes the bottom sheet with animation and invokes onClose callback
   */
  const closeSheet = () => {
    'worklet';
    backdropOpacity.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(windowHeight.value, { duration: 250 }, () => {
      scheduleOnRN(onClose);
    });
  };

  /**
   * Handles backdrop press - closes sheet if enabled
   */
  const handleBackdropPress = () => {
    closeSheet();
  };

  /**
   * Handles snap point changes and notifies parent
   */
  const notifySnapPointChange = (index: number) => {
    if (onSnapPointChange) {
      onSnapPointChange(index);
    }
  };

  /**
   * Gesture handler for dragging the sheet
   */
  const gesture = Gesture.Pan()
    .onStart(() => {
      offset.value = translateY.value;
    })
    .onUpdate((event) => {
      const newTranslateY = offset.value + event.translationY;
      // Constrain between 0 (fully up) and screen height (fully down)
      translateY.value = Math.max(0, Math.min(windowHeight.value, newTranslateY));
    })
    .onEnd((event) => {
      const targetIndex = findNearestSnapPoint(translateY.value, event.velocityY);

      if (targetIndex === -1) {
        closeSheet();
      } else {
        currentSnapIndex.value = targetIndex;
        translateY.value = withTiming(getSnapPosition(targetIndex), {
          duration: 250,
        });

        // Notify parent of snap point change
        scheduleOnRN(() => notifySnapPointChange(targetIndex));
      }
    });

  /**
   * React to keyboard changes and adjust sheet position accordingly
   */
  useAnimatedReaction(
    () => keyboard.height.value,
    (keyboardHeight, previousKeyboardHeight) => {
      if (!keyboardAvoidanceEnabled) return;

      // Only adjust if keyboard state actually changed
      if (keyboardHeight === previousKeyboardHeight) return;

      const targetSnapPosition = getSnapPosition(currentSnapIndex.value);

      // Adjust sheet up when keyboard opens
      if (keyboardHeight > 0) {
        const adjustment = Math.max(0, targetSnapPosition - keyboardHeight);
        translateY.value = withTiming(adjustment, { duration: 250 });
      } else {
        // Return to original snap point when keyboard closes
        translateY.value = withTiming(targetSnapPosition, { duration: 250 });
      }
    }
  );

  /**
   * Animated style for the sheet container
   */
  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  /**
   * Animated style for the backdrop
   */
  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  /**
   * Handles window dimension changes (rotation, split screen, etc.)
   */
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      windowHeight.value = window.height;

      // Recalculate position for current snap point after dimension change
      if (visible) {
        const newPosition = getSnapPosition(currentSnapIndex.value);
        translateY.value = withTiming(newPosition, { duration: 200 });
      }
    });

    return () => subscription?.remove();
  }, [visible, translateY,windowHeight,getSnapPosition,currentSnapIndex]);

  /**
   * Handles opening and closing animations when visible prop changes
   */
  useEffect(() => {
    if (visible) {
      const targetPosition = getSnapPosition(initialSnapPoint);
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(targetPosition, { duration: 300 });
      currentSnapIndex.value = initialSnapPoint;
    } else {
      backdropOpacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(windowHeight.value, { duration: 250 });
    }
  }, [visible, initialSnapPoint,backdropOpacity,translateY,currentSnapIndex,getSnapPosition,windowHeight]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={() => closeSheet()}
      statusBarTranslucent
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel="Bottom sheet dialog"
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            animatedBackdropStyle,
            { backgroundColor: backdropColor },
          ]}
        >
          {closeOnBackdropPress && (
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={handleBackdropPress}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close bottom sheet"
            />
          )}
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.container,
            animatedSheetStyle,
            { paddingBottom: Math.max(insets.bottom, 20) },
            enableDynamicSizing && styles.dynamicContainer,
          ]}
        >
          {/* Drag Handle */}
          <GestureDetector gesture={gesture}>
            <View
              style={styles.handleContainer}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Drag handle"
              accessibilityHint="Drag to resize or dismiss the sheet"
            >
              <View style={styles.handle} />
            </View>
          </GestureDetector>

          {/* Content */}
          <View style={styles.contentContainer}>{children}</View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
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
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 20,
    width: '100%',
  },
  dynamicContainer: {
    maxHeight: undefined,
  },
  handleContainer: {
    paddingVertical: 8,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
  },
  contentContainer: {
    flex: 1,
  },
});