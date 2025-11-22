import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedIconProps {
  onPress: () => void;
  isLiked: boolean;
  iconColor?: string;
}

const LikeButton: React.FC<AnimatedIconProps> = ({ onPress, isLiked, iconColor = Colors.white }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(1.5, {
        duration: 130,
        easing: Easing.out(Easing.ease)
      }),
      withTiming(1, {
        duration: 130,
        easing: Easing.in(Easing.ease)
      })
    );

    onPress();
  };

  return (
    <Pressable onPress={handlePress} hitSlop={10}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={24}
          color={isLiked ? Colors.red : iconColor}
        />
      </Animated.View>
    </Pressable>
  );
};

export default LikeButton;