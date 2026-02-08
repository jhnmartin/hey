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
        await getOrCreate({ role: "attendee" });
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, code]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff1ee" }}>
        <Pressable
          onPress={() => router.back()}
          style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
        >
          <Text style={{ color: "#6b7280", fontSize: 16 }}>&larr; Back</Text>
        </Pressable>

        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
            Verify your email
          </Text>
          <Text style={{ color: "#6b7280", marginBottom: 32 }}>
            Enter the verification code sent to your email address.
          </Text>

          {error ? (
            <Text style={{ color: "#ef4444", marginBottom: 16 }}>{error}</Text>
          ) : null}

          <Text style={{ fontWeight: "500", marginBottom: 4 }}>Code</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              padding: 12,
              marginBottom: 24,
              textAlign: "center",
              fontSize: 24,
              letterSpacing: 8,
            }}
          />

          <Pressable
            onPress={onVerify}
            disabled={loading}
            style={{
              backgroundColor: "#000",
              borderRadius: 8,
              padding: 14,
              alignItems: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "600" }}>Verify</Text>
            )}
          </Pressable>
        </SafeAreaView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
