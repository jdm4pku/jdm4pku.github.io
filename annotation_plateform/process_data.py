#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
处理data目录下的JSON文件，清空指定字段
- initial_requirements: 设置为空字符串
- Implicit Requirements: 设置为空数组
- URL: 设置为空数组
"""

import json
import os
from pathlib import Path

def process_json_file(file_path):
    """处理单个JSON文件"""
    print(f"正在处理: {file_path}")
    
    # 读取JSON文件
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 确保data是列表
    if not isinstance(data, list):
        print(f"警告: {file_path} 不是数组格式，跳过")
        return
    
    # 处理每条数据
    modified_count = 0
    for item in data:
        if isinstance(item, dict):
            # 设置 initial_requirements 为空字符串
            if 'initial_requirements' in item:
                item['initial_requirements'] = ""
                modified_count += 1
            
            # 设置 Implicit Requirements 为空数组
            if 'Implicit Requirements' in item:
                item['Implicit Requirements'] = []
                modified_count += 1
            
            # 设置 URL 为空数组
            if 'URL' in item:
                item['URL'] = []
                modified_count += 1
    
    # 保存修改后的文件
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"完成: {file_path} (处理了 {len(data)} 条记录)")

def main():
    """主函数"""
    # 获取data目录路径
    data_dir = Path(__file__).parent / 'data'
    
    if not data_dir.exists():
        print(f"错误: 目录 {data_dir} 不存在")
        return
    
    # 获取所有chunk_*.json文件
    json_files = sorted(data_dir.glob('chunk_*.json'))
    
    if not json_files:
        print(f"未找到chunk_*.json文件在 {data_dir}")
        return
    
    print(f"找到 {len(json_files)} 个文件需要处理\n")
    
    # 处理每个文件
    for json_file in json_files:
        try:
            process_json_file(json_file)
        except Exception as e:
            print(f"处理 {json_file} 时出错: {e}")
    
    print("\n所有文件处理完成！")

if __name__ == '__main__':
    main()

