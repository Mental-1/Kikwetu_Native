
import React, { useState, useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/constant';

interface AnimatedIconProps {
  onPress: () => void;
  isLiked: boolean;
}

const LikeButton: React.FC<AnimatedIconProps> = ({ onPress, isLiked }) => {
  const scale = useSharedValue(1);
  const [liked, setLiked] = useState(isLiked);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    scale.value = withSpring(1.5, { damping: 2, stiffness: 80 }, () => {
      scale.value = withSpring(1);
    });
    setLiked(!liked);
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={24}
          color={liked ? Colors.red : Colors.white}
        />
      </Animated.View>
    </Pressable>
  );
};

export default LikeButton;
