import React from 'react';
import { View } from 'tamagui';
import Paralax from '~/components/Home';
const Home: React.FC = () => {
  return (
    <View
      flex={1}
      bg="white"
      width="100%"
      paddingHorizontal={30}
      paddingTop={40}
      paddingBottom={85}
      justifyContent="center"
      alignItems="center">
      <Paralax />
    </View>
  );
};

export default Home;
