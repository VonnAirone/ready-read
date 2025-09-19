// src/Auth/TeacherSignup.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function TeacherSignup({ navigation }: any) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

const handleSignup = async () => {
  const { name, email, password } = form;
  if (!name || !email || !password) {
    Alert.alert("Error", "Please fill in all fields.");
    return;
  }

  setLoading(true);
  try {
    // ✅ Create Firebase Auth user
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    // ✅ Save teacher account in Firestore
    await setDoc(doc(db, "teacherAccounts", userCred.user.uid), {
      uid: userCred.user.uid,
      name,
      email,
      role: "teacher",
      createdAt: new Date(),
    });

    Alert.alert("Success", "Teacher account created! Please log in.");

    // ✅ Force sign out so teacher must log in
    await auth.signOut();

    setForm({ name: "", email: "", password: "" });

    // ✅ Reset navigation to Login (no back button)
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  } catch (err: any) {
    Alert.alert("Signup Error", err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Signup</Text>

      <TextInput
        placeholder="Full Name"
        value={form.name}
        onChangeText={(text) => handleChange("name", text)}
        style={styles.input}
      />

      <TextInput
        placeholder="Email Address"
        value={form.email}
        onChangeText={(text) => handleChange("email", text)}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password (min. 6 chars)"
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.7 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginHighlight}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  btn: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    width: "100%",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  btnText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 16,
  },
  loginText: {
    color: "#fff",
    fontSize: 14,
  },
  loginHighlight: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
