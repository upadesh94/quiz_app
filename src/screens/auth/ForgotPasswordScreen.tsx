import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomInput } from '../../components/common/CustomInput';
import { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Forgot Password</Text>
      <CustomInput value={username} onChangeText={setUsername} placeholder="Username" />
      <CustomButton title="Send Reset Link" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
});
