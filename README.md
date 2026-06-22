# 128 — 个人站点搭建记录

> 2026-06-23 · 由 opencode 协助搭建

---

## 项目概述

基于 **Jekyll + GitHub Pages** 的个人博客与导航站，域名为 `https://Bahu-Tang.github.io`。

| 属性 | 值 |
|------|-----|
| 站点标题 | 128 |
| 域名 | https://Bahu-Tang.github.io |
| 仓库 | github.com/Bahu-Tang/Bahu-Tang.github.io |
| 本地路径 | `G:\githubboke` |
| 技术栈 | Jekyll / Liquid / SCSS / GitHub Pages |
| 设计主题 | 苹果绿清新风 |

---

## 站点结构

```
G:\githubboke\
├── _config.yml                    # 站点配置
├── Gemfile                        # GitHub Pages 依赖声明
├── .gitignore
├── index.md                       # 首页（Hero + 标签 + 卡片 + 博客预览 + 项目预览）
├── about.md                       # 关于页面
│
├── _layouts/
│   ├── default.html               # 主布局模板
│   └── post.html                  # 文章/项目布局
│
├── _includes/
│   ├── header.html                # 导航栏（白底 + 绿色下划线指示）
│   └── footer.html                # 页脚
│
├── _posts/                        # 博客文章
│   └── 2026-06-22-hello-world.md  # 示例首篇
│
├── _projects/                     # 项目展示（Jekyll Collection）
│   └── this-site.md               # 示例：这个网站本身
│
├── blog/
│   └── index.html                 # 博客列表页
│
├── projects/
│   └── index.html                 # 项目列表页
│
├── bookmarks/
│   └── index.html                 # 收藏夹导航页（树形+搜索）
│
├── assets/
│   ├── css/
│   │   └── style.scss             # 全局样式（苹果绿主题）
│   └── js/
│       └── bookmarks_data.js      # 收藏夹数据（JS格式，约700KB）
│
└── _data/
    └── (bookmarks.yml 已移至 .gitignore，不在仓库中)
```

---

## 设计系统

### 色彩

| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色（按钮/链接/下划线） | 苹果绿 | `#4CAF50` |
| 深色（悬停/强调） | 深绿 | `#388E3C` |
| 浅色（卡片悬停背景） | 浅绿 | `#C8E6C9` |
| 极浅（标签/区块底） | 极浅绿 | `#E8F5E9` |
| 文字 | 深灰 | `#2C3E50` |
| 辅文 | 灰色 | `#6B7280` |
| 页面底色 | 浅灰 | `#F5F7FA` |
| 卡片 | 纯白 | `#FFFFFF` |
| 边框 | 淡灰 | `#E5E7EB` |

### 设计规范

- **圆角**：统一 12px
- **阴影**：统一 `0 2px 12px rgba(0,0,0,0.06)`，悬停 `0 8px 24px rgba(76,175,80,0.15)`
- **过渡**：统一 0.2s ease
- **字号梯度**：h1 2.5rem / h2 1.25rem / 正文 1rem / 辅文 0.875rem
- **导航栏**：60px 高，白底半透明玻璃效果 `rgba(255,255,255,0.92)`
- **当前页标识**：导航链接底部 60% 宽绿色下划线
- **间距**：区块间距 3.5rem，卡片间距 1.25rem

### 页面列表

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `/` | Hero + 身份标签 + 四张入口卡片 + 最近博客 + 项目预览 |
| 收藏夹 | `/bookmarks/` | 左侧树形目录（折叠展开）+ 搜索框 + 右侧链接列表 |
| 博客 | `/blog/` | 文章列表（卡片式，按时间倒序） |
| 项目 | `/projects/` | 项目卡片网格 |
| 关于 | `/about/` | 个人信息 |

---

## 日常维护

### 写新博客

在 `_posts/` 下新建 `.md` 文件，命名格式 `YYYY-MM-DD-标题.md`，内容顶部加 frontmatter：

```yaml
---
layout: post
title: "文章标题"
date: 2026-06-25
---
```

### 添加项目

在 `_projects/` 下新建 `.md` 文件：

```yaml
---
title: "项目名称"
layout: post
date: 2026-06-25
---
```

### 更新收藏夹

1. 在 Edge 中整理收藏夹
2. 导出为 HTML 文件到 `G:\收藏夹\`
3. 运行分类脚本生成 `assets/js/bookmarks_data.js`
4. 提交推送

### 修改标签云

编辑 `index.md` 中 `<div class="tag-cloud">` 内的 `<span class="tag">` 内容。

### 推送更新

```bash
cd G:\githubboke
git add -A
git commit -m "描述改动内容"
git push origin main
```

---

## 技术要点

### 收藏夹数据流

```
Edge 收藏夹 HTML
  → Python 解析 + 分类
  → assets/js/bookmarks_data.js (JS 变量 BOOKMARKS_DATA)
  → bookmarks/index.html (纯前端渲染树形导航 + 搜索)
```

### 为什么不用 _data/bookmarks.yml？

`_data/` 目录中的 14K 行 YAML 文件会导致 GitHub Pages 的 Jekyll 构建超时或内存溢出。改为静态 JS 文件通过 `<script src>` 加载，绕过 Jekyll 处理。

### GitHub Pages 自动构建

推送 `main` 分支后，GitHub Pages 自动运行 Jekyll 构建。构建状态查看：
```
Settings → Pages → 页面顶部有构建状态指示
```

---

## Edge 收藏夹整理

收藏夹同样经过整理，位于 `G:\收藏夹\favorites_2026_6_22_organized.html`。

整理方案：PARA 理念 + 数字前缀排序

```
收藏夹栏
├── 00-Inbox              # 临时收件箱
├── 10-常用               # 日常高频（邮箱/网盘/社交/河海大学）
├── 20-学习               # 课程/英语/编程题/打字/教程/论文写作/深度学习
├── 30-开发               # Python/AI对话/GitHub/云服务/robo
├── 40-资源库             # 导航站/资源站/博客/影视/书籍/图像素材
├── 50-闲置               # 保研资料/一生一芯/·兴趣爱好（隐匿）
└── 60-奶酪收藏夹         # 他人的收藏夹归档
```

---

## 未来可改进方向

- [ ] 添加深色模式切换
- [ ] 收藏夹页面按类别统计数量
- [ ] 博客增加标签/分类系统
- [ ] 添加 RSS 订阅
- [ ] 项目展示支持封面图
- [ ] about 页面添加技能条（文本式 `████░░`）
- [ ] 添加 OG 元标签用于社交分享预览
- [ ] 接入评论系统（Giscus / Waline）
- [ ] CI 自动同步 Edge 收藏夹到站点
