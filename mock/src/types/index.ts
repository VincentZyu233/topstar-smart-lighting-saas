import type { LucideIcon } from 'lucide-react';

export type ThemeMode = 'dark' | 'light';

export interface AuthSession {
  username: string;
  authenticatedAt: number;
}

export interface NavItem {
  id: string;
  label: string;
  path?: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export type TableValue = string | number;
export type TableRowData = Record<string, TableValue>;

export interface TableColumnConfig {
  key: string;
  label: string;
  format?: 'text' | 'status' | 'mono' | 'number' | 'progress';
  width?: string;
}

export interface TableFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'textarea';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface Project {
  id: string;
  name: string;
  city: string;
  owner: string;
  stations: number;
  devices: number;
  onlineRate: number;
  status: string;
  updatedAt: string;
}

export interface Station {
  id: string;
  name: string;
  project: string;
  address: string;
  devices: number;
  onlineRate: number;
  manager: string;
  status: string;
  lnglat?: [number, number];
  road?: string;
}

export interface DeviceType {
  id: string;
  name: string;
  category: string;
  protocol: string;
  powerRange: string;
  deviceCount: number;
  status: string;
}

export interface DeviceModel {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  protocol: string;
  firmware: string;
  status: string;
}

export interface Device {
  id: string;
  name: string;
  project: string;
  station: string;
  type: string;
  model: string;
  status: string;
  protocol: string;
  dimming: number;
  power: number;
  voltage: number;
  current: number;
  temperature: number;
  lastSeen: string;
}

export interface Deployment {
  id: string;
  deviceId: string;
  project: string;
  station: string;
  circuit: string;
  deployedAt: string;
  operator: string;
  status: string;
}

export interface Department {
  id: string;
  name: string;
  leader: string;
  members: number;
  parent: string;
  updatedAt: string;
  status: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  users: number;
  scope: string;
  permissions: string;
  status: string;
}

export interface UserAccount {
  id: string;
  name: string;
  account: string;
  department: string;
  role: string;
  phone: string;
  lastLogin: string;
  status: string;
}

export interface AlertRecord {
  id: string;
  level: '紧急' | '主要' | '次要';
  title: string;
  device: string;
  location: string;
  time: string;
  status: '待处理' | '处理中' | '已恢复';
}

export interface ReportPoint {
  label: string;
  energy: number;
  savings: number;
}
