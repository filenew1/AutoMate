import random
import sys
import json

def get_todo_count():
    """查询待办事项数量，随机生成待办数量用于测试"""
    unchecked_count = random.randint(0, 15)
    checked_count = random.randint(0, 20)
    
    if unchecked_count == 0 and checked_count == 0:
        message = "太棒了！当前没有待办事项，可以好好休息啦~"
    elif unchecked_count == 0:
        message = f"太棒了！所有 {checked_count} 个待办事项都已完成！"
    elif unchecked_count <= 5:
        message = f"当前有 {unchecked_count} 个待办事项待完成，已完成 {checked_count} 个"
    elif unchecked_count <= 10:
        message = f"当前有 {unchecked_count} 个待办事项待完成，已完成 {checked_count} 个，加油处理吧！"
    else:
        message = f"当前有 {unchecked_count} 个待办事项待完成，已完成 {checked_count} 个，任务有点多，建议优先处理重要事项！"
    
    return message

if __name__ == '__main__':
    params = {}
    args = sys.argv[1:]
    for i, arg in enumerate(args):
        if arg == '--params' and i + 1 < len(args):
            try:
              params = json.loads(args[i + 1])
            except:
              pass
    
print(get_todo_count())
