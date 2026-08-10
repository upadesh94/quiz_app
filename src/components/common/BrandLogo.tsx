import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

type BrandLogoProps = {
  size?: number;
};

export function BrandLogo({ size = 180 }: BrandLogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={require('../../images/image-removebg-preview (1).png')}
        style={[styles.image, { width: size, height: size, objectFit: 'contain' }]}
        accessibilityLabel="QuizMaster logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    alignSelf: 'center',
  },
});