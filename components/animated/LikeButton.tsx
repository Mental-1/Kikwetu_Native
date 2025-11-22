import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/constant';

interface AnimatedIconProps {
  onPress: () => void;
  isLiked: boolean;
}

const LikeButton: React.FC<AnimatedIconProps> = ({ onPress, isLiked }) => {
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
    <Pressable onPress={handlePress}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={24}
          color={isLiked ? Colors.red : Colors.white}
        />
      </Animated.View>
    </Pressable>
  );
};

export default LikeButton;