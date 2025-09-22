import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

/**
 * A concise summary of what the function, class, or variable does.
 *
 * @param {Type} paramName - Description of the parameter, including its purpose and any constraints.
 * @param {Type} [optionalParamName] - Description of an optional parameter.
 * @returns {Type} Description of the return value.
 * @example
 * // Example usage of the documented code.
 * const result = myFunction(10, 'hello');
 * console.log(result);
 * @see {@link AnotherThing} - Reference to related documentation or type.
 */

type ListingCardProps = {
    imageUrl: string;
    title: string;
    price: string;
    description: string;
    location: string;
    views: number;
    sellerHandle: string;
};

const ListingCard = ({ imageUrl, title, price, description, location, views, sellerHandle }: ListingCardProps) => {
    return (
        <View style={styles.card}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
                <Text style={styles.price}>{price}</Text>
                <Text style={styles.description} numberOfLines={2}>
                    {description}
                </Text>
                <Text style={styles.location}>{location}</Text>
                <View style={styles.footer}>
                    <Text style={styles.seller}>@{sellerHandle}</Text>
                    <Text style={styles.views}>{views} views</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 8,
        overflow: 'hidden',
        marginVertical: 8,
        width: '100%',
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    content: {
        padding: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    price: {
        fontSize: 20,
        color: '#00FF00',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#B0B0B0',
        marginBottom: 4,
    },
    location: {
        fontSize: 12,
        color: '#B0B0B0',
        marginBottom: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    seller: {
        fontSize: 12,
        color: '#FFF',
    },
    views: {
        fontSize: 12,
        color: '#B0B0B0',
    },
});

export default ListingCard;