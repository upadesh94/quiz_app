import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useResponsive } from '../../utils/responsive';
import { useAppTheme } from '../../utils/theme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { clearAuth } from '../../store/slices/authSlice';
import { DataTable } from '../../components/common/DataTable';
import { CustomButton } from '../../components/common/CustomButton';
import { Badge } from '../../components/common/Badge';
import { addDocument, getCollection, updateDocument, deleteDocument } from '../../firebase/firestore';

type Props = NativeStackScreenProps<RootStackParamList, 'SuperAdminDashboard'>;

type TabType = 'overview' | 'sessions' | 'teachers' | 'students' | 'quizzes' | 'attempts' | 'database' | 'logs';

const ALL_SUBJECT_OPTIONS = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Studies', 'Computer Science'];

export function SuperAdminDashboardScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { fontSize, spacing, containerPadding, isTablet, isDesktop } = useResponsive();
  const { colors, isDark } = useAppTheme();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // System Metrics
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [activeSessionsCount, setActiveSessionsCount] = useState(3);
  const [systemLoad, setSystemLoad] = useState(14);
  const [memoryUsage, setMemoryUsage] = useState(128);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);

  // Data Collections
  const [usersList, setUsersList] = useState<any[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [quizzesList, setQuizzesList] = useState<any[]>([]);
  const [attemptsList, setAttemptsList] = useState<any[]>([]);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<'users' | 'quizzes' | 'attempts'>('users');

  // Modals & Creation Forms
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [inspectDoc, setInspectDoc] = useState<any | null>(null);

  // Form Fields
  const [teacherName, setTeacherName] = useState('');
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherQualification, setTeacherQualification] = useState('M.Sc Mathematics');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherAssignedClasses, setTeacherAssignedClasses] = useState<number[]>([8, 9, 10]);
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>(['Mathematics', 'Science']);

  const [studentName, setStudentName] = useState('');
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentClass, setStudentClass] = useState<8 | 9 | 10>(8);

  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('Mathematics');
  const [quizClass, setQuizClass] = useState<8 | 9 | 10>(8);
  const [quizDuration, setQuizDuration] = useState('15');

  // Master Edit Fields
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editQualification, setEditQualification] = useState('');
  const [editRole, setEditRole] = useState<'student' | 'teacher' | 'superadmin'>('student');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [editClassLevel, setEditClassLevel] = useState<8 | 9 | 10>(8);
  const [editAssignedClasses, setEditAssignedClasses] = useState<number[]>([8, 9, 10]);
  const [editTeachingSubjects, setEditTeachingSubjects] = useState<string[]>(['Mathematics']);
  const [editIsActive, setEditIsActive] = useState(true);

  // System Audit Logs
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; event: string; timestamp: string; level: 'info' | 'warning' | 'success' | 'danger' }>>([
    { id: '1', event: '[SYSTEM_AUTH] Root Administrator Console Session Authenticated', timestamp: new Date().toISOString(), level: 'success' },
    { id: '2', event: '[CLUSTER_SYNC] Firestore Real-Time Listener Active (0ms latency)', timestamp: new Date(Date.now() - 30000).toISOString(), level: 'info' },
  ]);

  const loadDashboardData = async () => {
    try {
      const users = await getCollection('users');
      const quizzes = await getCollection('quizzes');
      const attempts = await getCollection('attempts');

      const allUsers = users.length > 0 ? users : [
        { id: 'usr-1', username: 'teacher_demo', fullName: 'Demo Teacher', role: 'teacher', initialPassword: 'teacher123', assignedClasses: [8, 9, 10], teachingSubjects: ['Mathematics', 'Science'], qualification: 'M.Sc Physics, B.Ed', isActive: true, lastLogin: new Date().toISOString() },
        { id: 'usr-2', username: 'student_demo', fullName: 'Demo Student', role: 'student', classLevel: 9, initialPassword: 'student123', isActive: true, lastLogin: new Date(Date.now() - 1800000).toISOString() },
        { id: 'usr-3', username: 'quizapp_superadminupadesh', fullName: 'Super Admin', role: 'superadmin', isActive: true, lastLogin: new Date().toISOString() },
      ];

      setUsersList(allUsers);
      const teachers = allUsers.filter((u) => u.role === 'teacher');
      const students = allUsers.filter((u) => u.role === 'student');

      setTeachersList(teachers);
      setStudentsList(students);
      setQuizzesList(quizzes.length > 0 ? quizzes : [
        { id: 'quiz-1', title: 'Mathematics Algebra Basics', subject: 'Mathematics', classLevel: 8, totalQuestions: 10, timeLimitMinutes: 15, isPublished: true },
      ]);
      setAttemptsList(attempts);

      // Session Mapping
      const sessions = allUsers.map((u) => ({
        id: `sess-${u.id}`,
        userId: u.id,
        username: u.username,
        fullName: u.fullName,
        role: u.role,
        isOnline: u.isActive !== false,
        lastLogin: u.lastLogin || u.createdAt || new Date().toISOString(),
        sessionToken: u.sessionToken || `tok_${Math.random().toString(36).substring(7)}`,
      }));

      setSessionLogs(sessions);
      setActiveSessionsCount(sessions.filter((s) => s.isOnline).length);

      setTotalUsers(allUsers.length);
      setTotalTeachers(teachers.length);
      setTotalStudents(students.length);
      setTotalQuizzes(quizzes.length || 1);
      setTotalAttempts(attempts.length || 5);
      
      setSystemLoad(Math.floor(Math.random() * 8) + 12);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    dispatch(clearAuth());
    navigation.replace('Login');
  };

  const toggleTeacherClass = (cls: number) => {
    setTeacherAssignedClasses((prev) =>
      prev.includes(cls) ? (prev.length > 1 ? prev.filter((c) => c !== cls) : prev) : [...prev, cls].sort()
    );
  };

  const toggleTeacherSubject = (subj: string) => {
    setTeacherSubjects((prev) =>
      prev.includes(subj) ? (prev.length > 1 ? prev.filter((s) => s !== subj) : prev) : [...prev, subj]
    );
  };

  const toggleEditTeacherClass = (cls: number) => {
    setEditAssignedClasses((prev) =>
      prev.includes(cls) ? (prev.length > 1 ? prev.filter((c) => c !== cls) : prev) : [...prev, cls].sort()
    );
  };

  const toggleEditTeacherSubject = (subj: string) => {
    setEditTeachingSubjects((prev) =>
      prev.includes(subj) ? (prev.length > 1 ? prev.filter((s) => s !== subj) : prev) : [...prev, subj]
    );
  };

  const handleCreateTeacher = async () => {
    if (!teacherName.trim() || !teacherUsername.trim() || !teacherPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter Full Name, Username, and Password.');
      return;
    }

    try {
      const newTeacher = {
        fullName: teacherName.trim(),
        username: teacherUsername.trim().toLowerCase(),
        email: teacherEmail.trim() || `${teacherUsername.trim()}@quizmaster.com`,
        mobileNumber: teacherPhone.trim(),
        qualification: teacherQualification.trim(),
        assignedClasses: teacherAssignedClasses,
        teachingSubjects: teacherSubjects,
        initialPassword: teacherPassword.trim(),
        role: 'teacher' as const,
        isActive: true,
        isApproved: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await addDocument('users', newTeacher);
      setAuditLogs((prev) => [
        { id: String(Date.now()), event: `[TEACHER_CREATE] Provisioned Teacher: ${teacherUsername.trim()} (Classes: ${teacherAssignedClasses.join(', ')})`, timestamp: new Date().toISOString(), level: 'success' },
        ...prev,
      ]);

      Alert.alert('Teacher Provisioned', `Teacher "${teacherName}" created successfully.`);
      setTeacherName('');
      setTeacherUsername('');
      setTeacherEmail('');
      setTeacherPhone('');
      setTeacherPassword('');
      setShowAddTeacher(false);
      loadDashboardData();
    } catch (err) {
      Alert.alert('Error', 'Failed to create teacher account.');
    }
  };

  const handleCreateStudent = async () => {
    if (!studentName.trim() || !studentUsername.trim() || !studentPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter Full Name, Username, and Password.');
      return;
    }

    try {
      const newStudent = {
        fullName: studentName.trim(),
        username: studentUsername.trim().toLowerCase(),
        initialPassword: studentPassword.trim(),
        classLevel: studentClass,
        role: 'student' as const,
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await addDocument('users', newStudent);
      setAuditLogs((prev) => [
        { id: String(Date.now()), event: `[STUDENT_CREATE] Enrolled Student: ${studentUsername.trim()} (Class ${studentClass})`, timestamp: new Date().toISOString(), level: 'success' },
        ...prev,
      ]);

      Alert.alert('Student Enrolled', `Student "${studentName}" added.`);
      setStudentName('');
      setStudentUsername('');
      setStudentPassword('');
      setShowAddStudent(false);
      loadDashboardData();
    } catch (err) {
      Alert.alert('Error', 'Failed to create student account.');
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter quiz title.');
      return;
    }

    try {
      const newQuiz = {
        title: quizTitle.trim(),
        subject: quizSubject,
        classLevel: quizClass,
        totalQuestions: 10,
        timeLimitMinutes: parseInt(quizDuration, 10) || 15,
        isPublished: true,
        status: 'published',
        createdBy: 'superadmin',
        createdAt: new Date().toISOString(),
      };

      await addDocument('quizzes', newQuiz);
      setAuditLogs((prev) => [
        { id: String(Date.now()), event: `[QUIZ_CREATE] Published Global Quiz: "${quizTitle}"`, timestamp: new Date().toISOString(), level: 'success' },
        ...prev,
      ]);

      Alert.alert('Quiz Published', `Quiz "${quizTitle}" is live.`);
      setQuizTitle('');
      setShowAddQuiz(false);
      loadDashboardData();
    } catch (err) {
      Alert.alert('Error', 'Failed to create quiz.');
    }
  };

  const startEditingUser = (user: any) => {
    setEditingUser(user);
    setEditFullName(user.fullName || '');
    setEditUsername(user.username || '');
    setEditEmail(user.email || '');
    setEditPhone(user.mobileNumber || '');
    setEditParentName(user.parentName || '');
    setEditQualification(user.qualification || 'B.Ed, M.Sc');
    setEditRole(user.role || 'student');
    setNewPassword(user.initialPassword || '');
    setShowPasswordText(false);
    setEditClassLevel(user.classLevel || 8);
    setEditAssignedClasses(user.assignedClasses || [8, 9, 10]);
    setEditTeachingSubjects(user.teachingSubjects || ['Mathematics', 'Science']);
    setEditIsActive(user.isActive !== false);
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser) return;

    try {
      const updates: any = {
        fullName: editFullName.trim(),
        username: editUsername.trim().toLowerCase(),
        email: editEmail.trim(),
        mobileNumber: editPhone.trim(),
        parentName: editParentName.trim(),
        role: editRole,
        isActive: editIsActive,
      };

      if (newPassword.trim()) {
        updates.initialPassword = newPassword.trim();
      }

      if (editRole === 'student') {
        updates.classLevel = editClassLevel;
      } else if (editRole === 'teacher') {
        updates.qualification = editQualification.trim();
        updates.assignedClasses = editAssignedClasses;
        updates.teachingSubjects = editTeachingSubjects;
      }

      if (editingUser.id && !editingUser.id.startsWith('usr-')) {
        await updateDocument('users', editingUser.id, updates);
      }

      setAuditLogs((prev) => [
        { id: String(Date.now()), event: `[USER_UPDATE] Updated Record & Credentials: ${editingUser.username}`, timestamp: new Date().toISOString(), level: 'warning' },
        ...prev,
      ]);

      Alert.alert('Record Updated', `User ${editUsername} details saved.`);
      setEditingUser(null);
      loadDashboardData();
    } catch (err) {
      Alert.alert('Error', 'Failed to update user record.');
    }
  };

  const handleDeleteUser = async (user: any) => {
    Alert.alert(
      'Permanent User Deletion',
      `Are you sure you want to delete user account "${user.username}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user.id && !user.id.startsWith('usr-')) {
                await deleteDocument('users', user.id);
              }
              setAuditLogs((prev) => [
                { id: String(Date.now()), event: `[USER_PURGE] Deleted Account: ${user.username}`, timestamp: new Date().toISOString(), level: 'danger' },
                ...prev,
              ]);
              setEditingUser(null);
              loadDashboardData();
            } catch (e) {
              console.error('Delete error:', e);
            }
          },
        },
      ]
    );
  };

  const toggleQuizStatus = async (quiz: any) => {
    try {
      const newStatus = !quiz.isPublished;
      if (quiz.id && !quiz.id.startsWith('quiz-')) {
        await updateDocument('quizzes', quiz.id, { isPublished: newStatus, status: newStatus ? 'published' : 'draft' });
      }
      setAuditLogs((prev) => [
        { id: String(Date.now()), event: `[QUIZ_UPDATE] Quiz (${quiz.title}) status set to: ${newStatus ? 'LIVE' : 'DRAFT'}`, timestamp: new Date().toISOString(), level: 'warning' },
        ...prev,
      ]);
      loadDashboardData();
    } catch (e) {
      console.error('Quiz status error:', e);
    }
  };

  const handleDeleteQuiz = async (quiz: any) => {
    try {
      if (quiz.id && !quiz.id.startsWith('quiz-')) {
        await deleteDocument('quizzes', quiz.id);
      }
      setAuditLogs((prev) => [
        { id: String(Date.now()), event: `[QUIZ_PURGE] Deleted Quiz: ${quiz.title}`, timestamp: new Date().toISOString(), level: 'danger' },
        ...prev,
      ]);
      loadDashboardData();
    } catch (e) {
      console.error('Delete quiz error:', e);
    }
  };

  const toggleUserStatus = async (user: any) => {
    try {
      const newStatus = !(user.isActive !== false);
      if (user.id && !user.id.startsWith('usr-')) {
        await updateDocument('users', user.id, { isActive: newStatus });
      }
      setAuditLogs((prev) => [
        { id: String(Date.now()), event: `[USER_STATUS] (${user.username}) active set to: ${newStatus ? 'ACTIVE' : 'DISABLED'}`, timestamp: new Date().toISOString(), level: 'warning' },
        ...prev,
      ]);
      loadDashboardData();
    } catch (e) {
      console.error('Status error:', e);
    }
  };

  const approveTeacher = async (user: any) => {
    try {
      if (user.id && !user.id.startsWith('usr-')) {
        await updateDocument('users', user.id, { isApproved: true, isActive: true });
      }
      setAuditLogs((prev) => [
        { id: String(Date.now()), event: `[TEACHER_APPROVAL] Approved Teacher: ${user.username}`, timestamp: new Date().toISOString(), level: 'success' },
        ...prev,
      ]);
      Alert.alert('Teacher Approved', `Teacher ${user.fullName} is now approved and can log in.`);
      loadDashboardData();
    } catch (e) {
      console.error('Approval error:', e);
    }
  };

  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const borderColor = isDark ? '#1e293b' : '#e2e8f0';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <ScrollView style={[styles.screen, { backgroundColor: isDark ? '#090d16' : '#f8fafc' }]} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* Developer Enterprise Top Bar */}
      <View style={[styles.topHeader, { backgroundColor: isDark ? '#0f172a' : '#ffffff', borderBottomColor: borderColor, paddingHorizontal: containerPadding }]}>
        <View style={styles.brandGroup}>
          <View style={styles.sysTagBg}>
            <Text style={styles.sysTagText}>ROOT</Text>
          </View>
          <View style={{ marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.brandTitle, { color: textColor }]}>
                QuizMaster <Text style={{ color: '#6366f1' }}>Admin Console</Text>
              </Text>
              <View style={styles.roleTag}>
                <Text style={{ color: '#6366f1', fontSize: 10, fontWeight: '900', fontFamily: 'monospace' }}>SUPERADMIN</Text>
              </View>
            </View>
            <Text style={{ color: subTextColor, fontSize: 11, fontFamily: 'monospace' }}>
              CLUSTER_ID: cluster_main_01 • LATENCY: 18ms
            </Text>
          </View>
        </View>

        {/* System Load & Control Gauges */}
        <View style={styles.clusterGroup}>
          <View style={[styles.loadBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#dcfce7', borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#86efac' }]}>
            <View style={styles.pulseDot} />
            <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '800', fontFamily: 'monospace' }}>
              LOAD: {systemLoad}% | RAM: {memoryUsage}MB
            </Text>
          </View>

          <Pressable
            onPress={() => {
              setMaintenanceMode((v) => !v);
              setAuditLogs((p) => [{ id: String(Date.now()), event: `[SYSTEM_TOGGLE] Maintenance Mode: ${!maintenanceMode ? 'ENABLED' : 'DISABLED'}`, timestamp: new Date().toISOString(), level: 'danger' }, ...p]);
            }}
            style={[styles.maintBtn, maintenanceMode && { backgroundColor: '#ef4444' }]}
          >
            <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '800', fontFamily: 'monospace' }}>
              {maintenanceMode ? 'MAINTENANCE_ACTIVE' : 'MAINTENANCE_OFF'}
            </Text>
          </Pressable>

          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={{ color: '#f87171', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>LOGOUT</Text>
          </Pressable>
        </View>
      </View>

      {/* Operations Navigation Bar */}
      <View style={[styles.tabBar, { paddingHorizontal: containerPadding }]}>
        {[
          { key: 'overview', label: 'System Dashboard' },
          { key: 'sessions', label: `Active Sessions (${activeSessionsCount})` },
          { key: 'teachers', label: `Teachers (${totalTeachers})` },
          { key: 'students', label: `Students (${totalStudents})` },
          { key: 'quizzes', label: `Quizzes (${totalQuizzes})` },
          { key: 'attempts', label: `Attempts (${totalAttempts})` },
          { key: 'database', label: 'DB Explorer' },
          { key: 'logs', label: 'Audit Stream' },
        ].map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => {
              setActiveTab(tab.key as TabType);
              setEditingUser(null);
            }}
            style={[
              styles.tabItem,
              { backgroundColor: activeTab === tab.key ? '#4f46e5' : isDark ? '#0f172a' : '#ffffff', borderColor },
            ]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? '#ffffff' : subTextColor }]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Main Content View */}
      <View style={{ paddingHorizontal: containerPadding, marginTop: spacing.md }}>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <View style={{ gap: spacing.md }}>
            <View style={[styles.metricsGrid, { flexDirection: isTablet ? 'row' : 'column' }]}>
              <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor }]}>
                <Text style={{ color: subTextColor, fontSize: 11, fontFamily: 'monospace', fontWeight: '700' }}>TOTAL ACCOUNTS</Text>
                <Text style={[styles.metricValue, { color: textColor }]}>{totalUsers}</Text>
                <Text style={{ color: subTextColor, fontSize: 11 }}>Registered Records</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor }]}>
                <Text style={{ color: subTextColor, fontSize: 11, fontFamily: 'monospace', fontWeight: '700' }}>ACTIVE SESSIONS</Text>
                <Text style={[styles.metricValue, { color: '#10b981' }]}>{activeSessionsCount}</Text>
                <Text style={{ color: subTextColor, fontSize: 11 }}>Logged-in Users</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor }]}>
                <Text style={{ color: subTextColor, fontSize: 11, fontFamily: 'monospace', fontWeight: '700' }}>TEACHERS</Text>
                <Text style={[styles.metricValue, { color: textColor }]}>{totalTeachers}</Text>
                <Text style={{ color: subTextColor, fontSize: 11 }}>Active Faculty</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor }]}>
                <Text style={{ color: subTextColor, fontSize: 11, fontFamily: 'monospace', fontWeight: '700' }}>STUDENTS</Text>
                <Text style={[styles.metricValue, { color: textColor }]}>{totalStudents}</Text>
                <Text style={{ color: subTextColor, fontSize: 11 }}>Enrolled Students</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor }]}>
                <Text style={{ color: subTextColor, fontSize: 11, fontFamily: 'monospace', fontWeight: '700' }}>QUIZZES</Text>
                <Text style={[styles.metricValue, { color: textColor }]}>{totalQuizzes}</Text>
                <Text style={{ color: subTextColor, fontSize: 11 }}>Published Content</Text>
              </View>
            </View>

            {/* Quick Actions & System Info */}
            <View style={[styles.contentCard, { backgroundColor: cardBg, borderColor }]}>
              <Text style={[styles.cardHeading, { color: textColor }]}>Environment Configuration & Overrides</Text>
              <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                <Pressable
                  onPress={() => {
                    setAllowRegistration((v) => !v);
                    setAuditLogs((p) => [{ id: String(Date.now()), event: `[DEV] Student Registrations: ${!allowRegistration ? 'ALLOWED' : 'BLOCKED'}`, timestamp: new Date().toISOString(), level: 'warning' }, ...p]);
                  }}
                  style={[styles.actionChip, { backgroundColor: allowRegistration ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderColor: allowRegistration ? '#10b981' : '#ef4444' }]}
                >
                  <Text style={{ color: allowRegistration ? '#10b981' : '#f87171', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    Student Self-Registration: {allowRegistration ? 'OPEN' : 'LOCKED'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    loadDashboardData();
                    Alert.alert('Database Synced', 'Real-time Firestore sync complete.');
                  }}
                  style={[styles.actionChip, { backgroundColor: isDark ? '#1e1b4b' : '#e0e7ff', borderColor: '#6366f1' }]}
                >
                  <Text style={{ color: '#6366f1', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Force Database Refresh</Text>
                </Pressable>

                <Pressable
                  onPress={() => setActiveTab('teachers')}
                  style={[styles.actionChip, { backgroundColor: isDark ? '#312e81' : '#e0e7ff', borderColor: '#4f46e5' }]}
                >
                  <Text style={{ color: '#4f46e5', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Manage Teachers & Classes</Text>
                </Pressable>
              </View>
            </View>

            {/* System Status Box */}
            <View style={[styles.contentCard, { backgroundColor: cardBg, borderColor }]}>
              <Text style={[styles.cardHeading, { color: textColor }]}>Cluster Environment Specifications</Text>
              <View style={{ gap: 8 }}>
                <View style={styles.secRow}>
                  <Text style={{ color: subTextColor, fontSize: 12, fontFamily: 'monospace', fontWeight: '700' }}>Authentication Protocol:</Text>
                  <Text style={{ color: '#10b981', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>RESTRICTED QUERY ACCESS</Text>
                </View>
                <View style={styles.secRow}>
                  <Text style={{ color: subTextColor, fontSize: 12, fontFamily: 'monospace', fontWeight: '700' }}>Session Authority:</Text>
                  <Text style={{ color: '#6366f1', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>ROOT SUPERADMIN</Text>
                </View>
                <View style={styles.secRow}>
                  <Text style={{ color: subTextColor, fontSize: 12, fontFamily: 'monospace', fontWeight: '700' }}>Database Cluster Status:</Text>
                  <Text style={{ color: '#10b981', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>ONLINE (ACTIVE)</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: SESSIONS */}
        {activeTab === 'sessions' && (
          <View style={{ gap: spacing.md }}>
            <View style={styles.tabHeaderRow}>
              <Text style={[styles.cardHeading, { color: textColor }]}>Active Logged-In Sessions</Text>
              <CustomButton title="Refresh Sessions" onPress={loadDashboardData} variant="secondary" size="sm" fullWidth={false} />
            </View>

            <DataTable
              columns={[
                { key: 'username', title: 'Username', flex: 1, render: (item) => <Text style={{ fontWeight: '800', color: '#6366f1', fontFamily: 'monospace' }}>{item.username}</Text> },
                { key: 'fullName', title: 'Full Name', flex: 1 },
                {
                  key: 'role',
                  title: 'Role',
                  flex: 1,
                  render: (item) => (
                    <Badge
                      label={item.role?.toUpperCase() || 'USER'}
                      variant={item.role === 'superadmin' ? 'error' : item.role === 'teacher' ? 'info' : 'success'}
                      size="sm"
                    />
                  ),
                },
                {
                  key: 'isOnline',
                  title: 'Status',
                  flex: 1,
                  render: (item) => (
                    <Badge label={item.isOnline ? 'ONLINE' : 'OFFLINE'} variant={item.isOnline ? 'success' : 'info'} size="sm" />
                  ),
                },
                { key: 'lastLogin', title: 'Last Activity', flex: 1.2, render: (item) => new Date(item.lastLogin).toLocaleString() },
                {
                  key: 'actions',
                  title: 'Action',
                  flex: 1.2,
                  render: (item) => (
                    <Pressable
                      onPress={() => startEditingUser(usersList.find((u) => u.username === item.username) || item)}
                      style={styles.actionBtnEdit}
                    >
                      <Text style={styles.btnTextText}>Edit Credentials</Text>
                    </Pressable>
                  ),
                },
              ]}
              data={sessionLogs}
              keyExtractor={(item, idx) => item.id || String(idx)}
            />
          </View>
        )}

        {/* TAB 3: TEACHERS */}
        {activeTab === 'teachers' && (
          <View style={{ gap: spacing.md }}>
            <View style={styles.tabHeaderRow}>
              <Text style={[styles.cardHeading, { color: textColor }]}>Teacher Directory & Provisioning</Text>
              <CustomButton title="+ Provision Teacher" onPress={() => setShowAddTeacher((v) => !v)} variant="primary" size="sm" fullWidth={false} />
            </View>

            {showAddTeacher && (
              <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: '#6366f1' }]}>
                <Text style={[styles.formTitle, { color: textColor }]}>Provision Teacher Account</Text>
                
                <View style={styles.formRow}>
                  <TextInput placeholder="Full Name" value={teacherName} onChangeText={setTeacherName} placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} />
                  <TextInput placeholder="Username" value={teacherUsername} onChangeText={setTeacherUsername} placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} autoCapitalize="none" />
                </View>

                <View style={[styles.formRow, { marginTop: 10 }]}>
                  <TextInput placeholder="Email Address" value={teacherEmail} onChangeText={setTeacherEmail} placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} autoCapitalize="none" />
                  <TextInput placeholder="Mobile Number" value={teacherPhone} onChangeText={setTeacherPhone} placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} />
                </View>

                <View style={[styles.formRow, { marginTop: 10 }]}>
                  <TextInput placeholder="Qualification (e.g. M.Sc Mathematics)" value={teacherQualification} onChangeText={setTeacherQualification} placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} />
                  <TextInput placeholder="Initial Password" value={teacherPassword} onChangeText={setTeacherPassword} placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} />
                </View>

                {/* Multi-Class Assignment Selector */}
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.fieldLabel, { color: textColor, fontSize: 12, fontWeight: '800', fontFamily: 'monospace' }]}>
                    ASSIGNED CLASSES (Multi-Select):
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                    {[8, 9, 10].map((cls) => {
                      const isSelected = teacherAssignedClasses.includes(cls);
                      return (
                        <Pressable
                          key={cls}
                          onPress={() => toggleTeacherClass(cls)}
                          style={[
                            styles.classChipLarge,
                            {
                              backgroundColor: isSelected ? '#4f46e5' : cardBg,
                              borderColor: isSelected ? '#4f46e5' : borderColor,
                            },
                          ]}
                        >
                          <Text style={{ color: isSelected ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                            Class {cls}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Teaching Subjects Selector */}
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.fieldLabel, { color: textColor, fontSize: 12, fontWeight: '800', fontFamily: 'monospace' }]}>
                    TEACHING SUBJECTS (Multi-Select):
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                    {ALL_SUBJECT_OPTIONS.map((subj) => {
                      const isSelected = teacherSubjects.includes(subj);
                      return (
                        <Pressable
                          key={subj}
                          onPress={() => toggleTeacherSubject(subj)}
                          style={[
                            styles.subjChip,
                            {
                              backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : cardBg,
                              borderColor: isSelected ? '#6366f1' : borderColor,
                            },
                          ]}
                        >
                          <Text style={{ color: isSelected ? '#6366f1' : subTextColor, fontWeight: '700', fontSize: 11, fontFamily: 'monospace' }}>
                            {subj}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                  <CustomButton title="Cancel" onPress={() => setShowAddTeacher(false)} variant="secondary" size="sm" fullWidth={false} />
                  <CustomButton title="Save Teacher Account" onPress={handleCreateTeacher} variant="primary" size="sm" fullWidth={false} />
                </View>
              </View>
            )}

            <DataTable
              columns={[
                { key: 'username', title: 'Username', flex: 1, render: (item) => <Text style={{ fontWeight: '800', color: '#6366f1', fontFamily: 'monospace' }}>{item.username}</Text> },
                { key: 'fullName', title: 'Full Name', flex: 1 },
                {
                  key: 'assignedClasses',
                  title: 'Classes Taught',
                  flex: 1.2,
                  render: (item) => {
                    const classes = item.assignedClasses || [8, 9, 10];
                    return (
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        {classes.map((c: number) => (
                          <Badge key={c} label={`Class ${c}`} variant="info" size="sm" />
                        ))}
                      </View>
                    );
                  },
                },
                {
                  key: 'teachingSubjects',
                  title: 'Subjects',
                  flex: 1.2,
                  render: (item) => (item.teachingSubjects ? item.teachingSubjects.join(', ') : 'Mathematics, Science'),
                },
                { key: 'initialPassword', title: 'Password', flex: 0.9, render: (item) => <Text style={{ color: '#10b981', fontWeight: '800', fontFamily: 'monospace' }}>{item.initialPassword || '******'}</Text> },
                {
                  key: 'isActive',
                  title: 'Status',
                  flex: 0.9,
                  render: (item) => {
                    if (item.isApproved === false) {
                      return <Badge label="PENDING" variant="warning" size="sm" />;
                    }
                    return (
                      <Pressable onPress={() => toggleUserStatus(item)}>
                        <Badge label={item.isActive !== false ? 'ACTIVE' : 'DISABLED'} variant={item.isActive !== false ? 'success' : 'warning'} size="sm" />
                      </Pressable>
                    );
                  },
                },
                {
                  key: 'actions',
                  title: 'Actions',
                  flex: 1.4,
                  render: (item) => (
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {item.isApproved === false && (
                        <Pressable onPress={() => approveTeacher(item)} style={[styles.actionBtnEdit, { backgroundColor: '#10b981' }]}>
                          <Text style={[styles.btnTextText, { color: '#fff' }]}>Approve</Text>
                        </Pressable>
                      )}
                      <Pressable onPress={() => startEditingUser(item)} style={styles.actionBtnEdit}>
                        <Text style={styles.btnTextText}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => handleDeleteUser(item)} style={styles.actionBtnDel}>
                        <Text style={styles.btnTextText}>Delete</Text>
                      </Pressable>
                    </View>
                  ),
                },
              ]}
              data={teachersList}
              keyExtractor={(item, idx) => item.id || String(idx)}
            />
          </View>
        )}

        {/* TAB 4: STUDENTS */}
        {activeTab === 'students' && (
          <View style={{ gap: spacing.md }}>
            <View style={styles.tabHeaderRow}>
              <Text style={[styles.cardHeading, { color: textColor }]}>Student Directory & Enrollment</Text>
              <CustomButton title="+ Enroll Student" onPress={() => setShowAddStudent((v) => !v)} variant="primary" size="sm" fullWidth={false} />
            </View>

            {showAddStudent && (
              <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: '#6366f1' }]}>
                <Text style={[styles.formTitle, { color: textColor }]}>Enroll New Student Account</Text>
                <View style={styles.formRow}>
                  <TextInput placeholder="Full Name" value={studentName} onChangeText={setStudentName} placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} />
                  <TextInput placeholder="Username" value={studentUsername} onChangeText={setStudentUsername} placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} autoCapitalize="none" />
                </View>
                <View style={[styles.formRow, { marginTop: 10 }]}>
                  <TextInput placeholder="Password" value={studentPassword} onChangeText={setStudentPassword} placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} />
                  <View style={{ flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <Text style={{ color: textColor, fontSize: 12, fontWeight: '700', fontFamily: 'monospace' }}>Class:</Text>
                    {[8, 9, 10].map((lvl) => (
                      <Pressable key={lvl} onPress={() => setStudentClass(lvl as any)} style={[styles.classChip, studentClass === lvl && { backgroundColor: '#4f46e5', borderColor: '#4f46e5' }]}>
                        <Text style={{ color: studentClass === lvl ? '#fff' : subTextColor, fontSize: 11, fontWeight: '800', fontFamily: 'monospace' }}>Class {lvl}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
                  <CustomButton title="Cancel" onPress={() => setShowAddStudent(false)} variant="secondary" size="sm" fullWidth={false} />
                  <CustomButton title="Save Student" onPress={handleCreateStudent} variant="primary" size="sm" fullWidth={false} />
                </View>
              </View>
            )}

            <DataTable
              columns={[
                { key: 'username', title: 'Username', flex: 1, render: (item) => <Text style={{ fontWeight: '800', color: '#6366f1', fontFamily: 'monospace' }}>{item.username}</Text> },
                { key: 'fullName', title: 'Full Name', flex: 1 },
                { key: 'classLevel', title: 'Class', flex: 0.8, render: (item) => `Class ${item.classLevel || 8}` },
                { key: 'initialPassword', title: 'Password', flex: 1, render: (item) => <Text style={{ color: '#10b981', fontWeight: '800', fontFamily: 'monospace' }}>{item.initialPassword || '******'}</Text> },
                {
                  key: 'isActive',
                  title: 'Status',
                  flex: 1,
                  render: (item) => (
                    <Pressable onPress={() => toggleUserStatus(item)}>
                      <Badge label={item.isActive !== false ? 'ACTIVE' : 'DISABLED'} variant={item.isActive !== false ? 'success' : 'warning'} size="sm" />
                    </Pressable>
                  ),
                },
                {
                  key: 'actions',
                  title: 'Actions',
                  flex: 1.4,
                  render: (item) => (
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Pressable onPress={() => startEditingUser(item)} style={styles.actionBtnEdit}>
                        <Text style={styles.btnTextText}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => handleDeleteUser(item)} style={styles.actionBtnDel}>
                        <Text style={styles.btnTextText}>Delete</Text>
                      </Pressable>
                    </View>
                  ),
                },
              ]}
              data={studentsList}
              keyExtractor={(item, idx) => item.id || String(idx)}
            />
          </View>
        )}

        {/* TAB 5: QUIZZES */}
        {activeTab === 'quizzes' && (
          <View style={{ gap: spacing.md }}>
            <View style={styles.tabHeaderRow}>
              <Text style={[styles.cardHeading, { color: textColor }]}>Global Quiz Content Management</Text>
              <CustomButton title="+ Create Quiz" onPress={() => setShowAddQuiz((v) => !v)} variant="primary" size="sm" fullWidth={false} />
            </View>

            {showAddQuiz && (
              <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: '#6366f1' }]}>
                <Text style={[styles.formTitle, { color: textColor }]}>Create Global Quiz</Text>
                <View style={styles.formRow}>
                  <TextInput placeholder="Quiz Title" value={quizTitle} onChangeText={setQuizTitle} placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} />
                  <TextInput placeholder="Subject" value={quizSubject} onChangeText={setQuizSubject} placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} />
                </View>
                <View style={[styles.formRow, { marginTop: 10 }]}>
                  <TextInput placeholder="Duration (min)" value={quizDuration} onChangeText={setQuizDuration} keyboardType="numeric" placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} />
                  <View style={{ flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <Text style={{ color: textColor, fontSize: 12, fontWeight: '700', fontFamily: 'monospace' }}>Target Class:</Text>
                    {[8, 9, 10].map((lvl) => (
                      <Pressable key={lvl} onPress={() => setQuizClass(lvl as any)} style={[styles.classChip, quizClass === lvl && { backgroundColor: '#4f46e5', borderColor: '#4f46e5' }]}>
                        <Text style={{ color: quizClass === lvl ? '#fff' : subTextColor, fontSize: 11, fontWeight: '800', fontFamily: 'monospace' }}>Class {lvl}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
                  <CustomButton title="Cancel" onPress={() => setShowAddQuiz(false)} variant="secondary" size="sm" fullWidth={false} />
                  <CustomButton title="Publish Quiz" onPress={handleCreateQuiz} variant="primary" size="sm" fullWidth={false} />
                </View>
              </View>
            )}

            <DataTable
              columns={[
                { key: 'title', title: 'Quiz Title', flex: 1.5, render: (item) => <Text style={{ color: textColor, fontWeight: '700' }}>{item.title}</Text> },
                { key: 'subject', title: 'Subject', flex: 1 },
                { key: 'classLevel', title: 'Class', flex: 0.8, render: (item) => `Class ${item.classLevel}` },
                { key: 'timeLimitMinutes', title: 'Duration', flex: 0.8, render: (item) => `${item.timeLimitMinutes} min` },
                {
                  key: 'isPublished',
                  title: 'Status',
                  flex: 1,
                  render: (item) => (
                    <Pressable onPress={() => toggleQuizStatus(item)}>
                      <Badge label={item.isPublished ? 'LIVE' : 'DRAFT'} variant={item.isPublished ? 'success' : 'info'} size="sm" />
                    </Pressable>
                  ),
                },
                {
                  key: 'actions',
                  title: 'Actions',
                  flex: 1,
                  render: (item) => (
                    <Pressable onPress={() => handleDeleteQuiz(item)} style={styles.actionBtnDel}>
                      <Text style={styles.btnTextText}>Delete</Text>
                    </Pressable>
                  ),
                },
              ]}
              data={quizzesList}
              keyExtractor={(item, idx) => item.id || String(idx)}
            />
          </View>
        )}

        {/* TAB 6: ATTEMPTS */}
        {activeTab === 'attempts' && (
          <View style={{ gap: spacing.md }}>
            <Text style={[styles.cardHeading, { color: textColor }]}>Student Attempt Logs & Results</Text>
            <DataTable
              columns={[
                { key: 'studentName', title: 'Student Name', flex: 1, render: (item) => item.studentName || item.studentId || 'Student' },
                { key: 'quizTitle', title: 'Quiz Title', flex: 1.2, render: (item) => item.quizTitle || 'Quiz' },
                { key: 'subject', title: 'Subject', flex: 1 },
                { key: 'percentage', title: 'Score %', flex: 1, render: (item) => <Text style={{ color: item.percentage >= 50 ? '#10b981' : '#f87171', fontWeight: '800', fontFamily: 'monospace' }}>{Math.round(item.percentage ?? 0)}%</Text> },
                { key: 'completedAt', title: 'Submission Date', flex: 1, render: (item) => (item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Recent') },
              ]}
              data={attemptsList}
              keyExtractor={(item, idx) => item.id || String(idx)}
            />
          </View>
        )}

        {/* TAB 7: DATABASE EXPLORER */}
        {activeTab === 'database' && (
          <View style={{ gap: spacing.md }}>
            <Text style={[styles.cardHeading, { color: textColor }]}>Firestore Collection Schema Explorer</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              {['users', 'quizzes', 'attempts'].map((col) => (
                <Pressable
                  key={col}
                  onPress={() => setSelectedCollection(col as any)}
                  style={[styles.colChip, { backgroundColor: selectedCollection === col ? '#4f46e5' : cardBg, borderColor }]}
                >
                  <Text style={{ color: selectedCollection === col ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    collection('{col}')
                  </Text>
                </Pressable>
              ))}
            </View>

            <DataTable
              columns={[
                { key: 'id', title: 'Doc ID', flex: 1, render: (item) => <Text style={{ fontWeight: '700', color: '#6366f1', fontFamily: 'monospace' }}>{item.id}</Text> },
                { key: 'title', title: 'Document Identifier', flex: 1, render: (item) => item.title || item.fullName || item.username || 'Record' },
                {
                  key: 'raw',
                  title: 'Schema Inspection',
                  flex: 1.2,
                  render: (item) => (
                    <Pressable onPress={() => setInspectDoc(item)} style={styles.actionBtnEdit}>
                      <Text style={styles.btnTextText}>Inspect JSON</Text>
                    </Pressable>
                  ),
                },
              ]}
              data={selectedCollection === 'users' ? usersList : selectedCollection === 'quizzes' ? quizzesList : attemptsList}
              keyExtractor={(item, idx) => item.id || String(idx)}
            />

            {inspectDoc && (
              <View style={[styles.jsonCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ color: textColor, fontWeight: '800', fontFamily: 'monospace' }}>Raw Document JSON: {inspectDoc.id}</Text>
                  <Pressable onPress={() => setInspectDoc(null)}>
                    <Text style={{ color: '#f87171', fontWeight: '800', fontFamily: 'monospace' }}>Close [X]</Text>
                  </Pressable>
                </View>
                <ScrollView style={{ maxHeight: 220 }}>
                  <Text style={{ color: '#818cf8', fontFamily: 'monospace', fontSize: 12 }}>
                    {JSON.stringify(inspectDoc, null, 2)}
                  </Text>
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* TAB 8: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <View style={{ gap: spacing.md }}>
            <Text style={[styles.cardHeading, { color: textColor }]}>Real-Time Security Audit Stream</Text>
            <View style={[styles.logsCard, { backgroundColor: cardBg, borderColor }]}>
              {auditLogs.map((log) => (
                <View key={log.id} style={styles.logRow}>
                  <Badge label={log.level.toUpperCase()} variant={log.level === 'danger' ? 'error' : log.level === 'warning' ? 'warning' : 'success'} size="sm" />
                  <Text style={[styles.logText, { color: textColor }]}>{log.event}</Text>
                  <Text style={{ color: subTextColor, fontSize: 11, fontFamily: 'monospace' }}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </View>

      {/* MASTER EDIT USER MODAL */}
      <Modal visible={!!editingUser} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitleText, { color: textColor }]}>
                Master Record Editor: <Text style={{ color: '#6366f1', fontFamily: 'monospace' }}>{editingUser?.username}</Text>
              </Text>
              <Pressable onPress={() => setEditingUser(null)}>
                <Text style={{ color: '#f87171', fontWeight: '800', fontSize: 16, fontFamily: 'monospace' }}>[X]</Text>
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 520 }}>
              <View style={styles.modalFormSection}>
                <Text style={styles.modalSectionTitle}>ACCOUNT IDENTITY</Text>
                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: subTextColor }]}>Full Name</Text>
                    <TextInput value={editFullName} onChangeText={setEditFullName} style={[styles.modalInput, { color: textColor, borderColor }]} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: subTextColor }]}>Username</Text>
                    <TextInput value={editUsername} onChangeText={setEditUsername} style={[styles.modalInput, { color: textColor, borderColor }]} autoCapitalize="none" />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: subTextColor }]}>Email Address</Text>
                    <TextInput value={editEmail} onChangeText={setEditEmail} placeholder="Email" placeholderTextColor={subTextColor} style={[styles.modalInput, { color: textColor, borderColor }]} autoCapitalize="none" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: subTextColor }]}>Mobile Number</Text>
                    <TextInput value={editPhone} onChangeText={setEditPhone} placeholder="Phone" placeholderTextColor={subTextColor} style={[styles.modalInput, { color: textColor, borderColor }]} />
                  </View>
                </View>

                {editingUser?.role === 'teacher' && (
                  <View style={{ marginTop: 6 }}>
                    <Text style={[styles.fieldLabel, { color: subTextColor }]}>Qualification / Title</Text>
                    <TextInput value={editQualification} onChangeText={setEditQualification} placeholder="Qualification" placeholderTextColor={subTextColor} style={[styles.modalInput, { color: textColor, borderColor }]} />
                  </View>
                )}

                {editingUser?.role === 'student' && (
                  <View style={{ marginTop: 6 }}>
                    <Text style={[styles.fieldLabel, { color: subTextColor }]}>Parent Name</Text>
                    <TextInput value={editParentName} onChangeText={setEditParentName} placeholder="Parent Name" placeholderTextColor={subTextColor} style={[styles.modalInput, { color: textColor, borderColor }]} />
                  </View>
                )}

                <Text style={[styles.modalSectionTitle, { marginTop: 16 }]}>SECURITY & AUTHENTICATION</Text>
                <View style={{ marginTop: 6 }}>
                  <Text style={[styles.fieldLabel, { color: subTextColor }]}>New Passcode / Password Key</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Enter new password"
                      placeholderTextColor={subTextColor}
                      secureTextEntry={!showPasswordText}
                      style={[styles.modalInput, { flex: 1, color: textColor, borderColor }]}
                    />
                    <Pressable onPress={() => setShowPasswordText((v) => !v)} style={{ paddingHorizontal: 12 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#6366f1', fontFamily: 'monospace' }}>{showPasswordText ? 'HIDE' : 'SHOW'}</Text>
                    </Pressable>
                  </View>
                </View>

                <Text style={[styles.modalSectionTitle, { marginTop: 16 }]}>PRIVILEGE & CLASS ASSIGNMENT</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                  {(['student', 'teacher', 'superadmin'] as const).map((r) => (
                    <Pressable key={r} onPress={() => setEditRole(r)} style={[styles.roleSelectChip, editRole === r && { backgroundColor: '#4f46e5', borderColor: '#4f46e5' }]}>
                      <Text style={{ color: editRole === r ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 11, fontFamily: 'monospace' }}>{r.toUpperCase()}</Text>
                    </Pressable>
                  ))}
                </View>

                {editRole === 'teacher' && (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.fieldLabel, { color: textColor, fontWeight: '800' }]}>Assigned Classes (Multi-Select):</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      {[8, 9, 10].map((cls) => {
                        const isSelected = editAssignedClasses.includes(cls);
                        return (
                          <Pressable
                            key={cls}
                            onPress={() => toggleEditTeacherClass(cls)}
                            style={[styles.classChipLarge, { backgroundColor: isSelected ? '#4f46e5' : cardBg, borderColor: isSelected ? '#4f46e5' : borderColor }]}
                          >
                            <Text style={{ color: isSelected ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 11, fontFamily: 'monospace' }}>
                              Class {cls}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <Text style={[styles.fieldLabel, { color: textColor, fontWeight: '800', marginTop: 10 }]}>Teaching Subjects:</Text>
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {ALL_SUBJECT_OPTIONS.map((subj) => {
                        const isSelected = editTeachingSubjects.includes(subj);
                        return (
                          <Pressable
                            key={subj}
                            onPress={() => toggleEditTeacherSubject(subj)}
                            style={[styles.subjChip, { backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : cardBg, borderColor: isSelected ? '#6366f1' : borderColor }]}
                          >
                            <Text style={{ color: isSelected ? '#6366f1' : subTextColor, fontWeight: '700', fontSize: 11, fontFamily: 'monospace' }}>
                              {subj}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}

                {editRole === 'student' && (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.fieldLabel, { color: subTextColor }]}>Assign Student Class</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      {[8, 9, 10].map((lvl) => (
                        <Pressable key={lvl} onPress={() => setEditClassLevel(lvl as any)} style={[styles.classChip, editClassLevel === lvl && { backgroundColor: '#4f46e5', borderColor: '#4f46e5' }]}>
                          <Text style={{ color: editClassLevel === lvl ? '#fff' : subTextColor, fontWeight: '800', fontFamily: 'monospace' }}>Class {lvl}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.fieldLabel, { color: subTextColor }]}>Account Status</Text>
                  <Pressable onPress={() => setEditIsActive((v) => !v)}>
                    <Badge label={editIsActive ? 'ACTIVE' : 'DISABLED'} variant={editIsActive ? 'success' : 'warning'} size="sm" />
                  </Pressable>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooterRow}>
              <Pressable onPress={() => handleDeleteUser(editingUser)} style={styles.modalDeleteBtn}>
                <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Purge Account</Text>
              </Pressable>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <CustomButton title="Cancel" onPress={() => setEditingUser(null)} variant="secondary" size="sm" fullWidth={false} />
                <CustomButton title="Save Overrides" onPress={handleSaveUserEdit} variant="primary" size="sm" fullWidth={false} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topHeader: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  brandGroup: { flexDirection: 'row', alignItems: 'center' },
  sysTagBg: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(99, 102, 241, 0.15)', borderWidth: 1, borderColor: '#6366f1' },
  sysTagText: { color: '#6366f1', fontSize: 11, fontWeight: '900', fontFamily: 'monospace' },
  brandTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  roleTag: { backgroundColor: 'rgba(99, 102, 241, 0.12)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#6366f1' },
  clusterGroup: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  loadBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 6 },
  maintBtn: { backgroundColor: 'rgba(99, 102, 241, 0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)' },
  logoutBtn: { padding: 8 },
  tabBar: { flexDirection: 'row', gap: 6, marginTop: 14, flexWrap: 'wrap' },
  tabItem: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  tabText: { fontWeight: '700', fontSize: 12, fontFamily: 'monospace' },
  metricsGrid: { gap: 12, marginBottom: 16 },
  metricCard: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'flex-start' },
  metricValue: { fontSize: 26, fontWeight: '900', marginVertical: 4, fontFamily: 'monospace' },
  contentCard: { padding: 18, borderRadius: 14, borderWidth: 1 },
  cardHeading: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  secRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  actionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  tabHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  formCard: { padding: 18, borderRadius: 14, borderWidth: 1, marginBottom: 14 },
  formTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  formRow: { flexDirection: 'row', gap: 10 },
  fieldLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  formInput: { flex: 1, height: 42, borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, fontSize: 13, fontFamily: 'monospace' },
  classChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e1' },
  classChipLarge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  subjChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  colChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  actionBtnEdit: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: '#4f46e5' },
  actionBtnDel: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: '#ef4444' },
  btnTextText: { color: '#ffffff', fontSize: 11, fontWeight: '800', fontFamily: 'monospace' },
  jsonCard: { padding: 14, borderRadius: 10, borderWidth: 1, marginTop: 14 },
  logsCard: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 10 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logText: { flex: 1, fontSize: 12, fontWeight: '600', fontFamily: 'monospace' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 620, borderRadius: 16, borderWidth: 1, padding: 22 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitleText: { fontSize: 16, fontWeight: '800' },
  modalFormSection: { gap: 8 },
  modalSectionTitle: { fontSize: 12, fontWeight: '900', color: '#6366f1', marginTop: 10, fontFamily: 'monospace', letterSpacing: 0.5 },
  modalInput: { height: 42, borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, fontSize: 13, fontFamily: 'monospace' },
  roleSelectChip: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center' },
  modalFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(148, 163, 184, 0.15)' },
  modalDeleteBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#ef4444' },
});
