import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
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

const sizeConfig = {
  small: {
    dotSize: 6,
    dotSpacing: 8,
    animationDuration: 250,
    waveDelay: 80,
  },
  medium: {
    dotSize: 10,
    dotSpacing: 12,
    animationDuration: 300,
    waveDelay: 100,
  },
  large: {
    dotSize: 14,
    dotSpacing: 16,
    animationDuration: 350,
    waveDelay: 120,
  },
};

interface CustomLoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ size = 'medium', color = Colors.primary, style }) => {
  const { dotSize, dotSpacing, animationDuration, waveDelay } = useMemo(() => sizeConfig[size], [size]);

  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const easing = Easing.inOut(Easing.ease);

    dot1.value = withRepeat(
      withSequence(
        withTiming(-dotSize, { duration: animationDuration, easing }),
        withTiming(0, { duration: animationDuration, easing })
      ),
      -1,
      true
    );

    dot2.value = withDelay(
      waveDelay,
      withRepeat(
        withSequence(
          withTiming(-dotSize, { duration: animationDuration, easing }),
          withTiming(0, { duration: animationDuration, easing })
        ),
        -1,
        true
      )
    );

    dot3.value = withDelay(
      waveDelay * 2,
      withRepeat(
        withSequence(
          withTiming(-dotSize, { duration: animationDuration, easing }),
          withTiming(0, { duration: animationDuration, easing })
        ),
        -1,
        true
      )
    );
  }, [dot1, dot2, dot3, dotSize, animationDuration, waveDelay]);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));
  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));
  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }));

  const dotStyle = {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: color,
  };

  return (
    <View style={[styles.container, { gap: dotSpacing }, style]}>
      <Animated.View style={[dotStyle, animatedStyle1]} />
      <Animated.View style={[dotStyle, animatedStyle2]} />
      <Animated.View style={[dotStyle, animatedStyle3]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomLoader;
