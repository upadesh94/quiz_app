import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CustomCard } from '../../components/common/CustomCard';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { StudentPerformanceAnalytics, StudentRecord } from '../../types/models';
import { StudentService } from '../../services/teacher/StudentService';
import { ValidationUtils } from '../../services/utils/ValidationUtils';
import { useResponsive, getGridColumns } from '../../utils/responsive';
import { useAppSelector } from '../../hooks/useAppSelector';
import { StudentRegistrationRequest } from '../../types/models';
import { PerformanceService } from '../../services/analytics/PerformanceService';
import { useAppTheme, radii } from '../../utils/theme';

export function ManageStudentsScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const { fontSize, spacing, containerPadding, isTablet, screenWidth } = useResponsive();
  const { colors, isDark } = useAppTheme();
  const numColumns = getGridColumns(screenWidth, isTablet);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentMobileNumber, setParentMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [section, setSection] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('other');
  const [classLevel, setClassLevel] = useState('8');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [pendingRequests, setPendingRequests] = useState<StudentRegistrationRequest[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<'all' | '8' | '9' | '10'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [selectedStudentForAnalysis, setSelectedStudentForAnalysis] = useState<StudentRecord | null>(null);
  const [selectedStudentAnalytics, setSelectedStudentAnalytics] = useState<StudentPerformanceAnalytics | null>(null);

  const loadStudents = async () => {
    const [studentData, pendingData] = await Promise.all([
      StudentService.getStudentsByClass(),
      StudentService.getPendingRegistrationRequests(),
    ]);
    setStudents(studentData);
    setPendingRequests(pendingData);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = studentSearchQuery.trim().toLowerCase();

    return students
      .filter((student) => {
        if (classFilter !== 'all' && String(student.classLevel) !== classFilter) {
          return false;
        }

        if (statusFilter === 'active' && !student.isActive) {
          return false;
        }

        if (statusFilter === 'inactive' && student.isActive) {
          return false;
        }

        if (!query) {
          return true;
        }

        return (
          student.fullName.toLowerCase().includes(query) ||
          student.username.toLowerCase().includes(query) ||
          (student.rollNumber ?? '').toLowerCase().includes(query) ||
          (student.mobileNumber ?? '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [students, studentSearchQuery, classFilter, statusFilter]);

  const onAnalyzeStudent = async (student: StudentRecord) => {
    setError('');
    setIsAnalysisLoading(true);
    setSelectedStudentForAnalysis(student);

    try {
      const analytics = await PerformanceService.getStudentPerformance(student.id);
      setSelectedStudentAnalytics(analytics);
    } catch {
      setSelectedStudentAnalytics(null);
      setError('Unable to load student analytics right now.');
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const onSearchAndAnalyze = async () => {
    const query = studentSearchQuery.trim().toLowerCase();
    if (!query) {
      setError('Enter student name, username, roll number, or mobile to search.');
      return;
    }

    const match = filteredStudents[0];
    if (!match) {
      setError('No matching student found for analysis.');
      return;
    }

    await onAnalyzeStudent(match);
  };

  const resetForm = () => {
    setUsername('');
    setFullName('');
    setPassword('');
    setMobileNumber('');
    setParentName('');
    setParentMobileNumber('');
    setEmail('');
    setAddress('');
    setRollNumber('');
    setSection('');
    setAdmissionNumber('');
    setDateOfBirth('');
    setGender('other');
    setClassLevel('8');
    setEditingStudentId(null);
  };

  const onEditStudent = (student: StudentRecord) => {
    setError('');
    setMessage('');
    setEditingStudentId(student.id);
    setFullName(student.fullName || '');
    setUsername(student.username || '');
    setPassword('');
    setMobileNumber(student.mobileNumber || '');
    setParentName(student.parentName || '');
    setParentMobileNumber(student.parentMobileNumber || '');
    setEmail(student.email || '');
    setAddress(student.address || '');
    setRollNumber(student.rollNumber || '');
    setSection(student.section || '');
    setAdmissionNumber(student.admissionNumber || '');
    setDateOfBirth(student.dateOfBirth || '');
    setGender(student.gender || 'other');
    setClassLevel(String(student.classLevel));
  };

  const onDeleteStudent = (student: StudentRecord) => {
    Alert.alert('Delete Student', `Are you sure you want to delete ${student.fullName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await StudentService.deleteStudent(student.id);
          setMessage('Student deleted successfully.');
          if (editingStudentId === student.id) {
            resetForm();
          }
          await loadStudents();
        },
      },
    ]);
  };

  const onApproveRequest = async (requestId: string) => {
    setError('');
    setMessage('');
    try {
      await StudentService.approveRegistrationRequest(requestId, user?.id ?? 'teacher');
      setMessage('Registration request approved and student account created.');
      await loadStudents();
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : 'Unable to approve request.');
    }
  };

  const onRejectRequest = async (requestId: string) => {
    setError('');
    setMessage('');
    try {
      await StudentService.rejectRegistrationRequest(requestId, 'Teacher rejected details.');
      setMessage('Registration request rejected.');
      await loadStudents();
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : 'Unable to reject request.');
    }
  };

  const onSaveStudent = async () => {
    setError('');
    setMessage('');

    if (!ValidationUtils.isRequired(fullName) || !ValidationUtils.isRequired(username)) {
      setError('Student name and username are required.');
      return;
    }

    if (!editingStudentId && !ValidationUtils.isPasswordStrong(password)) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (editingStudentId && password.trim().length > 0 && !ValidationUtils.isPasswordStrong(password)) {
      setError('If provided, password must be at least 6 characters.');
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      setError('Mobile number should be exactly 10 digits.');
      return;
    }

    const classLevelNumber = Number(classLevel);
    if (![8, 9, 10].includes(classLevelNumber)) {
      setError('Class should be 8, 9, or 10.');
      return;
    }

    const payload = {
      username,
      fullName,
      classLevel: classLevelNumber as 8 | 9 | 10,
      initialPassword: password,
      mobileNumber,
      parentName,
      parentMobileNumber,
      email,
      address,
      rollNumber,
      section,
      admissionNumber,
      dateOfBirth,
      gender: gender as 'male' | 'female' | 'other',
    };

    if (editingStudentId) {
      await StudentService.updateStudent(editingStudentId, {
        ...payload,
        initialPassword: password.trim().length > 0 ? password : undefined,
      });
      setMessage('Student information updated successfully.');
    } else {
      await StudentService.addStudent(payload);
      setMessage('Student added successfully.');
    }

    resetForm();
    await loadStudents();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#160629' : colors.background, paddingHorizontal: containerPadding }]}>
      <View
        style={{
          maxWidth: isTablet ? 800 : '100%',
          alignSelf: 'center',
          width: '100%',
          paddingVertical: spacing.lg,
        }}
      >
        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '700',
            marginBottom: spacing.lg,
            color: isDark ? '#FFFFFF' : colors.textPrimary,
          }}
        >
          👥 Manage Students
        </Text>

        <CustomCard>
          <Text style={{ fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md, color: isDark ? '#FFFFFF' : colors.textPrimary }}>
            Search and Filter Students
          </Text>

          <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="Search"
                value={studentSearchQuery}
                onChangeText={setStudentSearchQuery}
                placeholder="Name, username, roll no, mobile"
              />
            </View>
            <View style={{ flex: isTablet ? 0.35 : 1, justifyContent: 'flex-end' }}>
              <CustomButton title="Search Analysis" onPress={onSearchAndAnalyze} />
            </View>
          </View>

          <Text style={{ color: isDark ? '#a78bfa' : colors.textPrimary, fontWeight: '700', marginBottom: spacing.xs }}>Class Filter</Text>
          <View style={styles.filterRow}>
            {['all', '8', '9', '10'].map((item) => (
              <Pressable
                key={item}
                onPress={() => setClassFilter(item as 'all' | '8' | '9' | '10')}
                style={[
                  styles.filterChip,
                  classFilter === item
                    ? (isDark ? styles.filterChipActiveDark : styles.filterChipActiveLight)
                    : (isDark ? styles.filterChipInactiveDark : styles.filterChipInactiveLight)
                ]}
              >
                <Text style={
                  classFilter === item
                    ? (isDark ? styles.filterChipTextActiveDark : styles.filterChipTextActiveLight)
                    : (isDark ? styles.filterChipTextInactiveDark : styles.filterChipTextInactiveLight)
                }>
                  {item === 'all' ? 'All' : `Class ${item}`}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ color: isDark ? '#a78bfa' : colors.textPrimary, fontWeight: '700', marginTop: spacing.sm, marginBottom: spacing.xs }}>Status Filter</Text>
          <View style={styles.filterRow}>
            {['all', 'active', 'inactive'].map((item) => (
              <Pressable
                key={item}
                onPress={() => setStatusFilter(item as 'all' | 'active' | 'inactive')}
                style={[
                  styles.filterChip,
                  statusFilter === item
                    ? (isDark ? styles.filterChipActiveDark : styles.filterChipActiveLight)
                    : (isDark ? styles.filterChipInactiveDark : styles.filterChipInactiveLight)
                ]}
              >
                <Text style={
                  statusFilter === item
                    ? (isDark ? styles.filterChipTextActiveDark : styles.filterChipTextActiveLight)
                    : (isDark ? styles.filterChipTextInactiveDark : styles.filterChipTextInactiveLight)
                }>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ color: isDark ? '#cbd5e1' : colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.sm }}>
            Showing {filteredStudents.length} of {students.length} students
          </Text>
        </CustomCard>

        {(selectedStudentForAnalysis || isAnalysisLoading) ? (
          <CustomCard>
            <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: isDark ? '#FFFFFF' : colors.textPrimary, marginBottom: spacing.md }}>
              Student Analysis Snapshot
            </Text>

            {isAnalysisLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <ActivityIndicator size="small" color={isDark ? '#a855f7' : colors.primary} />
                <Text style={{ color: isDark ? '#cbd5e1' : colors.textSecondary }}>Loading analysis...</Text>
              </View>
            ) : (
              <>
                <Text style={{ color: isDark ? '#FFFFFF' : colors.textPrimary, fontWeight: '700' }}>
                  {selectedStudentForAnalysis?.fullName} ({selectedStudentForAnalysis?.username})
                </Text>
                <Text style={{ color: isDark ? '#cbd5e1' : colors.textSecondary, marginTop: spacing.xs }}>
                  Avg Score: {selectedStudentAnalytics?.averageScore ?? 0}% | Attempts: {selectedStudentAnalytics?.attemptsCount ?? 0}
                </Text>
                <Text style={{ color: isDark ? '#cbd5e1' : colors.textSecondary, marginTop: spacing.xs }}>
                  Strongest: {selectedStudentAnalytics?.strongestSubject ?? '-'} | Weakest: {selectedStudentAnalytics?.weakestSubject ?? '-'}
                </Text>
                <Text
                  style={{
                    color: (selectedStudentAnalytics?.improvementDelta ?? 0) >= 0 ? colors.success : colors.error,
                    marginTop: spacing.xs,
                    fontWeight: '600',
                  }}
                >
                  Trend: {(selectedStudentAnalytics?.improvementDelta ?? 0) >= 0 ? '+' : ''}
                  {selectedStudentAnalytics?.improvementDelta ?? 0}%
                </Text>
              </>
            )}
          </CustomCard>
        ) : null}

        <CustomCard>
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: '700',
              marginBottom: spacing.md,
              color: isDark ? '#FFFFFF' : colors.textPrimary,
            }}
          >
            ✅ Pending Student Requests ({pendingRequests.length})
          </Text>
          {pendingRequests.length === 0 ? (
            <Text style={{ color: isDark ? '#cbd5e1' : '#475569', fontSize: fontSize.sm }}>No pending requests.</Text>
          ) : (
            pendingRequests.map((request) => (
              <View key={request.id} style={[styles.requestItem, isDark && { backgroundColor: 'rgba(15, 10, 44, 0.5)', borderColor: 'rgba(168, 85, 247, 0.3)' }]}>
                <Text style={{ fontWeight: '700', color: isDark ? '#FFFFFF' : '#0f172a' }}>{request.fullName}</Text>
                <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: fontSize.sm }}>Username: {request.username}</Text>
                <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: fontSize.sm }}>Class: {request.classLevel}</Text>
                <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: fontSize.sm }}>Mobile: {request.mobileNumber}</Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                  <Pressable
                    onPress={() => onApproveRequest(request.id)}
                    style={[styles.actionButton, styles.approveButton]}
                  >
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onRejectRequest(request.id)}
                    style={[styles.actionButton, styles.deleteButton]}
                  >
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </CustomCard>

        <CustomCard>
          <Text
            style={{
              fontSize: fontSize.lg,
              fontWeight: '700',
              marginBottom: spacing.md,
            }}
          >
            {editingStudentId ? '✏️ Edit Student Information' : '➕ Add New Student'}
          </Text>
          <CustomInput label="Student Full Name" value={fullName} onChangeText={setFullName} placeholder="Enter full name" />
          <CustomInput label="Username" value={username} onChangeText={setUsername} placeholder="Enter username" />
          <CustomInput
            label={editingStudentId ? 'Password (Optional, change only if needed)' : 'Password'}
            value={password}
            onChangeText={setPassword}
            placeholder={editingStudentId ? 'Leave blank to keep current password' : 'Enter password'}
            secureTextEntry
          />
          <CustomInput label="Mobile Number" value={mobileNumber} onChangeText={setMobileNumber} placeholder="10-digit number" />
          <CustomInput label="Parent/Guardian Name" value={parentName} onChangeText={setParentName} placeholder="Enter parent name" />
          <CustomInput label="Parent Mobile Number" value={parentMobileNumber} onChangeText={setParentMobileNumber} placeholder="Enter parent mobile" />
          <CustomInput label="Student Email" value={email} onChangeText={setEmail} placeholder="Optional email" />
          <CustomInput label="Roll Number" value={rollNumber} onChangeText={setRollNumber} placeholder="Optional roll no" />
          <CustomInput label="Section" value={section} onChangeText={setSection} placeholder="Optional section" />
          <CustomInput label="Admission Number" value={admissionNumber} onChangeText={setAdmissionNumber} placeholder="Optional admission no" />
          <CustomInput label="Date of Birth" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" type="date" />
          
          <Text style={{ color: isDark ? '#d8b4fe' : '#0f172a', fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs }}>
            Gender
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            {['male', 'female', 'other'].map((item) => (
              <Pressable
                key={item}
                onPress={() => setGender(item)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                  borderRadius: 14,
                  borderWidth: 1,
                  backgroundColor: gender === item 
                    ? (isDark ? 'rgba(168, 85, 247, 0.25)' : '#dbeafe')
                    : (isDark ? 'rgba(15, 10, 44, 0.88)' : '#ffffff'),
                  borderColor: gender === item
                    ? (isDark ? '#a855f7' : '#3b82f6')
                    : (isDark ? 'rgba(168, 85, 247, 0.4)' : '#93c5fd'),
                }}
              >
                <Text style={{
                  fontWeight: gender === item ? '700' : '500',
                  color: gender === item
                    ? (isDark ? '#f3e8ff' : '#1d4ed8')
                    : (isDark ? '#cbd5e1' : '#475569')
                }}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
          
          <CustomInput label="Address" value={address} onChangeText={setAddress} placeholder="Optional address" />
          <CustomInput label="Class" value={classLevel} onChangeText={setClassLevel} placeholder="8 / 9 / 10" />
          <CustomButton title={editingStudentId ? 'Update Student' : 'Add Student'} onPress={onSaveStudent} />
          {editingStudentId ? <CustomButton title="Cancel Edit" variant="secondary" onPress={resetForm} /> : null}
          {error ? (
            <Text
              style={{
                color: '#b91c1c',
                fontWeight: '600',
                marginTop: spacing.md,
                fontSize: fontSize.sm,
              }}
            >
              {error}
            </Text>
          ) : null}
          {message ? (
            <Text
              style={{
                color: '#166534',
                fontWeight: '600',
                marginTop: spacing.md,
                fontSize: fontSize.sm,
              }}
            >
              {message}
            </Text>
          ) : null}
        </CustomCard>

        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: '700',
            marginTop: spacing.xl,
            marginBottom: spacing.lg,
            color: colors.textPrimary,
          }}
        >
          Student List ({filteredStudents.length})
        </Text>
        <View
          style={{
            flexDirection: isTablet ? 'row' : 'column',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          {filteredStudents.map((student) => (
            <View
              key={student.id}
              style={isTablet ? { flex: 1 / numColumns, minWidth: '45%' } : { width: '100%' }}
            >
              <CustomCard>
                <Text
                  style={{
                    fontSize: fontSize.base,
                    fontWeight: '700',
                    marginBottom: spacing.sm,
                    color: isDark ? '#FFFFFF' : colors.textPrimary
                  }}
                >
                  {student.fullName}
                </Text>
                <Text style={{ fontSize: fontSize.sm, color: isDark ? '#cbd5e1' : '#334155', marginBottom: spacing.xs }}>
                  User: {student.username}
                </Text>
                <Text style={{ fontSize: fontSize.sm, color: isDark ? '#cbd5e1' : '#334155', marginBottom: spacing.xs }}>
                  Mobile: {student.mobileNumber || '-'}
                </Text>
                <Text style={{ fontSize: fontSize.sm, color: isDark ? '#cbd5e1' : '#334155', marginBottom: spacing.xs }}>
                  Class: {student.classLevel}
                </Text>
                <Text style={{ fontSize: fontSize.sm, color: isDark ? '#cbd5e1' : '#334155', marginBottom: spacing.xs }}>
                  Roll No: {student.rollNumber || '-'}
                </Text>
                <Text style={{ fontSize: fontSize.sm, color: isDark ? '#cbd5e1' : '#334155', marginBottom: spacing.xs }}>
                  Parent: {student.parentName || '-'}
                </Text>
                <Text style={{ fontSize: fontSize.sm, color: isDark ? '#cbd5e1' : '#334155' }}>
                  {student.isActive ? '✓ Active' : '✗ Inactive'}
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                  <Pressable
                    onPress={() => onEditStudent(student)}
                    style={[styles.actionButton, styles.editButton]}
                  >
                    <Text style={styles.actionButtonText}>Edit Info</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onAnalyzeStudent(student)}
                    style={[styles.actionButton, styles.analyzeButton]}
                  >
                    <Text style={styles.actionButtonText}>Analyze</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onDeleteStudent(student)}
                    style={[styles.actionButton, styles.deleteButton]}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </Pressable>
                </View>
              </CustomCard>
            </View>
          ))}
        </View>

        <CustomCard>
          <Text style={{ fontSize: fontSize.sm, color: isDark ? '#cbd5e1' : '#334155', lineHeight: fontSize.sm * 1.5 }}>
            📝 Note: Password is stored as initial profile data for onboarding. Production apps should create auth credentials using Firebase Admin/Cloud Functions and never store plain text passwords.
          </Text>
        </CustomCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActiveLight: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  filterChipInactiveLight: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  filterChipTextActiveLight: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  filterChipTextInactiveLight: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 12,
  },
  filterChipActiveDark: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    borderColor: '#a855f7',
  },
  filterChipInactiveDark: {
    backgroundColor: 'rgba(15, 10, 44, 0.5)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  filterChipTextActiveDark: {
    color: '#f3e8ff',
    fontWeight: '700',
    fontSize: 12,
  },
  filterChipTextInactiveDark: {
    color: '#c4b5fd',
    fontWeight: '600',
    fontSize: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: radii.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#1d4ed8',
  },
  analyzeButton: {
    backgroundColor: '#8b5cf6',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  approveButton: {
    backgroundColor: '#16a34a',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  requestItem: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
});
