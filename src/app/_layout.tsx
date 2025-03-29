import { Stack } from 'expo-router';
import React from 'react';

// stack型ナビゲーション
const Layout = () : JSX.Element => {
  return (
    <Stack>
      {/* トップ画面（例: index.tsx）には戻るボタンを非表示 */}
      <Stack.Screen
        name="memo/deckScreen"
        options={{
          headerBackVisible: false, // 🔙戻るボタンを消す
          title: 'Home',
        }}
      />
    </Stack>
  );
};

export default Layout;