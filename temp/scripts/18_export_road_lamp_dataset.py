"""
18_export_road_lamp_dataset.py
从真实路网轨迹中提取并导出 TypeScript 代码所需的严谨路灯点位数据
"""

import math
import requests
import json

PROXIES = {'http': 'http://127.0.0.1:7890', 'https': 'http://127.0.0.1:7890'}

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
    R = 6371000
    phi1 = math.radians(p1[1])
    phi2 = math.radians(p2[1])
    delta_phi = math.radians(p2[1] - p1[1])
    delta_lambda = math.radians(p2[0] - p1[0])
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def sample_dense(coords, target_count=14):
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
        for j in range(len(dists) - 1):
            if dists[j] <= target_d <= dists[j+1]:
                seg_len = dists[j+1] - dists[j]
                ratio = (target_d - dists[j]) / seg_len if seg_len > 0 else 0
                lon = coords[j][0] + (coords[j+1][0] - coords[j][0]) * ratio
                lat = coords[j][1] + (coords[j+1][1] - coords[j][1]) * ratio
                sampled.append((round(lon, 6), round(lat, 6)))
                break
    return sampled, total_dist

SECTIONS = [
    {
        "station": "高崎空港互通示范站",
        "road": "枋钟路与迎宾大道",
        "start": (118.1275, 24.5285),
        "end": (118.1450, 24.5310),
        "count": 14,
        "prefix": "POLE-0",
    },
    {
        "station": "翔安大桥跨海示范段",
        "road": "翔安大桥跨海快速路",
        "start": (118.1630, 24.5385),
        "end": (118.1950, 24.5610),
        "count": 16,
        "prefix": "POLE-1",
    },
    {
        "station": "环岛南路示范段",
        "road": "环岛南路海滨景观道",
        "start": (118.1200, 24.4255),
        "end": (118.1360, 24.4245),
        "count": 14,
        "prefix": "POLE-3",
    },
    {
        "station": "演武大桥桥面",
        "road": "演武大桥观海主线",
        "start": (118.0870, 24.4350),
        "end": (118.0930, 24.4440),
        "count": 12,
        "prefix": "POLE-4",
    }
]

def main():
    results = {}
    for item in SECTIONS:
        s_lon, s_lat = item["start"]
        e_lon, e_lat = item["end"]
        url = f"https://router.project-osrm.org/route/v1/driving/{s_lon},{s_lat};{e_lon},{e_lat}?overview=full&geometries=geojson"
        resp = requests.get(url, proxies=PROXIES, timeout=12).json()
        if resp.get("code") == "Ok":
            wgs_path = resp["routes"][0]["geometry"]["coordinates"]
            gcj_path = [wgs84_to_gcj02(pt[0], pt[1]) for pt in wgs_path]
            sampled, total_m = sample_dense(gcj_path, item["count"])
            results[item["station"]] = {
                "road": item["road"],
                "total_meters": round(total_m, 1),
                "spacing_meters": round(total_m / (item["count"] - 1), 1),
                "center": sampled[len(sampled) // 2],
                "points": sampled
            }
            print(f"[{item['station']}] 采样成功: {len(sampled)} 个路灯, 间距 {round(total_m / (item['count'] - 1), 1)} 米, 中心: {sampled[len(sampled) // 2]}")

    with open("D:/aaaStuffsaaa/from_git/gitee/topstar-smart-lighting-saas/temp/scripts/sampled_road_lamps.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("\n已保存至 temp/scripts/sampled_road_lamps.json")

if __name__ == "__main__":
    main()
