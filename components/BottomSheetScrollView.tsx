import React, { forwardRef } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
} from "react-native-reanimated";
import { Spacing } from "@/constants/theme";

interface BottomSheetScrollViewProps {
    children?: React.ReactNode;
    contentContainerStyle?: ViewStyle;
    showsVerticalScrollIndicator?: boolean;
}

const BottomSheetScrollView = forwardRef<
    Animated.ScrollView,
    BottomSheetScrollViewProps
>(
    (
        {
            children,
            contentContainerStyle,
            showsVerticalScrollIndicator = true,
        },
        ref,
    ) => {
        const scrollY = useSharedValue(0);
        const isScrolling = useSharedValue(false);

        const scrollHandler = useAnimatedScrollHandler({
            onScroll: (event) => {
                scrollY.value = event.contentOffset.y;
            },
            onBeginDrag: () => {
                isScrolling.value = true;
            },
            onEndDrag: () => {
                isScrolling.value = false;
            },
        });

        return (
            <Animated.ScrollView
                ref={ref}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                contentContainerStyle={[
                    styles.contentContainer,
                    contentContainerStyle,
                ]}
                keyboardShouldPersistTaps="handled"
                bounces={true}
            >
                {children}
            </Animated.ScrollView>
        );
    },
);

BottomSheetScrollView.displayName = "BottomSheetScrollView";

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: Spacing.xl,
    },
});

export default BottomSheetScrollView;
