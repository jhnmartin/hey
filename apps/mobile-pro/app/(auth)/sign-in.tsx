import { useState, useCallback, useEffect } from "react";
import {
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startApple } = useOAuth({ strategy: "oauth_apple" });
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === "android") {
      WebBrowser.warmUpAsync();
      return () => {
        WebBrowser.coolDownAsync();
      };
    }
  }, []);

  const onSignIn = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // AuthGate in _layout.tsx handles redirect to (tabs)
      } else {
        setError(`Unexpected status: ${result.status}`);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? err.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password]);

  const onOAuth = useCallback(
    async (startFlow: typeof startGoogle) => {
      setError("");
      try {
        const { createdSessionId, setActive: setOAuthActive } =
          await startFlow();
        if (createdSessionId && setOAuthActive) {
          await setOAuthActive({ session: createdSessionId });
        }
      } catch (err: any) {
        setError(err.errors?.[0]?.longMessage ?? err.message ?? "OAuth failed");
      }
    },
    [],
  );

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
      }}
      style={{ backgroundColor: "#18181b" }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          marginBottom: 8,
          color: "#fff",
        }}
      >
        Log in to hey thursday
      </Text>
      <Text style={{ color: "#a1a1aa", marginBottom: 32 }}>
        Welcome back. Sign in to manage your events and organizations.
      </Text>

      {error ? (
        <Text style={{ color: "#ef4444", marginBottom: 16 }}>{error}</Text>
      ) : null}

      <Text style={{ fontWeight: "500", marginBottom: 4, color: "#d4d4d8" }}>
        Email
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#71717a"
        style={{
          borderWidth: 1,
          borderColor: "#3f3f46",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          color: "#fff",
          backgroundColor: "#27272a",
        }}
      />

      <Text style={{ fontWeight: "500", marginBottom: 4, color: "#d4d4d8" }}>
        Password
      </Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#71717a"
        style={{
          borderWidth: 1,
          borderColor: "#3f3f46",
          borderRadius: 8,
          padding: 12,
          marginBottom: 24,
          color: "#fff",
          backgroundColor: "#27272a",
        }}
      />

      <Pressable
        onPress={onSignIn}
        disabled={loading}
        style={{
          backgroundColor: "#fff",
          borderRadius: 8,
          padding: 14,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={{ color: "#000", fontWeight: "600" }}>Log In</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => onOAuth(startGoogle)}
        style={{
          borderWidth: 1,
          borderColor: "#3f3f46",
          borderRadius: 8,
          padding: 14,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: "500", color: "#d4d4d8" }}>
          Continue with Google
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onOAuth(startApple)}
        style={{
          borderWidth: 1,
          borderColor: "#3f3f46",
          borderRadius: 8,
          padding: 14,
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Text style={{ fontWeight: "500", color: "#d4d4d8" }}>
          Continue with Apple
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push("/(auth)/sign-up")}>
        <Text style={{ textAlign: "center", color: "#a1a1aa" }}>
          Don't have an account?{" "}
          <Text style={{ color: "#fff", textDecorationLine: "underline" }}>
            Sign up
          </Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}
