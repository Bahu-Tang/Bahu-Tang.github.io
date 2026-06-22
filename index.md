---
layout: default
title: 首页
---

<div class="hero">
  <h1>{{ site.title }}</h1>
  <p class="hero-subtitle">{{ site.description }}</p>
</div>

<div class="nav-cards">
  <a href="{{ '/bookmarks/' | relative_url }}" class="card">
    <span class="card-icon">&#128278;</span>
    <h2>收藏夹</h2>
    <p>整理后的个人收藏，分类导航，快速检索</p>
  </a>
  <a href="{{ '/blog/' | relative_url }}" class="card">
    <span class="card-icon">&#128221;</span>
    <h2>博客</h2>
    <p>技术笔记、学习心得、生活记录</p>
  </a>
  <a href="{{ '/projects/' | relative_url }}" class="card">
    <span class="card-icon">&#128736;</span>
    <h2>项目</h2>
    <p>个人作品展示，开源项目链接</p>
  </a>
  <a href="{{ '/about/' | relative_url }}" class="card">
    <span class="card-icon">&#128100;</span>
    <h2>关于</h2>
    <p>关于我，以及这个站点</p>
  </a>
</div>
