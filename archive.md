---
layout: page
title: Blog Archive
---

{% for tag in site.tags %}
  {% unless tag[0] == "Other" %}
  <h3>{{ tag[0] }}</h3>
  {% endunless %}
  <ul class="post-feed">
    {% for post in tag[1] %}
      <li class="post-feed-item">
        <a class="post-feed-link" href="{{ post.url | relative_url }}">
          <img
            class="post-feed-image"
            src="{{ post.preview_image | relative_url }}"
            alt="{{ post.preview_image_alt | default: post.title | escape }}"
            width="240"
            height="160"
            loading="lazy"
            decoding="async">
          <div class="post-feed-content">
            <p class="post-feed-date">{{ post.date | date: "%B %Y" }}</p>
            <h4 class="post-feed-title">{{ post.title | escape }}</h4>
            <p class="post-feed-excerpt">{{ post.excerpt | strip_html | strip_newlines | truncate: 180 | escape }}</p>
          </div>
        </a>
      </li>
    {% endfor %}
  </ul>
{% endfor %}