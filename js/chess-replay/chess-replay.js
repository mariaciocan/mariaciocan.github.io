import { Chess, DEFAULT_POSITION, validateFen } from "../../assets/vendor/chess.js/1.4.0/chess.js"
import { Chessboard, COLOR, BORDER_TYPE } from "../../assets/vendor/cm-chessboard/8.15.3/src/Chessboard.js"
import { Arrows } from "../../assets/vendor/cm-chessboard/8.15.3/src/extensions/arrows/Arrows.js"
import { Markers, MARKER_TYPE } from "../../assets/vendor/cm-chessboard/8.15.3/src/extensions/markers/Markers.js"

const ASSETS_URL = new URL("../../assets/vendor/cm-chessboard/8.15.3/assets/", import.meta.url).href
const THEMES = ["default", "default-contrast", "green", "blue", "chess-club", "chessboard-js", "black-and-white"]
const ARROW_COLOURS = ["green", "red", "yellow", "blue", "grey"]
const ARROW_TYPES = Object.fromEntries(ARROW_COLOURS.map((colour) => [colour, { class: `arrow-replay-${colour}` }]))
const MIN_SPEED = 500
const MAX_SPEED = 5000
const ANIMATION_DURATION = 300
const players = new Set()
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

const ICONS = {
  restart: '<path d="M6 5h2v14H6zM9.5 12 18 6v12z"/>',
  previous: '<path d="M15.5 6v12L7 12z"/>',
  next: '<path d="M8.5 6v12l8.5-6z"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>',
  replay: '<path d="M12 5a7 7 0 1 1-6.6 4.7l1.9.6A5 5 0 1 0 12 7v3L7.5 6 12 2z"/>'
}

class ReplayError extends Error {}

class ReplayArrows extends Arrows {
  drawArrow(arrow) {
    super.drawArrow(arrow)
    const widthFactor = this.props.widthFactor ?? 1
    const line = this.arrowGroup.lastElementChild?.querySelector(".arrow-line")
    if (line && widthFactor !== 1) {
      const width = Number.parseFloat(line.getAttribute("stroke-width"))
      line.setAttribute("stroke-width", `${width * widthFactor}px`)
    }
  }
}

function icon(name) {
  return `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">${ICONS[name]}</svg>`
}

function parseBoolean(value, field) {
  const normalised = value.trim().toLowerCase()
  if (["true", "yes", "on"].includes(normalised)) return true
  if (["false", "no", "off", ""].includes(normalised)) return false
  throw new ReplayError(`${field} must be "true" or "false".`)
}

function parseNumber(value, field, min, max) {
  const number = Number(value)
  if (!value.trim() || !Number.isFinite(number) || number < min || number > max) {
    throw new ReplayError(`${field} must be a number from ${min} to ${max}.`)
  }
  return number
}

function parseSettings(root) {
  const data = root.dataset
  const autoplay = data.autoplay.trim().toLowerCase()
  const orientation = data.orientation.trim().toLowerCase()
  const theme = data.theme.trim().toLowerCase()

  if (!["off", "visible"].includes(autoplay)) throw new ReplayError('autoplay must be "off" or "visible".')
  if (!["white", "black"].includes(orientation)) throw new ReplayError('orientation must be "white" or "black".')
  if (!THEMES.includes(theme)) throw new ReplayError(`theme must be one of: ${THEMES.join(", ")}.`)

  return {
    start: data.start.trim() || "start",
    moves: data.moves,
    autoplay,
    orientation,
    theme,
    speed: parseNumber(data.speed, "speed", MIN_SPEED, MAX_SPEED),
    loop: parseBoolean(data.loop, "loop"),
    loopDelay: parseNumber(data.loopDelay, "loop-delay", 0, 10000),
    arrows: data.arrows,
    arrowWidth: parseNumber(data.arrowWidth, "arrow_width", 0.25, 3),
    piecesFile: data.piecesFile.trim(),
    label: data.label.trim()
  }
}

function parseMoveTokens(text) {
  if (!text.trim()) throw new ReplayError("Add at least one move.")
  if (/[{}();$]/.test(text)) {
    throw new ReplayError("Remove comments, variations and symbols such as $1. Use one main line per replay.")
  }

  const tokens = []
  for (const rawToken of text.trim().split(/\s+/)) {
    if (["1-0", "0-1", "1/2-1/2", "½-½", "*"].includes(rawToken)) continue
    let token = rawToken.replace(/^\d+\s*(\.\.\.|…|\.)/, "")
    if (!token) continue
    token = token.replace(/e\.p\.$/i, "")
    const annotation = token.match(/[!?]+$/)?.[0] ?? ""
    const san = token.slice(0, token.length - annotation.length).replace(/^0-0-0/, "O-O-O").replace(/^0-0/, "O-O")
    if (san) tokens.push({ raw: rawToken, san, annotation })
  }

  if (!tokens.length) throw new ReplayError("Add at least one move.")
  return tokens
}

function buildLine(start, moveText) {
  const fen = start.toLowerCase() === "start" ? DEFAULT_POSITION : start
  const fenCheck = validateFen(fen)
  if (!fenCheck.ok) throw new ReplayError(`The start position is not a valid FEN. ${fenCheck.error}`)

  const chess = new Chess(fen)
  const positions = [{ fen: chess.fen() }]
  const moves = []

  parseMoveTokens(moveText).forEach((token, index) => {
    const number = chess.moveNumber()
    const colour = chess.turn()
    let move
    try {
      move = chess.move(token.san)
    } catch {
      throw new ReplayError(`Move ${index + 1}, "${token.raw}", is not legal in this position.`)
    }
    moves.push({ number, colour, san: `${move.san}${token.annotation}`, from: move.from, to: move.to })
    positions.push({ fen: chess.fen() })
  })

  return { positions, moves }
}

function parseArrows(text, moveCount) {
  const arrowsByPosition = new Map()
  if (!text.trim()) return arrowsByPosition

  for (const group of text.split(";")) {
    if (!group.trim()) continue
    const groupMatch = group.trim().match(/^(\d+)\s*:\s*(.+)$/)
    if (!groupMatch) throw new ReplayError(`Arrow group "${group.trim()}" should look like "3: e2e4 green".`)

    const position = Number(groupMatch[1])
    if (position > moveCount) {
      throw new ReplayError(`Arrow position ${position} is after the last move. Use a number from 0 to ${moveCount}.`)
    }

    for (const item of groupMatch[2].split(",")) {
      const arrowMatch = item.trim().toLowerCase().match(/^([a-h][1-8])\s*-?\s*([a-h][1-8])\s+([a-z]+)$/)
      if (!arrowMatch) throw new ReplayError(`Arrow "${item.trim()}" should look like "e2e4 green".`)

      const [, from, to, rawColour] = arrowMatch
      const colour = rawColour === "gray" ? "grey" : rawColour
      if (from === to) throw new ReplayError(`Arrow "${item.trim()}" must use two different squares.`)
      if (!ARROW_COLOURS.includes(colour)) {
        throw new ReplayError(`Arrow colour "${rawColour}" is not available. Use ${ARROW_COLOURS.join(", ")}.`)
      }

      const arrows = arrowsByPosition.get(position) ?? []
      arrows.push({ from, to, colour })
      arrowsByPosition.set(position, arrows)
    }
  }

  return arrowsByPosition
}

function moveLabel(move, showBlackNumber = true) {
  if (move.colour === "w") return `${move.number}. ${move.san}`
  return showBlackNumber ? `${move.number}... ${move.san}` : move.san
}

function describeArrows(arrows = []) {
  return arrows.map((arrow) => `Arrow from ${arrow.from} to ${arrow.to}, ${arrow.colour}.`).join(" ")
}

class ChessReplay {
  constructor(root, settings, line, arrows) {
    this.root = root
    this.settings = settings
    this.positions = line.positions
    this.moves = line.moves
    this.arrows = arrows
    this.index = 0
    this.playing = false
    this.token = 0
    this.timer = null
    this.visible = false
    this.userInteracted = false
    this.autoplayStarted = false
    this.resumeWhenVisible = false
    this.label = settings.label || root.querySelector(".chess-replay__caption")?.textContent.trim() || "Chess replay"
    this.render()
    this.createBoard()
    this.bindEvents()
    this.goTo(0, { animate: false, announce: false })
    players.add(this)
  }

  get lastIndex() {
    return this.positions.length - 1
  }

  get reduceMotion() {
    return reducedMotionQuery.matches
  }

  render() {
    this.root.classList.add("chess-replay--ready")
    this.root.querySelector(".chess-replay__fallback")?.remove()

    const player = document.createElement("div")
    player.className = "chess-replay__player"
    player.innerHTML = `
      <div class="chess-replay__board" role="img" tabindex="0"></div>
      <div class="chess-replay__toolbar">
        <div class="chess-replay__controls">
          <button type="button" class="chess-replay__button" data-action="restart" aria-label="Restart" title="Restart">${icon("restart")}</button>
          <button type="button" class="chess-replay__button" data-action="previous" aria-label="Previous move" title="Previous move">${icon("previous")}</button>
          <button type="button" class="chess-replay__button chess-replay__button--primary" data-action="toggle"></button>
          <button type="button" class="chess-replay__button" data-action="next" aria-label="Next move" title="Next move">${icon("next")}</button>
        </div>
        <span class="chess-replay__progress"></span>
      </div>
      <ol class="chess-replay__moves" aria-label="Moves"></ol>
      <p class="chess-replay__status" aria-live="polite"></p>
    `
    this.root.prepend(player)

    this.boardElement = player.querySelector(".chess-replay__board")
    this.toggleButton = player.querySelector('[data-action="toggle"]')
    this.previousButton = player.querySelector('[data-action="previous"]')
    this.nextButton = player.querySelector('[data-action="next"]')
    this.progress = player.querySelector(".chess-replay__progress")
    this.status = player.querySelector(".chess-replay__status")

    const moveList = player.querySelector(".chess-replay__moves")
    this.moveButtons = this.moves.map((move, index) => {
      const item = document.createElement("li")
      const button = document.createElement("button")
      button.type = "button"
      button.className = "chess-replay__move"
      button.dataset.index = String(index + 1)
      button.textContent = moveLabel(move, index === 0)
      item.append(button)
      moveList.append(item)
      return button
    })
  }

  createBoard() {
    this.board = new Chessboard(this.boardElement, {
      position: this.positions[0].fen,
      orientation: this.settings.orientation === "black" ? COLOR.black : COLOR.white,
      assetsUrl: ASSETS_URL,
      style: {
        cssClass: this.settings.theme,
        showCoordinates: true,
        borderType: BORDER_TYPE.none,
        pieces: { file: this.settings.piecesFile },
        animationDuration: ANIMATION_DURATION
      },
      extensions: [
        { class: Markers, props: { autoMarkers: null } },
        { class: ReplayArrows, props: { widthFactor: this.settings.arrowWidth } }
      ]
    })
  }

  bindEvents() {
    this.root.addEventListener("click", (event) => {
      const button = event.target.closest("button")
      if (!button || !this.root.contains(button)) return

      if (button.dataset.action === "toggle") this.toggle()
      if (button.dataset.action === "restart") this.userGoTo(0)
      if (button.dataset.action === "previous") this.userGoTo(this.index - 1)
      if (button.dataset.action === "next") this.userGoTo(this.index + 1)
      if (button.dataset.index) this.userGoTo(Number(button.dataset.index))
    })

    this.root.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const keyActions = {
        ArrowLeft: () => this.userGoTo(this.index - 1),
        ArrowRight: () => this.userGoTo(this.index + 1),
        Home: () => this.userGoTo(0),
        End: () => this.userGoTo(this.lastIndex)
      }
      if (keyActions[event.key]) {
        event.preventDefault()
        keyActions[event.key]()
      } else if (event.key === " " && event.target === this.boardElement) {
        event.preventDefault()
        this.toggle()
      }
    })

    this.observer = new IntersectionObserver(([entry]) => this.onVisibilityChange(entry.isIntersecting), {
      threshold: 0.5
    })
    this.observer.observe(this.boardElement)
  }

  onVisibilityChange(visible) {
    this.visible = visible
    if (!visible) {
      if (this.playing) {
        this.pause()
        this.resumeWhenVisible = true
      }
      return
    }

    if (document.hidden) return
    if (this.resumeWhenVisible) {
      this.resumeWhenVisible = false
      this.play()
    } else if (this.settings.autoplay === "visible" && !this.autoplayStarted && !this.userInteracted && !this.reduceMotion) {
      this.autoplayStarted = true
      this.play()
    }
  }

  onDocumentVisibilityChange() {
    if (document.hidden && this.playing) {
      this.pause()
      this.resumeWhenVisible = true
    } else if (!document.hidden && this.visible && this.resumeWhenVisible) {
      this.resumeWhenVisible = false
      this.play()
    }
  }

  toggle() {
    this.userInteracted = true
    this.resumeWhenVisible = false
    if (this.playing) {
      this.pause()
    } else {
      this.play()
    }
  }

  userGoTo(index) {
    this.userInteracted = true
    this.resumeWhenVisible = false
    this.pause()
    const target = Math.max(0, Math.min(index, this.lastIndex))
    if (target !== this.index) this.goTo(target, { animate: Math.abs(target - this.index) === 1 })
  }

  play() {
    if (this.playing) return
    players.forEach((player) => {
      if (player !== this && player.playing) {
        player.pause()
        player.resumeWhenVisible = false
      }
    })

    this.playing = true
    const token = ++this.token
    this.updateControls()

    if (this.index === this.lastIndex) {
      this.goTo(0, { animate: false })
      this.schedule(() => this.step(token), this.settings.speed)
    } else {
      this.step(token)
    }
  }

  pause() {
    this.playing = false
    this.token += 1
    window.clearTimeout(this.timer)
    this.timer = null
    this.updateControls()
  }

  schedule(callback, delay) {
    window.clearTimeout(this.timer)
    this.timer = window.setTimeout(callback, delay)
  }

  async step(token) {
    if (!this.isCurrent(token)) return
    const startedAt = performance.now()
    await this.goTo(this.index + 1, { animate: true })
    if (!this.isCurrent(token)) return

    if (this.index < this.lastIndex) {
      this.schedule(() => this.step(token), Math.max(0, this.settings.speed - (performance.now() - startedAt)))
    } else if (this.settings.loop) {
      this.schedule(() => this.restartLoop(token), this.settings.loopDelay)
    } else {
      this.playing = false
      this.updateControls()
    }
  }

  restartLoop(token) {
    if (!this.isCurrent(token)) return
    this.goTo(0, { animate: false })
    this.schedule(() => this.step(token), this.settings.speed)
  }

  isCurrent(token) {
    return this.playing && token === this.token
  }

  async goTo(index, { animate = false, announce = true } = {}) {
    this.index = Math.max(0, Math.min(index, this.lastIndex))
    const position = this.positions[this.index]
    const move = this.moves[this.index - 1]

    this.board.removeArrows()
    this.board.removeMarkers()
    const animation = this.board.setPosition(position.fen, animate && !this.reduceMotion)

    if (move) {
      this.board.addMarker(MARKER_TYPE.square, move.from)
      this.board.addMarker(MARKER_TYPE.square, move.to)
    }
    for (const arrow of this.arrows.get(this.index) ?? []) {
      this.board.addArrow(ARROW_TYPES[arrow.colour], arrow.from, arrow.to)
    }

    this.updateControls()
    this.updateDescription(announce)
    await animation
  }

  positionDescription() {
    const move = this.moves[this.index - 1]
    const position = move ? `After ${moveLabel(move)}.` : "Starting position."
    return [position, describeArrows(this.arrows.get(this.index))].filter(Boolean).join(" ")
  }

  updateDescription(announce) {
    const description = this.positionDescription()
    this.boardElement.setAttribute("aria-label", `${this.label}. ${description}`)
    if (announce) this.status.textContent = description
  }

  updateControls() {
    const atEnd = this.index === this.lastIndex
    const toggleState = this.playing ? "pause" : atEnd ? "replay" : "play"
    const toggleLabel = { pause: "Pause", replay: "Replay", play: "Play" }[toggleState]

    this.toggleButton.innerHTML = `${icon(toggleState)}<span>${toggleLabel}</span>`
    this.previousButton.disabled = this.index === 0
    this.nextButton.disabled = atEnd
    this.progress.textContent = this.index === 0 ? "Starting position" : `Move ${this.index} of ${this.lastIndex}`

    this.moveButtons.forEach((button, buttonIndex) => {
      if (buttonIndex + 1 === this.index) {
        button.setAttribute("aria-current", "step")
      } else {
        button.removeAttribute("aria-current")
      }
    })
  }
}

function showError(root, error) {
  console.error("Chess replay could not be loaded:", error, root)
  root.classList.add("chess-replay--error")
  const message = document.createElement("p")
  message.className = "chess-replay__error"
  message.setAttribute("role", "status")
  message.textContent = "This chess replay could not be loaded."
  if (root.dataset.debug === "true") {
    message.textContent += ` ${error instanceof ReplayError ? error.message : "Check the browser console for details."}`
  }
  root.prepend(message)
}

function initialise(root) {
  if (root.dataset.chessReplayInitialised) return
  root.dataset.chessReplayInitialised = "true"

  try {
    const settings = parseSettings(root)
    const line = buildLine(settings.start, settings.moves)
    const arrows = parseArrows(settings.arrows, line.moves.length)
    new ChessReplay(root, settings, line, arrows)
  } catch (error) {
    showError(root, error)
  }
}

document.addEventListener("visibilitychange", () => {
  players.forEach((player) => player.onDocumentVisibilityChange())
})

document.querySelectorAll("[data-chess-replay]").forEach(initialise)
