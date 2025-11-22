import React, { useState, useEffect } from 'react';
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
          color={saved ? Colors.highlight : Colors.white}
        />
      </Animated.View>
    </Pressable>
  );
};

export default SaveButton;