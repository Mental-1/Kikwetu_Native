import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { Modal, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetProps, BottomSheetRef } from "./BottomSheet";

export interface BottomSheetModalProps
    extends Omit<BottomSheetProps, "initialIndex"> {
    dismissOnSnapToBottom?: boolean;
}

export interface BottomSheetModalRef {
    present: (index?: number) => void;
    dismiss: () => void;
    snapToIndex: (index: number) => void;
    snapToPosition: (position: number) => void;
    expand: () => void;
    collapse: () => void;
}

const BottomSheetModal = forwardRef<BottomSheetModalRef, BottomSheetModalProps>(
    (
        {
            snapPoints = ["50%"],
            dismissOnSnapToBottom = true,
            onClose,
            children,
            ...props
        },
        ref,
    ) => {
        const [visible, setVisible] = useState(false);
        const [presentIndex, setPresentIndex] = useState(0);
        const bottomSheetRef = useRef<BottomSheetRef>(null);

        const handleClose = useCallback(() => {
            setVisible(false);
            onClose?.();
        }, [onClose]);

        const present = useCallback((index = 0) => {
            setPresentIndex(index);
            setVisible(true);
        }, []);

        const dismiss = useCallback(() => {
            bottomSheetRef.current?.close();
        }, []);

        useImperativeHandle(
            ref,
            () => ({
                present,
                dismiss,
                snapToIndex: (index: number) => {
                    bottomSheetRef.current?.snapToIndex(index);
                },
                snapToPosition: (position: number) => {
                    bottomSheetRef.current?.snapToPosition(position);
                },
                expand: () => {
                    bottomSheetRef.current?.expand();
                },
                collapse: () => {
                    bottomSheetRef.current?.collapse();
                },
            }),
            [present, dismiss],
        );

        if (!visible) {
            return null;
        }

        return (
            <Modal
                visible={visible}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={dismiss}
            >
                <GestureHandlerRootView style={styles.container}>
                    <View style={styles.container}>
                        <BottomSheet
                            ref={bottomSheetRef}
                            snapPoints={snapPoints}
                            initialIndex={presentIndex}
                            onClose={handleClose}
                            enablePanDownToClose={dismissOnSnapToBottom}
                            {...props}
                        >
                            {children}
                        </BottomSheet>
                    </View>
                </GestureHandlerRootView>
            </Modal>
        );
    },
);

BottomSheetModal.displayName = "BottomSheetModal";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default BottomSheetModal;
