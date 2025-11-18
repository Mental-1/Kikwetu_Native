
import React, { useState, useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/constant';
import Toast from 'react-native-toast-message';

interface AnimatedIconProps {
  onPress: () => void;
  isSaved: boolean;
}

const SaveButton: React.FC<AnimatedIconProps> = ({ onPress, isSaved }) => {
  const scale = useSharedValue(1);
  const [saved, setSaved] = useState(isSaved);

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    scale.value = withSpring(1.5, { damping: 2, stiffness: 80 }, () => {
      scale.value = withSpring(1);
    });
    setSaved(!saved);
    onPress();
    if (!saved) {
      Toast.show({
        type: 'success',
        text1: 'Saved successfully',
      });
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={saved ? 'bookmark' : 'bookmark-outline'}
          size={24}
          color={saved ? Colors.primary : Colors.white}
        />
      </Animated.View>
    </Pressable>
  );
};

export default SaveButton;
