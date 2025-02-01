import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { router, Slot, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { TamaguiProvider } from 'tamagui';
import store from '../redux/store';
import config from '../tamagui.config';
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function useNotificationObserver() {
  useEffect(() => {
   
    if (Platform.OS === 'web') return;

    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (url) {
        router.push(url);
      }
    }

    // Wrap trong try-catch để tránh lỗi trên web
    const setupNotifications = async () => {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        if (!isMounted || !response?.notification) {
          return;
        }
        redirect(response?.notification);

        const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
          redirect(response.notification);
        });

        return () => {
          subscription.remove();
        };
      } catch (error) {
        console.log('Notification setup error:', error);
      }
    };

    setupNotifications();

    return () => {
      isMounted = false;
    };
  }, []);
}

export default function Layout() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            console.log('Notification permissions not granted');
          }
        } catch (error) {
          console.log('Error requesting notification permissions:', error);
        }
      }
    }
    requestPermissions();
  }, []);

  useNotificationObserver();

  if (!loaded) return null;

  return (
    <TamaguiProvider config={config}>
      <ReduxProvider store={store}>
        <Slot />
      </ReduxProvider>
    </TamaguiProvider>
  );
}
