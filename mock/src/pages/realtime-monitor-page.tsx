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
    { id: 'DEV-00101', label: 'DEV-00101 (枋钟路主线#01)', lnglat: [118.143656, 24.534977], status: 'deployed', deviceId: 'DEV-00101', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-01', circuit: 'A回路-枋钟路主线', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00102', label: 'DEV-00102 (枋钟路主线#02)', lnglat: [118.143797, 24.535019], status: 'deployed', deviceId: 'DEV-00102', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-02', circuit: 'A回路-枋钟路主线', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00103', label: 'DEV-00103 (枋钟路主线#03)', lnglat: [118.143938, 24.535061], status: 'deployed', deviceId: 'DEV-00103', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-03', circuit: 'A回路-枋钟路主线', power: 0.22, voltage: 221.8, temperature: 34.6, dimming: 95 },
    { id: 'DEV-00104', label: 'DEV-00104 (枋钟路主线#04)', lnglat: [118.144079, 24.535103], status: 'dimmed', deviceId: 'DEV-00104', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-04', circuit: 'A回路-枋钟路主线', power: 0.17, voltage: 220.8, temperature: 32.8, dimming: 56 },
    { id: 'DEV-00105', label: 'DEV-00105 (枋钟路主线#05)', lnglat: [118.14422, 24.535145], status: 'deployed', deviceId: 'DEV-00105', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-05', circuit: 'A回路-枋钟路主线', power: 0.18, voltage: 221.4, temperature: 33.0, dimming: 90 },
    { id: 'DEV-00106', label: 'DEV-00106 (枋钟路主线#06)', lnglat: [118.144361, 24.535187], status: 'deployed', deviceId: 'DEV-00106', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-06', circuit: 'A回路-枋钟路主线', power: 0.2, voltage: 221.8, temperature: 33.8, dimming: 95 },
    { id: 'DEV-00107', label: 'DEV-00107 (枋钟路主线#07)', lnglat: [118.144502, 24.53523], status: 'deployed', deviceId: 'DEV-00107', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-07', circuit: 'A回路-枋钟路主线', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00108', label: 'DEV-00108 (枋钟路主线#08)', lnglat: [118.14464, 24.535278], status: 'warning', deviceId: 'DEV-00108', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-08', circuit: 'A回路-枋钟路主线', power: 0.28, voltage: 238.5, temperature: 48.6, dimming: 100 },
    { id: 'DEV-00109', label: 'DEV-00109 (枋钟路主线#09)', lnglat: [118.144778, 24.535327], status: 'deployed', deviceId: 'DEV-00109', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-09', circuit: 'A回路-枋钟路主线', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00110', label: 'DEV-00110 (枋钟路主线#10)', lnglat: [118.144916, 24.535376], status: 'deployed', deviceId: 'DEV-00110', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-10', circuit: 'A回路-枋钟路主线', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00111', label: 'DEV-00111 (枋钟路主线#11)', lnglat: [118.145054, 24.535425], status: 'dimmed', deviceId: 'DEV-00111', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-11', circuit: 'A回路-枋钟路主线', power: 0.19, voltage: 220.8, temperature: 32.8, dimming: 70 },
    { id: 'DEV-00112', label: 'DEV-00112 (枋钟路主线#12)', lnglat: [118.145193, 24.535474], status: 'deployed', deviceId: 'DEV-00112', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-12', circuit: 'A回路-枋钟路主线', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00113', label: 'DEV-00113 (枋钟路主线#13)', lnglat: [118.145331, 24.535523], status: 'deployed', deviceId: 'DEV-00113', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-13', circuit: 'B回路-枋钟路主线', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00114', label: 'DEV-00114 (枋钟路主线#14)', lnglat: [118.145469, 24.535572], status: 'deployed', deviceId: 'DEV-00114', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-14', circuit: 'B回路-枋钟路主线', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00115', label: 'DEV-00115 (枋钟路主线#15)', lnglat: [118.145607, 24.535621], status: 'deployed', deviceId: 'DEV-00115', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-15', circuit: 'B回路-枋钟路主线', power: 0.22, voltage: 221.8, temperature: 34.6, dimming: 95 },
    { id: 'DEV-00116', label: 'DEV-00116 (枋钟路主线#16)', lnglat: [118.145745, 24.53567], status: 'deployed', deviceId: 'DEV-00116', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-16', circuit: 'B回路-枋钟路主线', power: 0.24, voltage: 221.0, temperature: 35.4, dimming: 85 },
    { id: 'DEV-00117', label: 'DEV-00117 (枋钟路主线#17)', lnglat: [118.145883, 24.535719], status: 'dimmed', deviceId: 'DEV-00117', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-17', circuit: 'B回路-枋钟路主线', power: 0.17, voltage: 220.8, temperature: 32.8, dimming: 57 },
    { id: 'DEV-00118', label: 'DEV-00118 (枋钟路主线#18)', lnglat: [118.146021, 24.535768], status: 'deployed', deviceId: 'DEV-00118', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-18', circuit: 'B回路-枋钟路主线', power: 0.2, voltage: 221.8, temperature: 33.8, dimming: 95 },
    { id: 'DEV-00119', label: 'DEV-00119 (枋钟路主线#19)', lnglat: [118.14616, 24.535817], status: 'deployed', deviceId: 'DEV-00119', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-19', circuit: 'B回路-枋钟路主线', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00120', label: 'DEV-00120 (枋钟路主线#20)', lnglat: [118.146298, 24.535866], status: 'deployed', deviceId: 'DEV-00120', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-20', circuit: 'B回路-枋钟路主线', power: 0.24, voltage: 221.4, temperature: 35.4, dimming: 90 },
    { id: 'DEV-00121', label: 'DEV-00121 (枋钟路主线#21)', lnglat: [118.146436, 24.535915], status: 'deployed', deviceId: 'DEV-00121', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-21', circuit: 'B回路-枋钟路主线', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00122', label: 'DEV-00122 (枋钟路主线#22)', lnglat: [118.146576, 24.535958], status: 'deployed', deviceId: 'DEV-00122', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-22', circuit: 'B回路-枋钟路主线', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00123', label: 'DEV-00123 (枋钟路主线#23)', lnglat: [118.146718, 24.535999], status: 'deployed', deviceId: 'DEV-00123', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-23', circuit: 'B回路-枋钟路主线', power: 0.22, voltage: 221.4, temperature: 34.6, dimming: 90 },
    { id: 'DEV-00124', label: 'DEV-00124 (枋钟路主线#24)', lnglat: [118.146859, 24.536039], status: 'deployed', deviceId: 'DEV-00124', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-24', circuit: 'B回路-枋钟路主线', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00125', label: 'DEV-00125 (枋钟路主线#25)', lnglat: [118.147, 24.536083], status: 'offline', deviceId: 'DEV-00125', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-25', circuit: 'B回路-枋钟路主线', power: 0.0, voltage: 0.0, temperature: 21.4, dimming: 0 },
  ],
  '翔安大桥跨海示范段': [
    { id: 'DEV-00201', label: 'DEV-00201 (翔安大桥#01)', lnglat: [118.178039, 24.558815], status: 'deployed', deviceId: 'DEV-00201', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-01', circuit: 'A回路-翔安大桥', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00202', label: 'DEV-00202 (翔安大桥#02)', lnglat: [118.17815, 24.558905], status: 'deployed', deviceId: 'DEV-00202', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-02', circuit: 'A回路-翔安大桥', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00203', label: 'DEV-00203 (翔安大桥#03)', lnglat: [118.17826, 24.558995], status: 'deployed', deviceId: 'DEV-00203', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-03', circuit: 'A回路-翔安大桥', power: 0.22, voltage: 221.8, temperature: 34.6, dimming: 95 },
    { id: 'DEV-00204', label: 'DEV-00204 (翔安大桥#04)', lnglat: [118.178371, 24.559085], status: 'dimmed', deviceId: 'DEV-00204', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-04', circuit: 'A回路-翔安大桥', power: 0.17, voltage: 220.8, temperature: 32.8, dimming: 56 },
    { id: 'DEV-00205', label: 'DEV-00205 (翔安大桥#05)', lnglat: [118.178482, 24.559174], status: 'deployed', deviceId: 'DEV-00205', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-05', circuit: 'A回路-翔安大桥', power: 0.18, voltage: 221.4, temperature: 33.0, dimming: 90 },
    { id: 'DEV-00206', label: 'DEV-00206 (翔安大桥#06)', lnglat: [118.178592, 24.559264], status: 'deployed', deviceId: 'DEV-00206', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-06', circuit: 'A回路-翔安大桥', power: 0.2, voltage: 221.8, temperature: 33.8, dimming: 95 },
    { id: 'DEV-00207', label: 'DEV-00207 (翔安大桥#07)', lnglat: [118.178703, 24.559354], status: 'deployed', deviceId: 'DEV-00207', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-07', circuit: 'A回路-翔安大桥', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00208', label: 'DEV-00208 (翔安大桥#08)', lnglat: [118.178814, 24.559444], status: 'warning', deviceId: 'DEV-00208', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-08', circuit: 'A回路-翔安大桥', power: 0.28, voltage: 238.5, temperature: 48.6, dimming: 100 },
    { id: 'DEV-00209', label: 'DEV-00209 (翔安大桥#09)', lnglat: [118.178925, 24.559533], status: 'deployed', deviceId: 'DEV-00209', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-09', circuit: 'A回路-翔安大桥', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00210', label: 'DEV-00210 (翔安大桥#10)', lnglat: [118.179035, 24.559623], status: 'deployed', deviceId: 'DEV-00210', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-10', circuit: 'A回路-翔安大桥', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00211', label: 'DEV-00211 (翔安大桥#11)', lnglat: [118.179146, 24.559713], status: 'dimmed', deviceId: 'DEV-00211', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-11', circuit: 'A回路-翔安大桥', power: 0.19, voltage: 220.8, temperature: 32.8, dimming: 70 },
    { id: 'DEV-00212', label: 'DEV-00212 (翔安大桥#12)', lnglat: [118.179257, 24.559803], status: 'deployed', deviceId: 'DEV-00212', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-12', circuit: 'A回路-翔安大桥', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00213', label: 'DEV-00213 (翔安大桥#13)', lnglat: [118.179367, 24.559892], status: 'deployed', deviceId: 'DEV-00213', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-13', circuit: 'B回路-翔安大桥', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00214', label: 'DEV-00214 (翔安大桥#14)', lnglat: [118.179478, 24.559982], status: 'deployed', deviceId: 'DEV-00214', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-14', circuit: 'B回路-翔安大桥', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00215', label: 'DEV-00215 (翔安大桥#15)', lnglat: [118.17959, 24.560071], status: 'deployed', deviceId: 'DEV-00215', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-15', circuit: 'B回路-翔安大桥', power: 0.22, voltage: 221.8, temperature: 34.6, dimming: 95 },
    { id: 'DEV-00216', label: 'DEV-00216 (翔安大桥#16)', lnglat: [118.179703, 24.560159], status: 'deployed', deviceId: 'DEV-00216', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-16', circuit: 'B回路-翔安大桥', power: 0.24, voltage: 221.0, temperature: 35.4, dimming: 85 },
    { id: 'DEV-00217', label: 'DEV-00217 (翔安大桥#17)', lnglat: [118.179815, 24.560247], status: 'dimmed', deviceId: 'DEV-00217', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-17', circuit: 'B回路-翔安大桥', power: 0.17, voltage: 220.8, temperature: 32.8, dimming: 57 },
    { id: 'DEV-00218', label: 'DEV-00218 (翔安大桥#18)', lnglat: [118.179927, 24.560335], status: 'deployed', deviceId: 'DEV-00218', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-18', circuit: 'B回路-翔安大桥', power: 0.2, voltage: 221.8, temperature: 33.8, dimming: 95 },
    { id: 'DEV-00219', label: 'DEV-00219 (翔安大桥#19)', lnglat: [118.18004, 24.560423], status: 'deployed', deviceId: 'DEV-00219', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-19', circuit: 'B回路-翔安大桥', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00220', label: 'DEV-00220 (翔安大桥#20)', lnglat: [118.180152, 24.560511], status: 'deployed', deviceId: 'DEV-00220', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-20', circuit: 'B回路-翔安大桥', power: 0.24, voltage: 221.4, temperature: 35.4, dimming: 90 },
    { id: 'DEV-00221', label: 'DEV-00221 (翔安大桥#21)', lnglat: [118.180264, 24.560599], status: 'deployed', deviceId: 'DEV-00221', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-21', circuit: 'B回路-翔安大桥', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00222', label: 'DEV-00222 (翔安大桥#22)', lnglat: [118.180377, 24.560687], status: 'deployed', deviceId: 'DEV-00222', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-22', circuit: 'B回路-翔安大桥', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00223', label: 'DEV-00223 (翔安大桥#23)', lnglat: [118.180489, 24.560775], status: 'deployed', deviceId: 'DEV-00223', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-23', circuit: 'B回路-翔安大桥', power: 0.22, voltage: 221.4, temperature: 34.6, dimming: 90 },
    { id: 'DEV-00224', label: 'DEV-00224 (翔安大桥#24)', lnglat: [118.180601, 24.560863], status: 'deployed', deviceId: 'DEV-00224', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-24', circuit: 'B回路-翔安大桥', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00225', label: 'DEV-00225 (翔安大桥#25)', lnglat: [118.180714, 24.560951], status: 'offline', deviceId: 'DEV-00225', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-25', circuit: 'B回路-翔安大桥', power: 0.0, voltage: 0.0, temperature: 21.4, dimming: 0 },
  ],
  '环岛南路示范段': [
    { id: 'DEV-00401', label: 'DEV-00401 (环岛南路#01)', lnglat: [118.130319, 24.423994], status: 'deployed', deviceId: 'DEV-00401', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-01', circuit: 'A回路-环岛南路', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00402', label: 'DEV-00402 (环岛南路#02)', lnglat: [118.130465, 24.423969], status: 'deployed', deviceId: 'DEV-00402', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-02', circuit: 'A回路-环岛南路', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00403', label: 'DEV-00403 (环岛南路#03)', lnglat: [118.13061, 24.423943], status: 'deployed', deviceId: 'DEV-00403', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-03', circuit: 'A回路-环岛南路', power: 0.22, voltage: 221.8, temperature: 34.6, dimming: 95 },
    { id: 'DEV-00404', label: 'DEV-00404 (环岛南路#04)', lnglat: [118.130756, 24.423918], status: 'dimmed', deviceId: 'DEV-00404', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-04', circuit: 'A回路-环岛南路', power: 0.17, voltage: 220.8, temperature: 32.8, dimming: 56 },
    { id: 'DEV-00405', label: 'DEV-00405 (环岛南路#05)', lnglat: [118.130901, 24.423892], status: 'deployed', deviceId: 'DEV-00405', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-05', circuit: 'A回路-环岛南路', power: 0.18, voltage: 221.4, temperature: 33.0, dimming: 90 },
    { id: 'DEV-00406', label: 'DEV-00406 (环岛南路#06)', lnglat: [118.131047, 24.423867], status: 'deployed', deviceId: 'DEV-00406', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-06', circuit: 'A回路-环岛南路', power: 0.2, voltage: 221.8, temperature: 33.8, dimming: 95 },
    { id: 'DEV-00407', label: 'DEV-00407 (环岛南路#07)', lnglat: [118.131192, 24.423841], status: 'deployed', deviceId: 'DEV-00407', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-07', circuit: 'A回路-环岛南路', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00408', label: 'DEV-00408 (环岛南路#08)', lnglat: [118.131337, 24.423816], status: 'warning', deviceId: 'DEV-00408', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-08', circuit: 'A回路-环岛南路', power: 0.28, voltage: 238.5, temperature: 48.6, dimming: 100 },
    { id: 'DEV-00409', label: 'DEV-00409 (环岛南路#09)', lnglat: [118.131483, 24.42379], status: 'deployed', deviceId: 'DEV-00409', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-09', circuit: 'A回路-环岛南路', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00410', label: 'DEV-00410 (环岛南路#10)', lnglat: [118.131628, 24.423765], status: 'deployed', deviceId: 'DEV-00410', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-10', circuit: 'A回路-环岛南路', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00411', label: 'DEV-00411 (环岛南路#11)', lnglat: [118.131774, 24.42374], status: 'dimmed', deviceId: 'DEV-00411', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-11', circuit: 'A回路-环岛南路', power: 0.19, voltage: 220.8, temperature: 32.8, dimming: 70 },
    { id: 'DEV-00412', label: 'DEV-00412 (环岛南路#12)', lnglat: [118.131919, 24.423714], status: 'deployed', deviceId: 'DEV-00412', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-12', circuit: 'A回路-环岛南路', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00413', label: 'DEV-00413 (环岛南路#13)', lnglat: [118.132062, 24.423678], status: 'deployed', deviceId: 'DEV-00413', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-13', circuit: 'B回路-环岛南路', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00414', label: 'DEV-00414 (环岛南路#14)', lnglat: [118.1322, 24.42363], status: 'deployed', deviceId: 'DEV-00414', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-14', circuit: 'B回路-环岛南路', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00415', label: 'DEV-00415 (环岛南路#15)', lnglat: [118.132338, 24.423582], status: 'deployed', deviceId: 'DEV-00415', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-15', circuit: 'B回路-环岛南路', power: 0.22, voltage: 221.8, temperature: 34.6, dimming: 95 },
    { id: 'DEV-00416', label: 'DEV-00416 (环岛南路#16)', lnglat: [118.132477, 24.423533], status: 'deployed', deviceId: 'DEV-00416', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-16', circuit: 'B回路-环岛南路', power: 0.24, voltage: 221.0, temperature: 35.4, dimming: 85 },
    { id: 'DEV-00417', label: 'DEV-00417 (环岛南路#17)', lnglat: [118.132615, 24.423485], status: 'dimmed', deviceId: 'DEV-00417', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-17', circuit: 'B回路-环岛南路', power: 0.17, voltage: 220.8, temperature: 32.8, dimming: 57 },
    { id: 'DEV-00418', label: 'DEV-00418 (环岛南路#18)', lnglat: [118.132753, 24.423436], status: 'deployed', deviceId: 'DEV-00418', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-18', circuit: 'B回路-环岛南路', power: 0.2, voltage: 221.8, temperature: 33.8, dimming: 95 },
    { id: 'DEV-00419', label: 'DEV-00419 (环岛南路#19)', lnglat: [118.132891, 24.423388], status: 'deployed', deviceId: 'DEV-00419', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-19', circuit: 'B回路-环岛南路', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00420', label: 'DEV-00420 (环岛南路#20)', lnglat: [118.13303, 24.42334], status: 'deployed', deviceId: 'DEV-00420', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-20', circuit: 'B回路-环岛南路', power: 0.24, voltage: 221.4, temperature: 35.4, dimming: 90 },
    { id: 'DEV-00421', label: 'DEV-00421 (环岛南路#21)', lnglat: [118.133168, 24.423291], status: 'deployed', deviceId: 'DEV-00421', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-21', circuit: 'B回路-环岛南路', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00422', label: 'DEV-00422 (环岛南路#22)', lnglat: [118.133306, 24.423243], status: 'deployed', deviceId: 'DEV-00422', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-22', circuit: 'B回路-环岛南路', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00423', label: 'DEV-00423 (环岛南路#23)', lnglat: [118.133445, 24.423194], status: 'deployed', deviceId: 'DEV-00423', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-23', circuit: 'B回路-环岛南路', power: 0.22, voltage: 221.4, temperature: 34.6, dimming: 90 },
    { id: 'DEV-00424', label: 'DEV-00424 (环岛南路#24)', lnglat: [118.133583, 24.423146], status: 'deployed', deviceId: 'DEV-00424', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-24', circuit: 'B回路-环岛南路', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00425', label: 'DEV-00425 (环岛南路#25)', lnglat: [118.133721, 24.423098], status: 'offline', deviceId: 'DEV-00425', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-25', circuit: 'B回路-环岛南路', power: 0.0, voltage: 0.0, temperature: 21.4, dimming: 0 },
  ],
  '演武大桥桥面': [
    { id: 'DEV-00501', label: 'DEV-00501 (演武大桥#01)', lnglat: [118.086828, 24.436152], status: 'deployed', deviceId: 'DEV-00501', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-01', circuit: 'A回路-演武大桥', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00502', label: 'DEV-00502 (演武大桥#02)', lnglat: [118.086728, 24.436251], status: 'deployed', deviceId: 'DEV-00502', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-02', circuit: 'A回路-演武大桥', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00503', label: 'DEV-00503 (演武大桥#03)', lnglat: [118.086628, 24.436351], status: 'deployed', deviceId: 'DEV-00503', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-03', circuit: 'A回路-演武大桥', power: 0.22, voltage: 221.8, temperature: 34.6, dimming: 95 },
    { id: 'DEV-00504', label: 'DEV-00504 (演武大桥#04)', lnglat: [118.086528, 24.43645], status: 'dimmed', deviceId: 'DEV-00504', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-04', circuit: 'A回路-演武大桥', power: 0.17, voltage: 220.8, temperature: 32.8, dimming: 56 },
    { id: 'DEV-00505', label: 'DEV-00505 (演武大桥#05)', lnglat: [118.086428, 24.43655], status: 'deployed', deviceId: 'DEV-00505', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-05', circuit: 'A回路-演武大桥', power: 0.18, voltage: 221.4, temperature: 33.0, dimming: 90 },
    { id: 'DEV-00506', label: 'DEV-00506 (演武大桥#06)', lnglat: [118.086328, 24.436649], status: 'deployed', deviceId: 'DEV-00506', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-06', circuit: 'A回路-演武大桥', power: 0.2, voltage: 221.8, temperature: 33.8, dimming: 95 },
    { id: 'DEV-00507', label: 'DEV-00507 (演武大桥#07)', lnglat: [118.086228, 24.436749], status: 'deployed', deviceId: 'DEV-00507', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-07', circuit: 'A回路-演武大桥', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00508', label: 'DEV-00508 (演武大桥#08)', lnglat: [118.086128, 24.436848], status: 'warning', deviceId: 'DEV-00508', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-08', circuit: 'A回路-演武大桥', power: 0.28, voltage: 238.5, temperature: 48.6, dimming: 100 },
    { id: 'DEV-00509', label: 'DEV-00509 (演武大桥#09)', lnglat: [118.086028, 24.436948], status: 'deployed', deviceId: 'DEV-00509', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-09', circuit: 'A回路-演武大桥', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00510', label: 'DEV-00510 (演武大桥#10)', lnglat: [118.085928, 24.437047], status: 'deployed', deviceId: 'DEV-00510', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-10', circuit: 'A回路-演武大桥', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00511', label: 'DEV-00511 (演武大桥#11)', lnglat: [118.085828, 24.437147], status: 'dimmed', deviceId: 'DEV-00511', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-11', circuit: 'A回路-演武大桥', power: 0.19, voltage: 220.8, temperature: 32.8, dimming: 70 },
    { id: 'DEV-00512', label: 'DEV-00512 (演武大桥#12)', lnglat: [118.085728, 24.437246], status: 'deployed', deviceId: 'DEV-00512', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-12', circuit: 'A回路-演武大桥', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00513', label: 'DEV-00513 (演武大桥#13)', lnglat: [118.085628, 24.437346], status: 'deployed', deviceId: 'DEV-00513', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-13', circuit: 'B回路-演武大桥', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00514', label: 'DEV-00514 (演武大桥#14)', lnglat: [118.085528, 24.437446], status: 'deployed', deviceId: 'DEV-00514', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-14', circuit: 'B回路-演武大桥', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00515', label: 'DEV-00515 (演武大桥#15)', lnglat: [118.085437, 24.437552], status: 'deployed', deviceId: 'DEV-00515', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-15', circuit: 'B回路-演武大桥', power: 0.22, voltage: 221.8, temperature: 34.6, dimming: 95 },
    { id: 'DEV-00516', label: 'DEV-00516 (演武大桥#16)', lnglat: [118.085352, 24.437663], status: 'deployed', deviceId: 'DEV-00516', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-16', circuit: 'B回路-演武大桥', power: 0.24, voltage: 221.0, temperature: 35.4, dimming: 85 },
    { id: 'DEV-00517', label: 'DEV-00517 (演武大桥#17)', lnglat: [118.085267, 24.437773], status: 'dimmed', deviceId: 'DEV-00517', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-17', circuit: 'B回路-演武大桥', power: 0.17, voltage: 220.8, temperature: 32.8, dimming: 57 },
    { id: 'DEV-00518', label: 'DEV-00518 (演武大桥#18)', lnglat: [118.085181, 24.437883], status: 'deployed', deviceId: 'DEV-00518', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-18', circuit: 'B回路-演武大桥', power: 0.2, voltage: 221.8, temperature: 33.8, dimming: 95 },
    { id: 'DEV-00519', label: 'DEV-00519 (演武大桥#19)', lnglat: [118.085096, 24.437993], status: 'deployed', deviceId: 'DEV-00519', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-19', circuit: 'B回路-演武大桥', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00520', label: 'DEV-00520 (演武大桥#20)', lnglat: [118.085011, 24.438104], status: 'deployed', deviceId: 'DEV-00520', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-20', circuit: 'B回路-演武大桥', power: 0.24, voltage: 221.4, temperature: 35.4, dimming: 90 },
    { id: 'DEV-00521', label: 'DEV-00521 (演武大桥#21)', lnglat: [118.084932, 24.438218], status: 'deployed', deviceId: 'DEV-00521', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-21', circuit: 'B回路-演武大桥', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00522', label: 'DEV-00522 (演武大桥#22)', lnglat: [118.084856, 24.438333], status: 'deployed', deviceId: 'DEV-00522', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-22', circuit: 'B回路-演武大桥', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00523', label: 'DEV-00523 (演武大桥#23)', lnglat: [118.084779, 24.438449], status: 'deployed', deviceId: 'DEV-00523', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-23', circuit: 'B回路-演武大桥', power: 0.22, voltage: 221.4, temperature: 34.6, dimming: 90 },
    { id: 'DEV-00524', label: 'DEV-00524 (演武大桥#24)', lnglat: [118.084702, 24.438564], status: 'deployed', deviceId: 'DEV-00524', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-24', circuit: 'B回路-演武大桥', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00525', label: 'DEV-00525 (演武大桥#25)', lnglat: [118.084625, 24.438679], status: 'offline', deviceId: 'DEV-00525', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-25', circuit: 'B回路-演武大桥', power: 0.0, voltage: 0.0, temperature: 21.4, dimming: 0 },
  ],
  '翔安新机场综合枢纽站': [
    { id: 'DEV-00701', label: 'DEV-00701 (机场快速路#01)', lnglat: [118.356333, 24.544467], status: 'deployed', deviceId: 'DEV-00701', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-01', circuit: 'A回路-机场快速路', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00702', label: 'DEV-00702 (机场快速路#02)', lnglat: [118.356469, 24.544412], status: 'deployed', deviceId: 'DEV-00702', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-02', circuit: 'A回路-机场快速路', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00703', label: 'DEV-00703 (机场快速路#03)', lnglat: [118.356605, 24.544358], status: 'deployed', deviceId: 'DEV-00703', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-03', circuit: 'A回路-机场快速路', power: 0.22, voltage: 221.8, temperature: 34.6, dimming: 95 },
    { id: 'DEV-00704', label: 'DEV-00704 (机场快速路#04)', lnglat: [118.356741, 24.544304], status: 'dimmed', deviceId: 'DEV-00704', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-04', circuit: 'A回路-机场快速路', power: 0.17, voltage: 220.8, temperature: 32.8, dimming: 56 },
    { id: 'DEV-00705', label: 'DEV-00705 (机场快速路#05)', lnglat: [118.356876, 24.544249], status: 'deployed', deviceId: 'DEV-00705', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-05', circuit: 'A回路-机场快速路', power: 0.18, voltage: 221.4, temperature: 33.0, dimming: 90 },
    { id: 'DEV-00706', label: 'DEV-00706 (机场快速路#06)', lnglat: [118.357012, 24.544195], status: 'deployed', deviceId: 'DEV-00706', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-06', circuit: 'A回路-机场快速路', power: 0.2, voltage: 221.8, temperature: 33.8, dimming: 95 },
    { id: 'DEV-00707', label: 'DEV-00707 (机场快速路#07)', lnglat: [118.357148, 24.544141], status: 'deployed', deviceId: 'DEV-00707', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-07', circuit: 'A回路-机场快速路', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00708', label: 'DEV-00708 (机场快速路#08)', lnglat: [118.357284, 24.544087], status: 'warning', deviceId: 'DEV-00708', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-08', circuit: 'A回路-机场快速路', power: 0.28, voltage: 238.5, temperature: 48.6, dimming: 100 },
    { id: 'DEV-00709', label: 'DEV-00709 (机场快速路#09)', lnglat: [118.357419, 24.544032], status: 'deployed', deviceId: 'DEV-00709', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-09', circuit: 'A回路-机场快速路', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00710', label: 'DEV-00710 (机场快速路#10)', lnglat: [118.357555, 24.543978], status: 'deployed', deviceId: 'DEV-00710', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-10', circuit: 'A回路-机场快速路', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00711', label: 'DEV-00711 (机场快速路#11)', lnglat: [118.357691, 24.543924], status: 'dimmed', deviceId: 'DEV-00711', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-11', circuit: 'A回路-机场快速路', power: 0.19, voltage: 220.8, temperature: 32.8, dimming: 70 },
    { id: 'DEV-00712', label: 'DEV-00712 (机场快速路#12)', lnglat: [118.357827, 24.543869], status: 'deployed', deviceId: 'DEV-00712', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-12', circuit: 'A回路-机场快速路', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00713', label: 'DEV-00713 (机场快速路#13)', lnglat: [118.357962, 24.543815], status: 'deployed', deviceId: 'DEV-00713', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-13', circuit: 'B回路-机场快速路', power: 0.18, voltage: 221.0, temperature: 33.0, dimming: 85 },
    { id: 'DEV-00714', label: 'DEV-00714 (机场快速路#14)', lnglat: [118.358101, 24.543766], status: 'deployed', deviceId: 'DEV-00714', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-14', circuit: 'B回路-机场快速路', power: 0.2, voltage: 221.4, temperature: 33.8, dimming: 90 },
    { id: 'DEV-00715', label: 'DEV-00715 (机场快速路#15)', lnglat: [118.35824, 24.54372], status: 'deployed', deviceId: 'DEV-00715', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-15', circuit: 'B回路-机场快速路', power: 0.22, voltage: 221.8, temperature: 34.6, dimming: 95 },
    { id: 'DEV-00716', label: 'DEV-00716 (机场快速路#16)', lnglat: [118.358379, 24.543674], status: 'deployed', deviceId: 'DEV-00716', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-16', circuit: 'B回路-机场快速路', power: 0.24, voltage: 221.0, temperature: 35.4, dimming: 85 },
    { id: 'DEV-00717', label: 'DEV-00717 (机场快速路#17)', lnglat: [118.358518, 24.543627], status: 'dimmed', deviceId: 'DEV-00717', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-17', circuit: 'B回路-机场快速路', power: 0.17, voltage: 220.8, temperature: 32.8, dimming: 57 },
    { id: 'DEV-00718', label: 'DEV-00718 (机场快速路#18)', lnglat: [118.358658, 24.543581], status: 'deployed', deviceId: 'DEV-00718', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-18', circuit: 'B回路-机场快速路', power: 0.2, voltage: 221.8, temperature: 33.8, dimming: 95 },
    { id: 'DEV-00719', label: 'DEV-00719 (机场快速路#19)', lnglat: [118.358797, 24.543534], status: 'deployed', deviceId: 'DEV-00719', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-19', circuit: 'B回路-机场快速路', power: 0.22, voltage: 221.0, temperature: 34.6, dimming: 85 },
    { id: 'DEV-00720', label: 'DEV-00720 (机场快速路#20)', lnglat: [118.358936, 24.543488], status: 'deployed', deviceId: 'DEV-00720', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-20', circuit: 'B回路-机场快速路', power: 0.24, voltage: 221.4, temperature: 35.4, dimming: 90 },
    { id: 'DEV-00721', label: 'DEV-00721 (机场快速路#21)', lnglat: [118.359075, 24.543442], status: 'deployed', deviceId: 'DEV-00721', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-21', circuit: 'B回路-机场快速路', power: 0.18, voltage: 221.8, temperature: 33.0, dimming: 95 },
    { id: 'DEV-00722', label: 'DEV-00722 (机场快速路#22)', lnglat: [118.359215, 24.543395], status: 'deployed', deviceId: 'DEV-00722', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-22', circuit: 'B回路-机场快速路', power: 0.2, voltage: 221.0, temperature: 33.8, dimming: 85 },
    { id: 'DEV-00723', label: 'DEV-00723 (机场快速路#23)', lnglat: [118.359354, 24.543349], status: 'deployed', deviceId: 'DEV-00723', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-23', circuit: 'B回路-机场快速路', power: 0.22, voltage: 221.4, temperature: 34.6, dimming: 90 },
    { id: 'DEV-00724', label: 'DEV-00724 (机场快速路#24)', lnglat: [118.359493, 24.543302], status: 'deployed', deviceId: 'DEV-00724', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具', pole: 'POLE-24', circuit: 'B回路-机场快速路', power: 0.24, voltage: 221.8, temperature: 35.4, dimming: 95 },
    { id: 'DEV-00725', label: 'DEV-00725 (机场快速路#25)', lnglat: [118.359632, 24.543256], status: 'offline', deviceId: 'DEV-00725', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆', pole: 'POLE-25', circuit: 'B回路-机场快速路', power: 0.0, voltage: 0.0, temperature: 21.4, dimming: 0 },
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
              zoom={17.5}
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
