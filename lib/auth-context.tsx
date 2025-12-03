"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const API_URL = "/api";

// --- Data Types ---

// Matches the UserResponse Pydantic model
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  name?: string;
  gender?: string;
  age?: string;
  school?: string;
  student_id?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

// Data for the signup form's second step
export type ProfileData = Omit<UserProfile, 'id' | 'email' | 'username' | 'is_active' | 'created_at'>;

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  totalPrompts: number;
  totalLikes: number;
  login: (email: string, pass: string) => Promise<void>;
  signupAndCreateProfile: (email: string, pass:string, profileData: ProfileData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [promptsCountResponse, totalLikesResponse] = await Promise.all([
          fetch(`${API_URL}/stats/prompts/count`),
          fetch(`${API_URL}/stats/prompts/total-likes`),
        ]);

        if (!promptsCountResponse.ok || !totalLikesResponse.ok) {
          throw new Error("Failed to fetch statistics");
        }

        const promptsCount = await promptsCountResponse.json();
        const totalLikesCount = await totalLikesResponse.json();

        setTotalPrompts(promptsCount);
        setTotalLikes(totalLikesCount);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    }
    fetchStats();
  }, []);

  // --- Helper function to get user profile after login ---
  const fetchUserProfile = async (authToken: string) => {
    // This endpoint needs to be created on the backend
    // It should take a token and return the user's profile
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile.");
    }
    const profile: UserProfile = await response.json();
    setUser(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };


  // [Login Persistence] Fetch user profile if a token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          await fetchUserProfile(token);
        } catch (error) {
          console.error(error);
          logout(); // If token is invalid, logout
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    setLoading(true);

    const response = await fetch(`${API_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: pass }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        setLoading(false);
        throw new Error(errorData.detail || "Login failed.");
    }

    const data = await response.json();
    const newToken = data.access_token;
    
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    
    // After getting the token, fetch the full user profile
    await fetchUserProfile(newToken);

    setLoading(false);
  };

  const signupAndCreateProfile = async (email: string, pass: string, profileData: ProfileData) => {
    setLoading(true);

    const signupPayload = {
      username: profileData.name, // Use name from profile as username
      email: email,
      password: pass,
      ...profileData
    };

    const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupPayload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        setLoading(false);
        throw new Error(errorData.detail || "Signup failed.");
    }

    // If signup is successful, log the user in automatically
    await login(email, pass);

    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
  };

  const value = {
    user,
    token,
    loading,
    totalPrompts,
    totalLikes,
    login,
    signupAndCreateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// A new endpoint /users/me needs to be added to the backend
// to get the current user's profile from a token.