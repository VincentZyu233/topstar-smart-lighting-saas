"""
17_fetch_real_road_geometry.py
调研与实测脚本：获取厦门四条示范路段（高崎空港枋钟路、翔安大桥、环岛南路、演武大桥）的真实物理道路线型与等距路灯点位
"""

import math
import requests
import json

PROXIES = {'http': 'http://127.0.0.1:7890', 'https': 'http://127.0.0.1:7890'}

# 标准 WGS84 转 GCJ-02 (火星坐标系，高德地图使用)
PI = 3.1415926535897932384626
A = 6378245.0
EE = 0.00669342162296594323

def transform_lat(x, y):
    ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * math.sqrt(abs(x))
    ret += (20.0 * math.sin(6.0 * x * PI) + 20.0 * math.sin(2.0 * x * PI)) * 2.0 / 3.0
    ret += (20.0 * math.sin(y * PI) + 40.0 * math.sin(y / 3.0 * PI)) * 2.0 / 3.0
    ret += (160.0 * math.sin(y / 12.0 * PI) + 320 * math.sin(y * PI / 30.0)) * 2.0 / 3.0
    return ret

def transform_lon(x, y):
    ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * math.sqrt(abs(x))
    ret += (20.0 * math.sin(6.0 * x * PI) + 20.0 * math.sin(2.0 * x * PI)) * 2.0 / 3.0
    ret += (20.0 * math.sin(x * PI) + 40.0 * math.sin(x / 3.0 * PI)) * 2.0 / 3.0
    ret += (150.0 * math.sin(x / 12.0 * PI) + 300.0 * math.sin(x / 30.0 * PI)) * 2.0 / 3.0
    return ret

def wgs84_to_gcj02(lon, lat):
    d_lat = transform_lat(lon - 105.0, lat - 35.0)
    d_lon = transform_lon(lon - 105.0, lat - 35.0)
    rad_lat = lat / 180.0 * PI
    magic = math.sin(rad_lat)
    magic = 1 - EE * magic * magic
    sqrt_magic = math.sqrt(magic)
    d_lat = (d_lat * 180.0) / ((A * (1 - EE)) / (magic * sqrt_magic) * PI)
    d_lon = (d_lon * 180.0) / (A / sqrt_magic * math.cos(rad_lat) * PI)
    return round(lon + d_lon, 6), round(lat + d_lat, 6)

def distance_meters(p1, p2):
    # p: [lon, lat]
    R = 6371000
    phi1 = math.radians(p1[1])
    phi2 = math.radians(p2[1])
    delta_phi = math.radians(p2[1] - p1[1])
    delta_lambda = math.radians(p2[0] - p1[0])
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def sample_along_path(coords, target_count=15):
    # 计算总里程
    total_dist = 0
    dists = [0]
    for i in range(1, len(coords)):
        d = distance_meters(coords[i-1], coords[i])
        total_dist += d
        dists.append(total_dist)
    
    step = total_dist / (target_count - 1)
    sampled = []
    
    for i in range(target_count):
        target_d = i * step
        # 寻找所在区间
        for j in range(len(dists) - 1):
            if dists[j] <= target_d <= dists[j+1]:
                seg_len = dists[j+1] - dists[j]
                ratio = (target_d - dists[j]) / seg_len if seg_len > 0 else 0
                lon = coords[j][0] + (coords[j+1][0] - coords[j][0]) * ratio
                lat = coords[j][1] + (coords[j+1][1] - coords[j][1]) * ratio
                sampled.append((round(lon, 6), round(lat, 6)))
                break
    return sampled

ROADS = {
    "翔安大桥跨海示范段": {
        "start": (118.163, 24.537), # 本岛端环岛干线立交
        "end": (118.196, 24.561),   # 翔安刘五店登陆端
        "target_count": 16,
    },
    "高崎空港枋钟路": {
        "start": (118.125, 24.530), # 枋钟路T3西侧
        "end": (118.152, 24.532),   # 枋钟路T4东侧立交
        "target_count": 14,
    },
    "环岛南路海滨示范段": {
        "start": (118.115, 24.425), # 珍珠湾
        "end": (118.140, 24.427),   # 曾厝垵/音乐广场海滨
        "target_count": 14,
    },
    "演武大桥桥面": {
        "start": (118.087, 24.434), # 演武立交
        "end": (118.093, 24.444),   # 双子塔沿海桥面
        "target_count": 12,
    }
}

def main():
    print("=" * 60)
    print("开始获取厦门重点道路高精物理走向数据 (OSRM Routing Engine)...")
    print("=" * 60)

    for road_name, cfg in ROADS.items():
        s_lon, s_lat = cfg["start"]
        e_lon, e_lat = cfg["end"]
        url = f"https://router.project-osrm.org/route/v1/driving/{s_lon},{s_lat};{e_lon},{e_lat}?overview=full&geometries=geojson"
        
        try:
            resp = requests.get(url, proxies=PROXIES, timeout=12)
            data = resp.json()
            if data.get("code") == "Ok":
                raw_coords = data["routes"][0]["geometry"]["coordinates"]
                length_m = data["routes"][0]["distance"]
                print(f"\n[OK] {road_name}: 抓取成功! 全程 {length_m:.1f} 米, 包含 {len(raw_coords)} 个物理拐点")
                
                # 转为高德 GCJ-02 火星坐标
                gcj_coords = [wgs84_to_gcj02(c[0], c[1]) for c in raw_coords]
                
                # 沿道路物理中心线等距采样路灯
                lamps = sample_along_path(gcj_coords, cfg["target_count"])
                print(f"  -> 生成 {len(lamps)} 盏高密度路灯 (间距约 {length_m/(len(lamps)-1):.1f} 米):")
                for idx, lamp in enumerate(lamps[:4], 1):
                    print(f"     POLE-{idx:02d}: {lamp}")
                print(f"     ... 共 {len(lamps)} 盏灯杆")
            else:
                print(f"[FAIL] {road_name}: OSRM 返回错误 {data.get('code')}")
        except Exception as err:
            print(f"[ERROR] {road_name}: {err}")

if __name__ == "__main__":
    main()
