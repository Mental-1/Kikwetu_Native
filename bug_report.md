# Bug Report

This report details the findings of an investigation into inconsistent behavior with modals and bottom sheets throughout the app.

## Bug Candidates

### 1. Incorrect BottomSheet Sizing in `AvatarSheet`

*   **File:** `components/AvatarSheet.tsx`
*   **Line:** `<BottomSheet visible={visible} onClose={onClose} snapPoints={['25%']}enableDynamicSizing>`
*   **Reasoning:** The `BottomSheet` is using both a fixed `snapPoint` of `'25%'` and the `enableDynamicSizing` prop. This is a conflicting configuration. When `enableDynamicSizing` is used, the bottom sheet automatically adjusts its height to fit the content. However, the `snapPoints` prop forces it to a specific height (25% of the screen). This conflict is likely causing the inconsistent and incorrect rendering you're seeing, where only the top part of the sheet is visible.

### 2. Incorrect Root View Style in `PaymentConfirmationSheet`

*   **File:** `components/PaymentConfirmationSheet.tsx`
*   **Line:** `<View style={[styles.container, { paddingBottom: bottom > 0 ? bottom : 24 }]}>`
*   **Reasoning:** The root `View` inside the `BottomSheet` has a `flex: 1` style. This can cause issues with how the `BottomSheet` calculates its content height, especially when `enableDynamicSizing` is also used. The `flex: 1` property tells the view to expand to fill the available space, which can conflict with the bottom sheet's own sizing logic and lead to it appearing halfway up the screen.

### 3. Conflicting BottomSheet Sizing in `SortModal`

*   **File:** `components/SortModal.tsx`
*   **Line:** `<BottomSheet visible={visible} onClose={onClose} snapPoints={['50%']} enableDynamicSizing>`
*   **Reasoning:** Similar to the `AvatarSheet`, the `SortModal` uses both a fixed `snapPoint` of `'50%'` and the `enableDynamicSizing` prop. This conflict is likely the reason the modal is not visible, as the component doesn't know how to resolve the competing height requirements.

### 4. Incorrect Root View Style in `SortModal`

*   **File:** `components/SortModal.tsx`
*   **Line:** `<View style={styles.modalContainer}>`
*   **Reasoning:** The `modalContainer` style has a `flex: 1` property. As with the `PaymentConfirmationSheet`, this can interfere with the `BottomSheet`'s ability to correctly calculate its height, leading to it not appearing at all.

### 5. Incorrect `useEffect` Dependencies in `BottomSheet`

*   **File:** `components/BottomSheet.tsx`
*   **Line:** `useEffect(() => { ... }, [visible, translateY,windowHeight,getSnapPosition,currentSnapIndex]);`
*   **Reasoning:** The `useEffect` hook that handles window dimension changes has an incomplete dependency array. It is missing dependencies on `getSnapPosition` and `currentSnapIndex`. This means that if the snap points change, the bottom sheet won't correctly recalculate its position, leading to it appearing at the wrong height or not at all.

### 6. Incorrect `useEffect` Dependencies in `BottomSheet`

*   **File:** `components/BottomSheet.tsx`
*   **Line:** `useEffect(() => { ... }, [visible, initialSnapPoint,backdropOpacity,translateY,currentSnapIndex,getSnapPosition,windowHeight]);`
*   **Reasoning:** The `useEffect` hook that handles opening and closing the bottom sheet also has an incomplete dependency array. It is missing dependencies on `getSnapPosition` and `windowHeight`. This can cause the bottom sheet to open at the wrong position or not open at all, especially if the screen dimensions change while the sheet is closed.

### 7. Conflicting Styles in `BottomSheet`

*   **File:** `components/BottomSheet.tsx`
*   **Line:** `<View style={styles.contentContainer}>{children}</View>`
*   **Reasoning:** The `contentContainer` style has a `flex: 1` property. This can conflict with the `enableDynamicSizing` prop, which is intended to allow the bottom sheet to resize based on its content. The `flex: 1` style forces the content to expand to fill the available space, which can cause the bottom sheet to grow to its maximum height instead of wrapping its content. This is likely the cause of the `AvatarSheet` and `PaymentConfirmationSheet` appearing halfway up the screen.

### 8. Missing `Worklet` Directive in `BottomSheet`

*   **File:** `components/BottomSheet.tsx`
*   **Line:** `const handleBackdropPress = () => { ... };`
*   **Reasoning:** The `handleBackdropPress` function is called from a `Pressable` component, which runs on the main JavaScript thread. However, the `closeSheet` function it calls is a worklet and is expected to run on the UI thread. This can cause a race condition, where the bottom sheet tries to close before the UI has had a chance to update. This is a likely contributor to the inconsistent behavior you're seeing.
