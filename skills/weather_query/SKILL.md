---
name: "weather_query"
display_name: 天气查询
description: 查询指定城市的天气信息，包括温度、湿度、天气状况、风速等。如果用户未指定地点，默认查询深圳的天气
version: 1.0.0
author: lic
---

entry_point: main.py
function: main

parameters:
  - name: input
    type: string
    description: 用户输入的查询内容，可以是城市名称或包含城市名的句子，如"北京天气"、"查询深圳天气"
    required: true

returns:
  type: string
  description: 天气报告，包含城市名、温度、体感温度、天气状况、湿度、气压、风速等信息

examples:
  - input: "查询深圳天气"
    output: "🌤️ Shenzhen 天气报告\n\n📍 地区：CN\n🌡️ 温度：18.18°C (体感：18.06°C)\n☁️ 天气：阴，多云\n💧 湿度：77%\n📊 气压：1021 hPa\n💨 风速：1.21 m/s"
  - input: "北京天气怎么样"
    output: "🌤️ Beijing 天气报告\n\n📍 地区：CN\n🌡️ 温度：7.94°C (体感：7.94°C)\n☁️ 天气：晴\n💧 湿度：38%\n📊 气压：1018 hPa\n💨 风速：0.71 m/s"
  - input: "今天天气如何"
    output: "（默认查询深圳）\n🌤️ Shenzhen 天气报告..."
