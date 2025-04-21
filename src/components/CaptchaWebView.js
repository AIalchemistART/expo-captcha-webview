import React from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator } from 'react-native';

export default function CaptchaWebView({ onToken, captchaUrl, style }) {
  // You must host your CAPTCHA HTML page and provide the URL via captchaUrl prop.
  // The HTML page should post the token using window.ReactNativeWebView.postMessage('captcha-token:' + token)
  if (!captchaUrl) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }
  return (
    <WebView
      originWhitelist={['*']}
      source={{ uri: captchaUrl }}
      style={style}
      javaScriptEnabled
      onMessage={event => {
        const { data } = event.nativeEvent;
        if (data && data.startsWith('captcha-token:')) {
          const token = data.replace('captcha-token:', '');
          onToken && onToken(token);
        }
      }}
    />
  );
}
