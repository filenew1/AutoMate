---
name: "todo-query"
display_name: 查询待办事项数量
description: 查询用户待办事项数量
version: 1.0.0
author: lic
---

entry_point: main.py
function: get_todo_count

parameters:
  - name: content
    type: string
    description: 查询待办事项数量的用户输入内容
    required: true

returns:
  type: string
  description: 查询到的待办事项数量

examples:   
  - input: "查询待办事项数量"
    output: "您有3条待办事项"