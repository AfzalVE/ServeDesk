import React, {
    useEffect,
    useState,
} from "react";

import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    StyleSheet,
    useColorScheme,
} from "react-native";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    Ionicons,
} from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRouter } from "expo-router";

import {
    darkTheme,
    lightTheme,
} from "../constants/theme";

export default function SettingsScreen() {
    const router = useRouter();

    const deviceTheme =
        useColorScheme();

    const [theme, setTheme] =
        useState("dark");

    const [language, setLanguage] =
        useState("en");

    const [ticketNotifications,
        setTicketNotifications] =
        useState(true);

    const [orderNotifications,
        setOrderNotifications] =
        useState(true);

    const [announcementNotifications,
        setAnnouncementNotifications] =
        useState(true);

    const [soundEnabled,
        setSoundEnabled] =
        useState(true);

    const [vibrationEnabled,
        setVibrationEnabled] =
        useState(true);

    const [user,
        setUser] =
        useState<any>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings =
        async () => {
            try {
                const userData =
                    await AsyncStorage.getItem(
                        "user"
                    );

                if (userData) {
                    setUser(
                        JSON.parse(userData)
                    );
                }

                const savedTheme =
                    await AsyncStorage.getItem(
                        "theme"
                    );

                const savedLanguage =
                    await AsyncStorage.getItem(
                        "language"
                    );

                if (savedTheme) {
                    setTheme(savedTheme);
                }

                if (savedLanguage) {
                    setLanguage(
                        savedLanguage
                    );
                }

                const ticketAlerts =
                    await AsyncStorage.getItem(
                        "ticketNotifications"
                    );

                const orderAlerts =
                    await AsyncStorage.getItem(
                        "orderNotifications"
                    );

                const announcementAlerts =
                    await AsyncStorage.getItem(
                        "announcementNotifications"
                    );

                const sound =
                    await AsyncStorage.getItem(
                        "soundEnabled"
                    );

                const vibration =
                    await AsyncStorage.getItem(
                        "vibrationEnabled"
                    );

                if (ticketAlerts !== null) {
                    setTicketNotifications(
                        JSON.parse(
                            ticketAlerts
                        )
                    );
                }

                if (orderAlerts !== null) {
                    setOrderNotifications(
                        JSON.parse(
                            orderAlerts
                        )
                    );
                }

                if (
                    announcementAlerts !==
                    null
                ) {
                    setAnnouncementNotifications(
                        JSON.parse(
                            announcementAlerts
                        )
                    );
                }

                if (sound !== null) {
                    setSoundEnabled(
                        JSON.parse(sound)
                    );
                }

                if (vibration !== null) {
                    setVibrationEnabled(
                        JSON.parse(
                            vibration
                        )
                    );
                }
            } catch (error) {
                console.log(error);
            }
        };

    const currentTheme =
        theme === "light"
            ? lightTheme
            : theme === "dark"
                ? darkTheme
                : deviceTheme === "light"
                    ? lightTheme
                    : darkTheme;

    const saveTheme =
        async (
            value: string
        ) => {
            setTheme(value);

            await AsyncStorage.setItem(
                "theme",
                value
            );
        };

    const saveLanguage =
        async (
            value: string
        ) => {
            setLanguage(value);

            await AsyncStorage.setItem(
                "language",
                value
            );
        };

    const saveToggle =
        async (
            key: string,
            value: boolean
        ) => {
            await AsyncStorage.setItem(
                key,
                JSON.stringify(value)
            );
        };

    const logout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress:
                        async () => {
                            await AsyncStorage.clear();

                            router.replace(
                                "/(auth)/sign-in"
                            );
                        },
                },
            ]
        );
    };
const SettingOption = ({
  title,
  selected,
  onPress,
}: any) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={styles.option}
  >
    <View style={styles.optionLeft}>
      <View style={styles.optionTextContainer}>
        <Text
          style={[
            styles.optionTitle,
            {
              color: currentTheme.text,
            },
          ]}
        >
          {title}
        </Text>
      </View>
    </View>

    {selected ? (
      <Ionicons
        name="checkmark-circle"
        size={22}
        color={currentTheme.primary}
      />
    ) : (
      <Ionicons
        name="chevron-forward"
        size={18}
        color={currentTheme.secondaryText}
      />
    )}
  </TouchableOpacity>
);

const SettingSwitch = ({
  title,
  value,
  onChange,
  disabled = false,
}: any) => (
  <View
    style={[
      styles.option,
      disabled && {
        opacity: 0.5,
      },
    ]}
  >

    <View style={styles.optionLeft}>

      <View style={styles.optionTextContainer}>

        <Text
          style={[
            styles.optionTitle,
            {
              color: currentTheme.text,
            },
          ]}
        >
          {title}
        </Text>

      </View>

    </View>


    <Switch
      value={value}
      disabled={disabled}
      onValueChange={onChange}

      trackColor={{
        false: "#767577",
        true: currentTheme.primary,
      }}

      thumbColor="#FFFFFF"
    />


  </View>
);
    return (
        <SafeAreaView
            style={[
                styles.container,
                {
                    backgroundColor:
                        currentTheme.background,
                },
            ]}
            edges={["top"]}
        >
            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.content
                }
            >
                {/* HEADER */}

                <View
                    style={styles.headerContainer}
                >
                    <TouchableOpacity
                        onPress={() =>
                            router.back()
                        }
                        style={[
                            styles.backButton,
                            {
                                backgroundColor:
                                    currentTheme.card,
                            },
                        ]}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={24}
                            color={
                                currentTheme.text
                            }
                        />
                    </TouchableOpacity>

                    <View
                        style={
                            styles.headerTextContainer
                        }
                    >
                        <Text
                            style={[
                                styles.headerTitle,
                                {
                                    color:
                                        currentTheme.text,
                                },
                            ]}
                        >
                            Settings
                        </Text>

                        <Text
                            style={[
                                styles.headerSubtitle,
                                {
                                    color:
                                        currentTheme.secondaryText,
                                },
                            ]}
                        >
                            Manage your preferences
                        </Text>
                    </View>
                </View>

                {/* PROFILE */}

                <View
                    style={[
                        styles.profileCard,
                        {
                            backgroundColor:
                                currentTheme.card,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.avatar,
                            {
                                backgroundColor:
                                    currentTheme.primary,
                            },
                        ]}
                    >
                        <Text
                            style={styles.avatarText}
                        >
                            {user?.full_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "U"}
                        </Text>
                    </View>

                    <View
                        style={styles.profileInfo}
                    >
                        <Text
                            style={[
                                styles.userName,
                                {
                                    color:
                                        currentTheme.text,
                                },
                            ]}
                        >
                            {user?.full_name ||
                                "User"}
                        </Text>

                        <Text
                            style={[
                                styles.userRole,
                                {
                                    color:
                                        currentTheme.secondaryText,
                                },
                            ]}
                        >
                            {user?.user_type}
                        </Text>
                    </View>
                </View>

                {/* APPEARANCE */}

                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color:
                                    currentTheme.primary,
                            },
                        ]}
                    >
                        Appearance
                    </Text>

                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor:
                                    currentTheme.card,
                            },
                        ]}
                    >
                        <SettingOption
                            title="Dark Theme"
                            selected={
                                theme === "dark"
                            }
                            onPress={() =>
                                saveTheme("dark")
                            }
                        />

                        <View
                            style={[
                                styles.divider,
                                {
                                    backgroundColor:
                                        currentTheme.border,
                                },
                            ]}
                        />

                        <SettingOption
                            title="Light Theme"
                            selected={
                                theme === "light"
                            }
                            onPress={() =>
                                saveTheme(
                                    "light"
                                )
                            }
                        />

                        <View
                            style={[
                                styles.divider,
                                {
                                    backgroundColor:
                                        currentTheme.border,
                                },
                            ]}
                        />

                        <SettingOption
                            title="System Theme"
                            selected={
                                theme ===
                                "system"
                            }
                            onPress={() =>
                                saveTheme(
                                    "system"
                                )
                            }
                        />
                    </View>
                </View>

                {/* LANGUAGE */}

                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color:
                                    currentTheme.primary,
                            },
                        ]}
                    >
                        Language
                    </Text>

                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor:
                                    currentTheme.card,
                            },
                        ]}
                    >
                        <SettingOption
                            title="English"
                            selected={
                                language === "en"
                            }
                            onPress={() =>
                                saveLanguage("en")
                            }
                        />

                        <View
                            style={[
                                styles.divider,
                                {
                                    backgroundColor:
                                        currentTheme.border,
                                },
                            ]}
                        />

                        <SettingOption
                            title="Hindi"
                            selected={
                                language === "hi"
                            }
                            onPress={() =>
                                saveLanguage("hi")
                            }
                        />

                        <View
                            style={[
                                styles.divider,
                                {
                                    backgroundColor:
                                        currentTheme.border,
                                },
                            ]}
                        />

                        <SettingOption
                            title="Bengali"
                            selected={
                                language === "bn"
                            }
                            onPress={() =>
                                saveLanguage("bn")
                            }
                        />
                    </View>
                </View>

                {/* NOTIFICATIONS */}

                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color:
                                    currentTheme.primary,
                            },
                        ]}
                    >
                        Notifications
                    </Text>

                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor:
                                    currentTheme.card,
                            },
                        ]}
                    >
                        <SettingSwitch
                            title="Ticket Alerts"
                            value={
                                ticketNotifications
                            }
                                  disabled={true}
                            onChange={async (
                                value: boolean
                            ) => {
                                setTicketNotifications(
                                    value
                                );

                                await saveToggle(
                                    "ticketNotifications",
                                    value
                                );
                            }}
                        />

                        <View
                            style={[
                                styles.divider,
                                {
                                    backgroundColor:
                                        currentTheme.border,
                                },
                            ]}
                        />

                        <SettingSwitch
                            title="Order Alerts"
                            value={
                                orderNotifications
                            }
                             disabled={true}
                            onChange={async (
                                value: boolean
                            ) => {
                                setOrderNotifications(
                                    value
                                );

                                await saveToggle(
                                    "orderNotifications",
                                    value
                                );
                            }}
                        />

                        <View
                            style={[
                                styles.divider,
                                {
                                    backgroundColor:
                                        currentTheme.border,
                                },
                            ]}
                        />

                        <SettingSwitch
                            title="Announcements"
                            value={
                                announcementNotifications
                            }
                             disabled={true}
                            onChange={async (
                                value: boolean
                            ) => {
                                setAnnouncementNotifications(
                                    value
                                );

                                await saveToggle(
                                    "announcementNotifications",
                                    value
                                );
                            }}
                        />

                        <View
                            style={[
                                styles.divider,
                                {
                                    backgroundColor:
                                        currentTheme.border,
                                },
                            ]}
                        />

                        <SettingSwitch
                            title="Sound"
                            value={
                                soundEnabled
                            }
                             disabled={true}
                            onChange={async (
                                value: boolean
                            ) => {
                                setSoundEnabled(
                                    value
                                );

                                await saveToggle(
                                    "soundEnabled",
                                    value
                                );
                            }}
                        />

                        <View
                            style={[
                                styles.divider,
                                {
                                    backgroundColor:
                                        currentTheme.border,
                                },
                            ]}
                        />

                        <SettingSwitch
                            title="Vibration"
                            value={
                                vibrationEnabled
                            }
                             disabled={true}
                            onChange={async (
                                value: boolean
                            ) => {
                                setVibrationEnabled(
                                    value
                                );

                                await saveToggle(
                                    "vibrationEnabled",
                                    value
                                );
                            }}
                        />
                    </View>
                </View>

                {/* ACCOUNT */}

                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color:
                                    currentTheme.primary,
                            },
                        ]}
                    >
                        Account
                    </Text>

                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor:
                                    currentTheme.card,
                            },
                        ]}
                    >
                        <SettingOption
                            title="My Profile"
                            onPress={() => { }}
                        />

                        <View
                            style={[
                                styles.divider,
                                {
                                    backgroundColor:
                                        currentTheme.border,
                                },
                            ]}
                        />

                        <SettingOption
                            title="Change Password"
                            onPress={() => { }}
                        />

                        <View
                            style={[
                                styles.divider,
                                {
                                    backgroundColor:
                                        currentTheme.border,
                                },
                            ]}
                        />

                        <SettingOption
                            title="Contact Administrator"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* ABOUT */}

                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color:
                                    currentTheme.primary,
                            },
                        ]}
                    >
                        About
                    </Text>

                    <View
                        style={[
                            styles.card,
                            styles.aboutContainer,
                            {
                                backgroundColor:
                                    currentTheme.card,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.versionText,
                                {
                                    color:
                                        currentTheme.text,
                                },
                            ]}
                        >
                            ServeDesk v1.0.0
                        </Text>

                        <Text
                            style={[
                                styles.aboutText,
                                {
                                    color:
                                        currentTheme.secondaryText,
                                },
                            ]}
                        >
                            Smart Office Service &
                            Assistance Platform
                        </Text>
                    </View>
                </View>

                {/* LOGOUT */}

                <TouchableOpacity
                    style={[
                        styles.logoutButton,
                        {
                            backgroundColor:
                                currentTheme.danger,
                        },
                    ]}
                    onPress={logout}
                >
                    <Text
                        style={styles.logoutText}
                    >
                        Logout
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 40,
    },

    // =========================
    // HEADER
    // =========================

    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    headerTextContainer: {
        flex: 1,
    },

    headerTitle: {
        fontSize: 28,
        fontWeight: "700",
    },

    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },

    // =========================
    // PROFILE CARD
    // =========================

    profileCard: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        padding: 18,
        marginBottom: 20,
    },

    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },

    avatarText: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "700",
    },

    profileInfo: {
        flex: 1,
    },

    userName: {
        fontSize: 18,
        fontWeight: "700",
    },

    userRole: {
        fontSize: 13,
        marginTop: 4,
        textTransform: "capitalize",
    },

    // =========================
    // SECTION
    // =========================

    section: {
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 10,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },

    // =========================
    // CARD
    // =========================

    card: {
        borderRadius: 18,
        overflow: "hidden",
    },

    // =========================
    // OPTION
    // =========================

    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 56,
        paddingHorizontal: 16,
    },

    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    optionTextContainer: {
        flex: 1,
    },

    optionTitle: {
        fontSize: 15,
        fontWeight: "500",
    },

    optionSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },

    divider: {
        height: 1,
        marginLeft: 16,
    },

    // =========================
    // ABOUT
    // =========================

    versionText: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
        paddingLeft:10
    },

    aboutText: {
        fontSize: 13,
        lineHeight: 20,
    },

    aboutContainer: {
        padding: 16,
    },

    // =========================
    // LOGOUT
    // =========================

    logoutButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },

    logoutText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
});