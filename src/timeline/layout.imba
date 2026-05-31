const day = 864e5

export def startOfDay date
	new Date date.getFullYear!, date.getMonth!, date.getDate!

export def sameDay a, b
	a.getFullYear! == b.getFullYear! && a.getMonth! == b.getMonth! && a.getDate! == b.getDate!

export def addDays date, days
	new Date startOfDay(date).getTime! + days * day

export def daysBetween a, b
	Math.round (startOfDay(a).getTime! - startOfDay(b).getTime!) / day

export def rowHeight h
	h / 12.8

export def topFor date, first, h, offset = 0
	-h / 30 + daysBetween(date, first) * rowHeight(h) - offset
