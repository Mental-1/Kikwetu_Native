
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/constant';

interface AnimatedSearchBarProps {
  onSearch: (query: string) => void;
}

const AnimatedSearchBar: React.FC<AnimatedSearchBarProps> = ({ onSearch }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const width = useSharedValue(isFocused ? 200 : 0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(width.value, { duration: 300 }),
    };
  });

  const handleFocus = () => {
    setIsFocused(true);
    width.value = 200;
  };

  const handleBlur = () => {
    setIsFocused(false);
    width.value = 0;
  };

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleFocus}>
        <Ionicons name="search" size={24} color={Colors.black} />
      </Pressable>
      <Animated.View style={[styles.inputContainer, animatedStyle]}>
        <TextInput
          style={styles.input}
          placeholder="Search..."
          value={query}
          onChangeText={setQuery}
          onBlur={handleBlur}
          onSubmitEditing={handleSearch}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    overflow: 'hidden',
  },
  input: {
    height: 40,
    backgroundColor: Colors.lightgrey,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
});

export default AnimatedSearchBar;
