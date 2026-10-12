# Chess replay demo

This draft is for testing chess replay boards. It is not published unless you move it to `_posts/`.

---

### Opt-in replay with arrows

{% include chess-replay.html
  start="r2q2k1/bpp2pp1/p3rn1p/4pN2/4P3/1PP2Q1P/1P3PP1/R1B2RK1 b - - 2 18"
  moves="18... Qe8?? 19. Bxh6! gxh6 20. Qg3+ Ng4 21. Qxg4+ Rg6"
  arrows="0: c1h6 red; 4: g3g7 yellow; 7: f5h6 green, f5e7 blue"
  caption="Round 2: White breaks open Black’s king."
%}

---

### Autoplay when visible, looping, Black at the bottom

{% include chess-replay.html
  moves="1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O Nf6"
  orientation="black"
  autoplay="visible"
  loop="true"
  loop-delay="1500"
  speed="900"
  theme="green"
  arrows="3: f3e5 grey; 5: c4f7 red"
  caption="The Italian Game, with castling and Black at the bottom."
%}

---

### En passant and promotion

{% include chess-replay.html
  moves="1. e4 Nf6 2. e5 d5 3. exd6 e.p."
  theme="blue"
  arrows="4: e5d6 green"
  caption="En passant."
%}

{% include chess-replay.html
  start="8/P7/8/8/8/8/k6K/8 w - - 0 1"
  moves="1. a8=Q+"
  caption="Promotion."
%}

---

### Error examples

These should show error messages. In a local preview, the message explains what to fix.

{% include chess-replay.html start="not a fen" moves="1. e4" %}

{% include chess-replay.html moves="1. e4 e5 2. Qxh7" %}

{% include chess-replay.html moves="1. e4 e5" arrows="3: e2e4 green" %}

{% include chess-replay.html moves="1. e4 e5" arrows="1: e2e9 purple" %}
