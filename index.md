---
layout: default
title: 首页
---

<div class="hero">
  <h1>{{ site.title }}</h1>
  <p class="hero-subtitle">CS 研究生 · 视觉学习者 · 造物者</p>
  <div class="tag-cloud">
    <span class="tag">Python</span>
    <span class="tag">PyTorch</span>
    <span class="tag">计算机视觉</span>
    <span class="tag">图像分割</span>
    <span class="tag">河海大学</span>
    <span class="tag">Arduino</span>
  </div>
</div>

<div class="nav-cards">
  <a href="{{ '/bookmarks/' | relative_url }}" class="card">
    <span class="card-icon">📑</span>
    <h2>收藏夹</h2>
    <p>分类导航，快速检索常用资源</p>
  </a>
  <a href="{{ '/blog/' | relative_url }}" class="card">
    <span class="card-icon">📝</span>
    <h2>博客</h2>
    <p>技术笔记、学习心得、生活记录</p>
  </a>
  <a href="{{ '/projects/' | relative_url }}" class="card">
    <span class="card-icon">🔧</span>
    <h2>项目</h2>
    <p>个人作品与开源项目展示</p>
  </a>
  <a href="{{ '/newtab.html' | relative_url }}" class="card">
    <span class="card-icon">🏠</span>
    <h2>新标签页</h2>
    <p>常用网站卡片式快速访问</p>
  </a>
  <a href="{{ '/about/' | relative_url }}" class="card">
    <span class="card-icon">👤</span>
    <h2>关于</h2>
    <p>了解更多关于我的信息</p>
  </a>
</div>

{% if site.posts.size > 0 %}
<div class="section-header">
  <h2>最近文章</h2>
  <a href="{{ '/blog/' | relative_url }}">查看全部 →</a>
</div>
<div class="blog-grid">
  {% for post in site.posts limit:3 %}
    <article class="blog-card">
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <time>{{ post.date | date: "%Y-%m-%d" }}</time>
      <p>{{ post.excerpt | strip_html | truncate: 120 }}</p>
    </article>
  {% endfor %}
</div>
{% endif %}

{% if site.projects.size > 0 %}
<div class="section-header">
  <h2>项目展示</h2>
  <a href="{{ '/projects/' | relative_url }}">查看全部 →</a>
</div>
<div class="project-cards">
  {% for project in site.projects limit:3 %}
    <a href="{{ project.url | relative_url }}" class="project-card">
      <h2>{{ project.title }}</h2>
      <p>{{ project.excerpt | strip_html | truncate: 100 }}</p>
    </a>
  {% endfor %}
</div>
{% endif %}
