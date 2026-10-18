---
layout: page
title: Blog Archive
---

{% for tag in site.tags %}
  {% unless tag[0] == "Other" %}
  <h3>{{ tag[0] }}</h3>
  {% endunless %}
  <ul>
    {% for post in tag[1] %}
      <li><a href="{{ post.url }}">{{ post.date | date: "%B %Y" }} - {{ post.title }}</a></li>
    {% endfor %}
  </ul>
{% endfor %}