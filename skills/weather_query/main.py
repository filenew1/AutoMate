#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""天气查询技能 - 查询指定城市的天气信息，默认查询深圳"""

import requests
import json
import sys
import os


def load_city_map():
    """加载城市映射配置"""
    config_path = os.path.join(os.path.dirname(__file__), 'city_map.json')
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        city_map = {}
        city_map.update(data.get('province_capitals', {}))
        city_map.update(data.get('major_cities', {}))
        return city_map
    except Exception as e:
        print(f"[Warning] 加载城市映射配置失败: {e}", file=sys.stderr)
        return {
            '深圳': 'Shenzhen',
            '北京': 'Beijing',
            '上海': 'Shanghai',
            '广州': 'Guangzhou',
            '杭州': 'Hangzhou',
            '成都': 'Chengdu',
            '武汉': 'Wuhan',
            '西安': "Xi'an",
            '南京': 'Nanjing',
            '重庆': 'Chongqing',
            '天津': 'Tianjin'
        }


CITY_MAP = load_city_map()


def query_weather(location="深圳"):
    """查询天气"""
    API_KEY = "cec42fc25f5a5c76e46f88cf536725bf"
    BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

    city_map = CITY_MAP

    known_cities = list(city_map.keys())

    # 清理输入
    location = location.strip() if location else "深圳"

    # 尝试从输入中提取城市名
    found_city = None
    for city in known_cities:
        if city in location:
            found_city = city
            break

    # 如果没有找到，尝试匹配英文或中文
    if not found_city:
        location_lower = location.lower()
        for cn_city, en_city in city_map.items():
            if en_city.lower() in location_lower or cn_city.lower() in location_lower:
                found_city = cn_city
                break

    # 如果还是没找到，返回错误
    if not found_city:
        return {
            'success': False,
            'error': f'无法识别城市：{location}（请使用标准城市名称，如：北京、上海、深圳）'
        }

    # 获取英文城市名，附加 ,CN 确保匹配中国城市
    query_city = city_map.get(found_city, found_city)
    params = {'q': f'{query_city},CN', 'appid': API_KEY, 'lang': 'zh_cn', 'units': 'metric'}

    try:
        response = requests.get(BASE_URL, params=params, timeout=10)

        if response.status_code == 404:
            return {
                'success': False,
                'error': f'未找到城市：{location}（请使用标准城市名称）'
            }

        response.raise_for_status()
        data = response.json()

        return {
            'success': True,
            'location': data.get('name', location),
            'weather': data['weather'][0]['description'],
            'temperature': round(float(data['main']['temp']), 1),
            'feels_like': round(float(data['main']['feels_like']), 1),
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'wind_speed': round(float(data['wind']['speed']), 1),
            'country': data['sys']['country']
        }
    except requests.exceptions.HTTPError as e:
        return {
            'success': False,
            'error': f'天气服务响应错误：{str(e)}'
        }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': f'网络请求失败：{str(e)}'
        }
    except KeyError as e:
        return {
            'success': False,
            'error': f'数据解析错误：{str(e)}'
        }


def format_report(weather_data):
    """格式化报告"""
    if not weather_data.get('success'):
        return f"❌ {weather_data.get('error', '未知错误')}"
    report = f"""🌤️ {weather_data['location']} 天气报告

📍 地区：{weather_data.get('country', '')}
🌡️  温度：{weather_data['temperature']}°C (体感：{weather_data['feels_like']}°C)
☁️  天气：{weather_data['weather']}
💧 湿度：{weather_data['humidity']}%
📊 气压：{weather_data['pressure']} hPa
💨 风速：{weather_data['wind_speed']} m/s
"""
    return report


def main(location=None):
    """主函数"""
    if not location or location.strip() == "":
        location = "深圳"
    try:
        weather_data = query_weather(location)
        report = format_report(weather_data)
        return report
    except Exception as e:
        return f"❌ 查询失败：{str(e)}"


if __name__ == '__main__':
    location = None
    args = sys.argv[1:]
    for i, arg in enumerate(args):
        if arg == '--params' and i + 1 < len(args):
            try:
                params = json.loads(args[i + 1])
                location = params.get('input', params.get('location', None))
            except Exception:
                pass
    print(main(location))
