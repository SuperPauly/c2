import {addDays, daysBetween, rowHeight, sameDay, startOfDay, topFor} from './layout.imba'
import {palette} from './theme.imba'

const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

def fill ctx, color, x, y, w, h
	ctx.fillStyle = color
	ctx.fillRect x, y, w, h

def text ctx, value, x, y, size = 16, color, align = 'left', font
	ctx.fillStyle = color
	ctx.font = size + 'px ' + font
	ctx.textAlign = align
	ctx.textBaseline = 'alphabetic'
	ctx.fillText value, x, y

def monthLabel ctx, label, y, t
	ctx.save!
	ctx.translate 24, y
	ctx.rotate -Math.PI / 2
	text ctx, label, 0, 0, 17, t.month, 'center', t.font
	ctx.restore!

def eventColor e, t
	const c = e.color || 'blue'
	if c.startsWith && (c.startsWith('#') || c.startsWith('rgb') || c.startsWith('hsl'))
		c
	else
		t[c] || c || t.blue

def eventBox ctx, e, x, y, w, h, mobile, t
	fill ctx, eventColor(e, t), x, y, w, h
	if e.hovered || e.detail
		ctx.strokeStyle = e.detail ? t.detail : t.hover
		ctx.lineWidth = e.detail ? 3 : 2
		ctx.strokeRect x + 1, y + 1, w - 2, h - 2
	if mobile
		ctx.save!
		ctx.translate x + w / 2 + 5, y + h / 2
		ctx.rotate -Math.PI / 2
		text ctx, e.title, 0, 5, 16, t.text, 'center', t.font
		ctx.restore!
	else
		text ctx, e.title, x + 7, y + 16, 15, t.text, 'left', t.font

def addHit hits, e, x, y, w, h
	hits.push {x, y, w, h, path: e.path, pathKey: e.pathKey}

export def draw ctx, w, h, now, offset, events, opts = {}
	const t = palette opts.dark
	const hits = []
	const first = startOfDay addDays(now, -3)
	const rh = rowHeight h
	fill ctx, t.bg, 0, 0, w, h
	for i in [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
		const date = addDays first, i
		const y = topFor date, first, h, offset
		if date.getDay! == 0 || date.getDay! == 6
			fill ctx, t.weekend, 40, y, w - 40, rh
		fill ctx, t.grid, 40, y + rh - 1, w - 40, 1
		text ctx, date.getDate!, 49, y + 22, 17, sameDay(date, now) ? t.line : t.date, 'left', t.font
		text ctx, days[date.getDay!], 49, y + 35, 10, sameDay(date, now) ? t.line : t.date, 'left', t.font
		if sameDay date, now
			fill ctx, t.line, 0, y, w, 2
		if date.getDate! == 1 || i == 0
			monthLabel ctx, months[date.getMonth!] + ' ' + date.getFullYear!, y + rh * 1.8, t
	const x = 115
	const seen = {}
	for e in events
		const key = e.start.toDateString!
		const stack = seen[key] || 0
		seen[key] = stack + 1
		const y = topFor(e.start, first, h, offset) + 21 + (e.floating ? 0 : stack * 23)
		if y > h || y < -rh * 3
			continue
		if e.floating
			const bw = w < 500 ? 38 : Math.min 198, w * 0.145
			const bh = Math.max rh * 1.5, Math.min(rh * Math.max(1, daysBetween(e.end, e.start)) - 10, rh * 4.5)
			const bx = w - bw - 5
			const boxY = y - 6
			eventBox ctx, e, bx, boxY, bw, bh, w < 500, t
			addHit hits, e, bx, boxY, bw, bh
		else
			if e.count
				text ctx, e.count, x - 10, y + 15, 11, t.pink, 'right', t.font
			eventBox ctx, e, x, y, w - x - 5, 22, false, t
			addHit hits, e, x, y, w - x - 5, 22
	hits
