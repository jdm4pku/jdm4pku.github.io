# 数据检查系统

这是一个用于检查和编辑数据集的可视化工具，可以通过 GitHub Pages 部署。

## 功能特性

1. **Chunk 选择页面**：从 5 个数据块中选择一个进行检查
2. **数据编辑页面**：
   - 显示和编辑 Name、Initial Requirements
   - 编辑 URL（用户故事）列表
   - 管理 Implicit Requirements（添加、编辑、删除）
   - 保存单条数据到本地存储
   - 导出整个 Chunk 数据

## 文件结构

```
Human_Check_Website/
├── index.html          # 导航页面
├── check.html          # 数据检查页面
├── styles.css          # 样式文件
├── index.js            # 导航页面脚本
├── check.js            # 检查页面脚本
├── data/               # 数据文件目录
│   ├── chunk_1.json
│   ├── chunk_2.json
│   ├── chunk_3.json
│   ├── chunk_4.json
│   ├── chunk_5.json
│   └── chunks_index.json
└── README.md
```

## 使用方法

1. 运行 `split_data.py` 生成数据文件：
   ```bash
   python3 dataset_construction/split_data.py
   ```

2. 在浏览器中打开 `index.html` 或部署到 GitHub Pages

3. 选择要检查的 Chunk

4. 在检查页面中：
   - 从下拉菜单选择数据项
   - 编辑 URL 和 Implicit Requirements
   - 点击"保存当前数据"保存到本地存储
   - 点击"导出 Chunk"下载修改后的 JSON 文件

## 部署到 GitHub Pages

1. 将 `Human_Check_Website` 文件夹内容推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择主分支或 docs 文件夹作为源
4. 访问 `https://yourusername.github.io/repository-name/` 即可使用

## 注意事项

- 数据保存在浏览器的 localStorage 中，清除浏览器数据会丢失未导出的修改
- 建议定期使用"导出 Chunk"功能保存修改
- 导出的 JSON 文件可以替换原始的 chunk 文件

