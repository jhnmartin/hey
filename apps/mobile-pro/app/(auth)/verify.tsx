import { useState, useCallback } from "react";
import {
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useRouter } from "expo-router";

export default function VerifyScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const getOrCreate = useMutation(api.profiles.getOrCreate);
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onVerify = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await getOrCreate({ role: "organizer" });
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, code]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#18181b" }}>
        <Pressable
          onPress={() => router.back()}
          style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
        >
          <Text style={{ color: "#a1a1aa", fontSize: 16 }}>&larr; Back</Text>
        </Pressable>

        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              marginBottom: 8,
              color: "#fff",
            }}
          >
            Verify your email
          </Text>
          <Text style={{ color: "#a1a1aa", marginBottom: 32 }}>
            Enter the verification code sent to your email address.
          </Text>

          {error ? (
            <Text style={{ color: "#ef4444", marginBottom: 16 }}>{error}</Text>
          ) : null}

          <Text style={{ fontWeight: "500", marginBottom: 4, color: "#d4d4d8" }}>
            Code
          </Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            placeholderTextColor="#71717a"
            style={{
              borderWidth: 1,
              borderColor: "#3f3f46",
              borderRadius: 8,
              padding: 12,
              marginBottom: 24,
              textAlign: "center",
              fontSize: 24,
              letterSpacing: 8,
              color: "#fff",
              backgroundColor: "#27272a",
            }}
          />

          <Pressable
            onPress={onVerify}
            disabled={loading}
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 14,
              alignItems: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={{ color: "#000", fontWeight: "600" }}>Verify</Text>
            )}
          </Pressable>
        </SafeAreaView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
