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
  const [mfaCode, setMfaCode] = useState("");
  const [needsMfa, setNeedsMfa] = useState(false);
  const [mfaStrategy, setMfaStrategy] = useState<"totp" | "phone_code" | "email_code">("totp");
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
      } else if (result.status === "needs_first_factor") {
        const firstResult = await signIn.attemptFirstFactor({
          strategy: "password",
          password,
        });
        if (firstResult.status === "complete") {
          await setActive({ session: firstResult.createdSessionId });
        } else if (firstResult.status === "needs_second_factor") {
          const factors = firstResult.supportedSecondFactors ?? [];
          const hasEmail = factors.some((f: any) => f.strategy === "email_code");
          const hasPhone = factors.some((f: any) => f.strategy === "phone_code");
          const strategy = hasEmail ? "email_code" : hasPhone ? "phone_code" : "totp";
          setMfaStrategy(strategy);
          if (strategy === "email_code" || strategy === "phone_code") {
            await signIn.prepareSecondFactor({ strategy });
          }
          setNeedsMfa(true);
        } else {
          setError(`Unexpected status: ${firstResult.status}`);
        }
      } else if (result.status === "needs_second_factor") {
        const factors = result.supportedSecondFactors ?? [];
        const hasEmail = factors.some((f: any) => f.strategy === "email_code");
        const hasPhone = factors.some((f: any) => f.strategy === "phone_code");
        const strategy = hasEmail ? "email_code" : hasPhone ? "phone_code" : "totp";
        setMfaStrategy(strategy);
        if (strategy === "email_code" || strategy === "phone_code") {
          await signIn.prepareSecondFactor({ strategy });
        }
        setNeedsMfa(true);
      } else {
        setError(`Unexpected status: ${result.status}`);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? err.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password]);

  const onMfaVerify = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.attemptSecondFactor({
        strategy: mfaStrategy,
        code: mfaCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      } else {
        setError(`Unexpected status: ${result.status}`);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? err.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, mfaCode]);

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

  if (needsMfa) {
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
        style={{ backgroundColor: "#fff1ee" }}
      >
        <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
          Two-factor authentication
        </Text>
        <Text style={{ color: "#6b7280", marginBottom: 32 }}>
          {mfaStrategy === "email_code"
            ? "Enter the code sent to your email."
            : mfaStrategy === "phone_code"
              ? "Enter the code sent to your phone."
              : "Enter the code from your authenticator app."}
        </Text>

        {error ? (
          <Text style={{ color: "#ef4444", marginBottom: 16 }}>{error}</Text>
        ) : null}

        <Text style={{ fontWeight: "500", marginBottom: 4 }}>Code</Text>
        <TextInput
          value={mfaCode}
          onChangeText={setMfaCode}
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
          onPress={onMfaVerify}
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
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
      }}
      style={{ backgroundColor: "#fff1ee" }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
        Log in to hey thursday
      </Text>
      <Text style={{ color: "#6b7280", marginBottom: 32 }}>
        Welcome back. Sign in to access your events and tickets.
      </Text>

      {error ? (
        <Text style={{ color: "#ef4444", marginBottom: 16 }}>{error}</Text>
      ) : null}

      <Text style={{ fontWeight: "500", marginBottom: 4 }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}
      />

      <Text style={{ fontWeight: "500", marginBottom: 4 }}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 8,
          padding: 12,
          marginBottom: 24,
        }}
      />

      <Pressable
        onPress={onSignIn}
        disabled={loading}
        style={{
          backgroundColor: "#000",
          borderRadius: 8,
          padding: 14,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "600" }}>Log In</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => onOAuth(startGoogle)}
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 8,
          padding: 14,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: "500" }}>Continue with Google</Text>
      </Pressable>

      {Platform.OS === "ios" && (
        <Pressable
          onPress={() => onOAuth(startApple)}
          style={{
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 8,
            padding: 14,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text style={{ fontWeight: "500" }}>Continue with Apple</Text>
        </Pressable>
      )}

      <Pressable onPress={() => router.push("/(auth)/sign-up")}>
        <Text style={{ textAlign: "center", color: "#6b7280" }}>
          Don't have an account?{" "}
          <Text style={{ color: "#000", textDecorationLine: "underline" }}>
            Sign up
          </Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}
