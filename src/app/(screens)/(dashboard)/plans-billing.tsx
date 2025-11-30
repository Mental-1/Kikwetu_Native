import PaymentConfirmationSheet from "@/components/PaymentConfirmationSheet";
import PlanCard from "@/components/PlanCard";
import PlanUsageCard from "@/components/PlanUsageCard";
import CustomLoader from "@/components/ui/CustomLoader";
import { Colors } from "@/src/constants/constant";
import {
    useCancelSubscription,
    useCurrentSubscription,
    useSubscriptionHistory,
    useSubscriptionPlans,
} from "@/src/hooks/useApiSubscriptions";
import { ApiSubscription, ApiSubscriptionPlan } from "@/src/types/api.types";
import { getUserPlan } from "@/stores/useAppStore";
import { createAlertHelpers, useCustomAlert } from "@/utils/alertUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SubscriptionPlan {
    id: string;
    name: string;
    description?: string;
    price: number;
    annualPrice: number;
    duration: number;
    maxListings?: number;
    features: string[];
    isPopular?: boolean;
    isCurrent?: boolean;
    color: string;
    icon: string;
    annualDiscount?: string;
    createdAt: string;
    updatedAt: string;
    user_id?: string;
}

interface BillingTransaction {
    id: string;
    date: string;
    description: string;
    amount: string;
    status: "completed" | "pending" | "failed";
    type: "subscription" | "one-time" | "refund";
    invoiceUrl?: string;
    transaction_id?: string | null;
}

const PlansBilling = () => {
    const router = useRouter();
    const { showAlert, AlertComponent } = useCustomAlert();
    const { success } = createAlertHelpers(showAlert);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState<
        SubscriptionPlan | null
    >(null);
    const [isPaymentSheetVisible, setIsPaymentSheetVisible] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
        "monthly",
    );

    const { data: plansData, isLoading: plansLoading, error: plansError } =
        useSubscriptionPlans();
    const { data: currentSubscription, isLoading: subscriptionLoading } =
        useCurrentSubscription();
    const {
        data: historyData,
        isLoading: historyLoading,
        error: historyError,
    } = useSubscriptionHistory();
    const cancelSubscriptionMutation = useCancelSubscription();

    const subscriptionPlans: SubscriptionPlan[] = useMemo(() => {
        return (plansData || []).map((plan: ApiSubscriptionPlan) => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            annualPrice: plan.price * 10,
            duration: plan.duration,
            maxListings: plan.max_listings,
            features: Array.isArray(plan.features)
                ? (plan.features as string[])
                : [],
            isPopular: plan.is_popular,
            isCurrent: currentSubscription?.plan_id === plan.id,
            color: plan.color,
            icon: plan.icon,
            annualDiscount: "Save 17%",
            createdAt: plan.created_at,
            updatedAt: plan.updated_at,
            user_id: plan.user_id,
        }));
    }, [plansData, currentSubscription]);

    const billingHistory: BillingTransaction[] = useMemo(() => {
        return (historyData || []).map((sub: ApiSubscription) => ({
            id: sub.id,
            date: new Date(sub.created_at).toLocaleDateString(),
            description: `${sub.billing_cycle} subscription - ${sub.plan_id}`,
            amount: `${sub.currency} ${sub.amount.toLocaleString()}`,
            status: sub.status === "active" || sub.status === "free"
                ? "completed"
                : sub.status === "past_due"
                ? "pending"
                : "failed",
            type: "subscription" as const,
            invoiceUrl: undefined,
            transaction_id: sub.transaction_id,
        }));
    }, [historyData]);

    const handleBack = () => {
        router.back();
    };

    const handleSelectPlan = (planId: string) => {
        const plan = subscriptionPlans.find((p) => p.id === planId);
        if (!plan) return;
        setSelectedPlanDetails(plan);
    };

    const handlePickPlan = (planId: string) => {
        const plan = subscriptionPlans.find((p) => p.id === planId);
        if (!plan) return;

        if (plan.id === "enterprise") {
            showAlert({
                title: "Enterprise Plan",
                message:
                    "Contact our sales team for custom pricing and features.",
                buttons: [{
                    text: "Contact Sales",
                    color: Colors.primary,
                    onPress: () => {
                        success(
                            "Success",
                            "Our sales team will contact you within 24 hours",
                        );
                    },
                }],
                icon: "business-outline",
                iconColor: Colors.primary,
            });
        } else if (plan.id === "free") {
            success("Free Plan", "You are already on the free plan!");
        } else {
            setIsPaymentSheetVisible(true);
        }
    };

    const handleProceedToPayment = () => {
        if (!selectedPlanDetails) return;
        setIsPaymentSheetVisible(false);
        router.push({
            pathname: "/(screens)/(dashboard)/payment",
            params: {
                planId: selectedPlanDetails.id,
                planName: selectedPlanDetails.name,
                price: billingCycle === "monthly"
                    ? selectedPlanDetails.price
                    : selectedPlanDetails.annualPrice,
                period: billingCycle === "monthly" ? "month" : "year",
                billingCycle: billingCycle,
            },
        });
    };

    const handleCancelSubscription = () => {
        if (!currentSubscription) return;
        const planName =
            subscriptionPlans.find((p) => p.id === currentSubscription.plan_id)
                ?.name || "your subscription";

        showAlert({
            title: "Cancel Subscription",
            message:
                `Are you sure you want to cancel your ${planName} subscription? You'll lose access to premium features at the end of your billing period.`,
            buttons: [
                { text: "No", style: "cancel" },
                {
                    text: "Cancel Subscription",
                    style: "destructive",
                    onPress: () => {
                        cancelSubscriptionMutation.mutate(
                            currentSubscription.id,
                            {
                                onSuccess: () => {
                                    success(
                                        "Subscription Cancelled",
                                        "Your subscription has been cancelled. You can reactivate it anytime.",
                                    );
                                },
                                onError: (error: Error) => {
                                    showAlert({
                                        title: "Cancellation Failed",
                                        message: error.message ||
                                            "Failed to cancel subscription. Please try again.",
                                        buttons: [{ text: "OK" }],
                                        icon: "close-circle",
                                        iconColor: "#F44336",
                                    });
                                },
                            },
                        );
                    },
                },
            ],
            icon: "warning-outline",
            iconColor: "#F44336",
        });
    };

    const handleReactivateSubscription = () => {
        if (!currentSubscription) return;
        showAlert({
            title: "Reactivate Subscription",
            message:
                `To reactivate your subscription, please select a new plan below.`,
            buttons: [{ text: "OK", color: Colors.primary }],
            icon: "refresh-outline",
            iconColor: Colors.primary,
        });
    };

    const handleViewAllTransactions = () => {
        showAlert({
            title: "View All Transactions",
            message: "Full transaction history will be displayed here",
            buttons: [{
                text: "OK",
                color: Colors.primary,
                onPress: () => {
                    success(
                        "Success",
                        "Full transaction history will be implemented",
                    );
                },
            }],
            icon: "list-outline",
            iconColor: Colors.primary,
        });
    };

    const handleDownloadInvoice = (transactionId: string) => {
        const transaction = billingHistory.find((t) => t.id === transactionId);
        if (transaction?.invoiceUrl) {
            showAlert({
                title: "Download Invoice",
                message: "Opening invoice in your browser...",
                buttons: [{
                    text: "OK",
                    color: Colors.primary,
                    onPress: () => {
                        success("Success", "Invoice opened in browser");
                    },
                }],
                icon: "download-outline",
                iconColor: Colors.primary,
            });
        } else {
            showAlert({
                title: "Invoice Not Available",
                message:
                    "Invoice generation is not yet available for this transaction.",
                buttons: [{ text: "OK", color: Colors.grey }],
                icon: "information-circle-outline",
                iconColor: Colors.grey,
            });
        }
    };

    const getStatusColor = (status: "completed" | "pending" | "failed") => {
        switch (status) {
            case "completed":
                return "#4CAF50";
            case "pending":
                return "#FF9800";
            case "failed":
                return "#F44336";
            default:
                return Colors.grey;
        }
    };

    const getStatusIcon = (status: "completed" | "pending" | "failed") => {
        switch (status) {
            case "completed":
                return "checkmark-circle";
            case "pending":
                return "time-outline";
            case "failed":
                return "close-circle";
            default:
        }
    };

    const renderTransaction = (transaction: BillingTransaction) => (
        <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                        {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                        {transaction.date}
                    </Text>
                </View>
                <View style={styles.transactionAmount}>
                    <Text style={styles.amountText}>{transaction.amount}</Text>
                    <View style={styles.statusContainer}>
                        <Ionicons
                            name={getStatusIcon(transaction.status)}
                            size={16}
                            color={getStatusColor(transaction.status)}
                        />
                        <Text
                            style={[styles.statusText, {
                                color: getStatusColor(transaction.status),
                            }]}
                        >
                            {transaction.status}
                        </Text>
                    </View>
                </View>
            </View>
            <Pressable
                style={(
                    { pressed },
                ) => [styles.downloadButton, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() =>
                    handleDownloadInvoice(transaction.id)}
            >
                <Ionicons
                    name="download-outline"
                    size={16}
                    color={Colors.primary}
                />
                <Text style={styles.downloadText}>Download Invoice</Text>
            </Pressable>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            {/* Header */}
            <SafeAreaView style={styles.header} edges={["top"]}>
                <Pressable
                    style={(
                        { pressed },
                    ) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}
                    onPress={handleBack}
                >
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color={Colors.black}
                    />
                </Pressable>
                <Text style={styles.headerTitle}>Plans & Billing</Text>
                <Pressable
                    style={(
                        { pressed },
                    ) => [styles.helpButton, { opacity: pressed ? 0.7 : 1 }]}
                    onPress={() =>
                        success(
                            "Help",
                            "Support information will be available here",
                        )}
                >
                    <Ionicons
                        name="help-circle-outline"
                        size={24}
                        color={Colors.primary}
                    />
                </Pressable>
            </SafeAreaView>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Current Plan Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Plan</Text>
                    {subscriptionLoading
                        ? (
                            <View style={styles.loadingContainer}>
                                <CustomLoader />
                                <Text style={styles.loadingText}>
                                    Loading subscription...
                                </Text>
                            </View>
                        )
                        : currentSubscription
                        ? (() => {
                            const userPlan = getUserPlan();
                            return (
                                <PlanUsageCard
                                    planName={userPlan.planName}
                                    usedListings={userPlan.usedListings}
                                    maxListings={userPlan.maxListings}
                                />
                            );
                        })()
                        : (
                            <View style={styles.emptyState}>
                                <Ionicons
                                    name="card-outline"
                                    size={48}
                                    color={Colors.grey}
                                />
                                <Text style={styles.emptyStateText}>
                                    No active subscription
                                </Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Choose a plan below to get started
                                </Text>
                            </View>
                        )}
                </View>

                {/* Subscription Plans */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Choose Your Plan</Text>
                    <Text style={styles.sectionSubtitle}>
                        Upgrade to unlock more features and capabilities
                    </Text>

                    {/* Billing Cycle Toggle */}
                    <View style={styles.billingToggleContainer}>
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleLabelContainer}>
                                <Text style={styles.billingToggleLabel}>
                                    Monthly
                                </Text>
                                <Text style={styles.billingToggleSubLabel}>
                                    Billed monthly
                                </Text>
                            </View>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.simpleToggle,
                                    billingCycle === "annual" &&
                                    styles.simpleToggleActive,
                                    { opacity: pressed ? 0.7 : 1 },
                                ]}
                                onPress={() =>
                                    setBillingCycle(
                                        billingCycle === "monthly"
                                            ? "annual"
                                            : "monthly",
                                    )}
                            >
                                <View
                                    style={[
                                        styles.toggleThumb,
                                        billingCycle === "annual" &&
                                        styles.toggleThumbActive,
                                    ]}
                                />
                            </Pressable>

                            <View style={styles.toggleLabelContainer}>
                                <Text style={styles.billingToggleLabel}>
                                    Annual
                                </Text>
                                <Text style={styles.billingToggleSubLabel}>
                                    Save 17%
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.plansContainer}>
                        {plansLoading
                            ? (
                                <View style={styles.loadingContainer}>
                                    <CustomLoader />
                                    <Text style={styles.loadingText}>
                                        Loading plans...
                                    </Text>
                                </View>
                            )
                            : plansError
                            ? (
                                <View style={styles.errorContainer}>
                                    <Ionicons
                                        name="alert-circle-outline"
                                        size={48}
                                        color={Colors.grey}
                                    />
                                    <Text style={styles.errorText}>
                                        Failed to load plans
                                    </Text>
                                    <Text style={styles.errorSubtext}>
                                        Please try again later
                                    </Text>
                                </View>
                            )
                            : (
                                subscriptionPlans.map((plan) => (
                                    <PlanCard
                                        key={plan.id}
                                        id={plan.id}
                                        name={plan.name}
                                        price={plan.price}
                                        annualPrice={plan.annualPrice}
                                        billingCycle={billingCycle}
                                        features={plan.features}
                                        isPopular={plan.isPopular}
                                        isCurrent={plan.isCurrent}
                                        color={plan.color}
                                        annualDiscount={plan.annualDiscount}
                                        isSelected={selectedPlanDetails?.id ===
                                            plan.id}
                                        onSelect={() =>
                                            handleSelectPlan(plan.id)}
                                        onPick={() => handlePickPlan(plan.id)}
                                    />
                                ))
                            )}
                    </View>
                </View>

                {/* Billing History */}
                <View style={styles.section}>
                    <View style={styles.billingHeader}>
                        <Text style={styles.sectionTitle}>Billing History</Text>
                        <Pressable
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.7 : 1,
                            })}
                            onPress={handleViewAllTransactions}
                        >
                            <Text style={styles.viewAllText}>View All</Text>
                        </Pressable>
                    </View>

                    <View style={styles.transactionsContainer}>
                        {historyLoading
                            ? (
                                <View style={styles.loadingContainer}>
                                    <CustomLoader />
                                    <Text style={styles.loadingText}>
                                        Loading history...
                                    </Text>
                                </View>
                            )
                            : historyError
                            ? (
                                <View style={styles.errorContainer}>
                                    <Ionicons
                                        name="alert-circle-outline"
                                        size={32}
                                        color={Colors.grey}
                                    />
                                    <Text style={styles.errorText}>
                                        Failed to load history
                                    </Text>
                                </View>
                            )
                            : billingHistory.length === 0
                            ? (
                                <View style={styles.emptyHistory}>
                                    <Ionicons
                                        name="receipt-outline"
                                        size={32}
                                        color={Colors.grey}
                                    />
                                    <Text style={styles.emptyHistoryText}>
                                        No billing history yet
                                    </Text>
                                </View>
                            )
                            : (
                                billingHistory.slice(0, 3).map(
                                    renderTransaction,
                                )
                            )}
                    </View>
                </View>

                {/* Bottom padding for better scrolling */}
                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Custom Alert Component */}
            <AlertComponent />

            {/* Payment Confirmation Sheet */}
            {selectedPlanDetails && (
                <PaymentConfirmationSheet
                    visible={isPaymentSheetVisible}
                    onClose={() => setIsPaymentSheetVisible(false)}
                    planName={selectedPlanDetails.name}
                    price={billingCycle === "monthly"
                        ? selectedPlanDetails.price
                        : selectedPlanDetails.annualPrice}
                    billingCycle={billingCycle}
                    onProceed={handleProceedToPayment}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.white,
        borderBottomWidth: 0.2,
        borderBottomColor: Colors.lightgrey,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.black,
    },
    helpButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.black,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: Colors.grey,
        marginBottom: 16,
    },
    billingToggleContainer: {
        marginBottom: 20,
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    toggleLabelContainer: {
        flex: 1,
        alignItems: "center",
    },
    billingToggleLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.black,
        marginBottom: 2,
    },
    billingToggleSubLabel: {
        fontSize: 12,
        color: Colors.grey,
    },
    simpleToggle: {
        width: 52,
        height: 28,
        backgroundColor: Colors.lightgrey,
        borderRadius: 14,
        padding: 2,
        marginHorizontal: 16,
        justifyContent: "center",
    },
    simpleToggleActive: {
        backgroundColor: Colors.primary,
    },
    toggleThumb: {
        width: 24,
        height: 24,
        backgroundColor: Colors.white,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleThumbActive: {
        transform: [{ translateX: 24 }],
    },
    loadingContainer: {
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 10,
        color: Colors.grey,
        fontSize: 14,
    },
    emptyState: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.black,
        marginTop: 12,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: Colors.grey,
        marginTop: 4,
    },
    plansContainer: {
        gap: 16,
        width: "100%",
    },
    errorContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.black,
        marginTop: 12,
    },
    errorSubtext: {
        fontSize: 14,
        color: Colors.grey,
        marginTop: 4,
    },
    billingHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: "600",
    },
    transactionsContainer: {
        gap: 12,
    },
    transactionCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    transactionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionDescription: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.black,
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 12,
        color: Colors.grey,
    },
    transactionAmount: {
        alignItems: "flex-end",
    },
    amountText: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.black,
        marginBottom: 4,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "500",
        textTransform: "capitalize",
    },
    downloadButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.lightgrey + "40",
    },
    downloadText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: "500",
    },
    emptyHistory: {
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: Colors.white,
        borderRadius: 12,
    },
    emptyHistoryText: {
        marginTop: 8,
        color: Colors.grey,
        fontSize: 14,
    },
    bottomPadding: {
        height: 40,
    },
});

export default PlansBilling;
