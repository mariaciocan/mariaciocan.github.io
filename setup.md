# Chess replay setup

Use chess replay boards to show a short sequence from a game. Readers can play, pause, replay, and step through the moves.

This guide is for writing posts. It is **not published** on the blog.

## Contents

- [Quick start](#quick-start)
- [Getting a sequence from Lichess](#getting-a-sequence-from-lichess)
- [All options](#all-options)
- [Playback](#playback)
- [Arrows](#arrows)
- [Appearance](#appearance)
- [Changing defaults for every replay](#changing-defaults-for-every-replay)
- [Writing tips](#writing-tips)
- [Previewing and testing](#previewing-and-testing)
- [Troubleshooting](#troubleshooting)
- [Library and asset maintenance](#library-and-asset-maintenance)

## Quick start

Paste this into a post where you want the board to appear:

```liquid
{% raw %}{% include chess-replay.html
  start="r2q2k1/bpp2pp1/p3rn1p/4pN2/4P3/1PP2Q1P/1P3PP1/R1B2RK1 b - - 2 18"
  moves="18... Qe8?? 19. Bxh6! gxh6 20. Qg3+"
  caption="White breaks open Black’s king."
%}{% endraw %}
```

The board starts at the `start` position and plays the moves in `moves`.

To start from the normal chess starting position, leave out `start`:

```liquid
{% raw %}{% include chess-replay.html moves="1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5" %}{% endraw %}
```

The text between `{% raw %}{%{% endraw %}` and `{% raw %}%}{% endraw %}` can be on one line or split across several lines.

## Getting a sequence from Lichess

### 1. Copy the starting position

1. Open the game or study chapter on Lichess.
2. Go to the position **before** the first move you want to replay.
3. Copy the **FEN** shown below the board. In a study, it is under the board in the **Share & export** section.
4. Paste it into `start="..."`.

The FEN also says whose turn it is. If the position is Black to move, the first move in `moves` must be a Black move.

### 2. Copy the moves

Copy only the main-line moves you want readers to see:

```text
18... Qe8?? 19. Bxh6! gxh6 20. Qg3+
```

Move numbers are optional. These are equivalent:

```text
18... Qe8 19. Bxh6 gxh6
Qe8 Bxh6 gxh6
```

The replay always calculates move numbers from the FEN, so the numbers readers see will be correct even if you leave them out.

You can include:

- annotations such as `!`, `?`, `!!`, `??`, `!?`, and `?!`;
- checks and checkmates, such as `Qg3+` or `Qh7#`;
- castling, written as `O-O` or `O-O-O`;
- promotion, such as `a8=Q`;
- en passant, such as `exd6` or `exd6 e.p.`;
- a result at the end, such as `1-0`.

Remove:

- comments in curly brackets, such as `{ great move }`;
- variations in round brackets, such as `(19. Nd2)`;
- Lichess symbols such as `$1`.

### 3. Show an alternative line

Each replay shows one line. To show an alternative, add a second replay starting from the same FEN:

```liquid
{% raw %}{% include chess-replay.html
  start="r2q2k1/bpp2pp1/p3rn1p/4pN2/4P3/1PP2Q1P/1P3PP1/R1B2RK1 b - - 2 18"
  moves="18... Nh7"
  caption="What if Black had defended with Nh7?"
%}{% endraw %}
```

## All options

| Option | What it does | Values | Default |
|---|---|---|---|
| `start` | Starting position | A FEN, or `start` | `start` |
| `moves` | Moves to replay | Moves in standard notation | **Required** |
| `orientation` | Side shown at the bottom | `white` or `black` | `white` |
| `autoplay` | Starts automatically when visible | `off` or `visible` | `off` |
| `speed` | Time between moves | `500` to `5000` milliseconds | `1200` |
| `loop` | Restarts after the final move | `true` or `false` | `false` |
| `loop-delay` | Time on the final position before looping | `0` to `10000` milliseconds | `2000` |
| `arrows` | Arrows for specific positions | See [Arrows](#arrows) | No arrows |
| `theme` | Board colours | See [Board themes](#board-themes) | `default` |
| `caption` | Text below the board | Plain text | No caption |
| `label` | Description for screen-reader users | Plain text | Caption, or `Chess replay` |

Example with every option:

```liquid
{% raw %}{% include chess-replay.html
  start="start"
  moves="1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O Nf6"
  orientation="black"
  autoplay="visible"
  speed="900"
  loop="true"
  loop-delay="1500"
  arrows="3: f3e5 grey; 5: c4f7 red"
  theme="green"
  caption="The Italian Game."
  label="Opening moves of the Italian Game"
%}{% endraw %}
```

Put option values in quotation marks. If a caption needs a double quotation mark, use curly quotes (`“` and `”`) or wrap the value in single quotes:

```liquid
{% raw %}caption='He called it "the move of the day".'{% endraw %}
```

## Playback

### Sequence length

The sequence length is the number of moves in `moves`. To make a sequence shorter or longer, remove or add moves.

### Speed

`speed` is the time between moves in milliseconds:

| Value | Pace |
|---|---|
| `800` | Fast |
| `1200` | Default |
| `2000` | Slow, good for complicated positions |

### Autoplay

- `autoplay="off"`: the board waits until the reader presses **Play**.
- `autoplay="visible"`: playback starts when at least half of the board is visible.

Autoplay starts only once per page visit. It does not start for readers whose device is set to reduce motion.

### Looping

- `loop="false"`: the board stops on the final position.
- `loop="true"`: the board waits for `loop-delay`, then starts again.

### Pausing

Readers can always press **Pause**. Playback also pauses when the reader:

- presses **Restart**, **Previous move**, or **Next move**;
- selects a move from the move list;
- uses the keyboard controls;
- starts another replay on the same page.

Playback pauses when the board scrolls out of view or the browser tab is hidden. It resumes when the reader comes back, unless they paused it themselves.

### Keyboard controls

When a replay has keyboard focus:

| Key | Action |
|---|---|
| Left arrow | Previous move |
| Right arrow | Next move |
| Home | Starting position |
| End | Final position |
| Space, while the board is focused | Play or pause |

## Arrows

Arrows are attached to a position:

- `0` is the starting position, before any move;
- `1` is after the first move in `moves`;
- `2` is after the second move, and so on.

Count each move separately. In `18... Qe8 19. Bxh6 gxh6 20. Qg3+`, `Qg3+` is move `4`.

Format:

```text
position: fromto colour
```

Examples:

```text
arrows="0: c1h6 red"
arrows="0: c1h6 red; 4: g3g7 yellow"
arrows="2: f5h6 green, f5e7 blue"
```

- Separate arrows for the **same** position with commas.
- Separate **different** positions with semicolons.
- Write squares together, such as `e2e4`. `e2-e4` also works.

Available colours:

| Colour | Suggested use |
|---|---|
| `green` | Good move or main idea |
| `red` | Threat or mistake |
| `yellow` | Candidate move or warning |
| `blue` | Plan or piece route |
| `grey` | Neutral reference |

Arrows appear only on their position. They are redrawn when readers play, pause, step forward or backward, restart, select a move, or loop.

## Appearance

### Orientation

Use `orientation="black"` when you played Black and want Black at the bottom.

### Captions

Captions appear in italics below the board. Keep them short; use the post text for the full explanation.

### Board themes

Use `theme="..."` for one replay, or change the default for every replay.

| Theme | Look |
|---|---|
| `default` | Warm brown and beige |
| `default-contrast` | Brown and beige with stronger contrast |
| `green` | Green and cream |
| `blue` | Blue and white |
| `chess-club` | Darker wooden club board |
| `chessboard-js` | Classic chessboard.js colours |
| `black-and-white` | Printed-diagram style |

### Arrow colours, width, and transparency

Arrow colours and transparency are at the top of `css/chess-replay.css`:

```css
--chess-replay-arrow-opacity: 0.72;
--chess-replay-arrow-green: #2f9e44;
--chess-replay-arrow-red: #d6336c;
--chess-replay-arrow-yellow: #f2b705;
--chess-replay-arrow-blue: #1c7ed6;
--chess-replay-arrow-grey: #6c757d;
```

Use an opacity from `0` (invisible) to `1` (solid).

Arrow width is set in `_config.yml`:

```yaml
chess_replay:
  arrow_width: 1
```

Use a value from `0.25` to `3`. For example, `1.5` makes arrows 50% thicker.

### Board size and control colours

These are also at the top of `css/chess-replay.css`:

| Variable | Controls |
|---|---|
| `--chess-replay-max-width` | Maximum board width |
| `--chess-replay-accent` | Play button and current move |
| `--chess-replay-surface` | Background around the board |
| `--chess-replay-border` | Borders around the board and buttons |

### Changing the piece set

The current pieces are the Wikimedia standard pieces by Cburnett, licensed under CC BY-SA 3.0. The licence requires credit, so a small credit appears under each replay.

To change the pieces:

1. Find a piece set whose licence allows use on your blog.
2. Convert it to a cm-chessboard SVG sprite. Use `assets/vendor/cm-chessboard/8.15.3/assets/pieces/standard.svg` as the format reference.
3. Save it in `assets/vendor/cm-chessboard/8.15.3/assets/pieces/`.
4. Update `pieces_file` in `_config.yml`.
5. Update `pieces_credit`, `pieces_credit_url`, `pieces_license`, and `pieces_license_url`.
6. Update `assets/vendor/cm-chessboard/8.15.3/SOURCE.txt`.

Do not use cm-chessboard’s Staunty pieces. Their licence does not allow commercial use.

## Changing defaults for every replay

Defaults are in `_config.yml`:

```yaml
chess_replay:
  autoplay: "off"
  speed: 1200
  loop: false
  loop_delay: 2000
  orientation: "white"
  theme: "default"
  arrow_width: 1
```

Options written in a post override these defaults for that replay.

Note that the post option is `loop-delay`, while the `_config.yml` setting is `loop_delay`.

Restart the local preview after editing `_config.yml`.

## Writing tips

- **Puzzles:** keep `autoplay="off"`. The board shows the starting position until the reader presses Play, so readers can try to find the move first.
- **Explanations:** use a caption that tells readers what to watch, such as “Watch how Black wins the exchange.”
- **Keep sequences short:** 3 to 8 moves is usually easy to follow.
- **Use autoplay sparingly:** one autoplaying board is usually enough for a post.
- **Use arrows for ideas:** show threats, plans, or the move readers should consider.
- **Link the full game:** add a Lichess link for readers who want to analyse further.

## Previewing and testing

Preview the blog locally:

```bash
bundle exec jekyll serve --drafts
```

Then open <http://localhost:4000>.

The draft `_drafts/chess-replay-demo.md` contains examples of the main features and error messages. Use it as a template. It stays unpublished unless it is moved to `_posts/`.

Before publishing a post with replays:

1. Press **Play** and check the sequence.
2. Step through each move and check the arrows.
3. Make the browser window narrow to check the mobile layout.
4. Check that there are no error boxes.

## Troubleshooting

In the local preview, error boxes explain what to fix. On the published blog, readers see only a short message.

| Message | What to do |
|---|---|
| The start position is not a valid FEN | Copy the FEN again from Lichess. It should have six parts separated by spaces. |
| Move ... is not legal in this position | Check the move spelling, whose turn it is in the FEN, and whether a move is missing. |
| Remove comments, variations and symbols | Remove `{...}`, `(...)`, and `$` symbols from `moves`. |
| Arrow position ... is after the last move | Count the moves again. The last position number equals the number of moves. |
| Arrow ... should look like "e2e4 green" | Check the squares and colour, and use commas between arrows. |
| Arrow colour ... is not available | Use `green`, `red`, `yellow`, `blue`, or `grey`. |
| speed must be a number from 500 to 5000 | Use a number of milliseconds, without `ms`. |

If no board appears and there is no error box:

1. Restart `bundle exec jekyll serve --drafts`.
2. Check that the replay starts with `{% raw %}{% include chess-replay.html{% endraw %}` and ends with `{% raw %}%}{% endraw %}`.
3. Open the browser developer console and look for messages starting with `Chess replay`.

## Library and asset maintenance

| Part | Version | Location | Licence |
|---|---|---|---|
| cm-chessboard | 8.15.3 | `assets/vendor/cm-chessboard/8.15.3/` | MIT |
| chess.js | 1.4.0 | `assets/vendor/chess.js/1.4.0/` | BSD-2-Clause |
| Cburnett pieces | Wikimedia standard set | `assets/vendor/cm-chessboard/8.15.3/assets/pieces/standard.svg` | CC BY-SA 3.0 |

Each library folder has a `LICENSE` and `SOURCE.txt` file.

The libraries are stored in the blog repository, so replays do not depend on a CDN or Lichess.

Main replay files:

| File | Purpose |
|---|---|
| `_includes/chess-replay.html` | The include used in posts |
| `js/chess-replay/chess-replay.js` | Replay logic |
| `css/chess-replay.css` | Replay styling |
| `_config.yml` | Default settings and piece credit |

### Upgrading a library

1. Add the new version in a new folder, for example `assets/vendor/cm-chessboard/9.0.0/`.
2. Update the import paths and `ASSETS_URL` in `js/chess-replay/chess-replay.js`.
3. Update the CSS paths in `_includes/chess-replay.html`.
4. Update the folder’s `LICENSE` and `SOURCE.txt`.
5. Check `_drafts/chess-replay-demo.md` and existing posts with replays.
6. Remove the old folder only after everything works.
