import type {
  AlertRecord,
  Department,
  Deployment,
  Device,
  DeviceModel,
  DeviceType,
  Project,
  ReportPoint,
  Role,
  Station,
  UserAccount,
} from '@/types';

export const projects: Project[] = [
  { id: 'PRJ-001', name: '厦门智慧照明示范项目', city: '厦门市思明区', owner: '叶文来', stations: 128, devices: 5420, onlineRate: 99.84, status: '运行中', updatedAt: '2026-10-24 09:42' },
  { id: 'PRJ-002', name: '同安产业园智慧灯杆项目', city: '厦门市同安区', owner: '陈明远', stations: 46, devices: 1860, onlineRate: 98.72, status: '运行中', updatedAt: '2026-10-24 09:28' },
  { id: 'PRJ-003', name: '湖里区道路照明改造项目', city: '厦门市湖里区', owner: '林晓峰', stations: 73, devices: 3120, onlineRate: 97.91, status: '建设调试', updatedAt: '2026-10-23 18:16' },
  { id: 'PRJ-004', name: '集美新城夜景提升项目', city: '厦门市集美区', owner: '许安然', stations: 35, devices: 940, onlineRate: 99.12, status: '运行中', updatedAt: '2026-10-23 16:40' },
  { id: 'PRJ-005', name: '海沧港区道路照明项目', city: '厦门市海沧区', owner: '周启航', stations: 52, devices: 2240, onlineRate: 96.85, status: '规划中', updatedAt: '2026-10-22 11:24' },
  { id: 'PRJ-006', name: '翔安机场片区智慧灯杆项目', city: '厦门市翔安区', owner: '苏子墨', stations: 64, devices: 2780, onlineRate: 98.36, status: '运行中', updatedAt: '2026-10-21 15:08' },
];

export const stations: Station[] = [
  { id: 'ST-001', name: '高崎空港互通示范站', project: '厦门智慧照明示范项目', address: '湖里区枋钟路 / 迎宾高架枢纽段', devices: 960, onlineRate: 99.88, manager: '叶文来', status: '在线', lnglat: [118.145331, 24.535523], road: '枋钟路双向主干道及迎宾段' },
  { id: 'ST-002', name: '翔安大桥跨海示范段', project: '厦门智慧照明示范项目', address: '厦门第二东通道 · 翔安大桥海上主桥段（刘五店航道）', devices: 480, onlineRate: 99.75, manager: '陈明远', status: '在线', lnglat: [118.179367, 24.559892], road: '翔安大桥跨海主线桥面' },
  { id: 'ST-003', name: '翔安新机场综合枢纽站', project: '翔安机场片区智慧灯杆项目', address: '翔安区大嶝岛新机场航站区交通枢纽 GTC', devices: 1240, onlineRate: 99.52, manager: '苏子墨', status: '在线', lnglat: [118.357962, 24.543815], road: '大嶝岛机场快速路主线' },
  { id: 'ST-004', name: '环岛南路示范段', project: '厦门智慧照明示范项目', address: '思明区环岛南路（曾厝垵-音乐广场海滨段）', devices: 820, onlineRate: 99.92, manager: '叶文来', status: '在线', lnglat: [118.132062, 24.423678], road: '环岛南路海滨景观道' },
  { id: 'ST-005', name: '演武大桥桥面', project: '厦门智慧照明示范项目', address: '思明区演武大桥主线（沙坡尾-双子塔观海段）', devices: 264, onlineRate: 99.61, manager: '陈明远', status: '在线', lnglat: [118.085628, 24.437346], road: '演武大桥观海主线' },
  { id: 'ST-006', name: '同安产业园东区', project: '同安产业园智慧灯杆项目', address: '同安区集成路东段', devices: 486, onlineRate: 98.84, manager: '林晓峰', status: '在线', lnglat: [118.1630, 24.7210], road: '集成路与同盛北路' },
  { id: 'ST-007', name: '湖里大道 A 段', project: '湖里区道路照明改造项目', address: '湖里区湖里大道 A1-A18', devices: 618, onlineRate: 97.52, manager: '周启航', status: '调试', lnglat: [118.1120, 24.5150], road: '湖里大道' },
  { id: 'ST-008', name: '翔安机场快速路', project: '翔安机场片区智慧灯杆项目', address: '翔安区机场快速路北段', devices: 540, onlineRate: 98.46, manager: '苏子墨', status: '在线', lnglat: [118.3240, 24.5680], road: '机场快速路北段' },
];

export const deviceTypes: DeviceType[] = [
  { id: 'DT-001', name: '多功能智慧杆', category: '智慧灯杆', protocol: 'Cat.1', powerRange: '80-240W', deviceCount: 2160, status: '启用' },
  { id: 'DT-002', name: 'LED 高杆灯', category: '道路照明', protocol: 'NB-IoT', powerRange: '120-360W', deviceCount: 1480, status: '启用' },
  { id: 'DT-003', name: '景观氛围灯杆', category: '景观照明', protocol: 'PLC', powerRange: '40-120W', deviceCount: 920, status: '启用' },
  { id: 'DT-004', name: '隧道照明控制器', category: '隧道照明', protocol: 'LoRaWAN', powerRange: '60-180W', deviceCount: 420, status: '启用' },
  { id: 'DT-005', name: '太阳能路灯', category: '新能源照明', protocol: 'NB-IoT', powerRange: '30-80W', deviceCount: 280, status: '停用' },
  { id: 'DT-006', name: '边缘网关', category: '网关设备', protocol: 'Ethernet', powerRange: '8-20W', deviceCount: 160, status: '启用' },
];

export const deviceModels: DeviceModel[] = [
  { id: 'DM-001', name: 'TS-SP-240', type: '多功能智慧杆', manufacturer: '通士达', protocol: 'Cat.1', firmware: 'v3.8.2', status: '启用' },
  { id: 'DM-002', name: 'TS-HP-360', type: 'LED 高杆灯', manufacturer: '通士达', protocol: 'NB-IoT', firmware: 'v2.4.1', status: '启用' },
  { id: 'DM-003', name: 'TS-LP-120', type: '景观氛围灯杆', manufacturer: '通士达', protocol: 'PLC', firmware: 'v2.9.0', status: '启用' },
  { id: 'DM-004', name: 'TS-TC-180', type: '隧道照明控制器', manufacturer: '通士达', protocol: 'LoRaWAN', firmware: 'v1.7.4', status: '启用' },
  { id: 'DM-005', name: 'TS-SL-080', type: '太阳能路灯', manufacturer: '通士达', protocol: 'NB-IoT', firmware: 'v1.2.6', status: '停用' },
  { id: 'DM-006', name: 'TS-GW-20', type: '边缘网关', manufacturer: '通士达', protocol: 'Ethernet', firmware: 'v4.1.0', status: '启用' },
  { id: 'DM-007', name: 'TS-SP-200', type: '多功能智慧杆', manufacturer: '通士达', protocol: 'PLC', firmware: 'v3.5.8', status: '启用' },
  { id: 'DM-008', name: 'TS-HP-300', type: 'LED 高杆灯', manufacturer: '通士达', protocol: 'Cat.1', firmware: 'v2.3.9', status: '启用' },
];

const deviceSeeds: Array<[string, string, string, string, string, string, number, number, number, number, number, string]> = [
  // 高崎空港互通示范站（枋钟路 / 高崎 T3·T4 枢纽段）
  ['DEV-0101', 'T3航站迎宾道 01# 智慧杆', '厦门智慧照明示范项目', '高崎空港互通示范站', '多功能智慧杆', 'TS-SP-240', 85, 120.4, 221.8, 0.54, 34.2, '刚刚'],
  ['DEV-0102', '枋钟路立交主线 02# 智慧杆', '厦门智慧照明示范项目', '高崎空港互通示范站', '多功能智慧杆', 'TS-SP-240', 85, 121.2, 221.5, 0.55, 35.1, '刚刚'],
  ['DEV-0103', 'T4航站连接匝道 03# 智能杆', '厦门智慧照明示范项目', '高崎空港互通示范站', 'LED 高杆灯', 'TS-HP-360', 40, 64.0, 220.9, 0.29, 31.8, '1 分钟前'],
  ['DEV-0104', '环岛干线北立交 04# 智慧杆', '厦门智慧照明示范项目', '高崎空港互通示范站', '多功能智慧杆', 'TS-SP-200', 75, 142.8, 236.4, 0.61, 48.9, '3 分钟前'],
  ['DEV-0105', '枋钟路隧道入口 05# 景观杆', '厦门智慧照明示范项目', '高崎空港互通示范站', '景观氛围灯杆', 'TS-LP-120', 90, 88.5, 221.0, 0.40, 33.4, '刚刚'],
  ['DEV-0106', '大桥西引桥 06# 控制器', '厦门智慧照明示范项目', '高崎空港互通示范站', '单灯控制器', 'TS-SP-240', 0, 0, 0, 0, 22.5, '25 分钟前'],

  // 翔安大桥跨海示范段（第二东通道海上主桥段）
  ['DEV-0111', '西桥头本岛引桥 01# 智慧杆', '厦门智慧照明示范项目', '翔安大桥跨海示范段', '多功能智慧杆', 'TS-SP-240', 95, 158.0, 222.0, 0.71, 33.1, '刚刚'],
  ['DEV-0112', '环岛干线互通高架 02# 智慧杆', '厦门智慧照明示范项目', '翔安大桥跨海示范段', 'LED 高杆灯', 'TS-HP-360', 90, 145.2, 221.4, 0.65, 34.5, '刚刚'],
  ['DEV-0113', '跨海连续梁海中段 03# 测温杆', '厦门智慧照明示范项目', '翔安大桥跨海示范段', '多功能智慧杆', 'TS-SP-240', 80, 130.6, 220.8, 0.59, 35.0, '2 分钟前'],
  ['DEV-0114', '刘五店主航道西塔 04# 高杆灯', '厦门智慧照明示范项目', '翔安大桥跨海示范段', 'LED 高杆灯', 'TS-HP-360', 85, 138.0, 221.5, 0.62, 34.0, '刚刚'],
  ['DEV-0115', '刘五店主航道东塔 05# 高杆灯', '厦门智慧照明示范项目', '翔安大桥跨海示范段', 'LED 高杆灯', 'TS-HP-360', 85, 139.2, 221.6, 0.63, 34.2, '刚刚'],
  ['DEV-0116', '翔安刘五店登陆段 06# 智慧杆', '厦门智慧照明示范项目', '翔安大桥跨海示范段', '多功能智慧杆', 'TS-SP-200', 85, 125.0, 221.2, 0.56, 33.8, '刚刚'],

  // 翔安新机场综合枢纽站（大嶝岛航站楼枢纽）
  ['DEV-0601', '新机场进场大道 01# 智慧杆', '翔安机场片区智慧灯杆项目', '翔安新机场综合枢纽站', '多功能智慧杆', 'TS-SP-240', 88, 126.7, 222.4, 0.57, 34.9, '刚刚'],
  ['DEV-0602', 'GTC 交通中心高架 02# 高杆灯', '翔安机场片区智慧灯杆项目', '翔安新机场综合枢纽站', 'LED 高杆灯', 'TS-HP-360', 82, 112.4, 221.7, 0.51, 36.1, '1 分钟前'],
  ['DEV-0603', '航站楼主落客区 03# 智慧杆', '翔安机场片区智慧灯杆项目', '翔安新机场综合枢纽站', '多功能智慧杆', 'TS-SP-200', 90, 138.0, 223.1, 0.62, 33.8, '刚刚'],
  ['DEV-0604', '空港保税环路 04# 景观杆', '翔安机场片区智慧灯杆项目', '翔安新机场综合枢纽站', '景观氛围灯杆', 'TS-LP-120', 70, 75.0, 220.5, 0.34, 32.0, '5 分钟前'],

  // 原有其他示范站
  ['DEV-0201', '同安产业园东区 01#', '同安产业园智慧灯杆项目', '同安产业园东区', '多功能智慧杆', 'TS-SP-240', 70, 108.2, 220.6, 0.49, 33.8, '刚刚'],
  ['DEV-0202', '同安产业园东区 02#', '同安产业园智慧灯杆项目', '同安产业园东区', 'LED 高杆灯', 'TS-HP-360', 65, 96.8, 219.4, 0.44, 37.2, '2 分钟前'],
  ['DEV-0301', '湖里大道 A01#', '湖里区道路照明改造项目', '湖里大道 A 段', '多功能智慧杆', 'TS-SP-200', 62, 94.6, 218.9, 0.43, 39.1, '4 分钟前'],
  ['DEV-0302', '湖里大道 A02#', '湖里区道路照明改造项目', '湖里大道 A 段', 'LED 高杆灯', 'TS-HP-300', 55, 82.1, 220.1, 0.37, 36.4, '刚刚'],
  ['DEV-0401', '集美核心区 01#', '集美新城夜景提升项目', '集美新城核心区', '景观氛围灯杆', 'TS-LP-120', 78, 71.4, 221.3, 0.32, 32.6, '刚刚'],
  ['DEV-0402', '集美核心区 02#', '集美新城夜景提升项目', '集美新城核心区', '景观氛围灯杆', 'TS-LP-120', 72, 68.2, 220.8, 0.31, 33.2, '刚刚'],
];

export const devices: Device[] = deviceSeeds.map((seed, index) => {
  const [id, name, project, station, type, model, dimming, power, voltage, current, temperature, lastSeen] = seed;
  const status = temperature > 45 ? '告警' : lastSeen.includes('分钟') && lastSeen.includes('25') ? '离线' : dimming < 50 ? '调光' : '在线';
  return { id, name, project, station, type, model, status, protocol: deviceModels.find((item) => item.name === model)?.protocol ?? 'Cat.1', dimming, power, voltage, current, temperature, lastSeen, order: index } as Device;
});

export const deployments: Deployment[] = [
  { id: 'DEP-001', deviceId: 'DEV-0101', project: '厦门智慧照明示范项目', station: '高崎空港互通示范站', circuit: 'A 回路-迎宾段', deployedAt: '2026-10-24 08:30', operator: '陈明远', status: '已部署' },
  { id: 'DEP-002', deviceId: 'DEV-0102', project: '厦门智慧照明示范项目', station: '高崎空港互通示范站', circuit: 'A 回路-迎宾段', deployedAt: '2026-10-24 08:32', operator: '陈明远', status: '已部署' },
  { id: 'DEP-003', deviceId: 'DEV-0111', project: '厦门智慧照明示范项目', station: '翔安大桥跨海示范段', circuit: 'C 回路-桥面', deployedAt: '2026-10-23 17:20', operator: '叶文来', status: '待复核' },
  { id: 'DEP-004', deviceId: 'DEV-0201', project: '同安产业园智慧灯杆项目', station: '同安产业园东区', circuit: 'B 回路-东段', deployedAt: '2026-10-23 15:12', operator: '林晓峰', status: '已部署' },
  { id: 'DEP-005', deviceId: 'DEV-0202', project: '同安产业园智慧灯杆项目', station: '同安产业园东区', circuit: 'B 回路-东段', deployedAt: '2026-10-23 15:13', operator: '林晓峰', status: '已部署' },
  { id: 'DEP-006', deviceId: 'DEV-0301', project: '湖里区道路照明改造项目', station: '湖里大道 A 段', circuit: 'A 回路', deployedAt: '2026-10-23 11:40', operator: '周启航', status: '调试中' },
  { id: 'DEP-007', deviceId: 'DEV-0302', project: '湖里区道路照明改造项目', station: '湖里大道 A 段', circuit: 'A 回路', deployedAt: '2026-10-23 11:41', operator: '周启航', status: '调试中' },
  { id: 'DEP-008', deviceId: 'DEV-0601', project: '翔安机场片区智慧灯杆项目', station: '翔安新机场综合枢纽站', circuit: 'D 回路-进场段', deployedAt: '2026-10-22 16:05', operator: '苏子墨', status: '已部署' },
];

export const departments: Department[] = [
  { id: 'ORG-001', name: '智慧照明事业部', leader: '叶文来', members: 42, parent: '通士达科技', updatedAt: '2026-10-24 08:30', status: '启用' },
  { id: 'ORG-002', name: '产品研发中心', leader: '陈明远', members: 68, parent: '通士达科技', updatedAt: '2026-10-23 18:20', status: '启用' },
  { id: 'ORG-003', name: '项目实施部', leader: '林晓峰', members: 35, parent: '智慧照明事业部', updatedAt: '2026-10-23 16:42', status: '启用' },
  { id: 'ORG-004', name: '运维服务部', leader: '周启航', members: 26, parent: '智慧照明事业部', updatedAt: '2026-10-23 14:10', status: '启用' },
  { id: 'ORG-005', name: '数据运营组', leader: '许安然', members: 14, parent: '产品研发中心', updatedAt: '2026-10-22 10:16', status: '启用' },
  { id: 'ORG-006', name: '区域交付组', leader: '苏子墨', members: 19, parent: '项目实施部', updatedAt: '2026-10-21 09:35', status: '停用' },
];

export const roles: Role[] = [
  { id: 'ROLE-001', name: '品牌系统管理员', code: 'SUPER_ADMIN', users: 2, scope: '全平台', permissions: '全部权限', status: '启用' },
  { id: 'ROLE-002', name: '项目管理员', code: 'PROJECT_ADMIN', users: 8, scope: '所属项目', permissions: '项目、设备、告警管理', status: '启用' },
  { id: 'ROLE-003', name: '运营管理员', code: 'OPS_ADMIN', users: 26, scope: '所属场站', permissions: '监控、策略、工单处置', status: '启用' },
  { id: 'ROLE-004', name: '数据分析员', code: 'DATA_ANALYST', users: 6, scope: '所属项目', permissions: '数据统计与导出', status: '启用' },
  { id: 'ROLE-005', name: '维修工程师', code: 'MAINTENANCE_ENGINEER', users: 15, scope: '所属场站', permissions: '设备巡检、故障维修与核销', status: '启用' },
];

export const users: UserAccount[] = [
  { id: 'USR-001', name: '叶文来', account: 'admin', department: '智慧照明事业部', role: '品牌系统管理员', phone: '138****1024', lastLogin: '2026-10-24 09:52', status: '启用' },
  { id: 'USR-002', name: '陈明远', account: 'chenmy', department: '产品研发中心', role: '项目管理员', phone: '139****5618', lastLogin: '2026-10-24 09:28', status: '启用' },
  { id: 'USR-003', name: '林晓峰', account: 'linxf', department: '项目实施部', role: '项目管理员', phone: '136****8721', lastLogin: '2026-10-24 09:05', status: '启用' },
  { id: 'USR-004', name: '周启航', account: 'zhouqh', department: '运维服务部', role: '运营管理员', phone: '137****3625', lastLogin: '2026-10-24 08:47', status: '启用' },
  { id: 'USR-005', name: '许安然', account: 'xuanr', department: '数据运营组', role: '数据分析员', phone: '135****1148', lastLogin: '2026-10-23 18:32', status: '启用' },
  { id: 'USR-006', name: '苏子墨', account: 'suzm', department: '区域交付组', role: '项目管理员', phone: '188****7023', lastLogin: '2026-10-23 17:10', status: '启用' },
  { id: 'USR-007', name: '黄嘉怡', account: 'huangjy', department: '运维服务部', role: '维修工程师', phone: '150****9120', lastLogin: '2026-10-23 16:55', status: '启用' },
  { id: 'USR-008', name: '吴泽宇', account: 'wuzy', department: '产品研发中心', role: '数据分析员', phone: '151****4362', lastLogin: '2026-10-23 15:22', status: '启用' },
  { id: 'USR-009', name: '郑思远', account: 'zhengsy', department: '项目实施部', role: '维修工程师', phone: '186****5330', lastLogin: '2026-10-22 11:08', status: '启用' },
  { id: 'USR-010', name: '李若溪', account: 'lirx', department: '智慧照明事业部', role: '维修工程师', phone: '159****2416', lastLogin: '2026-10-21 09:40', status: '启用' },
];

export const alerts: AlertRecord[] = [
  { id: 'ALM-2026-0842', level: '紧急', title: '驱动电源过温告警 48.9°C', device: 'DEV-0104', location: '厦门智慧照明示范项目 · 环岛南路示范段', time: '09:48:12', status: '处理中' },
  { id: 'ALM-2026-0839', level: '主要', title: 'NB-IoT 无线载波信号丢失超过 25 分钟', device: 'DEV-0107', location: '厦门智慧照明示范项目 · 演武大桥桥面', time: '09:25:00', status: '待处理' },
  { id: 'ALM-2026-0835', level: '次要', title: '光感阈值与策略预期偏差 12%', device: 'DEV-0202', location: '同安产业园智慧灯杆项目 · 东区', time: '08:56:22', status: '待处理' },
  { id: 'ALM-2026-0828', level: '主要', title: '回路电流波动超过阈值', device: 'DEV-0301', location: '湖里区道路照明改造项目 · 湖里大道 A 段', time: '08:31:16', status: '处理中' },
  { id: 'ALM-2026-0824', level: '次要', title: '设备时钟同步偏移 4.2 秒', device: 'DEV-0401', location: '集美新城夜景提升项目 · 核心区', time: '08:12:04', status: '已恢复' },
  { id: 'ALM-2026-0819', level: '紧急', title: '边缘网关离线', device: 'DEV-0602', location: '翔安机场片区智慧灯杆项目 · 快速路', time: '07:58:41', status: '已恢复' },
  { id: 'ALM-2026-0814', level: '次要', title: '灯具亮度低于策略目标值', device: 'DEV-0105', location: '厦门智慧照明示范项目 · 环岛南路示范段', time: '07:34:10', status: '已恢复' },
];

export const reportSeries: Record<'daily' | 'weekly' | 'monthly', ReportPoint[]> = {
  daily: [
    { label: '00:00', energy: 72, savings: 28 }, { label: '02:00', energy: 54, savings: 36 }, { label: '04:00', energy: 42, savings: 41 },
    { label: '06:00', energy: 60, savings: 31 }, { label: '08:00', energy: 96, savings: 18 }, { label: '10:00', energy: 108, savings: 15 },
    { label: '12:00', energy: 112, savings: 14 }, { label: '14:00', energy: 118, savings: 12 }, { label: '16:00', energy: 126, savings: 11 },
    { label: '18:00', energy: 154, savings: 22 }, { label: '20:00', energy: 168, savings: 29 }, { label: '22:00', energy: 142, savings: 34 },
  ],
  weekly: [
    { label: '周一', energy: 842, savings: 26 }, { label: '周二', energy: 918, savings: 28 }, { label: '周三', energy: 886, savings: 27 },
    { label: '周四', energy: 954, savings: 31 }, { label: '周五', energy: 1024, savings: 34 }, { label: '周六', energy: 1086, savings: 38 },
    { label: '周日', energy: 972, savings: 36 },
  ],
  monthly: [
    { label: '1月', energy: 3240, savings: 22 }, { label: '2月', energy: 2980, savings: 24 }, { label: '3月', energy: 3360, savings: 25 },
    { label: '4月', energy: 3520, savings: 28 }, { label: '5月', energy: 3740, savings: 30 }, { label: '6月', energy: 3980, savings: 32 },
    { label: '7月', energy: 4260, savings: 35 }, { label: '8月', energy: 4180, savings: 34 }, { label: '9月', energy: 3890, savings: 31 },
    { label: '10月', energy: 3720, savings: 33 }, { label: '11月', energy: 3480, savings: 29 }, { label: '12月', energy: 3320, savings: 27 },
  ],
};

export const brandCapabilities = [
  { title: '智慧照明控制', description: '统一管理灯杆、灯具、回路和亮度策略，支持远程调光与场景联动。', icon: 'lightbulb' },
  { title: '空间感知网络', description: '连接环境、能耗、交通与设备状态数据，构建城市级空间感知底座。', icon: 'radar' },
  { title: '智能运维中枢', description: '从告警发现、工单派发到恢复确认，形成可追溯的闭环运维流程。', icon: 'wrench' },
  { title: '数据洞察与节能', description: '按日、周、月分析能耗与节能成效，为运营决策提供实时依据。', icon: 'chart' },
];
