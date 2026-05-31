export const lightTheme = {
	bg: '#fff'
	weekend: '#f0f0f0'
	grid: '#e7e7e7'
	line: '#4338ff'
	date: '#798391'
	month: '#1f334d'
	text: '#fff'
	pink: '#df2db8'
	blue: '#3b79d8'
	green: '#25b39c'
	gray: '#9ba9bc'
	hover: '#1f334d'
	detail: '#111827'
	font: 'system-ui, -apple-system, Segoe UI, sans-serif'
}

export const darkTheme = {
	bg: '#101418'
	weekend: '#1b222b'
	grid: '#2c3745'
	line: '#8b8cff'
	date: '#b9c4d0'
	month: '#f2f5f8'
	text: '#fff'
	pink: '#df2db8'
	blue: '#3b79d8'
	green: '#25b39c'
	gray: '#7d8da3'
	hover: '#dbeafe'
	detail: '#fff'
	font: lightTheme.font
}

export const theme = lightTheme

export def palette dark
	dark ? darkTheme : lightTheme
