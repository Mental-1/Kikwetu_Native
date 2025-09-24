import React from 'react';
import { Text,View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {Colors } from '@/src/constants/constant'
import {Searchbar, Avatar, Card, Modal} from "react-native-paper";

type Props = {};

const Home = (props: Props) => {
    useRouter();
    return (
    <SafeAreaView style={{ flex: 1 }} >
        <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
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

// TODO: Implement full home page.
//  Views to create:
// 1. Header with logo, and account avatar, both justified right.
// 2. Search bar below that above the categories seelection.
// 3. Add category view, 2 rows of 4 categories scrollable to horizontally to the right with a view all button that redirects to the categories page with a subcategories page for each .
// 4. A For You section with video card previews, scrollable horizoontally, and opening to the discover page .
// 5. A neighbourhood and proximity filtering section showing listing near you and for you.