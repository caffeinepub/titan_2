const REGISTRATION_KEY = "titanUserId";
const REGISTRATION_DATA_KEY = "titanUserData";

export interface RegistrationData {
  username: string;
  age: number;
  gmail: string;
  principalId: string;
}

export function isRegistered(): boolean {
  return !!localStorage.getItem(REGISTRATION_KEY);
}

export function getRegistrationId(): string | null {
  return localStorage.getItem(REGISTRATION_KEY);
}

export function setRegistrationId(id: string): void {
  localStorage.setItem(REGISTRATION_KEY, id);
}

export function setRegistrationData(data: RegistrationData): void {
  localStorage.setItem(REGISTRATION_DATA_KEY, JSON.stringify(data));
}

export function getRegistrationData(): RegistrationData | null {
  const raw = localStorage.getItem(REGISTRATION_DATA_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RegistrationData;
  } catch {
    return null;
  }
}
