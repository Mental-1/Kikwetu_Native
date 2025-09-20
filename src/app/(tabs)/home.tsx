import React from 'react';
import { Text,View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {Colors} from '@/src/constants/constant'
type Props = {};

const Home = (props: Props) => {
    useRouter();
    return (
    <SafeAreaView style={{ flex: 1 }} >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.text}>
                Hello Kikwetu
            </Text>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    text: {
        fontSize: 26,
        color: Colors.primary,
        letterSpacing: 1.5,
        fontWeight: 'bold'
    }
})

export default Home;
