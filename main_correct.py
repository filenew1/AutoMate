#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""天气查询技能 - 查询指定城市的天气信息，默认查询深圳"""

import requests
import json
import sys

def query_weather(location="深圳"):
    """查询天气"""
  API_KEY = "cec42fc25f5a5c76e46f88cf536725bf"
    BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
 params = {'q': location, 'appid': API_KEY, 'lang': 'zh_cn', 'units': 'metric'}
    
    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('cod') != 200:
            return {'success': False, 'error': f'未找到城市：{location}'}
        
        return {
            'success': True,
            'location': data.get('name', location),
            'weather': data['weather'][0]['description'],
            'temperature': data['main']['temp'],
            'feels_like': data['main']['feels_like'],
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'wind_speed': data['wind']['speed'],
            'country': data['sys']['country']
        }
    except requests.exceptions.HTTPError as e:
        return {'success': False, 'error': f'天气服务响应错误：{str(e)}'}
    except requests.exceptions.RequestException as e:
        return {'success': False, 'error': f'网络请求失败：{str(e)}'}
    except KeyError as e:
        return {'success': False, 'error': f'数据解析错误：{str(e)}'}

def format_report(weather_data):
    if not weather_data.get('success'):
        return f"❌ {weather_data.get('error', '未知错误')}"
    report = f"""🌤️ {weather_data['location']} 天气报告

📍 地区：{weather_data.get('country', '')}
🌡️  温度：{weather_data['temperature']}°C (体感：{weather_data['feels_like']}°C)
☁️  天气：{weather_data['weather']}
💧  湿度：{weather_data['humidity']}%
📊  气压：{weather_data['pressure']} hPa
💨  风速：{weather_data['wind_speed']} m/s
"""
    return report

def main(location=None):
    if not location or location.strip() == "":
        location= "深圳"
    try:
        weather_data = query_weather(location)
        report = format_report(weather_data)
        return report
    except Exception as e:
        return f"❌ 查询失败：{str(e)}"

if __name__ == '__main__':
    location= None
    args = sys.argv[1:]
    for i, arg in enumerate(args):
        if arg == '--params' and i + 1 < len(args):
           try:
            params = json.loads(args[i + 1])
              location = params.get('input', params.get('location', None))
           except:
            pass
    print(main(location))