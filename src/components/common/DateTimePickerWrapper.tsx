import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CustomButton } from './CustomButton';

export function DateTimePickerWrapper({ value, onChange, label, isDark, colors }: any) {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (Platform.OS === 'android') {
        setShow(false);
        if (mode === 'date') {
          // After date is chosen, open time picker
          setMode('time');
          setShow(true);
          onChange(selectedDate);
        } else {
          // Time is chosen
          setMode('date');
          onChange(selectedDate);
        }
      } else {
        // iOS
        onChange(selectedDate);
      }
    } else {
      setShow(false);
      setMode('date');
    }
  };

  const showPicker = () => {
    setMode('date');
    setShow(true);
  };

  if (Platform.OS === 'web') {
    // Format value to YYYY-MM-DDTHH:MM for HTML5 datetime-local
    const isoStr = value ? new Date(value).toISOString().slice(0, 16) : '';
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: isDark ? '#a78bfa' : colors.primary }]}>{label}</Text>
        {React.createElement('input', {
          type: 'datetime-local',
          value: isoStr,
          onChange: (e: any) => {
            if (e.target.value) {
              onChange(new Date(e.target.value));
            }
          },
          style: {
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${isDark ? '#4c1d95' : '#93c5fd'}`,
            backgroundColor: isDark ? '#0f0a2c' : '#ffffff',
            color: isDark ? '#ffffff' : '#000000',
            fontFamily: 'inherit',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            width: '100%',
          },
        })}
      </View>
    );
  }

  // Native rendering
  const displayVal = value
    ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Select Date & Time';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isDark ? '#a78bfa' : colors.primary }]}>{label}</Text>
      <Pressable
        onPress={showPicker}
        style={[
          styles.button,
          {
            backgroundColor: isDark ? '#0f0a2c' : '#ffffff',
            borderColor: isDark ? '#4c1d95' : '#93c5fd',
          },
        ]}
      >
        <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>📅 {displayVal}</Text>
      </Pressable>

      {show && (
        Platform.OS === 'ios' ? (
          <Modal transparent visible={show} animationType="slide">
            <View style={styles.modalBg}>
              <View style={[styles.modalContent, { backgroundColor: isDark ? '#0f0a2c' : '#ffffff' }]}>
                <DateTimePicker
                  value={value || new Date()}
                  mode="datetime"
                  display="spinner"
                  onChange={onDateChange}
                  textColor={isDark ? '#ffffff' : '#000000'}
                />
                <View style={{ marginTop: 12 }}>
                  <CustomButton title="Done" onPress={() => setShow(false)} />
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={value || new Date()}
            mode={mode}
            display="default"
            onChange={onDateChange}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  button: { padding: 12, borderRadius: 10, borderWidth: 1 },
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }
});
