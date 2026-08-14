import React, { useEffect, useMemo, useState } from 'react';
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
import { PasswordResetService } from '../../services/auth/PasswordResetService';
import { PasswordResetRequest } from '../../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'SuperAdminDashboard'>;

type TabType = 'overview' | 'sessions' | 'teachers' | 'students' | 'quizzes' | 'attempts' | 'database' | 'logs';

const ALL_SUBJECT_OPTIONS = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Studies', 'Computer Science'];

export function SuperAdminDashboardScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { fontSize, spacing, containerPadding, isTablet, isDesktop } = useResponsive();
  const { colors, isDark } = useAppTheme();
  
  const cardWidth = isDesktop ? '23.8%' : isTablet ? '48.5%' : '100%';
  
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
  const [inspectDoc, setInspectDoc] = useState<any | null>(null);

  // View Modes & Filters for Admin Sections
  const [teacherViewMode, setTeacherViewMode] = useState<'cards' | 'table'>('cards');
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [studentViewMode, setStudentViewMode] = useState<'cards' | 'table'>('cards');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [sessionViewMode, setSessionViewMode] = useState<'cards' | 'table'>('cards');
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [quizViewMode, setQuizViewMode] = useState<'cards' | 'table'>('cards');
  const [quizSearchQuery, setQuizSearchQuery] = useState('');
  const [attemptViewMode, setAttemptViewMode] = useState<'cards' | 'table'>('cards');
  const [attemptSearchQuery, setAttemptSearchQuery] = useState('');
  const [dbViewMode, setDbViewMode] = useState<'cards' | 'table'>('cards');
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [isEditingJson, setIsEditingJson] = useState(false);
  const [editJsonText, setEditJsonText] = useState('');

  // Password Reset Notifications State
  const [pendingResetRequests, setPendingResetRequests] = useState<PasswordResetRequest[]>([]);
  const [resetModalState, setResetModalState] = useState<{
    visible: boolean;
    request: PasswordResetRequest | null;
    newPassword: string;
    confirmPassword: string;
  }>({
    visible: false,
    request: null,
    newPassword: '',
    confirmPassword: '',
  });

  // Confirmation Modal State
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const filteredTeachersList = useMemo(() => {
    const q = teacherSearchQuery.trim().toLowerCase();
    if (!q) return teachersList;
    return teachersList.filter(
      (item) =>
        (item.fullName || '').toLowerCase().includes(q) ||
        (item.username || '').toLowerCase().includes(q) ||
        (item.qualification || '').toLowerCase().includes(q) ||
        (item.email || '').toLowerCase().includes(q) ||
        (item.mobileNumber || '').toLowerCase().includes(q)
    );
  }, [teachersList, teacherSearchQuery]);

  const filteredStudentsList = useMemo(() => {
    const q = studentSearchQuery.trim().toLowerCase();
    if (!q) return studentsList;
    return studentsList.filter(
      (item) =>
        (item.fullName || '').toLowerCase().includes(q) ||
        (item.username || '').toLowerCase().includes(q) ||
        (item.rollNumber || '').toLowerCase().includes(q) ||
        (item.parentName || '').toLowerCase().includes(q) ||
        (item.mobileNumber || '').toLowerCase().includes(q)
    );
  }, [studentsList, studentSearchQuery]);

  const filteredSessionsList = useMemo(() => {
    const q = sessionSearchQuery.trim().toLowerCase();
    if (!q) return sessionLogs;
    return sessionLogs.filter(
      (item) =>
        (item.fullName || '').toLowerCase().includes(q) ||
        (item.username || '').toLowerCase().includes(q) ||
        (item.role || '').toLowerCase().includes(q)
    );
  }, [sessionLogs, sessionSearchQuery]);

  const filteredQuizzesList = useMemo(() => {
    const q = quizSearchQuery.trim().toLowerCase();
    if (!q) return quizzesList;
    return quizzesList.filter(
      (item) =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.subject || '').toLowerCase().includes(q) ||
        String(item.classLevel || '').includes(q)
    );
  }, [quizzesList, quizSearchQuery]);

  const filteredAttemptsList = useMemo(() => {
    const q = attemptSearchQuery.trim().toLowerCase();
    if (!q) return attemptsList;
    return attemptsList.filter(
      (item) =>
        (item.studentName || '').toLowerCase().includes(q) ||
        (item.studentId || '').toLowerCase().includes(q) ||
        (item.quizTitle || '').toLowerCase().includes(q) ||
        (item.subject || '').toLowerCase().includes(q)
    );
  }, [attemptsList, attemptSearchQuery]);

  const currentDbCollection = selectedCollection === 'users' ? usersList : selectedCollection === 'quizzes' ? quizzesList : attemptsList;

  const filteredDbList = useMemo(() => {
    const q = dbSearchQuery.trim().toLowerCase();
    if (!q) return currentDbCollection;
    return currentDbCollection.filter((doc) => {
      const docStr = JSON.stringify(doc).toLowerCase();
      return docStr.includes(q);
    });
  }, [currentDbCollection, dbSearchQuery]);

  const activeInspectDoc = inspectDoc || filteredDbList[0];

  const handleSaveJson = async () => {
    if (!activeInspectDoc) return;
    try {
      const parsed = JSON.parse(editJsonText);
      await updateDocument(selectedCollection, activeInspectDoc.id, parsed);
      Alert.alert('Document Saved', `Document ${activeInspectDoc.id} updated in collection '${selectedCollection}'.`);
      setInspectDoc(parsed);
      setIsEditingJson(false);
      loadDashboardData();
    } catch (e: any) {
      Alert.alert('JSON Parse Error', e?.message || 'Invalid JSON format.');
    }
  };

  // Modals & Creation Forms
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

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
      const resetRequests = await PasswordResetService.getPendingResetRequests('admin');

      setPendingResetRequests(resetRequests);

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

  const handleResolveResetRequest = async () => {
    if (!resetModalState.request || !resetModalState.newPassword.trim()) {
      Alert.alert('Error', 'Please enter a valid new password.');
      return;
    }
    if (resetModalState.newPassword !== resetModalState.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match. Please re-enter the password to confirm.');
      return;
    }
    try {
      await PasswordResetService.resolvePasswordReset(
        resetModalState.request.id,
        resetModalState.newPassword,
        'SuperAdmin'
      );
      Alert.alert('Success', `Password for @${resetModalState.request.username} has been updated.`);
      setResetModalState({ visible: false, request: null, newPassword: '', confirmPassword: '' });
      loadDashboardData();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to reset password.');
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

  const handleDeleteUser = (user: any) => {
    const userNameLabel = user.fullName || user.username || 'User Account';
    setConfirmDeleteModal({
      visible: true,
      title: 'Confirm Account Deletion',
      message: `Are you sure you want to permanently delete user account "${userNameLabel}" (@${user.username})? All user credentials and access will be permanently purged.`,
      onConfirm: async () => {
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
        setConfirmDeleteModal((prev) => ({ ...prev, visible: false }));
      },
    });
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

  const handleDeleteQuiz = (quiz: any) => {
    setConfirmDeleteModal({
      visible: true,
      title: 'Confirm Quiz Deletion',
      message: `Are you sure you want to permanently delete the quiz "${quiz.title}" (Subject: ${quiz.subject || 'General'})? This action cannot be undone.`,
      onConfirm: async () => {
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
        setConfirmDeleteModal((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  const handleDeleteDbDocument = (doc: any) => {
    if (!doc) return;
    setConfirmDeleteModal({
      visible: true,
      title: `Confirm Delete Document from '${selectedCollection}'`,
      message: `Are you sure you want to permanently delete document "${doc.id}" from collection '${selectedCollection}'?`,
      onConfirm: async () => {
        try {
          await deleteDocument(selectedCollection, doc.id);
          setInspectDoc(null);
          setAuditLogs((prev) => [
            { id: String(Date.now()), event: `[DB_PURGE] Deleted Document: ${doc.id} from collection '${selectedCollection}'`, timestamp: new Date().toISOString(), level: 'danger' },
            ...prev,
          ]);
          loadDashboardData();
        } catch (e) {
          console.error('Delete DB document error:', e);
        }
        setConfirmDeleteModal((prev) => ({ ...prev, visible: false }));
      },
    });
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
            
            {/* PENDING TEACHER PASSWORD RESET NOTIFICATIONS */}
            {pendingResetRequests.length > 0 && (
              <View style={[styles.contentCard, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2', borderColor: '#ef4444', borderWidth: 2, marginBottom: spacing.sm }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#ef4444', fontFamily: 'monospace' }}>
                    PASSWORD RESET NOTIFICATIONS ({pendingResetRequests.length})
                  </Text>
                  <Badge label="ACTION REQUIRED" variant="error" size="sm" />
                </View>
                <View style={{ gap: 10 }}>
                  {pendingResetRequests.map((req) => (
                    <View key={req.id} style={{ flexDirection: isTablet ? 'row' : 'column', justifyContent: 'space-between', alignItems: isTablet ? 'center' : 'stretch', backgroundColor: cardBg, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ef4444' }}>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: textColor }}>{req.fullName} (@{req.username})</Text>
                        <Text style={{ fontSize: 11, color: subTextColor, fontFamily: 'monospace' }}>
                          ROLE: {req.userRole.toUpperCase()} • REQUESTED: {new Date(req.requestedAt).toLocaleString()}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => setResetModalState({ visible: true, request: req, newPassword: '', confirmPassword: '' })}
                        style={[styles.cardBtn, { backgroundColor: '#ef4444', marginTop: isTablet ? 0 : 8 }]}
                      >
                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Reset Password</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Metrics Grid */}
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
              <View>
                <Text style={[styles.cardHeading, { color: textColor }]}>Active Logged-In Sessions</Text>
                <Text style={{ color: subTextColor, fontSize: 12 }}>Real-time user session status & system activity tracking</Text>
              </View>
              <CustomButton title="Refresh Sessions" onPress={loadDashboardData} variant="secondary" size="sm" fullWidth={false} />
            </View>

            {/* View Mode & Search Controls */}
            <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 12, alignItems: isTablet ? 'center' : 'stretch', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, minWidth: 260 }}>
                <TextInput
                  placeholder="Filter sessions by name, username, role..."
                  value={sessionSearchQuery}
                  onChangeText={setSessionSearchQuery}
                  placeholderTextColor={subTextColor}
                  style={[styles.formInput, { color: textColor, borderColor }]}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => setSessionViewMode('cards')}
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: sessionViewMode === 'cards' ? '#4f46e5' : cardBg,
                      borderColor: sessionViewMode === 'cards' ? '#4f46e5' : borderColor,
                    },
                  ]}
                >
                  <Text style={{ color: sessionViewMode === 'cards' ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    [ Grid View ]
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSessionViewMode('table')}
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: sessionViewMode === 'table' ? '#4f46e5' : cardBg,
                      borderColor: sessionViewMode === 'table' ? '#4f46e5' : borderColor,
                    },
                  ]}
                >
                  <Text style={{ color: sessionViewMode === 'table' ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    [ Table View ]
                  </Text>
                </Pressable>
              </View>
            </View>

            {sessionViewMode === 'cards' ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs }}>
                {filteredSessionsList.length === 0 ? (
                  <Text style={{ color: subTextColor, textAlign: 'center', width: '100%', marginVertical: 20 }}>No active sessions match query.</Text>
                ) : (
                  filteredSessionsList.map((item: any, idx: number) => {
                    const isSuper = item.role === 'superadmin';
                    const isTeacher = item.role === 'teacher';
                    const avatarCode = isSuper ? 'ADM' : isTeacher ? 'TCH' : 'STU';

                    return (
                      <View key={item.id || idx} style={[styles.entityCard, { backgroundColor: cardBg, borderColor, width: cardWidth }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: isSuper ? 'rgba(239, 68, 68, 0.15)' : isTeacher ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: isSuper ? '#ef4444' : isTeacher ? '#6366f1' : '#10b981' }}>
                              <Text style={{ fontSize: 11, fontWeight: '900', fontFamily: 'monospace', color: isSuper ? '#ef4444' : isTeacher ? '#6366f1' : '#10b981' }}>{avatarCode}</Text>
                            </View>
                            <View>
                              <Text style={{ fontSize: 15, fontWeight: '800', color: textColor }}>{item.fullName || item.username}</Text>
                              <Text style={{ fontSize: 12, color: '#6366f1', fontWeight: '700', fontFamily: 'monospace' }}>@{item.username}</Text>
                            </View>
                          </View>
                          <Badge label={item.isOnline ? 'ONLINE' : 'OFFLINE'} variant={item.isOnline ? 'success' : 'info'} size="sm" />
                        </View>

                        <View style={styles.cardInfoDivider} />

                        <View style={{ gap: 6, marginVertical: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 12, color: subTextColor, fontFamily: 'monospace' }}>ROLE:</Text>
                            <Badge
                              label={item.role?.toUpperCase() || 'USER'}
                              variant={isSuper ? 'error' : isTeacher ? 'info' : 'success'}
                              size="sm"
                            />
                          </View>
                          <Text style={{ fontSize: 12, color: subTextColor, fontFamily: 'monospace' }}>
                            LAST_ACTIVITY: <Text style={{ fontWeight: '700', color: textColor }}>{item.lastLogin ? new Date(item.lastLogin).toLocaleString() : 'Just now'}</Text>
                          </Text>
                        </View>

                        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: borderColor }}>
                          <Pressable
                            onPress={() => startEditingUser(usersList.find((u) => u.username === item.username) || item)}
                            style={[styles.cardBtn, { backgroundColor: '#4f46e5' }]}
                          >
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Edit Credentials</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            ) : (
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
                data={filteredSessionsList}
                keyExtractor={(item, idx) => item.id || String(idx)}
              />
            )}
          </View>
        )}

        {/* TAB 3: TEACHERS */}
        {activeTab === 'teachers' && (
          <View style={{ gap: spacing.md }}>
            <View style={styles.tabHeaderRow}>
              <View>
                <Text style={[styles.cardHeading, { color: textColor }]}>Teacher Directory & Provisioning</Text>
                <Text style={{ color: subTextColor, fontSize: 12 }}>Manage faculty members, assigned classes & monitor account status</Text>
              </View>
              <CustomButton title="+ Provision Teacher" onPress={() => setShowAddTeacher((v) => !v)} variant="primary" size="sm" fullWidth={false} />
            </View>

            {/* View Mode & Search Controls */}
            <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 12, alignItems: isTablet ? 'center' : 'stretch', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, minWidth: 260 }}>
                <TextInput
                  placeholder="Filter teachers by name, username, qualification..."
                  value={teacherSearchQuery}
                  onChangeText={setTeacherSearchQuery}
                  placeholderTextColor={subTextColor}
                  style={[styles.formInput, { color: textColor, borderColor }]}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => setTeacherViewMode('cards')}
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: teacherViewMode === 'cards' ? '#4f46e5' : cardBg,
                      borderColor: teacherViewMode === 'cards' ? '#4f46e5' : borderColor,
                    },
                  ]}
                >
                  <Text style={{ color: teacherViewMode === 'cards' ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    [ Cards Grid ]
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setTeacherViewMode('table')}
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: teacherViewMode === 'table' ? '#4f46e5' : cardBg,
                      borderColor: teacherViewMode === 'table' ? '#4f46e5' : borderColor,
                    },
                  ]}
                >
                  <Text style={{ color: teacherViewMode === 'table' ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    [ Table View ]
                  </Text>
                </Pressable>
              </View>
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

            {teacherViewMode === 'cards' ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs }}>
                {filteredTeachersList.length === 0 ? (
                  <Text style={{ color: subTextColor, textAlign: 'center', width: '100%', marginVertical: 20 }}>No teachers match search.</Text>
                ) : (
                  filteredTeachersList.map((item: any, idx: number) => {
                    const classes = item.assignedClasses || [8, 9, 10];
                    const subjects = item.teachingSubjects || ['Mathematics', 'Science'];
                    const isPending = item.isApproved === false;
                    const isActive = item.isActive !== false;

                    return (
                      <View key={item.id || idx} style={[styles.entityCard, { backgroundColor: cardBg, borderColor, width: cardWidth }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(99, 102, 241, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#6366f1' }}>
                              <Text style={{ fontSize: 11, fontWeight: '900', color: '#6366f1', fontFamily: 'monospace' }}>TCH</Text>
                            </View>
                            <View>
                              <Text style={{ fontSize: 16, fontWeight: '800', color: textColor }}>{item.fullName || item.username}</Text>
                              <Text style={{ fontSize: 12, color: '#6366f1', fontWeight: '700', fontFamily: 'monospace' }}>@{item.username}</Text>
                            </View>
                          </View>
                          <Pressable onPress={() => !isPending && toggleUserStatus(item)}>
                            <Badge
                              label={isPending ? 'PENDING' : isActive ? 'ACTIVE' : 'DISABLED'}
                              variant={isPending ? 'warning' : isActive ? 'success' : 'warning'}
                              size="sm"
                            />
                          </Pressable>
                        </View>

                        <View style={styles.cardInfoDivider} />

                        <View style={{ gap: 6, marginVertical: 8 }}>
                          {item.qualification ? (
                            <Text style={{ fontSize: 12, color: subTextColor, fontFamily: 'monospace' }}>QUALIFICATION: <Text style={{ fontWeight: '700', color: textColor }}>{item.qualification}</Text></Text>
                          ) : null}
                          {item.email || item.mobileNumber ? (
                            <Text style={{ fontSize: 12, color: subTextColor, fontFamily: 'monospace' }}>CONTACT: <Text style={{ fontWeight: '700', color: textColor }}>{item.mobileNumber || item.phone || item.email || '-'}</Text></Text>
                          ) : null}
                          <Text style={{ fontSize: 12, color: subTextColor, fontFamily: 'monospace' }}>
                            PASSWORD:{' '}
                            <Text style={{ color: '#10b981', fontWeight: '800', fontFamily: 'monospace' }}>{item.initialPassword || '******'}</Text>
                          </Text>
                        </View>

                        <View style={{ marginTop: 4, gap: 6 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: subTextColor, fontFamily: 'monospace' }}>Classes:</Text>
                            {classes.map((c: number) => (
                              <Badge key={c} label={`Class ${c}`} variant="info" size="sm" />
                            ))}
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: subTextColor, fontFamily: 'monospace' }}>Subjects:</Text>
                            <Text style={{ fontSize: 11, color: textColor, fontWeight: '600' }}>{subjects.join(', ')}</Text>
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: borderColor }}>
                          {isPending && (
                            <Pressable onPress={() => approveTeacher(item)} style={[styles.cardBtn, { backgroundColor: '#10b981' }]}>
                              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Approve</Text>
                            </Pressable>
                          )}
                          <Pressable onPress={() => startEditingUser(item)} style={[styles.cardBtn, { backgroundColor: '#4f46e5' }]}>
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Edit</Text>
                          </Pressable>
                          <Pressable onPress={() => toggleUserStatus(item)} style={[styles.cardBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }]}>
                            <Text style={{ color: textColor, fontWeight: '700', fontSize: 12, fontFamily: 'monospace' }}>{isActive ? 'Disable' : 'Enable'}</Text>
                          </Pressable>
                          <Pressable onPress={() => handleDeleteUser(item)} style={[styles.cardBtn, { backgroundColor: '#ef4444' }]}>
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Delete</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            ) : (
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
                data={filteredTeachersList}
                keyExtractor={(item, idx) => item.id || String(idx)}
              />
            )}
          </View>
        )}

        {/* TAB 4: STUDENTS */}
        {activeTab === 'students' && (
          <View style={{ gap: spacing.md }}>
            <View style={styles.tabHeaderRow}>
              <View>
                <Text style={[styles.cardHeading, { color: textColor }]}>Student Directory & Enrollment</Text>
                <Text style={{ color: subTextColor, fontSize: 12 }}>Manage enrolled students, class levels & account credentials</Text>
              </View>
              <CustomButton title="+ Enroll Student" onPress={() => setShowAddStudent((v) => !v)} variant="primary" size="sm" fullWidth={false} />
            </View>

            {/* View Mode & Search Controls */}
            <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 12, alignItems: isTablet ? 'center' : 'stretch', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, minWidth: 260 }}>
                <TextInput
                  placeholder="Filter students by name, username, roll number..."
                  value={studentSearchQuery}
                  onChangeText={setStudentSearchQuery}
                  placeholderTextColor={subTextColor}
                  style={[styles.formInput, { color: textColor, borderColor }]}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => setStudentViewMode('cards')}
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: studentViewMode === 'cards' ? '#4f46e5' : cardBg,
                      borderColor: studentViewMode === 'cards' ? '#4f46e5' : borderColor,
                    },
                  ]}
                >
                  <Text style={{ color: studentViewMode === 'cards' ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    [ Cards Grid ]
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setStudentViewMode('table')}
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: studentViewMode === 'table' ? '#4f46e5' : cardBg,
                      borderColor: studentViewMode === 'table' ? '#4f46e5' : borderColor,
                    },
                  ]}
                >
                  <Text style={{ color: studentViewMode === 'table' ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    [ Table View ]
                  </Text>
                </Pressable>
              </View>
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

            {studentViewMode === 'cards' ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs }}>
                {filteredStudentsList.length === 0 ? (
                  <Text style={{ color: subTextColor, textAlign: 'center', width: '100%', marginVertical: 20 }}>No students match query.</Text>
                ) : (
                  filteredStudentsList.map((item: any, idx: number) => {
                    const isActive = item.isActive !== false;

                    return (
                      <View key={item.id || idx} style={[styles.entityCard, { backgroundColor: cardBg, borderColor, width: cardWidth }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(16, 185, 129, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#10b981' }}>
                              <Text style={{ fontSize: 11, fontWeight: '900', color: '#10b981', fontFamily: 'monospace' }}>STU</Text>
                            </View>
                            <View>
                              <Text style={{ fontSize: 16, fontWeight: '800', color: textColor }}>{item.fullName || item.username}</Text>
                              <Text style={{ fontSize: 12, color: '#10b981', fontWeight: '700', fontFamily: 'monospace' }}>@{item.username}</Text>
                            </View>
                          </View>
                          <Pressable onPress={() => toggleUserStatus(item)}>
                            <Badge
                              label={isActive ? 'ACTIVE' : 'DISABLED'}
                              variant={isActive ? 'success' : 'warning'}
                              size="sm"
                            />
                          </Pressable>
                        </View>

                        <View style={styles.cardInfoDivider} />

                        <View style={{ gap: 6, marginVertical: 8 }}>
                          <Text style={{ fontSize: 12, color: subTextColor, fontFamily: 'monospace' }}>CLASS: <Text style={{ fontWeight: '700', color: textColor }}>Class {item.classLevel || 8}</Text></Text>
                          {item.rollNumber ? (
                            <Text style={{ fontSize: 12, color: subTextColor, fontFamily: 'monospace' }}>ROLL_NO: <Text style={{ fontWeight: '700', color: textColor }}>{item.rollNumber}</Text></Text>
                          ) : null}
                          {item.mobileNumber || item.parentName ? (
                            <Text style={{ fontSize: 12, color: subTextColor, fontFamily: 'monospace' }}>PARENT/CONTACT: <Text style={{ fontWeight: '700', color: textColor }}>{item.parentName ? `${item.parentName} (${item.parentMobileNumber || item.mobileNumber || '-'})` : (item.mobileNumber || '-')}</Text></Text>
                          ) : null}
                          <Text style={{ fontSize: 12, color: subTextColor, fontFamily: 'monospace' }}>
                            PASSWORD:{' '}
                            <Text style={{ color: '#10b981', fontWeight: '800', fontFamily: 'monospace' }}>{item.initialPassword || '******'}</Text>
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: borderColor }}>
                          <Pressable onPress={() => startEditingUser(item)} style={[styles.cardBtn, { backgroundColor: '#4f46e5' }]}>
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Edit</Text>
                          </Pressable>
                          <Pressable onPress={() => toggleUserStatus(item)} style={[styles.cardBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }]}>
                            <Text style={{ color: textColor, fontWeight: '700', fontSize: 12, fontFamily: 'monospace' }}>{isActive ? 'Disable' : 'Enable'}</Text>
                          </Pressable>
                          <Pressable onPress={() => handleDeleteUser(item)} style={[styles.cardBtn, { backgroundColor: '#ef4444' }]}>
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Delete</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            ) : (
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
                data={filteredStudentsList}
                keyExtractor={(item, idx) => item.id || String(idx)}
              />
            )}
          </View>
        )}

        {/* TAB 5: QUIZZES */}
        {activeTab === 'quizzes' && (
          <View style={{ gap: spacing.md }}>
            <View style={styles.tabHeaderRow}>
              <View>
                <Text style={[styles.cardHeading, { color: textColor }]}>Global Quiz Content Management</Text>
                <Text style={{ color: subTextColor, fontSize: 12 }}>Create, publish, and manage quizzes across all classes</Text>
              </View>
              <CustomButton title="+ Create Quiz" onPress={() => setShowAddQuiz((v) => !v)} variant="primary" size="sm" fullWidth={false} />
            </View>

            {/* View Mode & Search Controls */}
            <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 12, alignItems: isTablet ? 'center' : 'stretch', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, minWidth: 260 }}>
                <TextInput
                  placeholder="Filter quizzes by title, subject, target class..."
                  value={quizSearchQuery}
                  onChangeText={setQuizSearchQuery}
                  placeholderTextColor={subTextColor}
                  style={[styles.formInput, { color: textColor, borderColor }]}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => setQuizViewMode('cards')}
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: quizViewMode === 'cards' ? '#4f46e5' : cardBg,
                      borderColor: quizViewMode === 'cards' ? '#4f46e5' : borderColor,
                    },
                  ]}
                >
                  <Text style={{ color: quizViewMode === 'cards' ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    [ Cards Grid ]
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setQuizViewMode('table')}
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: quizViewMode === 'table' ? '#4f46e5' : cardBg,
                      borderColor: quizViewMode === 'table' ? '#4f46e5' : borderColor,
                    },
                  ]}
                >
                  <Text style={{ color: quizViewMode === 'table' ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    [ Table View ]
                  </Text>
                </Pressable>
              </View>
            </View>

            {showAddQuiz && (
              <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: '#6366f1' }]}>
                <Text style={[styles.formTitle, { color: textColor }]}>Create Global Quiz</Text>
                <View style={styles.formRow}>
                  <TextInput placeholder="Quiz Title" value={quizTitle} onChangeText={setQuizTitle} placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} />
                  <TextInput placeholder="Subject" value={quizSubject} onChangeText={setQuizSubject} placeholderTextColor={subTextColor} style={[styles.formInput, { color: textColor, borderColor }]} />
                </View>
                {/* Subject Quick Selector */}
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {ALL_SUBJECT_OPTIONS.map((subj) => (
                    <Pressable
                      key={subj}
                      onPress={() => setQuizSubject(subj)}
                      style={[
                        styles.classChip,
                        quizSubject === subj && { backgroundColor: '#6366f1', borderColor: '#6366f1' },
                      ]}
                    >
                      <Text style={{ color: quizSubject === subj ? '#ffffff' : subTextColor, fontSize: 10, fontWeight: '800', fontFamily: 'monospace' }}>
                        {subj}
                      </Text>
                    </Pressable>
                  ))}
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

            {quizViewMode === 'cards' ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs }}>
                {filteredQuizzesList.length === 0 ? (
                  <Text style={{ color: subTextColor, textAlign: 'center', width: '100%', marginVertical: 20 }}>No quizzes match query.</Text>
                ) : (
                  filteredQuizzesList.map((item: any, idx: number) => {
                    const isPublished = item.isPublished !== false;

                    return (
                      <View key={item.id || idx} style={[styles.entityCard, { backgroundColor: cardBg, borderColor, width: cardWidth }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(99, 102, 241, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#6366f1' }}>
                              <Text style={{ fontSize: 11, fontWeight: '900', color: '#6366f1', fontFamily: 'monospace' }}>QUIZ</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 16, fontWeight: '800', color: textColor }} numberOfLines={1}>{item.title}</Text>
                              <Text style={{ fontSize: 12, color: '#6366f1', fontWeight: '700', fontFamily: 'monospace' }}>SUBJECT: {item.subject || 'General'}</Text>
                            </View>
                          </View>
                          <Pressable onPress={() => toggleQuizStatus(item)}>
                            <Badge label={isPublished ? 'LIVE' : 'DRAFT'} variant={isPublished ? 'success' : 'info'} size="sm" />
                          </Pressable>
                        </View>

                        <View style={styles.cardInfoDivider} />

                        <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8, flexWrap: 'wrap' }}>
                          <Badge label={`Class ${item.classLevel || 8}`} variant="info" size="sm" />
                          <Badge label={`${item.timeLimitMinutes || 15}m limit`} variant="warning" size="sm" />
                          <Badge label={`${item.totalQuestions || 10} questions`} variant="success" size="sm" />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: borderColor }}>
                          <Pressable onPress={() => toggleQuizStatus(item)} style={[styles.cardBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }]}>
                            <Text style={{ color: textColor, fontWeight: '700', fontSize: 12, fontFamily: 'monospace' }}>{isPublished ? 'Set Draft' : 'Publish Live'}</Text>
                          </Pressable>
                          <Pressable onPress={() => handleDeleteQuiz(item)} style={[styles.cardBtn, { backgroundColor: '#ef4444' }]}>
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Delete</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            ) : (
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
                data={filteredQuizzesList}
                keyExtractor={(item, idx) => item.id || String(idx)}
              />
            )}
          </View>
        )}

        {/* TAB 6: ATTEMPTS */}
        {activeTab === 'attempts' && (
          <View style={{ gap: spacing.md }}>
            <View style={styles.tabHeaderRow}>
              <View>
                <Text style={[styles.cardHeading, { color: textColor }]}>Student Attempt Logs & Results</Text>
                <Text style={{ color: subTextColor, fontSize: 12 }}>Review quiz submissions, score percentages & completion dates</Text>
              </View>
            </View>

            {/* View Mode & Search Controls */}
            <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 12, alignItems: isTablet ? 'center' : 'stretch', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, minWidth: 260 }}>
                <TextInput
                  placeholder="Filter attempt logs by student, quiz title, subject..."
                  value={attemptSearchQuery}
                  onChangeText={setAttemptSearchQuery}
                  placeholderTextColor={subTextColor}
                  style={[styles.formInput, { color: textColor, borderColor }]}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => setAttemptViewMode('cards')}
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: attemptViewMode === 'cards' ? '#4f46e5' : cardBg,
                      borderColor: attemptViewMode === 'cards' ? '#4f46e5' : borderColor,
                    },
                  ]}
                >
                  <Text style={{ color: attemptViewMode === 'cards' ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    [ Cards Grid ]
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAttemptViewMode('table')}
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: attemptViewMode === 'table' ? '#4f46e5' : cardBg,
                      borderColor: attemptViewMode === 'table' ? '#4f46e5' : borderColor,
                    },
                  ]}
                >
                  <Text style={{ color: attemptViewMode === 'table' ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    [ Table View ]
                  </Text>
                </Pressable>
              </View>
            </View>

            {attemptViewMode === 'cards' ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs }}>
                {filteredAttemptsList.length === 0 ? (
                  <Text style={{ color: subTextColor, textAlign: 'center', width: '100%', marginVertical: 20 }}>No quiz attempts match query.</Text>
                ) : (
                  filteredAttemptsList.map((item: any, idx: number) => {
                    const pct = Math.round(item.percentage ?? 0);
                    const isPassed = pct >= 40;

                    return (
                      <View key={item.id || idx} style={[styles.entityCard, { backgroundColor: cardBg, borderColor, width: cardWidth }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(99, 102, 241, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#6366f1' }}>
                              <Text style={{ fontSize: 11, fontWeight: '900', color: '#6366f1', fontFamily: 'monospace' }}>LOG</Text>
                            </View>
                            <View>
                              <Text style={{ fontSize: 15, fontWeight: '800', color: textColor }}>{item.studentName || item.studentId || 'Student'}</Text>
                              <Text style={{ fontSize: 12, color: '#6366f1', fontWeight: '700', fontFamily: 'monospace' }}>SUBJECT: {item.subject || 'General'}</Text>
                            </View>
                          </View>
                          <Badge
                            label={`${pct}% ${isPassed ? 'PASSED' : 'FAILED'}`}
                            variant={isPassed ? 'success' : 'error'}
                            size="sm"
                          />
                        </View>

                        <View style={styles.cardInfoDivider} />

                        <View style={{ gap: 6, marginVertical: 8 }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: textColor, fontFamily: 'monospace' }}>QUIZ: {item.quizTitle || 'Quiz Attempt'}</Text>
                          <Text style={{ fontSize: 12, color: subTextColor, fontFamily: 'monospace' }}>
                            SCORE: {item.score ?? 0} / {item.totalMarks ?? 0} ({pct}%)
                          </Text>
                          <Text style={{ fontSize: 12, color: subTextColor, fontFamily: 'monospace' }}>
                            SUBMITTED: {item.completedAt ? new Date(item.completedAt).toLocaleString() : 'Recent'}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            ) : (
              <DataTable
                columns={[
                  { key: 'studentName', title: 'Student Name', flex: 1, render: (item) => item.studentName || item.studentId || 'Student' },
                  { key: 'quizTitle', title: 'Quiz Title', flex: 1.2, render: (item) => item.quizTitle || 'Quiz' },
                  { key: 'subject', title: 'Subject', flex: 1 },
                  { key: 'percentage', title: 'Score %', flex: 1, render: (item) => <Text style={{ color: item.percentage >= 50 ? '#10b981' : '#f87171', fontWeight: '800', fontFamily: 'monospace' }}>{Math.round(item.percentage ?? 0)}%</Text> },
                  { key: 'completedAt', title: 'Submission Date', flex: 1, render: (item) => (item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Recent') },
                ]}
                data={filteredAttemptsList}
                keyExtractor={(item, idx) => item.id || String(idx)}
              />
            )}
          </View>
        )}

        {/* TAB 7: DATABASE EXPLORER (Desktop Optimized Split-Pane Interface) */}
        {activeTab === 'database' && (
          <View style={{ gap: spacing.md }}>
            <View style={styles.tabHeaderRow}>
              <View>
                <Text style={[styles.cardHeading, { color: textColor }]}>Firestore Collection Schema & DB Inspector</Text>
                <Text style={{ color: subTextColor, fontSize: 12 }}>Desktop-optimized dual pane document navigator & live JSON inspector</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => setDbViewMode('cards')}
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: dbViewMode === 'cards' ? '#4f46e5' : cardBg,
                      borderColor: dbViewMode === 'cards' ? '#4f46e5' : borderColor,
                    },
                  ]}
                >
                  <Text style={{ color: dbViewMode === 'cards' ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    [ Cards Grid ]
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setDbViewMode('table')}
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: dbViewMode === 'table' ? '#4f46e5' : cardBg,
                      borderColor: dbViewMode === 'table' ? '#4f46e5' : borderColor,
                    },
                  ]}
                >
                  <Text style={{ color: dbViewMode === 'table' ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                    [ Table View ]
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Collection Selection & Search Bar */}
            <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 12, alignItems: isTablet ? 'center' : 'stretch', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {(['users', 'quizzes', 'attempts'] as const).map((col) => {
                  const count = col === 'users' ? usersList.length : col === 'quizzes' ? quizzesList.length : attemptsList.length;
                  const isSel = selectedCollection === col;
                  return (
                    <Pressable
                      key={col}
                      onPress={() => {
                        setSelectedCollection(col);
                        setInspectDoc(null);
                        setIsEditingJson(false);
                      }}
                      style={[
                        styles.colChip,
                        {
                          backgroundColor: isSel ? '#4f46e5' : cardBg,
                          borderColor: isSel ? '#4f46e5' : borderColor,
                        },
                      ]}
                    >
                      <Text style={{ color: isSel ? '#ffffff' : subTextColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>
                        collection('{col}') [{count}]
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ flex: 1, minWidth: 240 }}>
                <TextInput
                  placeholder="Search document ID or schema fields..."
                  value={dbSearchQuery}
                  onChangeText={setDbSearchQuery}
                  placeholderTextColor={subTextColor}
                  style={[styles.formInput, { color: textColor, borderColor }]}
                />
              </View>
            </View>

            {/* Split View Container for Desktop */}
            <View style={{ flexDirection: isTablet || isDesktop ? 'row' : 'column', gap: 16, alignItems: 'flex-start', marginTop: 6 }}>
              {/* LEFT PANE: Document List / Cards */}
              <View style={{ flex: 1, width: '100%', gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: subTextColor, fontFamily: 'monospace' }}>
                    DOCUMENTS IN '{selectedCollection.toUpperCase()}' ({filteredDbList.length})
                  </Text>
                </View>

                {dbViewMode === 'cards' ? (
                  <View style={{ gap: 10, maxHeight: 600 }}>
                    <ScrollView style={{ maxHeight: 580 }} showsVerticalScrollIndicator={true}>
                      <View style={{ gap: 10, paddingRight: 4 }}>
                        {filteredDbList.length === 0 ? (
                          <Text style={{ color: subTextColor, textAlign: 'center', marginVertical: 20 }}>No documents match query.</Text>
                        ) : (
                          filteredDbList.map((item: any, idx: number) => {
                            const isSelected = (inspectDoc && inspectDoc.id === item.id) || (!inspectDoc && idx === 0);
                            const keyCount = Object.keys(item).length;
                            const title = item.title || item.fullName || item.username || item.quizTitle || item.id;

                            return (
                              <Pressable
                                key={item.id || idx}
                                onPress={() => {
                                  setInspectDoc(item);
                                  setIsEditingJson(false);
                                }}
                                style={[
                                  styles.entityCard,
                                  {
                                    backgroundColor: isSelected ? (isDark ? 'rgba(79, 70, 229, 0.25)' : '#e0e7ff') : cardBg,
                                    borderColor: isSelected ? '#6366f1' : borderColor,
                                    borderWidth: isSelected ? 2 : 1,
                                    padding: 12,
                                  },
                                ]}
                              >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Text style={{ fontSize: 13, fontWeight: '800', color: isSelected ? '#6366f1' : textColor, fontFamily: 'monospace' }} numberOfLines={1}>
                                    DOC: {item.id}
                                  </Text>
                                  <Badge label={`${keyCount} keys`} variant={isSelected ? 'info' : 'success'} size="sm" />
                                </View>
                                <Text style={{ fontSize: 12, color: subTextColor, marginTop: 4, fontFamily: 'monospace' }} numberOfLines={1}>
                                  IDENTIFIER: <Text style={{ color: textColor, fontWeight: '700' }}>{title}</Text>
                                </Text>
                              </Pressable>
                            );
                          })
                        )}
                      </View>
                    </ScrollView>
                  </View>
                ) : (
                  <DataTable
                    columns={[
                      { key: 'id', title: 'Doc ID', flex: 1, render: (item) => <Text style={{ fontWeight: '700', color: '#6366f1', fontFamily: 'monospace' }}>{item.id}</Text> },
                      { key: 'title', title: 'Identifier', flex: 1, render: (item) => item.title || item.fullName || item.username || 'Record' },
                      {
                        key: 'raw',
                        title: 'Select',
                        flex: 0.8,
                        render: (item) => (
                          <Pressable
                            onPress={() => {
                              setInspectDoc(item);
                              setIsEditingJson(false);
                            }}
                            style={[styles.actionBtnEdit, { backgroundColor: inspectDoc?.id === item.id ? '#10b981' : '#6366f1' }]}
                          >
                            <Text style={styles.btnTextText}>{inspectDoc?.id === item.id ? 'Selected' : 'Inspect'}</Text>
                          </Pressable>
                        ),
                      },
                    ]}
                    data={filteredDbList}
                    keyExtractor={(item, idx) => item.id || String(idx)}
                  />
                )}
              </View>

              {/* RIGHT PANE: Live Desktop JSON Inspector & Editor */}
              <View style={{ flex: isTablet || isDesktop ? 1.3 : 1, width: '100%' }}>
                {activeInspectDoc ? (
                  <View style={[styles.jsonCard, { backgroundColor: cardBg, borderColor: '#6366f1', borderWidth: 2, padding: 16, borderRadius: 16, marginTop: 0 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: 'rgba(99, 102, 241, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#6366f1' }}>
                          <Text style={{ fontSize: 10, fontWeight: '900', color: '#6366f1', fontFamily: 'monospace' }}>JSON</Text>
                        </View>
                        <View>
                          <Text style={{ color: textColor, fontWeight: '900', fontFamily: 'monospace', fontSize: 14 }}>
                            {activeInspectDoc.id}
                          </Text>
                          <Text style={{ color: '#6366f1', fontSize: 11, fontWeight: '700', fontFamily: 'monospace' }}>
                            Collection: {selectedCollection} ({Object.keys(activeInspectDoc).length} fields)
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {!isEditingJson ? (
                          <Pressable
                            onPress={() => {
                              setEditJsonText(JSON.stringify(activeInspectDoc, null, 2));
                              setIsEditingJson(true);
                            }}
                            style={[styles.actionChip, { backgroundColor: '#4f46e5', borderColor: '#4f46e5' }]}
                          >
                            <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 11, fontFamily: 'monospace' }}>
                              Edit Raw JSON
                            </Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            onPress={() => setIsEditingJson(false)}
                            style={[styles.actionChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', borderColor }]}
                          >
                            <Text style={{ color: textColor, fontWeight: '800', fontSize: 11, fontFamily: 'monospace' }}>
                              Cancel
                            </Text>
                          </Pressable>
                        )}
                        <Pressable
                          onPress={() => setInspectDoc(null)}
                          style={[styles.actionChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', borderColor }]}
                        >
                          <Text style={{ color: textColor, fontWeight: '800', fontSize: 11, fontFamily: 'monospace' }}>
                            Close Pane
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeleteDbDocument(activeInspectDoc)}
                          style={[styles.actionChip, { backgroundColor: '#ef4444', borderColor: '#ef4444' }]}
                        >
                          <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 11, fontFamily: 'monospace' }}>
                            Delete Doc
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.cardInfoDivider} />

                    {isEditingJson ? (
                      <View style={{ gap: 10, marginTop: 10 }}>
                        <Text style={{ color: subTextColor, fontSize: 11, fontFamily: 'monospace', fontWeight: '700' }}>
                          RAW JSON SCHEMA EDITOR (Ensure valid JSON syntax before commit):
                        </Text>
                        <TextInput
                          multiline
                          value={editJsonText}
                          onChangeText={setEditJsonText}
                          style={{
                            height: 380,
                            backgroundColor: isDark ? '#09051b' : '#f8fafc',
                            color: isDark ? '#818cf8' : '#1e1b4b',
                            fontFamily: 'monospace',
                            fontSize: 12,
                            padding: 12,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#6366f1',
                            textAlignVertical: 'top',
                          }}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                          <CustomButton
                            title="Commit Changes"
                            onPress={handleSaveJson}
                            variant="primary"
                            size="sm"
                            fullWidth={false}
                          />
                        </View>
                      </View>
                    ) : (
                      <ScrollView style={{ maxHeight: 420, marginTop: 8 }} showsVerticalScrollIndicator={true}>
                        <View style={{ backgroundColor: isDark ? '#09051b' : '#f8fafc', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : '#e2e8f0' }}>
                          <Text style={{ color: isDark ? '#a5b4fc' : '#312e81', fontFamily: 'monospace', fontSize: 12, lineHeight: 18 }}>
                            {JSON.stringify(activeInspectDoc, null, 2)}
                          </Text>
                        </View>
                      </ScrollView>
                    )}
                  </View>
                ) : (
                  <View style={[styles.jsonCard, { backgroundColor: cardBg, borderColor, padding: 30, alignItems: 'center', justifyContent: 'center', minHeight: 280 }]}>
                    <Text style={{ color: textColor, fontWeight: '800', fontSize: 14, fontFamily: 'monospace', textAlign: 'center' }}>
                      Select a Document to Inspect Schema
                    </Text>
                    <Text style={{ color: subTextColor, fontSize: 12, textAlign: 'center', marginTop: 6, maxWidth: 300, fontFamily: 'monospace' }}>
                      Click on any document entry in the left panel to inspect its JSON structure and raw values.
                    </Text>
                  </View>
                )}
              </View>
            </View>
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

      {/* GLOBAL CONFIRMATION POPUP MODAL */}
      <Modal visible={confirmDeleteModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: cardBg, borderColor: '#ef4444', borderWidth: 2, maxWidth: 480 }]}>
            <View style={{ alignItems: 'center', marginBottom: 14 }}>
              <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: '#ef4444', marginBottom: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#ef4444', fontFamily: 'monospace' }}>CRITICAL_ACTION</Text>
              </View>
              <Badge label="PERMANENT DELETION WARNING" variant="error" size="sm" />
              <Text style={[styles.modalTitleText, { color: textColor, marginTop: 8, fontSize: 17, textAlign: 'center', fontFamily: 'monospace' }]}>
                {confirmDeleteModal.title}
              </Text>
            </View>

            <Text style={{ color: subTextColor, fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 20, fontFamily: 'monospace' }}>
              {confirmDeleteModal.message}
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
              <Pressable
                onPress={() => setConfirmDeleteModal((prev) => ({ ...prev, visible: false }))}
                style={[styles.cardBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', paddingVertical: 10 }]}
              >
                <Text style={{ color: textColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmDeleteModal.onConfirm}
                style={[styles.cardBtn, { backgroundColor: '#ef4444', paddingVertical: 10 }]}
              >
                <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Confirm Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADMIN RESET PASSWORD MODAL */}
      <Modal visible={resetModalState.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: cardBg, borderColor: '#ef4444', borderWidth: 2, maxWidth: 460 }]}>
            <Text style={{ fontSize: 16, fontWeight: '900', color: textColor, fontFamily: 'monospace', marginBottom: 6 }}>
              Reset Password for @{resetModalState.request?.username}
            </Text>
            <Text style={{ fontSize: 12, color: subTextColor, fontFamily: 'monospace', marginBottom: 14 }}>
              Assign a new initial password for user {resetModalState.request?.fullName}.
            </Text>
            <TextInput
              placeholder="Enter new password (min 4 chars)"
              value={resetModalState.newPassword}
              onChangeText={(val) => setResetModalState((prev) => ({ ...prev, newPassword: val }))}
              placeholderTextColor={subTextColor}
              style={[styles.formInput, { color: textColor, borderColor, marginBottom: 10 }]}
              secureTextEntry
            />
            <TextInput
              placeholder="Confirm new password"
              value={resetModalState.confirmPassword}
              onChangeText={(val) => setResetModalState((prev) => ({ ...prev, confirmPassword: val }))}
              placeholderTextColor={subTextColor}
              style={[styles.formInput, { color: textColor, borderColor, marginBottom: 16 }]}
              secureTextEntry
            />
            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
              <Pressable
                onPress={() => setResetModalState({ visible: false, request: null, newPassword: '', confirmPassword: '' })}
                style={[styles.cardBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }]}
              >
                <Text style={{ color: textColor, fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleResolveResetRequest}
                style={[styles.cardBtn, { backgroundColor: '#10b981' }]}
              >
                <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 12, fontFamily: 'monospace' }}>Update & Resolve</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
  
  entityCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardInfoDivider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginVertical: 4,
  },
  cardBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
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
