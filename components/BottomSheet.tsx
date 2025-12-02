import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SPRING_CONFIG = {
  damping: 50,
  stiffness: 500,
  mass: 0.5,
  overshootClamping: true,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
};

export type SnapPoint = number | `${number}%`;

export interface BottomSheetProps {
  snapPoints?: SnapPoint[];
  initialIndex?: number;
  enablePanDownToClose?: boolean;
  enableBackdropDismiss?: boolean;
  enableDynamicSizing?: boolean;
  backdropOpacity?: number;
  handleHeight?: number;
  showHandle?: boolean;
  keyboardBehavior?: "extend" | "fillParent" | "interactive";
  onChange?: (index: number) => void;
  onClose?: () => void;
  onOpen?: () => void;
  children?: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  handleStyle?: ViewStyle;
  handleIndicatorStyle?: ViewStyle;
  backgroundStyle?: ViewStyle;
}

export interface BottomSheetRef {
  snapToIndex: (index: number) => void;
  snapToPosition: (position: number) => void;
  expand: () => void;
  collapse: () => void;
  close: () => void;
  forceClose: () => void;
}

const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  (
    {
      snapPoints: propSnapPoints = ["25%", "50%", "75%", "90%"],
      initialIndex = -1,
      enablePanDownToClose = true,
      enableBackdropDismiss = true,
      backdropOpacity = 0.5,
      handleHeight = 24,
      showHandle = true,
      keyboardBehavior = "interactive",
      onChange,
      onClose,
      onOpen,
      children,
      contentContainerStyle,
      handleStyle,
      handleIndicatorStyle,
      backgroundStyle,
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const translateY = useSharedValue(SCREEN_HEIGHT);
    const context = useSharedValue({ y: 0 });
    const currentIndex = useSharedValue(initialIndex);
    const keyboardHeight = useSharedValue(0);
    const [isVisible, setIsVisible] = useState(initialIndex >= 0);

    const snapPointsInPixels = useMemo(() => {
      return propSnapPoints.map((point) => {
        if (typeof point === "number") {
          return point;
        }
        const percentage = parseFloat(point) / 100;
        return SCREEN_HEIGHT * percentage;
      });
    }, [propSnapPoints]);

    const maxSnapPoint = useMemo(
      () => Math.max(...snapPointsInPixels),
      [snapPointsInPixels],
    );

    const minSnapPoint = useMemo(
      () => Math.min(...snapPointsInPixels),
      [snapPointsInPixels],
    );

    const closedPosition = SCREEN_HEIGHT;

    const getPositionForIndex = useCallback(
      (index: number): number => {
        "worklet";
        if (index < 0) return closedPosition;
        const snapPoint = snapPointsInPixels[index] ?? minSnapPoint;
        return SCREEN_HEIGHT - snapPoint;
      },
      [snapPointsInPixels, closedPosition, minSnapPoint],
    );

    const getIndexForPosition = useCallback(
      (position: number): number => {
        "worklet";
        const sheetHeight = SCREEN_HEIGHT - position;
        let closestIndex = -1;
        let minDistance = Infinity;

        for (let i = 0; i < snapPointsInPixels.length; i++) {
          const distance = Math.abs(snapPointsInPixels[i] - sheetHeight);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
          }
        }

        return closestIndex;
      },
      [snapPointsInPixels],
    );

    const animateTo = useCallback(
      (position: number, velocity = 0) => {
        "worklet";
        translateY.value = withSpring(position, {
          ...SPRING_CONFIG,
          velocity,
        });
      },
      [translateY],
    );

    const handleCloseCallback = useCallback(() => {
      setIsVisible(false);
      onClose?.();
    }, [onClose]);

    const handleOpenCallback = useCallback(() => {
      setIsVisible(true);
      onOpen?.();
    }, [onOpen]);

    const handleIndexChangeCallback = useCallback(
      (index: number) => {
        onChange?.(index);
      },
      [onChange],
    );

    useAnimatedReaction(
      () => currentIndex.value,
      (curr, prev) => {
        if (curr !== prev && prev !== null) {
          handleIndexChangeCallback(curr);
          if (curr === -1 && prev !== -1) {
            handleCloseCallback();
          } else if (curr !== -1 && prev === -1) {
            handleOpenCallback();
          }
        }
      },
      [handleIndexChangeCallback, handleCloseCallback, handleOpenCallback],
    );

    useKeyboardHandler(
      {
        onMove: (e) => {
          "worklet";
          if (keyboardBehavior === "interactive") {
            keyboardHeight.value = e.height;
          }
        },
        onEnd: (e) => {
          "worklet";
          if (keyboardBehavior === "interactive") {
            keyboardHeight.value = e.height;
          }
        },
      },
      [keyboardBehavior],
    );

    const snapToIndexInternal = useCallback(
      (index: number) => {
        const clampedIndex = Math.max(
          -1,
          Math.min(index, snapPointsInPixels.length - 1),
        );
        const position = getPositionForIndex(clampedIndex);
        currentIndex.value = clampedIndex;
        if (clampedIndex >= 0) {
          setIsVisible(true);
        }
        animateTo(position);
      },
      [snapPointsInPixels.length, getPositionForIndex, currentIndex, animateTo],
    );

    const snapToPositionInternal = useCallback(
      (position: number) => {
        const targetY = SCREEN_HEIGHT - position;
        const index = getIndexForPosition(targetY);
        currentIndex.value = index;
        if (index >= 0) {
          setIsVisible(true);
        }
        animateTo(targetY);
      },
      [getIndexForPosition, currentIndex, animateTo],
    );

    const expandInternal = useCallback(() => {
      snapToIndexInternal(snapPointsInPixels.length - 1);
    }, [snapToIndexInternal, snapPointsInPixels.length]);

    const collapseInternal = useCallback(() => {
      snapToIndexInternal(0);
    }, [snapToIndexInternal]);

    const closeInternal = useCallback(() => {
      snapToIndexInternal(-1);
    }, [snapToIndexInternal]);

    const forceCloseInternal = useCallback(() => {
      translateY.value = closedPosition;
      currentIndex.value = -1;
      setIsVisible(false);
    }, [translateY, currentIndex, closedPosition]);

    useImperativeHandle(
      ref,
      () => ({
        snapToIndex: snapToIndexInternal,
        snapToPosition: snapToPositionInternal,
        expand: expandInternal,
        collapse: collapseInternal,
        close: closeInternal,
        forceClose: forceCloseInternal,
      }),
      [
        snapToIndexInternal,
        snapToPositionInternal,
        expandInternal,
        collapseInternal,
        closeInternal,
        forceCloseInternal,
      ],
    );

    useEffect(() => {
      if (initialIndex >= 0) {
        const position = getPositionForIndex(initialIndex);
        translateY.value = position;
        currentIndex.value = initialIndex;
        setIsVisible(true);
      }
    }, []);

    useEffect(() => {
      if (Platform.OS === "android") {
        const subscription = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            if (isVisible) {
              closeInternal();
              return true;
            }
            return false;
          },
        );
        return () => subscription.remove();
      }
    }, [closeInternal, isVisible]);

    const panGesture = Gesture.Pan()
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate((event) => {
        const newY = context.value.y + event.translationY;
        const minY = SCREEN_HEIGHT - maxSnapPoint;
        const maxY = enablePanDownToClose
          ? closedPosition
          : SCREEN_HEIGHT - minSnapPoint;

        if (newY < minY) {
          const overflow = minY - newY;
          translateY.value = minY - overflow * 0.2;
        } else if (newY > maxY) {
          const overflow = newY - maxY;
          translateY.value = maxY + overflow * 0.2;
        } else {
          translateY.value = newY;
        }
      })
      .onEnd((event) => {
        const velocity = event.velocityY;
        const currentY = translateY.value;
        const currentHeight = SCREEN_HEIGHT - currentY;

        if (enablePanDownToClose && velocity > 500) {
          currentIndex.value = -1;
          animateTo(closedPosition, velocity);
          handleCloseCallback();
          return;
        }

        if (velocity < -500) {
          const currentIdx = getIndexForPosition(currentY);
          const nextIdx = Math.min(
            currentIdx + 1,
            snapPointsInPixels.length - 1,
          );
          currentIndex.value = nextIdx;
          animateTo(getPositionForIndex(nextIdx), velocity);
          return;
        }

        let closestIndex = 0;
        let minDistance = Infinity;

        for (let i = 0; i < snapPointsInPixels.length; i++) {
          const distance = Math.abs(snapPointsInPixels[i] - currentHeight);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
          }
        }

        if (enablePanDownToClose) {
          const distanceToClose = currentHeight;
          if (distanceToClose < minSnapPoint * 0.5) {
            currentIndex.value = -1;
            animateTo(closedPosition, velocity);
            handleCloseCallback();
            return;
          }
        }

        currentIndex.value = closestIndex;
        animateTo(getPositionForIndex(closestIndex), velocity);
      });

    const backdropTapGesture = Gesture.Tap().onEnd(() => {
      if (enableBackdropDismiss) {
        currentIndex.value = -1;
        animateTo(closedPosition);
        handleCloseCallback();
      }
    });

    const rBackdropStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        translateY.value,
        [closedPosition, SCREEN_HEIGHT - minSnapPoint],
        [0, backdropOpacity],
        Extrapolation.CLAMP,
      );

      return {
        opacity,
      };
    });

    const rSheetStyle = useAnimatedStyle(() => {
      const keyboardOffset = keyboardBehavior === "interactive"
        ? keyboardHeight.value
        : 0;

      return {
        transform: [
          { translateY: Math.max(translateY.value - keyboardOffset, 0) },
        ],
      };
    });

    const rContentStyle = useAnimatedStyle(() => {
      const keyboardOffset = keyboardBehavior === "interactive"
        ? keyboardHeight.value
        : 0;

      return {
        paddingBottom: keyboardOffset > 0 ? keyboardOffset : insets.bottom,
      };
    });

    if (!isVisible && initialIndex < 0) {
      return null;
    }

    return (
      <>
        <GestureDetector gesture={backdropTapGesture}>
          <Animated.View
            style={[
              styles.backdrop,
              { backgroundColor: theme.text },
              rBackdropStyle,
            ]}
          />
        </GestureDetector>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.backgroundDefault,
                height: SCREEN_HEIGHT,
              },
              backgroundStyle,
              rSheetStyle,
            ]}
          >
            {showHandle
              ? (
                <View
                  style={[
                    styles.handleContainer,
                    { height: handleHeight },
                    handleStyle,
                  ]}
                >
                  <View
                    style={[
                      styles.handle,
                      { backgroundColor: theme.border },
                      handleIndicatorStyle,
                    ]}
                  />
                </View>
              )
              : null}

            <Animated.View
              style={[
                styles.content,
                contentContainerStyle,
                rContentStyle,
              ]}
            >
              {children}
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </>
    );
  },
);

BottomSheet.displayName = "BottomSheet";

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    zIndex: 101,
    overflow: "hidden",
    boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.15)",
  },
  handleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
});

export default BottomSheet;
