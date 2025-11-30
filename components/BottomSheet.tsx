import React, { useCallback, useEffect } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

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
  handleStyle?: "default" | "none";
}

export default function BottomSheet({
  visible,
  onClose,
  children,
  snapPoints = ["90%"],
  initialSnapPoint = 0,
  enableDynamicSizing = false,
  closeOnBackdropPress = true,
  backdropColor = "rgba(0, 0, 0, 0.5)",
  onSnapPointChange,
  keyboardAvoidanceEnabled = true,
  handleStyle = "default",
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const windowHeight = useSharedValue(Dimensions.get("window").height);

  const translateY = useSharedValue(windowHeight.value);
  const backdropOpacity = useSharedValue(0);
  const currentSnapIndex = useSharedValue(initialSnapPoint);
  const contentHeight = useSharedValue(0);
  const offset = useSharedValue(0);

  const keyboard = useAnimatedKeyboard();

  const parsePercentage = useCallback((val: string): number => {
    "worklet";
    return val.endsWith("%") ? parseFloat(val) / 100 : parseFloat(val);
  }, []);

  const getSnapPosition = useCallback((index: number): number => {
    "worklet";
    const availableHeight = windowHeight.value - insets.top;

    if (enableDynamicSizing && contentHeight.value > 0) {
      const needed = contentHeight.value +
        (handleStyle === "default" ? 40 : 20) + insets.bottom;
      return windowHeight.value - Math.min(availableHeight, needed);
    }

    const percentage = parsePercentage(snapPoints[index]);
    return availableHeight * (1 - percentage) + insets.top;
  }, [
    enableDynamicSizing,
    insets.top,
    snapPoints,
    parsePercentage,
    contentHeight,
    windowHeight,
    handleStyle,
    insets.bottom,
  ]);

  const closeSheet = useCallback(() => {
    "worklet";
    backdropOpacity.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(windowHeight.value, { duration: 300 }, () => {
      "worklet";
      scheduleOnRN(onClose);
    });
  }, [backdropOpacity, translateY, windowHeight, onClose]);

  const snapTo = useCallback((index: number) => {
    "worklet";
    currentSnapIndex.value = index;
    const target = getSnapPosition(index);
    translateY.value = withTiming(target, { duration: 300 }, () => {
      "worklet";
      if (onSnapPointChange) {
        scheduleOnRN(onSnapPointChange, index);
      }
    });
  }, [currentSnapIndex, getSnapPosition, translateY, onSnapPointChange]);

  const findNearestSnapPoint = useCallback(
    (position: number, velocity: number): number => {
      "worklet";
      if (velocity > 800) return -1;
      if (velocity < -800) return snapPoints.length - 1;

      const currentTarget = getSnapPosition(currentSnapIndex.value);
      const distanceFromCurrent = position - currentTarget;

      if (distanceFromCurrent > 150) return -1;

      let closest = 0;
      let minDist = Math.abs(position - getSnapPosition(0));

      for (let i = 1; i < snapPoints.length; i++) {
        const dist = Math.abs(position - getSnapPosition(i));
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      }

      return closest;
    },
    [snapPoints.length, getSnapPosition, currentSnapIndex],
  );

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

  useAnimatedReaction(
    () => keyboard.height.value,
    (height) => {
      if (!keyboardAvoidanceEnabled || height === 0) {
        translateY.value = withTiming(getSnapPosition(currentSnapIndex.value));
      } else {
        const target = getSnapPosition(currentSnapIndex.value);
        translateY.value = withTiming(
          Math.max(target - height + 40, insets.top),
        );
      }
    },
  );

  useEffect(() => {
    if (visible) {
      currentSnapIndex.value = initialSnapPoint;
      backdropOpacity.value = withTiming(1, { duration: 300 });
      if (!enableDynamicSizing || contentHeight.value > 0) {
        const target = getSnapPosition(initialSnapPoint);
        translateY.value = withTiming(target, { duration: 350 });
      }
    } else {
      backdropOpacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(windowHeight.value, { duration: 300 });
      if (enableDynamicSizing) {
        contentHeight.value = 0;
      }
    }
  }, [
    visible,
    initialSnapPoint,
    getSnapPosition,
    translateY,
    currentSnapIndex,
    windowHeight,
    backdropOpacity,
    enableDynamicSizing,
    contentHeight,
  ]);

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      windowHeight.value = window.height;
      if (visible) {
        translateY.value = withTiming(getSnapPosition(currentSnapIndex.value));
      }
    });
    return () => sub?.remove();
  }, [visible, getSnapPosition, translateY, currentSnapIndex, windowHeight]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    paddingBottom: insets.bottom,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const onContentLayout = useCallback((e: LayoutChangeEvent) => {
    if (enableDynamicSizing) {
      const height = e.nativeEvent.layout.height;
      if (
        Math.abs(contentHeight.value - height) > 1 || contentHeight.value === 0
      ) {
        contentHeight.value = height;
        if (visible) {
          translateY.value = withTiming(
            getSnapPosition(currentSnapIndex.value),
          );
        }
      }
    }
  }, [
    enableDynamicSizing,
    contentHeight,
    visible,
    translateY,
    getSnapPosition,
    currentSnapIndex,
  ]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.root}>
        <Animated.View
          style={[styles.backdrop, backdropStyle, {
            backgroundColor: backdropColor,
          }]}
        >
          {closeOnBackdropPress && (
            <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
          )}
        </Animated.View>

        <Animated.View style={[styles.sheet, sheetStyle]}>
          {handleStyle === "default" && (
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
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
    maxHeight: "100%",
  },
  handleWrapper: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ddd",
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
});
