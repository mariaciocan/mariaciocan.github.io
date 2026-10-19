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
      {% include post-feed-item.html post=post %}
    {% endfor %}
  </ul>
{% endfor %}