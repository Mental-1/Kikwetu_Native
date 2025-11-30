import { Colors } from "@/src/constants/constant";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface PlanCardProps {
    id: string;
    name: string;
    price: number;
    annualPrice: number;
    billingCycle: "monthly" | "annual";
    features: string[];
    isPopular?: boolean;
    isCurrent?: boolean;
    color: string;
    annualDiscount?: string;
    isSelected: boolean;
    onSelect: () => void;
    onPick: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
    name,
    price,
    annualPrice,
    billingCycle,
    features,
    isPopular,
    isCurrent,
    color,
    annualDiscount,
    isSelected,
    onSelect,
    onPick,
}) => {
    const heightProgress = useSharedValue(0);

    useEffect(() => {
        heightProgress.value = withTiming(isSelected ? 1 : 0, {
            duration: 300,
        });
    }, [isSelected]);

    const animatedContentStyle = useAnimatedStyle(() => {
        return {
            opacity: heightProgress.value,
            height: isSelected ? "auto" : 0,
            overflow: "hidden",
        };
    });

    const displayPrice = billingCycle === "monthly" ? price : annualPrice;
    const period = billingCycle === "monthly" ? "month" : "year";

    return (
        <Pressable
            style={[
                styles.container,
                isSelected && styles.selectedContainer,
            ]}
            onPress={onSelect}
        >
            {isPopular && (
                <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Most Popular</Text>
                </View>
            )}

            {/* Header: Always Visible */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.planName}>{name}</Text>
                </View>

                <View style={styles.headerRight}>
                    {annualDiscount && billingCycle === "annual" && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                                {annualDiscount}
                            </Text>
                        </View>
                    )}
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>
                            {displayPrice.toLocaleString()}
                        </Text>
                        <Text style={styles.period}>/{period}</Text>
                    </View>
                </View>
            </View>

            {/* Expanded Content: Features & Button */}
            <Animated.View style={animatedContentStyle}>
                <View style={styles.expandedContent}>
                    <View style={styles.divider} />

                    <View style={styles.featuresContainer}>
                        {features.map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color={Colors.primary}
                                />
                                <Text style={styles.featureText}>
                                    {feature}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.pickPlanButton}
                        onPress={onPick}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.pickPlanButtonText}>Pick Plan</Text>
                        <Ionicons
                            name="arrow-forward"
                            size={18}
                            color={Colors.white}
                        />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.lightgrey,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedContainer: {
        borderColor: Colors.green,
        borderWidth: 1.5, // Slightly thicker to match "0.8 green border" intent (0.8 is too thin for RN usually, 1-2 is better)
        backgroundColor: Colors.white,
    },
    popularBadge: {
        position: "absolute",
        top: -10,
        right: 16,
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 1,
    },
    popularText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: "bold",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    planName: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.black,
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    price: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.black,
    },
    period: {
        fontSize: 14,
        color: Colors.grey,
        marginLeft: 2,
    },
    discountBadge: {
        backgroundColor: "#E8F5E9",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    discountText: {
        color: Colors.green,
        fontSize: 12,
        fontWeight: "600",
    },
    expandedContent: {
        marginTop: 12,
    },
    divider: {
        height: 1,
        backgroundColor: "#F0F0F0",
        marginBottom: 12,
    },
    featuresContainer: {
        marginBottom: 16,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    featureText: {
        marginLeft: 8,
        fontSize: 14,
        color: Colors.darkgrey,
    },
    pickPlanButton: {
        backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    pickPlanButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default PlanCard;
