import re

def optimize_document(content: str) -> str:
    """
    将输入内容优化为政府公文格式
    """
    if not content or not content.strip():
        return ""
    
    # 清理原始内容
    text = content.strip()
    
    # 定义常用口语化词汇映射到公文用语
    replacements = {
        # 动词优化
        "要做": "切实推进",
        "做好": "切实加强",
        "做完": "全面完成",
        "做成": "确保完成",
        "看看": "调研",
        "想一下": "研究",
        "弄一下": "落实",
        "搞一下": "开展",
        "整一下": "规范",
        "查一下": "核查",
        "说一下": "明确",
        "讲一下": "阐述",
        "谈一下": "研讨",
        
        # 程度词优化
        "很": "显著",
        "非常": "切实",
        "特别": "尤为",
        "比较": "相对",
        "有点": "存在一定",
        "基本上": "总体",
        "差不多": "基本",
        
        # 名词优化
        "事情": "工作",
        "问题": "情况",
        "麻烦": "困难",
        "大家": "相关人员",
        "老百姓": "群众",
        "公司": "单位",
        "老板": "负责人",
        "员工": "干部职工",
        "钱": "资金",
        "东西": "物资",
        
        # 连接词优化
        "还有": "此外",
        "另外": "同时",
        "但是": "然而",
        "所以": "因此",
        "因为": "鉴于",
        "然后": "随后",
        "接着": "继而",
        
        # 结果词优化
        "行了": "可行",
        "可以": "符合要求",
        "不行": "不符合规定",
        "没用": "无效",
        "有用": "有效",
    }
    
    # 执行词汇替换
    for old, new in replacements.items():
        # 使用正则确保匹配完整词汇
        pattern = r'(?<![\u4e00-\u9fa5])' + re.escape(old) + r'(?![\u4e00-\u9fa5])'
        text = re.sub(pattern, new, text)
    
    # 优化句式结构
    
    # 1. 将"让..."转换为"确保..."或"提升..."
    text = re.sub(r'让([^，。]+)满意', r'提升\1满意度', text)
    text = re.sub(r'让([^，。]+)放心', r'确保\1安心', text)
    text = re.sub(r'让([^，。]+)参与', r'推动\1积极参与', text)
    
    # 2. 优化"把..."句式
    text = re.sub(r'把([^，。]+)做好', r'切实加强\1', text)
    text = re.sub(r'把([^，。]+)完成', r'全面完成\1', text)
    text = re.sub(r'把([^，。]+)落实', r'切实落实\1', text)
    
    # 3. 优化"对..."句式
    text = re.sub(r'对([^，。]+)进行', r'深入开展\1', text)
    text = re.sub(r'对([^，。]+)开展', r'组织开展\1', text)
    
    # 4. 删除冗余词汇
    redundant = ["一下", "呢", "啊", "吧", "嘛", "哦", "哈", "哟"]
    for word in redundant:
        text = text.replace(word, "")
    
    # 5. 规范化标点
    text = text.replace("...", "。")
    text = text.replace("。。", "。")
    text = re.sub(r'，+', '，', text)
    text = re.sub(r'。+', '。', text)
    
    # 6. 优化段落结构 - 添加序号逻辑
    sentences = re.split(r'[。！？]', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # 如果句子较多，尝试分类组织
    if len(sentences) >= 3:
        organized = organize_paragraphs(sentences)
        text = organized
    
    # 7. 最终润色
    text = final_polish(text)
    
    return text


def organize_paragraphs(sentences):
    """
    根据内容语义组织段落结构
    """
    # 分类关键词
    purpose_keywords = ["目的", "目标", "旨在", "为了", "意图"]
    measure_keywords = ["加强", "推进", "落实", "开展", "组织", "实施", "完善", "建立", "健全"]
    result_keywords = ["确保", "实现", "达成", "提升", "提高", "增强", "促进"]
    
    purpose = []
    measures = []
    results = []
    others = []
    
    for sent in sentences:
        categorized = False
        for kw in purpose_keywords:
            if kw in sent:
                purpose.append(sent)
                categorized = True
                break
        
        if not categorized:
            for kw in measure_keywords:
                if kw in sent:
                    measures.append(sent)
                    categorized = True
                    break
        
        if not categorized:
            for kw in result_keywords:
                if kw in sent:
                    results.append(sent)
                    categorized = True
                    break
        
        if not categorized:
            others.append(sent)
    
    # 重组文本
    parts = []
    
    if purpose:
        parts.append("".join(purpose) + "。")
    
    if measures:
        if len(measures) > 1:
            # 多条措施使用分号连接
            measure_text = "；".join(measures) + "。"
            parts.append(measure_text)
        else:
            parts.append(measures[0] + "。")
    
    if results:
        parts.append("".join(results) + "。")
    
    if others:
        parts.append("".join(others) + "。")
    
    # 如果分类失败，保持原样
    if not parts:
        return "。".join(sentences) + "。"
    
    return "".join(parts)


def final_polish(text):
    """
    最终润色，确保格式规范
    """
    # 确保句子结尾有标点
    if text and not text[-1] in "。！？；":
        text += "。"
    
    # 删除多余空格
    text = re.sub(r'\s+', '', text)
    
    # 确保公文常用词汇准确
    formal_pairs = [
        (r'进行开展', '开展'),
        (r'落实实施', '落实'),
        (r'加强提升', '加强'),
        (r'推进推动', '推进'),
        (r'组织进行', '组织'),
    ]
    
    for pattern, replacement in formal_pairs:
        text = re.sub(pattern, replacement, text)
    
    # 删除连续重复的标点
    text = re.sub(r'([，；。])\1+', r'\1', text)
    
    return text.strip()