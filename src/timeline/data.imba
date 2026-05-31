const day = 864e5

def startOfDay date
	new Date date.getFullYear!, date.getMonth!, date.getDate!

def add date, days
	new Date startOfDay(date).getTime! + days * day

def item start, span, title, color, opts = {}
	{start, end: add(start, span), title, color, count: opts.count || '', floating: opts.floating || false}

export def events now
	const d = startOfDay now
	const base = add d, -3
	let list = [
		item base, 1, 'My breakfast-day', 'pink', {count: '2'}
		item base, 1, 'Hockey with kids', 'blue'
		item add(base, 2), 1, 'Morning swim', 'blue'
		item add(base, 5), 1, 'Morning briefing', 'pink'
		item add(base, 6), 1, 'Meeting with R.P', 'pink'
		item add(base, 7), 1, 'My breakfast-day', 'pink', {count: '2'}
		item add(base, 9), 1, 'Gym', 'green'
		item add(base, 9), 3, 'Visit my parents', 'gray', {floating: true}
		item add(base, 12), 1, 'Morning briefing', 'pink'
	]
	for i in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
		list.push item(add(base, 12 + i * 7), 1, 'Morning briefing', 'pink')
		list.push item(add(base, 9 + i * 14), 1, 'Gym', 'green')
	list
