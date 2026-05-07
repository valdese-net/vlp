// HTML helper functions
export function createEl(tag:string, attrs:{[key:string]: string|null} = {}): HTMLElement {
	const el = document.createElement(tag);

	if (attrs) Object.entries(attrs).forEach(([key, value]) => {
		if (key == 'text') el.textContent = value;
		else if (key == 'html') el.innerHTML = value;
		else {
			if (value === null) el.removeAttribute(key);
			else el.setAttribute(key, value);
		}
	});

	return el;
}