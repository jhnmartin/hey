import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startApple } = useOAuth({ strategy: "oauth_apple" });
  const getOrCreate = useMutation(api.profiles.getOrCreate);
  const router = useRouter();

  const [name, setName] = useState("");
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

  const onSignUp = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const [firstName, ...rest] = name.split(" ");
      await signUp.create({
        firstName: firstName ?? "",
        lastName: rest.join(" "),
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      router.push("/(auth)/verify");
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, name, email, password]);

  const onOAuth = useCallback(
    async (startFlow: typeof startGoogle) => {
      setError("");
      try {
        const { createdSessionId, setActive: setOAuthActive } =
          await startFlow();
        if (createdSessionId && setOAuthActive) {
          await setOAuthActive({ session: createdSessionId });
          await getOrCreate({ role: "organizer" });
        }
      } catch (err: any) {
        setError(err.errors?.[0]?.longMessage ?? "OAuth failed");
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
        Create your account
      </Text>
      <Text style={{ color: "#a1a1aa", marginBottom: 32 }}>
        Join hey thursday to manage events and grow your audience.
      </Text>

      {error ? (
        <Text style={{ color: "#ef4444", marginBottom: 16 }}>{error}</Text>
      ) : null}

      <Text style={{ fontWeight: "500", marginBottom: 4, color: "#d4d4d8" }}>
        Name
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
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
        onPress={onSignUp}
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
          <Text style={{ color: "#000", fontWeight: "600" }}>Sign Up</Text>
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

      {Platform.OS === "ios" && (
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
      )}

      <Pressable onPress={() => router.push("/(auth)/sign-in")}>
        <Text style={{ textAlign: "center", color: "#a1a1aa" }}>
          Already have an account?{" "}
          <Text style={{ color: "#fff", textDecorationLine: "underline" }}>
            Log in
          </Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}
