import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";
import { colors } from "../../constants/theme";

type Ticket = {
    id: number;
    customer_id: number;
    customer_name: string;

    requested_employee_id: number | null;
    requested_employee_name: string | null;

    accepted_employee_id: number | null;
    accepted_employee_name: string | null;
    accepted_at: string | null;

    rejected_employee_id: number | null;
    rejected_employee_name: string | null;


    reject_reason: string | null;

    message: string;
    status: string;
    created_at: string;
};

export default function TicketsPage() {
    const [refreshing, setRefreshing] = useState(false);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch(`${API_URL}/tickets`);
            const data = await res.json();
            setTickets(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    };
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTickets();
        setRefreshing(false);
    };
    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator color="#2D8CFF" />
            </View>
        );
    }

    return (

        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#2D8CFF"]}
                />
            }

        >
            <Text style={styles.title} >🎫 Support Tickets</Text>

            {tickets.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                        No support tickets found
                    </Text>
                </View>
            ) : (
                tickets.map((t) => (
                    <View key={t.id} style={styles.card}>
                        <View style={styles.headerRow}>
                            <Text style={styles.ticketId}>
                                Ticket #{t.id}
                            </Text>

                            <View
                                style={[
                                    styles.statusBadge,
                                    t.status === "OPEN" &&
                                    styles.openBadge,
                                    t.status === "ACCEPTED" &&
                                    styles.acceptedBadge,
                                    t.status === "REJECTED" &&
                                    styles.rejectedBadge,
                                    t.status === "CANCELLED" &&
                                    styles.cancelledBadge,
                                    t.status === "CLOSED" &&
                                    styles.closedBadge,
                                ]}
                            >
                                <Text style={styles.statusText}>
                                    {t.status}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>
                                👤 Customer
                            </Text>

                            <Text style={styles.value}>
                                {t.customer_name}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>
                                🙋 Requested Employee
                            </Text>

                            <Text style={styles.value}>
                                {t.requested_employee_name ||
                                    "-"}
                            </Text>
                        </View>

                        {t.accepted_employee_name && (
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>
                                    ✅ Accepted By
                                </Text>

                                <Text style={styles.successText}>
                                    {t.accepted_employee_name}
                                </Text>
                            </View>
                        )}

                        {t.rejected_employee_name && (
                            <>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>
                                        ❌ Rejected By
                                    </Text>

                                    <Text style={styles.rejectText}>
                                        {t.rejected_employee_name}
                                    </Text>
                                </View>

                                <View style={styles.reasonBox}>
                                    <Text style={styles.reasonTitle}>
                                        Reject Reason
                                    </Text>

                                    <Text style={styles.reasonText}>
                                        {t.reject_reason}
                                    </Text>
                                </View>
                            </>
                        )}

                        <View style={styles.messageBox}>
                            <Text style={styles.messageTitle}>
                                Message
                            </Text>

                            <Text style={styles.messageText}>
                                {t.message}
                            </Text>
                        </View>

                        <Text style={styles.date}>
                            🕒{" "}
                            {new Date(
                                t.created_at
                            ).toLocaleString()}
                        </Text>
                    </View>
                ))
            )}
        </ScrollView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },

    title: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "900",
        margin: 20,
    },

    emptyCard: {
        backgroundColor: "#101E2D",
        margin: 20,
        padding: 30,
        borderRadius: 18,
        alignItems: "center",
    },

    emptyText: {
        color: "#90A4AE",
        fontSize: 16,
    },

    card: {
        backgroundColor: "#101E2D",
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 18,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#1E3348",
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    ticketId: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "900",
    },

    divider: {
        height: 1,
        backgroundColor: "#1E3348",
        marginVertical: 15,
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    openBadge: {
        backgroundColor: "#FF9800",
    },

    acceptedBadge: {
        backgroundColor: "#2E7D32",
    },

    rejectedBadge: {
        backgroundColor: "#D32F2F",
    },

    cancelledBadge: {
        backgroundColor: "#616161",
    },

    closedBadge: {
        backgroundColor: "#1565C0",
    },

    statusText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 12,
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    label: {
        color: "#90A4AE",
        fontWeight: "700",
        width: "45%",
    },

    value: {
        color: "#FFFFFF",
        fontWeight: "800",
        textAlign: "right",
        width: "55%",
    },

    successText: {
        color: "#4CAF50",
        fontWeight: "900",
        textAlign: "right",
        width: "55%",
    },

    rejectText: {
        color: "#EF5350",
        fontWeight: "900",
        textAlign: "right",
        width: "55%",
    },

    reasonBox: {
        marginTop: 12,
        backgroundColor: "#16293D",
        padding: 12,
        borderRadius: 12,
    },

    reasonTitle: {
        color: "#FF8A80",
        fontWeight: "800",
        marginBottom: 6,
    },

    reasonText: {
        color: "#FFFFFF",
        lineHeight: 20,
    },

    messageBox: {
        marginTop: 15,
        backgroundColor: "#16293D",
        padding: 14,
        borderRadius: 12,
    },

    messageTitle: {
        color: "#64B5F6",
        fontWeight: "900",
        marginBottom: 6,
    },

    messageText: {
        color: "#FFFFFF",
        lineHeight: 22,
    },

    date: {
        color: "#78909C",
        marginTop: 16,
        fontSize: 12,
        textAlign: "right",
    },
});