#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""测试天气查询"""

import sys
sys.path.append('skills/weather_query')
from main import query_weather, format_report

# 测试广州
print("=" * 50)
print("测试 1: 广州天气")
print("=" * 50)
result = query_weather("广州天气")
print(format_report(result))

# 测试深圳
print("=" * 50)
print("测试 2: 深圳")
print("=" * 50)
result = query_weather("深圳")
print(format_report(result))

# 测试北京
print("=" * 50)
print("测试 3: 北京天气怎么样")
print("=" * 50)
result = query_weather("北京天气怎么样")
print(format_report(result))
