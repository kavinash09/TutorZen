import { Platform } from 'react-native';
import { TeacherClassSession, StudentRosterItem, AttendanceStrategyType, StudentAttendanceStatus } from '../types/teacher';
import { normalizeRosterItem } from '../utils/rosterUtils';

export interface UserProfile {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: 'TEACHER' | 'STUDENT' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: UserProfile;
}

// Development API URL: localhost for web, 10.0.2.2 for Android emulator
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }
  return 'http://localhost:8080';
};

class ApiService {
  private baseUrl: string = getBaseUrl();
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private currentUser: UserProfile | null = null;

  setTokens(access: string | null, refresh: string | null, user: UserProfile | null) {
    this.accessToken = access;
    this.refreshToken = refresh;
    this.currentUser = user;
    if (typeof window !== 'undefined' && window.localStorage) {
      if (access) window.localStorage.setItem('tz_access_token', access);
      else window.localStorage.removeItem('tz_access_token');

      if (refresh) window.localStorage.setItem('tz_refresh_token', refresh);
      else window.localStorage.removeItem('tz_refresh_token');

      if (user) window.localStorage.setItem('tz_user', JSON.stringify(user));
      else window.localStorage.removeItem('tz_user');
    }
  }

  getAccessToken() {
    if (!this.accessToken && typeof window !== 'undefined' && window.localStorage) {
      this.accessToken = window.localStorage.getItem('tz_access_token');
    }
    return this.accessToken;
  }

  getRefreshToken() {
    if (!this.refreshToken && typeof window !== 'undefined' && window.localStorage) {
      this.refreshToken = window.localStorage.getItem('tz_refresh_token');
    }
    return this.refreshToken;
  }

  getCurrentUser(): UserProfile | null {
    if (!this.currentUser && typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('tz_user');
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
        } catch {
          this.currentUser = null;
        }
      }
    }
    return this.currentUser;
  }

  async signIn(email: string, password: string, tenantId?: string): Promise<AuthResponse> {
    const res = await fetch(`${this.baseUrl}/api/v1/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, tenantId }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || 'Failed to sign in. Please check credentials.');
    }

    const data: AuthResponse = await res.json();
    this.setTokens(data.accessToken, data.refreshToken, data.user);
    return data;
  }

  async refresh(): Promise<string> {
    const rf = this.getRefreshToken();
    if (!rf) throw new Error('No refresh token available');

    const res = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rf }),
    });

    if (!res.ok) {
      this.setTokens(null, null, null);
      throw new Error('Refresh token expired or invalid');
    }

    const data: AuthResponse = await res.json();
    this.setTokens(data.accessToken, data.refreshToken, data.user);
    return data.accessToken;
  }

  async signOut(): Promise<void> {
    const rf = this.getRefreshToken();
    if (rf) {
      await fetch(`${this.baseUrl}/api/v1/auth/sign-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rf }),
      }).catch(() => {});
    }
    this.setTokens(null, null, null);
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    // If 401, try to refresh token once
    if (response.status === 401 && this.getRefreshToken()) {
      try {
        const newToken = await this.refresh();
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${this.baseUrl}${path}`, {
          ...options,
          headers,
        });
      } catch {
        // Refresh failed, re-throw 401
      }
    }

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // --- Teacher Endpoints ---

  async getTodayTeacherSessions(): Promise<{ sessions: TeacherClassSession[]; isLive: boolean }> {
    try {
      const data = await this.request<any[]>('/api/v1/teacher/sessions/today');
      const sessions: TeacherClassSession[] = data.map((item) => ({
        id: item.id,
        subject: item.subject,
        batchName: item.batchName,
        timeSlot: item.timeSlot,
        room: item.room,
        enrolledStudentsCount: item.enrolledStudentsCount,
        status: item.status,
      }));
      return { sessions, isLive: true };
    } catch (err) {
      console.warn('Backend unavailable, using fallback mock dataset', err);
      return {
        sessions: [
          {
            id: 'session-math-a',
            subject: 'Mathematics',
            batchName: 'Batch A',
            timeSlot: '10:00 AM – 11:00 AM',
            room: 'Room A1',
            enrolledStudentsCount: 42,
            status: 'UPCOMING',
          },
          {
            id: 'session-math-b',
            subject: 'Mathematics',
            batchName: 'Batch B',
            timeSlot: '12:00 PM – 1:00 PM',
            room: 'Room A2',
            enrolledStudentsCount: 38,
            status: 'UPCOMING',
          },
          {
            id: 'session-doubt',
            subject: 'Doubt Session',
            batchName: 'Class 11 & 12',
            timeSlot: '4:00 PM – 5:00 PM',
            room: 'Room B1',
            enrolledStudentsCount: 12,
            status: 'UPCOMING',
          },
        ],
        isLive: false,
      };
    }
  }

  async getSessionRoster(sessionId: string): Promise<StudentRosterItem[]> {
    try {
      const data = await this.request<any[]>(`/api/v1/teacher/sessions/${sessionId}/roster`);
      return data.map(normalizeRosterItem);
    } catch (err) {
      console.warn('Backend unavailable for roster, using fallback', err);
      return [
        { id: 'std-01', name: 'Aditya Kumar', rollNumber: 'Roll #101', initials: 'AK', status: 'PRESENT' },
        { id: 'std-02', name: 'Ananya Verma', rollNumber: 'Roll #102', initials: 'AV', status: 'PRESENT' },
        { id: 'std-03', name: 'Rohan Sharma', rollNumber: 'Roll #103', initials: 'RS', status: 'ABSENT' },
        { id: 'std-04', name: 'Neha Singh', rollNumber: 'Roll #104', initials: 'NS', status: 'PRESENT' },
        { id: 'std-05', name: 'Aryan Shah', rollNumber: 'Roll #105', initials: 'AS', status: 'PRESENT' },
        { id: 'std-06', name: 'Kavya Patel', rollNumber: 'Roll #106', initials: 'KP', status: 'PRESENT' },
        { id: 'std-07', name: 'Tanvi Joshi', rollNumber: 'Roll #107', initials: 'TJ', status: 'ABSENT' },
        { id: 'std-08', name: 'Vikram Reddy', rollNumber: 'Roll #108', initials: 'VR', status: 'PRESENT' },
      ];
    }
  }

  async generateSessionCode(sessionId: string): Promise<{ code: string; qrPayload: string; expiresInSeconds: number }> {
    return this.request<{ sessionId: string; code: string; expiresInSeconds: number; qrPayload: string }>(
      `/api/v1/teacher/sessions/${sessionId}/attendance/code`,
      { method: 'POST' }
    );
  }

  async submitAttendance(
    sessionId: string,
    method: AttendanceStrategyType,
    studentStatuses: Record<string, StudentAttendanceStatus>
  ): Promise<{ success: boolean; totalMarked: number; message: string }> {
    return this.request<{ success: boolean; totalMarked: number; message: string }>(
      `/api/v1/teacher/sessions/${sessionId}/attendance`,
      {
        method: 'POST',
        body: JSON.stringify({
          method,
          studentStatuses,
        }),
      }
    );
  }

  async getSubjects(): Promise<SubjectItem[]> {
    try {
      return await this.request<SubjectItem[]>('/api/v1/teacher/materials/subjects');
    } catch {
      return [
        { id: 'sub-math-11', name: 'Mathematics', code: 'MATH-11' },
        { id: 'sub-phy-11', name: 'Physics', code: 'PHY-11' },
      ];
    }
  }

  async getMaterials(subjectId?: string): Promise<LearningMaterialItem[]> {
    const query = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : '';
    try {
      return await this.request<LearningMaterialItem[]>(`/api/v1/teacher/materials${query}`);
    } catch (err) {
      console.warn('Backend materials unavailable, using fallback', err);
      return [
        {
          id: 'mat-01',
          subjectId: 'sub-math-11',
          subjectName: 'Mathematics',
          title: 'Calculus: Integration by Parts & Formulas',
          description: 'Comprehensive formula guide with derivations and practice problems.',
          fileName: 'Calculus_Ch4_Integration_Formulas.pdf',
          fileType: 'application/pdf',
          fileSizeBytes: 2411724,
          uploadedBy: 'usr-teacher-01',
          uploaderName: 'Priya Ma\'am',
          createdAt: new Date().toISOString(),
        },
      ];
    }
  }

  async uploadMaterial(payload: CreateMaterialPayload): Promise<LearningMaterialItem> {
    return this.request<LearningMaterialItem>('/api/v1/teacher/materials', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteMaterial(materialId: string): Promise<void> {
    await this.request<void>(`/api/v1/teacher/materials/${materialId}`, {
      method: 'DELETE',
    });
  }
}

export interface LearningMaterialItem {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description?: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  fileUrl?: string;
  uploadedBy: string;
  uploaderName?: string;
  createdAt: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
}

export interface CreateMaterialPayload {
  subjectId: string;
  title: string;
  description?: string;
  fileName: string;
  fileType?: string;
  fileSizeBytes?: number;
  fileUrl?: string;
}

export const apiClient = new ApiService();


