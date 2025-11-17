import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/src/constants/constant';

const DOT_SIZE = 10;
const DOT_SPACING = 12;
const ANIMATION_DURATION = 300;
const WAVE_DELAY = 100;

const CustomLoader = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const easing = Easing.inOut(Easing.ease);

    dot1.value = withRepeat(
      withSequence(
        withTiming(-DOT_SIZE, { duration: ANIMATION_DURATION, easing }),
        withTiming(0, { duration: ANIMATION_DURATION, easing })
      ),
      -1,
      true
    );

    dot2.value = withDelay(
      WAVE_DELAY,
      withRepeat(
        withSequence(
          withTiming(-DOT_SIZE, { duration: ANIMATION_DURATION, easing }),
          withTiming(0, { duration: ANIMATION_DURATION, easing })
        ),
        -1,
        true
      )
    );

    dot3.value = withDelay(
      WAVE_DELAY * 2,
      withRepeat(
        withSequence(
          withTiming(-DOT_SIZE, { duration: ANIMATION_DURATION, easing }),
          withTiming(0, { duration: ANIMATION_DURATION, easing })
        ),
        -1,
        true
      )
    );
  }, [dot1, dot2, dot3]);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));
  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));
  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, animatedStyle1]} />
      <Animated.View style={[styles.dot, animatedStyle2]} />
      <Animated.View style={[styles.dot, animatedStyle3]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: DOT_SPACING,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.primary,
  },
});

export default CustomLoader;
