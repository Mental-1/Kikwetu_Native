import { Colors } from '@/src/constants/constant';
import { useAppStore } from '@/stores/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function Step1() {
  const router = useRouter();
  const { 
    title, 
    description, 
    price, 
    location, 
    condition, 
    tags,
    setTitle,
    setDescription,
    setPrice,
    setLocation,
    setCondition,
    setTags
  } = useAppStore((state) => state.postAd);

  const [tagInput, setTagInput] = useState('');

  const handleBack = () => {
    router.push('/(tabs)/listings');
  };

  const handleNext = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a title for your listing');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required Field', 'Please enter a description');
      return;
    }
    if (!price) {
      Alert.alert('Required Field', 'Please enter a price');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Required Field', 'Please enter a location');
      return;
    }
    if (!condition) {
      Alert.alert('Required Field', 'Please select a condition');
      return;
    }
    router.push('/(screens)/post-ad/step2');
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const requestLocation = () => {
    Alert.alert(
      'Location Permission',
      'Allow Kikwetu to access your location for automatic detection?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Allow', 
          onPress: () => {
            // TODO: Implement location permission request
            Alert.alert('Location', 'Location permission would be requested here');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Ad - Step 1</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter listing title"
            placeholderTextColor={Colors.grey}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.characterCount}>{title.length}/100</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your item in detail"
            placeholderTextColor={Colors.grey}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{description.length}/500</Text>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>Price (Kes) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            placeholderTextColor={Colors.grey}
            value={price ? price.toString() : ''}
            onChangeText={(text) => setPrice(text ? parseFloat(text) : null)}
            keyboardType="numeric"
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <View style={styles.locationContainer}>
            <TextInput
              style={[styles.input, styles.locationInput]}
              placeholder="Enter location"
              placeholderTextColor={Colors.grey}
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity style={styles.locationButton} onPress={requestLocation}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Condition */}
        <View style={styles.section}>
          <Text style={styles.label}>Condition *</Text>
          <View style={styles.conditionContainer}>
            {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((cond) => (
              <TouchableOpacity
                key={cond}
                style={[
                  styles.conditionButton,
                  condition === cond && styles.conditionButtonSelected
                ]}
                onPress={() => setCondition(cond)}
              >
                <Text style={[
                  styles.conditionText,
                  condition === cond && styles.conditionTextSelected
                ]}>
                  {cond}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.label}>Tags (for search and classification)</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.input, styles.tagInput]}
              placeholder="Add a tag (e.g., #electronics, #furniture)"
              placeholderTextColor={Colors.grey}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
            />
            <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
              <Ionicons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          {/* Display Tags */}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => removeTag(tag)}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                  <Ionicons name="close" size={16} color={Colors.white} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next: Add Media</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.black,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: 'right',
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    marginRight: 8,
  },
  locationButton: {
    backgroundColor: Colors.lightgrey,
    borderRadius: 8,
    padding: 12,
  },
  conditionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionButton: {
    backgroundColor: Colors.lightgrey,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  conditionButtonSelected: {
    backgroundColor: Colors.primary,
  },
  conditionText: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
  },
  conditionTextSelected: {
    color: Colors.white,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightgrey,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
