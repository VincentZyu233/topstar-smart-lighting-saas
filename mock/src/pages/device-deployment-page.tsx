import { useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  HardDriveUpload,
  Layers,
  Lightbulb,
  Plus,
  Radio,
  Search,
  Send,
  Trash2,
  Unlink,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { InteractiveMapCanvas, type MapPoint } from '@/components/interactive-map-canvas';
import { PageHeader } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projects, stations } from '@/data/mock-data';
import { cn } from '@/lib/utils';

interface PendingDevice {
  id: string;
  name: string;
  model: string;
  type: string;
  spec: string;
}

// 示范场站预设真实点位（精准贴合高崎空港枋钟路、翔安大桥跨海高架、翔安新机场航站区道路中心线）
const STATION_DEFAULT_POINTS: Record<string, MapPoint[]> = {
  '高崎空港互通示范站': [
    { id: 'POLE-01', label: '枋钟路主线 #01', lnglat: [118.1342, 24.52765], circuit: 'A回路-枋钟路主线', pole: 'POLE-01', status: 'deployed', deviceId: 'DEV-00101', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-02', label: '枋钟路主线 #02', lnglat: [118.135228, 24.527896], circuit: 'A回路-枋钟路主线', pole: 'POLE-02', status: 'deployed', deviceId: 'DEV-00102', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-03', label: '枋钟路主线 #03', lnglat: [118.136256, 24.528142], circuit: 'A回路-枋钟路主线', pole: 'POLE-03', status: 'deployed', deviceId: 'DEV-00103', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-04', label: '枋钟路主线 #04', lnglat: [118.137273, 24.528419], circuit: 'A回路-枋钟路主线', pole: 'POLE-04', status: 'dimmed', deviceId: 'DEV-00104', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-05', label: '枋钟路主线 #05', lnglat: [118.138288, 24.528705], circuit: 'A回路-枋钟路主线', pole: 'POLE-05', status: 'deployed', deviceId: 'DEV-00105', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-06', label: '枋钟路主线 #06', lnglat: [118.139302, 24.528996], circuit: 'A回路-枋钟路主线', pole: 'POLE-06', status: 'warning', deviceId: 'DEV-00106', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆' },
    { id: 'POLE-07', label: '枋钟路主线 #07', lnglat: [118.140314, 24.529291], circuit: 'A回路-枋钟路主线', pole: 'POLE-07', status: 'deployed', deviceId: 'DEV-00107', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-08', label: '枋钟路主线 #08', lnglat: [118.141326, 24.529586], circuit: 'A回路-枋钟路主线', pole: 'POLE-08', status: 'deployed', deviceId: 'DEV-00108', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-09', label: '枋钟路主线 #09', lnglat: [118.142341, 24.529872], circuit: 'B回路-枋钟路主线', pole: 'POLE-09', status: 'deployed', deviceId: 'DEV-00109', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-10', label: '枋钟路主线 #10', lnglat: [118.143356, 24.530159], circuit: 'B回路-枋钟路主线', pole: 'POLE-10', status: 'deployed', deviceId: 'DEV-00110', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-11', label: '枋钟路主线 #11', lnglat: [118.144376, 24.530429], circuit: 'B回路-枋钟路主线', pole: 'POLE-11', status: 'deployed', deviceId: 'DEV-00111', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-12', label: '枋钟路主线 #12', lnglat: [118.145398, 24.530695], circuit: 'B回路-枋钟路主线', pole: 'POLE-12', status: 'deployed', deviceId: 'DEV-00112', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-13', label: '枋钟路主线 #13', lnglat: [118.146417, 24.53097], circuit: 'B回路-枋钟路主线', pole: 'POLE-13', status: 'deployed', deviceId: 'DEV-00113', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-14', label: '枋钟路主线 #14', lnglat: [118.147434, 24.531249], circuit: 'B回路-枋钟路主线', pole: 'POLE-14', status: 'deployed', deviceId: 'DEV-00114', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-15', label: '枋钟路主线 #15', lnglat: [118.148464, 24.531487], circuit: 'B回路-枋钟路主线', pole: 'POLE-15', status: 'pending' },
    { id: 'POLE-16', label: '枋钟路主线 #16', lnglat: [118.1495, 24.5317], circuit: 'B回路-枋钟路主线', pole: 'POLE-16', status: 'pending' },
  ],
  '翔安大桥跨海示范段': [
    { id: 'POLE-01', label: '翔安大桥 #01', lnglat: [118.16945, 24.55188], circuit: 'A回路-翔安大桥', pole: 'POLE-01', status: 'deployed', deviceId: 'DEV-00201', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-02', label: '翔安大桥 #02', lnglat: [118.170833, 24.552994], circuit: 'A回路-翔安大桥', pole: 'POLE-02', status: 'deployed', deviceId: 'DEV-00202', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-03', label: '翔安大桥 #03', lnglat: [118.172216, 24.554108], circuit: 'A回路-翔安大桥', pole: 'POLE-03', status: 'deployed', deviceId: 'DEV-00203', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-04', label: '翔安大桥 #04', lnglat: [118.173599, 24.555221], circuit: 'A回路-翔安大桥', pole: 'POLE-04', status: 'dimmed', deviceId: 'DEV-00204', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-05', label: '翔安大桥 #05', lnglat: [118.174982, 24.556335], circuit: 'A回路-翔安大桥', pole: 'POLE-05', status: 'deployed', deviceId: 'DEV-00205', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-06', label: '翔安大桥 #06', lnglat: [118.176365, 24.557449], circuit: 'A回路-翔安大桥', pole: 'POLE-06', status: 'warning', deviceId: 'DEV-00206', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆' },
    { id: 'POLE-07', label: '翔安大桥 #07', lnglat: [118.177736, 24.558575], circuit: 'A回路-翔安大桥', pole: 'POLE-07', status: 'deployed', deviceId: 'DEV-00207', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-08', label: '翔安大桥 #08', lnglat: [118.179101, 24.559707], circuit: 'A回路-翔安大桥', pole: 'POLE-08', status: 'deployed', deviceId: 'DEV-00208', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-09', label: '翔安大桥 #09', lnglat: [118.180472, 24.560833], circuit: 'A回路-翔安大桥', pole: 'POLE-09', status: 'deployed', deviceId: 'DEV-00209', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-10', label: '翔安大桥 #10', lnglat: [118.181881, 24.56192], circuit: 'B回路-翔安大桥', pole: 'POLE-10', status: 'deployed', deviceId: 'DEV-00210', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-11', label: '翔安大桥 #11', lnglat: [118.18329, 24.563007], circuit: 'B回路-翔安大桥', pole: 'POLE-11', status: 'deployed', deviceId: 'DEV-00211', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-12', label: '翔安大桥 #12', lnglat: [118.184731, 24.564057], circuit: 'B回路-翔安大桥', pole: 'POLE-12', status: 'deployed', deviceId: 'DEV-00212', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-13', label: '翔安大桥 #13', lnglat: [118.18619, 24.565087], circuit: 'B回路-翔安大桥', pole: 'POLE-13', status: 'deployed', deviceId: 'DEV-00213', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-14', label: '翔安大桥 #14', lnglat: [118.187686, 24.56607], circuit: 'B回路-翔安大桥', pole: 'POLE-14', status: 'deployed', deviceId: 'DEV-00214', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-15', label: '翔安大桥 #15', lnglat: [118.189263, 24.566946], circuit: 'B回路-翔安大桥', pole: 'POLE-15', status: 'deployed', deviceId: 'DEV-00215', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-16', label: '翔安大桥 #16', lnglat: [118.190845, 24.567806], circuit: 'B回路-翔安大桥', pole: 'POLE-16', status: 'deployed', deviceId: 'DEV-00216', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-17', label: '翔安大桥 #17', lnglat: [118.192673, 24.568053], circuit: 'B回路-翔安大桥', pole: 'POLE-17', status: 'pending' },
    { id: 'POLE-18', label: '翔安大桥 #18', lnglat: [118.1945, 24.5683], circuit: 'B回路-翔安大桥', pole: 'POLE-18', status: 'pending' },
  ],
  '环岛南路示范段': [
    { id: 'POLE-01', label: '环岛南路 #01', lnglat: [118.12567, 24.42441], circuit: 'A回路-环岛南路', pole: 'POLE-01', status: 'deployed', deviceId: 'DEV-00401', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-02', label: '环岛南路 #02', lnglat: [118.126617, 24.42425], circuit: 'A回路-环岛南路', pole: 'POLE-02', status: 'deployed', deviceId: 'DEV-00402', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-03', label: '环岛南路 #03', lnglat: [118.127565, 24.4241], circuit: 'A回路-环岛南路', pole: 'POLE-03', status: 'deployed', deviceId: 'DEV-00403', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-04', label: '环岛南路 #04', lnglat: [118.128528, 24.424105], circuit: 'A回路-环岛南路', pole: 'POLE-04', status: 'dimmed', deviceId: 'DEV-00404', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-05', label: '环岛南路 #05', lnglat: [118.129491, 24.42411], circuit: 'A回路-环岛南路', pole: 'POLE-05', status: 'deployed', deviceId: 'DEV-00405', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-06', label: '环岛南路 #06', lnglat: [118.130448, 24.42401], circuit: 'A回路-环岛南路', pole: 'POLE-06', status: 'warning', deviceId: 'DEV-00406', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆' },
    { id: 'POLE-07', label: '环岛南路 #07', lnglat: [118.131404, 24.42391], circuit: 'A回路-环岛南路', pole: 'POLE-07', status: 'deployed', deviceId: 'DEV-00407', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-08', label: '环岛南路 #08', lnglat: [118.132301, 24.423599], circuit: 'B回路-环岛南路', pole: 'POLE-08', status: 'deployed', deviceId: 'DEV-00408', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-09', label: '环岛南路 #09', lnglat: [118.133192, 24.423266], circuit: 'B回路-环岛南路', pole: 'POLE-09', status: 'deployed', deviceId: 'DEV-00409', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-10', label: '环岛南路 #10', lnglat: [118.134112, 24.423012], circuit: 'B回路-环岛南路', pole: 'POLE-10', status: 'deployed', deviceId: 'DEV-00410', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-11', label: '环岛南路 #11', lnglat: [118.135046, 24.422802], circuit: 'B回路-环岛南路', pole: 'POLE-11', status: 'deployed', deviceId: 'DEV-00411', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-12', label: '环岛南路 #12', lnglat: [118.135978, 24.42282], circuit: 'B回路-环岛南路', pole: 'POLE-12', status: 'deployed', deviceId: 'DEV-00412', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-13', label: '环岛南路 #13', lnglat: [118.136907, 24.423052], circuit: 'B回路-环岛南路', pole: 'POLE-13', status: 'deployed', deviceId: 'DEV-00413', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-14', label: '环岛南路 #14', lnglat: [118.137771, 24.423399], circuit: 'B回路-环岛南路', pole: 'POLE-14', status: 'pending' },
    { id: 'POLE-15', label: '环岛南路 #15', lnglat: [118.13852, 24.42395], circuit: 'B回路-环岛南路', pole: 'POLE-15', status: 'pending' },
  ],
  '演武大桥桥面': [
    { id: 'POLE-01', label: '演武大桥 #01', lnglat: [118.0872, 24.4365], circuit: 'A回路-演武大桥', pole: 'POLE-01', status: 'deployed', deviceId: 'DEV-00501', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-02', label: '演武大桥 #02', lnglat: [118.08771, 24.437138], circuit: 'A回路-演武大桥', pole: 'POLE-02', status: 'deployed', deviceId: 'DEV-00502', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-03', label: '演武大桥 #03', lnglat: [118.088221, 24.437776], circuit: 'A回路-演武大桥', pole: 'POLE-03', status: 'deployed', deviceId: 'DEV-00503', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-04', label: '演武大桥 #04', lnglat: [118.088731, 24.438414], circuit: 'A回路-演武大桥', pole: 'POLE-04', status: 'dimmed', deviceId: 'DEV-00504', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-05', label: '演武大桥 #05', lnglat: [118.089245, 24.43905], circuit: 'A回路-演武大桥', pole: 'POLE-05', status: 'deployed', deviceId: 'DEV-00505', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-06', label: '演武大桥 #06', lnglat: [118.08976, 24.439685], circuit: 'A回路-演武大桥', pole: 'POLE-06', status: 'warning', deviceId: 'DEV-00506', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆' },
    { id: 'POLE-07', label: '演武大桥 #07', lnglat: [118.090274, 24.440321], circuit: 'A回路-演武大桥', pole: 'POLE-07', status: 'deployed', deviceId: 'DEV-00507', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-08', label: '演武大桥 #08', lnglat: [118.090756, 24.440976], circuit: 'B回路-演武大桥', pole: 'POLE-08', status: 'deployed', deviceId: 'DEV-00508', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-09', label: '演武大桥 #09', lnglat: [118.091214, 24.441647], circuit: 'B回路-演武大桥', pole: 'POLE-09', status: 'deployed', deviceId: 'DEV-00509', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-10', label: '演武大桥 #10', lnglat: [118.091671, 24.442317], circuit: 'B回路-演武大桥', pole: 'POLE-10', status: 'deployed', deviceId: 'DEV-00510', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-11', label: '演武大桥 #11', lnglat: [118.092128, 24.442988], circuit: 'B回路-演武大桥', pole: 'POLE-11', status: 'deployed', deviceId: 'DEV-00511', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-12', label: '演武大桥 #12', lnglat: [118.092585, 24.443659], circuit: 'B回路-演武大桥', pole: 'POLE-12', status: 'deployed', deviceId: 'DEV-00512', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-13', label: '演武大桥 #13', lnglat: [118.093043, 24.444329], circuit: 'B回路-演武大桥', pole: 'POLE-13', status: 'pending' },
    { id: 'POLE-14', label: '演武大桥 #14', lnglat: [118.0935, 24.445], circuit: 'B回路-演武大桥', pole: 'POLE-14', status: 'pending' },
  ],
  '翔安新机场综合枢纽站': [
    { id: 'POLE-01', label: '机场快速路 #01', lnglat: [118.3482, 24.5471], circuit: 'A回路-机场快速路', pole: 'POLE-01', status: 'deployed', deviceId: 'DEV-00701', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-02', label: '机场快速路 #02', lnglat: [118.349478, 24.546759], circuit: 'A回路-机场快速路', pole: 'POLE-02', status: 'deployed', deviceId: 'DEV-00702', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-03', label: '机场快速路 #03', lnglat: [118.350756, 24.546419], circuit: 'A回路-机场快速路', pole: 'POLE-03', status: 'deployed', deviceId: 'DEV-00703', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-04', label: '机场快速路 #04', lnglat: [118.352005, 24.546005], circuit: 'A回路-机场快速路', pole: 'POLE-04', status: 'dimmed', deviceId: 'DEV-00704', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-05', label: '机场快速路 #05', lnglat: [118.35324, 24.545552], circuit: 'A回路-机场快速路', pole: 'POLE-05', status: 'deployed', deviceId: 'DEV-00705', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-06', label: '机场快速路 #06', lnglat: [118.354475, 24.545099], circuit: 'A回路-机场快速路', pole: 'POLE-06', status: 'warning', deviceId: 'DEV-00706', deviceName: '多功能智慧杆', deviceType: '多功能智慧杆' },
    { id: 'POLE-07', label: '机场快速路 #07', lnglat: [118.35571, 24.544646], circuit: 'A回路-机场快速路', pole: 'POLE-07', status: 'deployed', deviceId: 'DEV-00707', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-08', label: '机场快速路 #08', lnglat: [118.356945, 24.544193], circuit: 'A回路-机场快速路', pole: 'POLE-08', status: 'deployed', deviceId: 'DEV-00708', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-09', label: '机场快速路 #09', lnglat: [118.358204, 24.543799], circuit: 'B回路-机场快速路', pole: 'POLE-09', status: 'deployed', deviceId: 'DEV-00709', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-10', label: '机场快速路 #10', lnglat: [118.359468, 24.543419], circuit: 'B回路-机场快速路', pole: 'POLE-10', status: 'deployed', deviceId: 'DEV-00710', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-11', label: '机场快速路 #11', lnglat: [118.360732, 24.543039], circuit: 'B回路-机场快速路', pole: 'POLE-11', status: 'deployed', deviceId: 'DEV-00711', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-12', label: '机场快速路 #12', lnglat: [118.361996, 24.542656], circuit: 'B回路-机场快速路', pole: 'POLE-12', status: 'deployed', deviceId: 'DEV-00712', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-13', label: '机场快速路 #13', lnglat: [118.363259, 24.542273], circuit: 'B回路-机场快速路', pole: 'POLE-13', status: 'deployed', deviceId: 'DEV-00713', deviceName: '智能单灯节能控制器', deviceType: '单灯控制器' },
    { id: 'POLE-14', label: '机场快速路 #14', lnglat: [118.364508, 24.541854], circuit: 'B回路-机场快速路', pole: 'POLE-14', status: 'deployed', deviceId: 'DEV-00714', deviceName: '全光谱 LED 智慧路灯', deviceType: '智慧灯具' },
    { id: 'POLE-15', label: '机场快速路 #15', lnglat: [118.365754, 24.541427], circuit: 'B回路-机场快速路', pole: 'POLE-15', status: 'pending' },
    { id: 'POLE-16', label: '机场快速路 #16', lnglat: [118.367, 24.541], circuit: 'B回路-机场快速路', pole: 'POLE-16', status: 'pending' },
  ],
};

// 初始点位
const INITIAL_POINTS: MapPoint[] = STATION_DEFAULT_POINTS['高崎空港互通示范站'];

// 待分配设备池
const INITIAL_PENDING_DEVICES: PendingDevice[] = [
  { id: 'DEV-0205', name: '智能单灯节能控制器', model: 'TS-SLC-Cat1-Pro', type: '单灯控制器', spec: 'Cat.1 / 0-10V 调光' },
  { id: 'DEV-0208', name: '全光谱 LED 智慧路灯', model: 'TS-LED-180W-C', type: '智慧灯具', spec: '180W / IP66 / 光敏' },
  { id: 'DEV-0301', name: '边缘多功能照明网关', model: 'TS-GW-5000', type: '智能网关', spec: 'RS485 / 4G双模' },
  { id: 'DEV-0312', name: '多回路智慧配电驱动器', model: 'TS-DRV-400W', type: '驱动电源', spec: '恒流双通道 / 远程遥测' },
  { id: 'DEV-0320', name: '微波空间存在感应模块', model: 'TS-SN-MW02', type: '传感器', spec: '24GHz 毫米波探测' },
];

export function DeviceDeploymentPage() {
  const [selectedProject, setSelectedProject] = useState(projects[0]?.name ?? '厦门智慧照明示范项目');
  const projectStations = useMemo(() => stations.filter((st) => st.project === selectedProject), [selectedProject]);
  const [selectedStation, setSelectedStation] = useState(projectStations[0]?.name ?? '高崎空港互通示范站');

  const currentStation = useMemo(() => {
    return stations.find((st) => st.name === selectedStation) || projectStations[0] || stations[0];
  }, [selectedStation, projectStations]);

  const [points, setPoints] = useState<MapPoint[]>(INITIAL_POINTS);
  const [pendingDevices, setPendingDevices] = useState<PendingDevice[]>(INITIAL_PENDING_DEVICES);
  const [deviceSearch, setDeviceSearch] = useState('');

  const handleStationChange = (stName: string) => {
    setSelectedStation(stName);
    const matched = STATION_DEFAULT_POINTS[stName];
    if (matched) {
      setPoints(matched);
    } else {
      const st = stations.find((s) => s.name === stName);
      const baseLng = st?.lnglat?.[0] ?? 118.1355;
      const baseLat = st?.lnglat?.[1] ?? 24.5386;
      setPoints([
        { id: 'POLE-01', label: `${stName} #01`, lnglat: [Number((baseLng - 0.003).toFixed(4)), Number((baseLat + 0.001).toFixed(4))], circuit: 'A 回路', pole: 'POLE-01', status: 'deployed' },
        { id: 'POLE-02', label: `${stName} #02`, lnglat: [baseLng, baseLat], circuit: 'A 回路', pole: 'POLE-02', status: 'deployed' },
        { id: 'POLE-03', label: `${stName} #03`, lnglat: [Number((baseLng + 0.003).toFixed(4)), Number((baseLat - 0.001).toFixed(4))], circuit: 'B 回路', pole: 'POLE-03', status: 'pending' },
      ]);
    }
  };

  const handleProjectChange = (projName: string) => {
    setSelectedProject(projName);
    const related = stations.filter((st) => st.project === projName);
    const firstStation = related[0]?.name ?? '';
    handleStationChange(firstStation);
  };

  // 侧拉分析抽屉开合状态
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 部署弹窗状态
  const [deployDialogPoint, setDeployDialogPoint] = useState<MapPoint | null>(null);
  const [dialogDeviceId, setDialogDeviceId] = useState('');
  const [dialogCircuit, setDialogCircuit] = useState('A 回路-东段');

  // 新建点位弹窗状态
  const [newPointCoords, setNewPointCoords] = useState<{ lnglat: [number, number]; x?: number; y?: number } | null>(null);
  const [newPointLabel, setNewPointLabel] = useState('');

  // 统计数值
  const deployedCount = points.filter((p) => p.status === 'deployed').length;
  const pendingCount = points.filter((p) => p.status === 'pending').length;

  // 触发点击点位
  const handlePointClick = (point: MapPoint) => {
    setDeployDialogPoint(point);
    setDialogCircuit(point.circuit || 'A 回路-东段');
    if (point.status === 'deployed') {
      setDialogDeviceId(point.deviceId || '');
    } else {
      setDialogDeviceId(pendingDevices[0]?.id ?? '');
    }
  };

  // 触发地图空白处加点
  const handleCanvasClick = (coords: { lnglat: [number, number]; x?: number; y?: number }) => {
    const nextIndex = points.length + 1;
    setNewPointCoords(coords);
    setNewPointLabel(`POLE-${nextIndex < 10 ? '0' + nextIndex : nextIndex}`);
  };

  // 确认在空白处新建点位
  const handleConfirmCreatePoint = () => {
    if (!newPointCoords) return;
    const newPoint: MapPoint = {
      id: newPointLabel,
      label: `${selectedStation} #${newPointLabel.slice(-2)}`,
      lnglat: newPointCoords.lnglat,
      x: newPointCoords.x ?? 50,
      y: newPointCoords.y ?? 50,
      circuit: 'A 回路-东段',
      status: 'pending',
    };
    setPoints((prev) => [...prev, newPoint]);
    toast.success(`成功在真实 GPS 坐标 [${newPointCoords.lnglat[0]}, ${newPointCoords.lnglat[1]}] 新建点位 [${newPointLabel}]！`);
    setNewPointCoords(null);
  };

  // 确认执行部署
  const handleConfirmDeploy = () => {
    if (!deployDialogPoint) return;
    if (!dialogDeviceId) {
      toast.error('请选择需要绑定的待部署设备');
      return;
    }

    const selectedDev = pendingDevices.find((d) => d.id === dialogDeviceId);
    setPoints((prev) =>
      prev.map((p) => {
        if (p.id === deployDialogPoint.id) {
          return {
            ...p,
            status: 'deployed',
            deviceId: dialogDeviceId,
            deviceName: selectedDev?.name ?? '智能单灯控制器',
            deviceType: selectedDev?.type ?? '单灯控制器',
            circuit: dialogCircuit,
          };
        }
        return p;
      })
    );

    setPendingDevices((prev) => prev.filter((d) => d.id !== dialogDeviceId));
    toast.success(`设备 [${dialogDeviceId}] 已成功部署到点位 [${deployDialogPoint.id}]！`);
    setDeployDialogPoint(null);
  };

  // 解除部署 / 卸载设备
  const handleUnassignDevice = () => {
    if (!deployDialogPoint || !deployDialogPoint.deviceId) return;

    // 回收设备到待分配池
    const recoveredDevice: PendingDevice = {
      id: deployDialogPoint.deviceId,
      name: deployDialogPoint.deviceName ?? '智能照明设备',
      model: 'TS-Recovered-Model',
      type: deployDialogPoint.deviceType ?? '单灯控制器',
      spec: '已解绑 / 待重新入库分配',
    };
    setPendingDevices((prev) => [recoveredDevice, ...prev]);

    // 点位恢复为空闲待部署
    setPoints((prev) =>
      prev.map((p) =>
        p.id === deployDialogPoint.id
          ? {
              ...p,
              status: 'pending',
              deviceId: undefined,
              deviceName: undefined,
              deviceType: undefined,
            }
          : p
      )
    );

    toast.success(`已卸载点位 [${deployDialogPoint.id}] 的设备，设备已重新退回待部署池`);
    setDeployDialogPoint(null);
  };

  // 删除该灯杆点位
  const handleDeletePoint = () => {
    if (!deployDialogPoint) return;
    if (deployDialogPoint.deviceId) {
      // 若已部署设备，先回收设备
      const recoveredDevice: PendingDevice = {
        id: deployDialogPoint.deviceId,
        name: deployDialogPoint.deviceName ?? '智能照明设备',
        model: 'TS-Recovered-Model',
        type: deployDialogPoint.deviceType ?? '单灯控制器',
        spec: '已解绑 / 点位已删除',
      };
      setPendingDevices((prev) => [recoveredDevice, ...prev]);
    }

    setPoints((prev) => prev.filter((p) => p.id !== deployDialogPoint.id));
    toast.success(`已从地图上移除点位 [${deployDialogPoint.id}]`);
    setDeployDialogPoint(null);
  };

  const filteredPending = useMemo(() => {
    const q = deviceSearch.trim().toLowerCase();
    if (!q) return pendingDevices;
    return pendingDevices.filter(
      (d) => d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || d.model.toLowerCase().includes(q)
    );
  }, [pendingDevices, deviceSearch]);

  return (
    <div className="space-y-4">
      {/* 顶部 Header：去除大卡片后，整体上提，视野大幅开阔 */}
      <PageHeader
        eyebrow="设备管理 / 设备部署"
        title="设备点位部署工作台"
        description="选择目标项目及场站，在交互式地图上滚轮缩放、拖拽平移，支持点击空闲点部署、点击已有节点解除/删除、点击空白道路插旗建点。"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              className="h-8 gap-1.5 border-brand-500/30 bg-brand-500/10 text-xs font-medium text-brand-700 dark:text-brand-300 hover:bg-brand-500/20 shadow-xs"
            >
              <BarChart3 className="size-3.5" />
              部署概况与分析
            </Button>
          </div>
        }
      />

      {/* 左右核心操作区分栏 */}
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* 左侧：选择栏 + 待部署设备池 */}
        <div className="space-y-4">
          {/* 左侧上部：项目与场站选择 + 极简常态指标小药丸 */}
          <section className="app-surface rounded-2xl p-4 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center text-xs font-semibold text-foreground">
                <span className="mr-1.5 inline-block h-3.5 w-1 rounded-full bg-brand-600 dark:bg-brand-400" />
                1. 选择所属项目与场站
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] text-muted-foreground">所属项目</label>
                <Select value={selectedProject} onValueChange={handleProjectChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="选择项目" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.name} className="text-xs">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] text-muted-foreground">运营场站</label>
                <Select value={selectedStation} onValueChange={handleStationChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="选择场站" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStations.map((st) => (
                      <SelectItem key={st.id} value={st.name} className="text-xs">
                        {st.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 极简状态胶囊指示条：取代原本 140px 的庞大卡片 */}
            <div
              onClick={() => setIsDrawerOpen(true)}
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-border/80 bg-muted/40 px-3 py-2 text-xs transition-colors hover:bg-muted/70 hover:border-brand-500/30"
              title="点击查看详细部署统计与回路占比"
            >
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  已部署 {deployedCount}
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  待部署 {pendingCount}
                </span>
                <span className="flex items-center gap-1 text-brand-600 dark:text-brand-300">
                  <span className="size-1.5 rounded-full bg-brand-500" />
                  待分配 {pendingDevices.length}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground group-hover:text-brand-600">
                概况 ➔
              </span>
            </div>
          </section>

          {/* 左侧下部：待部署设备池 */}
          <section className="app-surface rounded-2xl p-4 border border-border flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="flex items-center text-xs font-semibold text-foreground">
                <span className="mr-1.5 inline-block h-3.5 w-1 rounded-full bg-brand-600 dark:bg-brand-400" />
                2. 待分配设备池
              </h2>
              <Badge variant="outline" className="text-[10px] font-mono bg-brand-500/10 text-brand-700 dark:text-brand-300">
                余 {pendingDevices.length} 台
              </Badge>
            </div>

            <div className="relative mb-2.5">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
                placeholder="搜索待部署编号/型号..."
                className="h-7 pl-7 text-[11px] bg-background/50"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredPending.length === 0 ? (
                <div className="py-16 text-center text-xs text-muted-foreground">
                  待分配设备池已空（或已全部部署）
                </div>
              ) : (
                filteredPending.map((dev) => (
                  <div
                    key={dev.id}
                    className="rounded-xl border border-border/80 bg-background/40 p-2.5 text-xs transition-colors hover:border-brand-500/40 hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-brand-600 dark:text-brand-300">
                        {dev.id}
                      </span>
                      <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-[9px] text-amber-700 dark:text-amber-300">
                        待部署
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs font-medium text-foreground">{dev.name}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>{dev.model}</span>
                      <span>{dev.type}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* 右侧：高质感交互式电子地图（滚轮缩放、鼠标拖拽、点位增删） */}
        <section className="app-surface rounded-2xl p-4 border border-border flex flex-col min-h-[620px]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-brand-500" />
                  {selectedStation} · 电子点位地图
                </h2>
                <Badge variant="outline" className="text-[10px] bg-brand-500/10 text-brand-700 dark:text-brand-300">
                  {selectedProject}
                </Badge>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                支持 <span className="text-foreground font-medium">滚轮缩放</span>、<span className="text-foreground font-medium">鼠标按住拖拽</span>；点击黄色点位部署，点击蓝色点位解除/删除，点击空白道路可插旗新建。
              </p>
            </div>
          </div>

          {/* 交互式地图组件 */}
          <div className="flex-1 min-h-[520px]">
            <InteractiveMapCanvas
              points={points}
              stationName={selectedStation}
              roadName={currentStation?.road || '主干道路段'}
              centerLnglat={currentStation?.lnglat || [118.142341, 24.529872]}
              zoom={16.5}
              onPointClick={handlePointClick}
              onCanvasClick={handleCanvasClick}
              enableAddMode
              className="h-full min-h-[520px]"
              legend={
                <div className="rounded-xl border border-white/10 bg-slate-900/85 p-2.5 text-[10px] text-slate-300 backdrop-blur space-y-1 shadow-xl">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1">
                    <Layers className="size-3 text-brand-400" />图层说明
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-brand-400" />
                    <span>已部署点位 (点击可解除/删除)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>待部署空闲点位 (点击可部署)</span>
                  </div>
                  <div className="text-[9px] text-slate-400 pt-1 border-t border-white/10">
                    点击空白道路区域 ➔ 新建灯杆
                  </div>
                </div>
              }
            />
          </div>
        </section>
      </div>

      {/* 侧拉分析抽屉（Sheet / Drawer）：容纳原顶部统计及深度分析 */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="h-full w-full max-w-sm border-l border-border bg-card p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-brand-600" />
                <h3 className="font-semibold text-sm text-foreground">场站部署概况与分析</h3>
              </div>
              <Button size="icon-xs" variant="ghost" onClick={() => setIsDrawerOpen(false)}>
                <X className="size-4 text-muted-foreground" />
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              {/* 核心指标 */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-border bg-muted/30 p-2.5">
                  <p className="text-[10px] text-muted-foreground">已部署点位</p>
                  <p className="mt-1 font-mono text-xl font-bold text-emerald-600">{deployedCount}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-2.5">
                  <p className="text-[10px] text-muted-foreground">待部署点位</p>
                  <p className="mt-1 font-mono text-xl font-bold text-amber-500">{pendingCount}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-2.5">
                  <p className="text-[10px] text-muted-foreground">备件池待分配</p>
                  <p className="mt-1 font-mono text-xl font-bold text-brand-600">{pendingDevices.length}</p>
                </div>
              </div>

              {/* 回路部署覆盖率 */}
              <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2.5 text-xs">
                <h4 className="font-medium text-foreground">各回路部署进度</h4>
                {[
                  { name: 'A 回路 - 东段 (主干北侧)', rate: 100 },
                  { name: 'B 回路 - 中段 (立交匝道)', rate: 50 },
                  { name: 'C 回路 - 西段 (高架辅道)', rate: 0 },
                ].map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{item.name}</span>
                      <span className="font-mono">{item.rate}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-brand-600 rounded-full" style={{ width: `${item.rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* 施工动态日志 */}
              <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2 text-xs">
                <h4 className="font-medium text-foreground">今日部署日志</h4>
                <div className="space-y-2 text-[11px] text-muted-foreground">
                  <p>· 09:40 陈明远 完成 POLE-01 单灯控制器现场复核</p>
                  <p>· 09:12 周启航 在 POLE-03 挂接边缘智能网关</p>
                  <p>· 08:30 系统自动校准 环岛南路 全网回路通信链路</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 点击点位弹出：部署或解除/删除对话框 */}
      <Dialog open={!!deployDialogPoint} onOpenChange={(open) => !open && setDeployDialogPoint(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HardDriveUpload className="size-5 text-brand-600" />
              {deployDialogPoint?.status === 'deployed' ? '点位设备详情与维护' : '设备部署配置'}
            </DialogTitle>
            <DialogDescription>
              {deployDialogPoint?.status === 'deployed'
                ? '查看当前点位已安装的设备，支持解除绑定或删除此点位。'
                : '将待分配设备绑定至指定灯杆点位，并完成回路划分。'}
            </DialogDescription>
          </DialogHeader>

          {deployDialogPoint && (
            <div className="space-y-3.5 py-2">
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">点位编号:</span>
                  <span className="font-mono font-semibold text-foreground">{deployDialogPoint.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">所属场站:</span>
                  <span className="text-foreground">{selectedStation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">点位状态:</span>
                  <Badge variant="outline" className={cn('text-[10px]', deployDialogPoint.status === 'deployed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600')}>
                    {deployDialogPoint.status === 'deployed' ? '已完成部署' : '空闲待部署'}
                  </Badge>
                </div>
                {deployDialogPoint.status === 'deployed' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">已挂载设备:</span>
                      <span className="font-mono text-brand-600 font-medium">{deployDialogPoint.deviceId} ({deployDialogPoint.deviceName})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">供电回路:</span>
                      <span className="text-foreground font-mono">{deployDialogPoint.circuit}</span>
                    </div>
                  </>
                )}
              </div>

              {/* 仅在待部署点位时展示设备选择 */}
              {deployDialogPoint.status === 'pending' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">绑定设备 (从待分配池选择)</label>
                    <Select value={dialogDeviceId} onValueChange={setDialogDeviceId}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="请选择设备" />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingDevices.length === 0 ? (
                          <SelectItem value="none" disabled className="text-xs">待分配池已空</SelectItem>
                        ) : (
                          pendingDevices.map((d) => (
                            <SelectItem key={d.id} value={d.id} className="text-xs">
                              {d.id} - {d.name} ({d.model})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">分配供电回路</label>
                    <Select value={dialogCircuit} onValueChange={setDialogCircuit}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="选择回路" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A 回路-东段" className="text-xs">A 回路-东段 (主干北侧)</SelectItem>
                        <SelectItem value="B 回路-中段" className="text-xs">B 回路-中段 (立交匝道)</SelectItem>
                        <SelectItem value="C 回路-西段" className="text-xs">C 回路-西段 (高架辅道)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            {deployDialogPoint?.status === 'deployed' ? (
              <div className="flex w-full justify-between items-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDeletePoint}
                  className="gap-1 text-xs"
                >
                  <Trash2 className="size-3.5" />删除此点位
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setDeployDialogPoint(null)}>
                    关闭
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUnassignDevice}
                    className="gap-1 bg-amber-600 text-white hover:bg-amber-700 text-xs shadow-sm"
                  >
                    <Unlink className="size-3.5" />解除部署 (设备回池)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex w-full justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setDeployDialogPoint(null)}>
                  取消
                </Button>
                <Button size="sm" onClick={handleConfirmDeploy} className="bg-brand-600 text-white hover:bg-brand-700 text-xs shadow-sm">
                  <Send className="mr-1.5 size-3.5" />确认部署
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 点击空白处弹出：新建点位对话框 */}
      <Dialog open={!!newPointCoords} onOpenChange={(open) => !open && setNewPointCoords(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-4 text-brand-600" />
              在地图空白路段新建灯杆点位
            </DialogTitle>
            <DialogDescription>
              真实 GPS 坐标：{newPointCoords?.lnglat ? `[经度 ${newPointCoords.lnglat[0]}, 纬度 ${newPointCoords.lnglat[1]}]` : ''}。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">灯杆/点位编号</label>
              <Input
                value={newPointLabel}
                onChange={(e) => setNewPointLabel(e.target.value)}
                placeholder="例如：POLE-07"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setNewPointCoords(null)}>
              取消
            </Button>
            <Button size="sm" onClick={handleConfirmCreatePoint} className="bg-brand-600 text-white hover:bg-brand-700 text-xs">
              确认新增点位
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
