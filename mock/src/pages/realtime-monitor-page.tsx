import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Cpu,
  Layers,
  Lightbulb,
  Radio,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Thermometer,
  Wifi,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { LineTrendChart } from '@/components/charts';
import { InteractiveMapCanvas, type MapPoint } from '@/components/interactive-map-canvas';
import { MetricBar, PageHeader, SectionCard, StatCard, StatusBadge } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projects, stations } from '@/data/mock-data';
import { cn } from '@/lib/utils';

// 预置厦门示范路段监控点位（精准贴合高崎空港枋钟路、翔安大桥跨海高架、翔安新机场航站区真实道路走向）
const STATION_MONITOR_POINTS: Record<string, MapPoint[]> = {
  '高崎空港互通示范站': [
    { id: 'DEV-00101', label: 'DEV-00101 (枋钟路主线#01)', lnglat: [118.135471, 24.530298], status: 'deployed', deviceId: 'DEV-00101', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-01', circuit: 'A回路-枋钟路主线', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00102', label: 'DEV-00102 (枋钟路主线#02)', lnglat: [118.136612, 24.531243], status: 'deployed', deviceId: 'DEV-00102', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-02', circuit: 'A回路-枋钟路主线', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00103', label: 'DEV-00103 (枋钟路主线#03)', lnglat: [118.13778, 24.532162], status: 'dimmed', deviceId: 'DEV-00103', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-03', circuit: 'A回路-枋钟路主线', power: 0.16, voltage: 220.6, temperature: 32.5, dimming: 51 },
    { id: 'DEV-00104', label: 'DEV-00104 (枋钟路主线#04)', lnglat: [118.13898, 24.533041], status: 'deployed', deviceId: 'DEV-00104', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-04', circuit: 'A回路-枋钟路主线', power: 0.24, voltage: 221.0, temperature: 35.4, dimming: 85 },
    { id: 'DEV-00105', label: 'DEV-00105 (枋钟路主线#05)', lnglat: [118.14028, 24.533796], status: 'deployed', deviceId: 'DEV-00105', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-05', circuit: 'A回路-枋钟路主线', power: 0.18, voltage: 221.4, temperature: 33.0, dimming: 90 },
    { id: 'DEV-00106', label: 'DEV-00106 (枋钟路主线#06)', lnglat: [118.141687, 24.53437], status: 'warning', deviceId: 'DEV-00106', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-06', circuit: 'A回路-枋钟路主线', power: 0.28, voltage: 238.5, temperature: 48.6, dimming: 100 },
    { id: 'DEV-00107', label: 'DEV-00107 (枋钟路主线#07)', lnglat: [118.143147, 24.534824], status: 'deployed', deviceId: 'DEV-00107', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-07', circuit: 'A回路-枋钟路主线', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00108', label: 'DEV-00108 (枋钟路主线#08)', lnglat: [118.144612, 24.535267], status: 'dimmed', deviceId: 'DEV-00108', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-08', circuit: 'A回路-枋钟路主线', power: 0.18, voltage: 220.6, temperature: 32.5, dimming: 66 },
    { id: 'DEV-00109', label: 'DEV-00109 (枋钟路主线#09)', lnglat: [118.14605, 24.535778], status: 'deployed', deviceId: 'DEV-00109', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-09', circuit: 'B回路-枋钟路主线', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00110', label: 'DEV-00110 (枋钟路主线#10)', lnglat: [118.147499, 24.536262], status: 'deployed', deviceId: 'DEV-00110', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-10', circuit: 'B回路-枋钟路主线', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00111', label: 'DEV-00111 (枋钟路主线#11)', lnglat: [118.14894, 24.536764], status: 'dimmed', deviceId: 'DEV-00111', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-11', circuit: 'B回路-枋钟路主线', power: 0.16, voltage: 220.6, temperature: 32.5, dimming: 50 },
    { id: 'DEV-00112', label: 'DEV-00112 (枋钟路主线#12)', lnglat: [118.150383, 24.537264], status: 'deployed', deviceId: 'DEV-00112', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-12', circuit: 'B回路-枋钟路主线', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00113', label: 'DEV-00113 (枋钟路主线#13)', lnglat: [118.151811, 24.537792], status: 'deployed', deviceId: 'DEV-00113', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-13', circuit: 'B回路-枋钟路主线', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00114', label: 'DEV-00114 (枋钟路主线#14)', lnglat: [118.153153, 24.538483], status: 'deployed', deviceId: 'DEV-00114', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-14', circuit: 'B回路-枋钟路主线', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00115', label: 'DEV-00115 (枋钟路主线#15)', lnglat: [118.154353, 24.539365], status: 'deployed', deviceId: 'DEV-00115', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-15', circuit: 'B回路-枋钟路主线', power: 0.22, voltage: 221.8, temperature: 34.6, dimming: 95 },
    { id: 'DEV-00116', label: 'DEV-00116 (枋钟路主线#16)', lnglat: [118.155488, 24.540317], status: 'offline', deviceId: 'DEV-00116', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-16', circuit: 'B回路-枋钟路主线', power: 0.0, voltage: 0.0, temperature: 21.4, dimming: 0 },
  ],
  '翔安大桥跨海示范段': [
    { id: 'DEV-00201', label: 'DEV-00201 (翔安大桥#01)', lnglat: [118.16945, 24.55188], status: 'deployed', deviceId: 'DEV-00201', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-01', circuit: 'A回路-翔安大桥', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00202', label: 'DEV-00202 (翔安大桥#02)', lnglat: [118.170833, 24.552994], status: 'deployed', deviceId: 'DEV-00202', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-02', circuit: 'A回路-翔安大桥', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00203', label: 'DEV-00203 (翔安大桥#03)', lnglat: [118.172216, 24.554108], status: 'dimmed', deviceId: 'DEV-00203', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-03', circuit: 'A回路-翔安大桥', power: 0.16, voltage: 220.6, temperature: 32.5, dimming: 51 },
    { id: 'DEV-00204', label: 'DEV-00204 (翔安大桥#04)', lnglat: [118.173599, 24.555221], status: 'deployed', deviceId: 'DEV-00204', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-04', circuit: 'A回路-翔安大桥', power: 0.24, voltage: 221.0, temperature: 35.4, dimming: 85 },
    { id: 'DEV-00205', label: 'DEV-00205 (翔安大桥#05)', lnglat: [118.174982, 24.556335], status: 'deployed', deviceId: 'DEV-00205', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-05', circuit: 'A回路-翔安大桥', power: 0.18, voltage: 221.4, temperature: 33.0, dimming: 90 },
    { id: 'DEV-00206', label: 'DEV-00206 (翔安大桥#06)', lnglat: [118.176365, 24.557449], status: 'warning', deviceId: 'DEV-00206', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-06', circuit: 'A回路-翔安大桥', power: 0.28, voltage: 238.5, temperature: 48.6, dimming: 100 },
    { id: 'DEV-00207', label: 'DEV-00207 (翔安大桥#07)', lnglat: [118.177736, 24.558575], status: 'deployed', deviceId: 'DEV-00207', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-07', circuit: 'A回路-翔安大桥', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00208', label: 'DEV-00208 (翔安大桥#08)', lnglat: [118.179101, 24.559707], status: 'dimmed', deviceId: 'DEV-00208', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-08', circuit: 'A回路-翔安大桥', power: 0.18, voltage: 220.6, temperature: 32.5, dimming: 66 },
    { id: 'DEV-00209', label: 'DEV-00209 (翔安大桥#09)', lnglat: [118.180472, 24.560833], status: 'deployed', deviceId: 'DEV-00209', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-09', circuit: 'A回路-翔安大桥', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00210', label: 'DEV-00210 (翔安大桥#10)', lnglat: [118.181881, 24.56192], status: 'deployed', deviceId: 'DEV-00210', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-10', circuit: 'B回路-翔安大桥', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00211', label: 'DEV-00211 (翔安大桥#11)', lnglat: [118.18329, 24.563007], status: 'dimmed', deviceId: 'DEV-00211', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-11', circuit: 'B回路-翔安大桥', power: 0.16, voltage: 220.6, temperature: 32.5, dimming: 50 },
    { id: 'DEV-00212', label: 'DEV-00212 (翔安大桥#12)', lnglat: [118.184731, 24.564057], status: 'deployed', deviceId: 'DEV-00212', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-12', circuit: 'B回路-翔安大桥', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00213', label: 'DEV-00213 (翔安大桥#13)', lnglat: [118.18619, 24.565087], status: 'deployed', deviceId: 'DEV-00213', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-13', circuit: 'B回路-翔安大桥', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00214', label: 'DEV-00214 (翔安大桥#14)', lnglat: [118.187686, 24.56607], status: 'deployed', deviceId: 'DEV-00214', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-14', circuit: 'B回路-翔安大桥', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00215', label: 'DEV-00215 (翔安大桥#15)', lnglat: [118.189263, 24.566946], status: 'deployed', deviceId: 'DEV-00215', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-15', circuit: 'B回路-翔安大桥', power: 0.22, voltage: 221.8, temperature: 34.6, dimming: 95 },
    { id: 'DEV-00216', label: 'DEV-00216 (翔安大桥#16)', lnglat: [118.190845, 24.567806], status: 'deployed', deviceId: 'DEV-00216', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-16', circuit: 'B回路-翔安大桥', power: 0.24, voltage: 221.0, temperature: 35.4, dimming: 85 },
    { id: 'DEV-00217', label: 'DEV-00217 (翔安大桥#17)', lnglat: [118.192673, 24.568053], status: 'deployed', deviceId: 'DEV-00217', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-17', circuit: 'B回路-翔安大桥', power: 0.18, voltage: 221.4, temperature: 33.0, dimming: 90 },
    { id: 'DEV-00218', label: 'DEV-00218 (翔安大桥#18)', lnglat: [118.1945, 24.5683], status: 'offline', deviceId: 'DEV-00218', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-18', circuit: 'B回路-翔安大桥', power: 0.0, voltage: 0.0, temperature: 21.4, dimming: 0 },
  ],
  '环岛南路示范段': [
    { id: 'DEV-00401', label: 'DEV-00401 (环岛南路#01)', lnglat: [118.12567, 24.42441], status: 'deployed', deviceId: 'DEV-00401', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-01', circuit: 'A回路-环岛南路', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00402', label: 'DEV-00402 (环岛南路#02)', lnglat: [118.126617, 24.42425], status: 'deployed', deviceId: 'DEV-00402', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-02', circuit: 'A回路-环岛南路', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00403', label: 'DEV-00403 (环岛南路#03)', lnglat: [118.127565, 24.4241], status: 'dimmed', deviceId: 'DEV-00403', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-03', circuit: 'A回路-环岛南路', power: 0.16, voltage: 220.6, temperature: 32.5, dimming: 51 },
    { id: 'DEV-00404', label: 'DEV-00404 (环岛南路#04)', lnglat: [118.128528, 24.424105], status: 'deployed', deviceId: 'DEV-00404', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-04', circuit: 'A回路-环岛南路', power: 0.24, voltage: 221.0, temperature: 35.4, dimming: 85 },
    { id: 'DEV-00405', label: 'DEV-00405 (环岛南路#05)', lnglat: [118.129491, 24.42411], status: 'deployed', deviceId: 'DEV-00405', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-05', circuit: 'A回路-环岛南路', power: 0.18, voltage: 221.4, temperature: 33.0, dimming: 90 },
    { id: 'DEV-00406', label: 'DEV-00406 (环岛南路#06)', lnglat: [118.130448, 24.42401], status: 'warning', deviceId: 'DEV-00406', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-06', circuit: 'A回路-环岛南路', power: 0.28, voltage: 238.5, temperature: 48.6, dimming: 100 },
    { id: 'DEV-00407', label: 'DEV-00407 (环岛南路#07)', lnglat: [118.131404, 24.42391], status: 'deployed', deviceId: 'DEV-00407', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-07', circuit: 'A回路-环岛南路', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00408', label: 'DEV-00408 (环岛南路#08)', lnglat: [118.132301, 24.423599], status: 'dimmed', deviceId: 'DEV-00408', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-08', circuit: 'B回路-环岛南路', power: 0.18, voltage: 220.6, temperature: 32.5, dimming: 66 },
    { id: 'DEV-00409', label: 'DEV-00409 (环岛南路#09)', lnglat: [118.133192, 24.423266], status: 'deployed', deviceId: 'DEV-00409', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-09', circuit: 'B回路-环岛南路', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00410', label: 'DEV-00410 (环岛南路#10)', lnglat: [118.134112, 24.423012], status: 'deployed', deviceId: 'DEV-00410', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-10', circuit: 'B回路-环岛南路', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00411', label: 'DEV-00411 (环岛南路#11)', lnglat: [118.135046, 24.422802], status: 'dimmed', deviceId: 'DEV-00411', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-11', circuit: 'B回路-环岛南路', power: 0.16, voltage: 220.6, temperature: 32.5, dimming: 50 },
    { id: 'DEV-00412', label: 'DEV-00412 (环岛南路#12)', lnglat: [118.135978, 24.42282], status: 'deployed', deviceId: 'DEV-00412', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-12', circuit: 'B回路-环岛南路', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00413', label: 'DEV-00413 (环岛南路#13)', lnglat: [118.136907, 24.423052], status: 'deployed', deviceId: 'DEV-00413', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-13', circuit: 'B回路-环岛南路', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00414', label: 'DEV-00414 (环岛南路#14)', lnglat: [118.137771, 24.423399], status: 'deployed', deviceId: 'DEV-00414', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-14', circuit: 'B回路-环岛南路', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00415', label: 'DEV-00415 (环岛南路#15)', lnglat: [118.13852, 24.42395], status: 'offline', deviceId: 'DEV-00415', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-15', circuit: 'B回路-环岛南路', power: 0.0, voltage: 0.0, temperature: 21.4, dimming: 0 },
  ],
  '演武大桥桥面': [
    { id: 'DEV-00501', label: 'DEV-00501 (演武大桥#01)', lnglat: [118.092128, 24.432302], status: 'deployed', deviceId: 'DEV-00501', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-01', circuit: 'A回路-演武大桥', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00502', label: 'DEV-00502 (演武大桥#02)', lnglat: [118.090889, 24.432738], status: 'deployed', deviceId: 'DEV-00502', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-02', circuit: 'A回路-演武大桥', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00503', label: 'DEV-00503 (演武大桥#03)', lnglat: [118.089782, 24.433411], status: 'dimmed', deviceId: 'DEV-00503', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-03', circuit: 'A回路-演武大桥', power: 0.16, voltage: 220.6, temperature: 32.5, dimming: 51 },
    { id: 'DEV-00504', label: 'DEV-00504 (演武大桥#04)', lnglat: [118.088825, 24.434253], status: 'deployed', deviceId: 'DEV-00504', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-04', circuit: 'A回路-演武大桥', power: 0.24, voltage: 221.0, temperature: 35.4, dimming: 85 },
    { id: 'DEV-00505', label: 'DEV-00505 (演武大桥#05)', lnglat: [118.087895, 24.435122], status: 'deployed', deviceId: 'DEV-00505', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-05', circuit: 'A回路-演武大桥', power: 0.18, voltage: 221.4, temperature: 33.0, dimming: 90 },
    { id: 'DEV-00506', label: 'DEV-00506 (演武大桥#06)', lnglat: [118.086978, 24.436003], status: 'warning', deviceId: 'DEV-00506', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-06', circuit: 'A回路-演武大桥', power: 0.28, voltage: 238.5, temperature: 48.6, dimming: 100 },
    { id: 'DEV-00507', label: 'DEV-00507 (演武大桥#07)', lnglat: [118.086078, 24.436898], status: 'deployed', deviceId: 'DEV-00507', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-07', circuit: 'A回路-演武大桥', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00508', label: 'DEV-00508 (演武大桥#08)', lnglat: [118.085224, 24.437828], status: 'dimmed', deviceId: 'DEV-00508', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-08', circuit: 'B回路-演武大桥', power: 0.18, voltage: 220.6, temperature: 32.5, dimming: 66 },
    { id: 'DEV-00509', label: 'DEV-00509 (演武大桥#09)', lnglat: [118.084525, 24.438859], status: 'deployed', deviceId: 'DEV-00509', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-09', circuit: 'B回路-演武大桥', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00510', label: 'DEV-00510 (演武大桥#10)', lnglat: [118.083956, 24.439957], status: 'deployed', deviceId: 'DEV-00510', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-10', circuit: 'B回路-演武大桥', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00511', label: 'DEV-00511 (演武大桥#11)', lnglat: [118.083387, 24.441054], status: 'dimmed', deviceId: 'DEV-00511', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-11', circuit: 'B回路-演武大桥', power: 0.16, voltage: 220.6, temperature: 32.5, dimming: 50 },
    { id: 'DEV-00512', label: 'DEV-00512 (演武大桥#12)', lnglat: [118.082818, 24.442152], status: 'deployed', deviceId: 'DEV-00512', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-12', circuit: 'B回路-演武大桥', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00513', label: 'DEV-00513 (演武大桥#13)', lnglat: [118.082248, 24.443249], status: 'deployed', deviceId: 'DEV-00513', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-13', circuit: 'B回路-演武大桥', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00514', label: 'DEV-00514 (演武大桥#14)', lnglat: [118.081655, 24.444336], status: 'offline', deviceId: 'DEV-00514', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-14', circuit: 'B回路-演武大桥', power: 0.0, voltage: 0.0, temperature: 21.4, dimming: 0 },
  ],
  '翔安新机场综合枢纽站': [
    { id: 'DEV-00701', label: 'DEV-00701 (机场快速路#01)', lnglat: [118.3482, 24.5471], status: 'deployed', deviceId: 'DEV-00701', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-01', circuit: 'A回路-机场快速路', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00702', label: 'DEV-00702 (机场快速路#02)', lnglat: [118.349478, 24.546759], status: 'deployed', deviceId: 'DEV-00702', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-02', circuit: 'A回路-机场快速路', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00703', label: 'DEV-00703 (机场快速路#03)', lnglat: [118.350756, 24.546419], status: 'dimmed', deviceId: 'DEV-00703', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-03', circuit: 'A回路-机场快速路', power: 0.16, voltage: 220.6, temperature: 32.5, dimming: 51 },
    { id: 'DEV-00704', label: 'DEV-00704 (机场快速路#04)', lnglat: [118.352005, 24.546005], status: 'deployed', deviceId: 'DEV-00704', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-04', circuit: 'A回路-机场快速路', power: 0.24, voltage: 221.0, temperature: 35.4, dimming: 85 },
    { id: 'DEV-00705', label: 'DEV-00705 (机场快速路#05)', lnglat: [118.35324, 24.545552], status: 'deployed', deviceId: 'DEV-00705', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-05', circuit: 'A回路-机场快速路', power: 0.18, voltage: 221.4, temperature: 33.0, dimming: 90 },
    { id: 'DEV-00706', label: 'DEV-00706 (机场快速路#06)', lnglat: [118.354475, 24.545099], status: 'warning', deviceId: 'DEV-00706', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-06', circuit: 'A回路-机场快速路', power: 0.28, voltage: 238.5, temperature: 48.6, dimming: 100 },
    { id: 'DEV-00707', label: 'DEV-00707 (机场快速路#07)', lnglat: [118.35571, 24.544646], status: 'deployed', deviceId: 'DEV-00707', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-07', circuit: 'A回路-机场快速路', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00708', label: 'DEV-00708 (机场快速路#08)', lnglat: [118.356945, 24.544193], status: 'dimmed', deviceId: 'DEV-00708', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-08', circuit: 'A回路-机场快速路', power: 0.18, voltage: 220.6, temperature: 32.5, dimming: 66 },
    { id: 'DEV-00709', label: 'DEV-00709 (机场快速路#09)', lnglat: [118.358204, 24.543799], status: 'deployed', deviceId: 'DEV-00709', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-09', circuit: 'B回路-机场快速路', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00710', label: 'DEV-00710 (机场快速路#10)', lnglat: [118.359468, 24.543419], status: 'deployed', deviceId: 'DEV-00710', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-10', circuit: 'B回路-机场快速路', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00711', label: 'DEV-00711 (机场快速路#11)', lnglat: [118.360732, 24.543039], status: 'dimmed', deviceId: 'DEV-00711', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-11', circuit: 'B回路-机场快速路', power: 0.16, voltage: 220.6, temperature: 32.5, dimming: 50 },
    { id: 'DEV-00712', label: 'DEV-00712 (机场快速路#12)', lnglat: [118.361996, 24.542656], status: 'deployed', deviceId: 'DEV-00712', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-12', circuit: 'B回路-机场快速路', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00713', label: 'DEV-00713 (机场快速路#13)', lnglat: [118.363259, 24.542273], status: 'deployed', deviceId: 'DEV-00713', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-13', circuit: 'B回路-机场快速路', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00714', label: 'DEV-00714 (机场快速路#14)', lnglat: [118.364508, 24.541854], status: 'deployed', deviceId: 'DEV-00714', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-14', circuit: 'B回路-机场快速路', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00715', label: 'DEV-00715 (机场快速路#15)', lnglat: [118.365754, 24.541427], status: 'deployed', deviceId: 'DEV-00715', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-15', circuit: 'B回路-机场快速路', power: 0.22, voltage: 221.8, temperature: 34.6, dimming: 95 },
    { id: 'DEV-00716', label: 'DEV-00716 (机场快速路#16)', lnglat: [118.367, 24.541], status: 'offline', deviceId: 'DEV-00716', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-16', circuit: 'B回路-机场快速路', power: 0.0, voltage: 0.0, temperature: 21.4, dimming: 0 },
  ],
};

const MONITOR_POINTS: MapPoint[] = STATION_MONITOR_POINTS['高崎空港互通示范站'];

export function RealtimeMonitorPage() {
  const [selectedProject, setSelectedProject] = useState(projects[0]?.name ?? '厦门智慧照明示范项目');
  const projectStations = useMemo(() => stations.filter((st) => st.project === selectedProject), [selectedProject]);
  const [selectedStation, setSelectedStation] = useState(projectStations[0]?.name ?? '高崎空港互通示范站');

  const currentStation = useMemo(() => {
    return stations.find((s) => s.name === selectedStation) || projectStations[0] || stations[0];
  }, [selectedStation, projectStations]);

  const [points, setPoints] = useState<MapPoint[]>(MONITOR_POINTS);
  const [selectedPointId, setSelectedPointId] = useState<string>(MONITOR_POINTS[0].id);

  // 选中的灯杆设备
  const activePoint = useMemo(() => {
    return points.find((p) => p.id === selectedPointId) ?? points[0];
  }, [points, selectedPointId]);

  // 当前调光滑块状态
  const [dimmingValue, setDimmingValue] = useState<number>(activePoint.dimming ?? 85);

  const handleStationChange = (stName: string) => {
    setSelectedStation(stName);
    const matched = STATION_MONITOR_POINTS[stName];
    if (matched && matched.length > 0) {
      setPoints(matched);
      setSelectedPointId(matched[0].id);
      setDimmingValue(matched[0].dimming ?? 85);
    } else {
      const st = stations.find((s) => s.name === stName);
      const baseLng = st?.lnglat?.[0] ?? 118.1355;
      const baseLat = st?.lnglat?.[1] ?? 24.5386;
      const fallbackList: MapPoint[] = [
        { id: `DEV-${stName}-01`, label: `${stName} 01#`, lnglat: [baseLng, baseLat], status: 'deployed', dimming: 85, power: 0.18, voltage: 220.0, temperature: 34.0 },
      ];
      setPoints(fallbackList);
      setSelectedPointId(fallbackList[0].id);
      setDimmingValue(85);
    }
  };

  const handleProjectChange = (projName: string) => {
    setSelectedProject(projName);
    const related = stations.filter((st) => st.project === projName);
    const firstStation = related[0]?.name ?? '';
    handleStationChange(firstStation);
  };

  // 监听选中节点切换
  const handleSelectPoint = (point: MapPoint) => {
    setSelectedPointId(point.id);
    setDimmingValue(point.dimming ?? 85);
  };

  // 下发调光指令
  const handleApplyDimming = () => {
    setPoints((prev) =>
      prev.map((p) => (p.id === activePoint.id ? { ...p, dimming: dimmingValue, status: dimmingValue > 0 ? (dimmingValue < 70 ? 'dimmed' : 'deployed') : 'offline' } : p))
    );
    toast.success(`调光指令已下发！设备 [${activePoint.id}] 目标亮度调整为 ${dimmingValue}%`);
  };

  // 刷新遥测
  const handleRefresh = () => {
    toast.success('全网遥测数据已成功同步！');
  };

  // 生成折线图模拟遥测波形
  const telemetryData = useMemo(() => {
    const basePower = (activePoint.power ?? 0.18) * 100;
    return [
      { label: '10:00', value: Math.round(basePower * 0.95) },
      { label: '10:10', value: Math.round(basePower * 0.98) },
      { label: '10:20', value: Math.round(basePower * 1.02) },
      { label: '10:30', value: Math.round(basePower * 1.0) },
      { label: '10:40', value: Math.round(basePower * 0.96) },
      { label: '10:50', value: Math.round(basePower * 1.04) },
      { label: '11:00', value: Math.round(basePower * 1.01) },
    ];
  }, [activePoint]);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="监控与控制 / 实时监控"
        title="设备实时监控与电子地图"
        description="基于路网电子地图全景呈现路灯运行工况，支持滚轮缩放、拖拽浏览，点击任意灯杆点位即时调取遥测曲线与调光控制。"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="h-8 gap-1.5 text-xs">
              <RefreshCw className="size-3.5" />刷新遥测
            </Button>
          </div>
        }
      />

      {/* 顶部指标卡片 */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="全网在线设备" value="5,411" unit="台" trend={0.12} trendLabel="近 5 分钟" icon={Wifi} tone="green" />
        <StatCard label="实时负载总功率" value="184.6" unit="kW" trendLabel="负载率 57.6%" icon={Zap} tone="blue" />
        <StatCard label="平均运行温度" value="34.6" unit="°C" trend={1.2} trendLabel="较昨日同时段" icon={Thermometer} tone="amber" />
        <StatCard label="告警异常点位" value="1" unit="处" trendLabel="DEV-0104 过温 48.9°C" icon={AlertTriangle} tone="cyan" />
      </div>

      {/* 核心分栏：左侧交互地图 + 右侧单灯遥测与控制 */}
      <div className="grid gap-4 lg:grid-cols-[1fr_390px]">
        {/* 左侧：可缩放拖拽的监控电子地图 */}
        <section className="app-surface rounded-2xl p-4 border border-border flex flex-col min-h-[580px]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-foreground">
                {selectedStation} · 实时运行地图
              </h2>
              <div className="flex items-center gap-1.5 ml-2">
                <Select value={selectedProject} onValueChange={handleProjectChange}>
                  <SelectTrigger className="h-7 text-xs w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.name} className="text-xs">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStation} onValueChange={handleStationChange}>
                  <SelectTrigger className="h-7 text-xs w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStations.map((st) => (
                      <SelectItem key={st.id} value={st.name} className="text-xs">{st.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              提示：高德 3D 真实地图联动 · 滚轮缩放 · 鼠标拖拽平移 · 点击地图路灯点位即时调取遥测
            </p>
          </div>

          <div className="flex-1 min-h-[480px]">
            <InteractiveMapCanvas
              points={points}
              selectedPointId={selectedPointId}
              stationName={selectedStation}
              roadName={currentStation?.road || '主干道路段'}
              centerLnglat={currentStation?.lnglat || [118.142341, 24.529872]}
              zoom={16.5}
              onPointClick={handleSelectPoint}
              className="h-full min-h-[480px]"
                            legend={
                <div className="rounded-xl border border-white/10 bg-slate-900/85 p-2.5 text-[10px] text-slate-300 backdrop-blur space-y-1 shadow-xl">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1">
                    <Layers className="size-3 text-brand-400" />工况图例
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    <span>正常照明运行 (100%~70%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-400" />
                    <span>策略调光节能 (&lt;70%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>故障告警节点 (超温/通信)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-slate-500" />
                    <span>白天熄灯 / 设备离线</span>
                  </div>
                </div>
              }
            />
          </div>
        </section>

        {/* 右侧：当前选中灯杆的遥测与快捷调光控制 */}
        <section className="app-surface rounded-2xl p-4 border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* 节点头部与状态 */}
            <div className="border-b border-border/80 pb-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-foreground">{activePoint.id}</span>
                <StatusBadge
                  status={
                    activePoint.status === 'warning'
                      ? '主要告警'
                      : activePoint.status === 'offline'
                      ? '离线'
                      : '正常运行'
                  }
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{activePoint.label}</p>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                <Badge variant="outline" className="text-[9px] bg-muted">{activePoint.deviceType}</Badge>
                <span>回路: {activePoint.circuit}</span>
              </div>
            </div>

            {/* 四项核心遥测指标 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-border bg-muted/30 p-2.5">
                <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                  <span>实时功率</span>
                  <Zap className="size-3 text-brand-600" />
                </div>
                <p className="mt-1 font-mono text-base font-semibold text-foreground">{activePoint.power} kW</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-2.5">
                <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                  <span>工作电压</span>
                  <Activity className="size-3 text-sky-600" />
                </div>
                <p className="mt-1 font-mono text-base font-semibold text-foreground">{activePoint.voltage} V</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-2.5">
                <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                  <span>工作温度</span>
                  <Thermometer className="size-3 text-amber-500" />
                </div>
                <p
                  className={cn(
                    'mt-1 font-mono text-base font-semibold',
                    (activePoint.temperature ?? 0) > 45 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
                  )}
                >
                  {activePoint.temperature} °C
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-2.5">
                <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                  <span>当前亮度</span>
                  <BatteryCharging className="size-3 text-emerald-600" />
                </div>
                <p className="mt-1 font-mono text-base font-semibold text-foreground">{activePoint.dimming}%</p>
              </div>
            </div>

            {/* 负载率进度条 */}
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>负载率</span>
                <span className="font-mono">{activePoint.dimming}%</span>
              </div>
              <MetricBar value={activePoint.dimming ?? 0} />
            </div>

            {/* 实时功率波动趋势图 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-foreground">实时功率走势 (近1小时)</span>
                <span className="font-mono text-[9px] text-muted-foreground">瓦特 (W)</span>
              </div>
              <div className="rounded-xl border border-border/80 bg-background/50 p-2">
                <LineTrendChart points={telemetryData} height={120} />
              </div>
            </div>
          </div>

          {/* 底部快捷调光控制 */}
          <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sliders className="size-3.5 text-brand-600" />
                单灯亮度调光
              </span>
              <span className="font-mono text-xs font-bold text-brand-600">{dimmingValue}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={dimmingValue}
              onChange={(e) => setDimmingValue(Number(e.target.value))}
              className="w-full accent-brand-600 h-2 bg-muted rounded-lg cursor-pointer"
            />

            <div className="flex gap-1.5">
              {[0, 30, 60, 85, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDimmingValue(preset)}
                  className={cn(
                    'flex-1 rounded-md py-1 text-[10px] font-mono border transition-colors',
                    dimmingValue === preset
                      ? 'border-brand-500 bg-brand-600 text-white font-medium'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  {preset}%
                </button>
              ))}
            </div>

            <Button
              size="sm"
              onClick={handleApplyDimming}
              className="w-full bg-brand-600 text-white hover:bg-brand-700 text-xs shadow-sm h-8"
            >
              <Sparkles className="mr-1.5 size-3.5" />
              立即下发调光策略
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
