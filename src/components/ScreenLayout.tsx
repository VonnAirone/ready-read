import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, View, ViewStyle } from "react-native";

interface ScreenLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export function ScreenLayout({ children, style, noPadding }: ScreenLayoutProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.content, !noPadding && styles.padding, style]}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: 20,
  },
});
