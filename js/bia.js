// Get affiliate id
const query = window.location.search.substr(1);
if(!query) console.error("Don't know you");
const queryparams = query.split('&');
const params = queryparams.reduce((memo, param) => {
	const [key, value] = param.split('=');
	memo[key] = value;
	return memo;
}, {});
fetch('http://localhost:1880/affiliates/' + params['id'])
.then(res => res.json())
.then(user => {
	window.localStorage.setItem('user', user);
	Object.entries(user).forEach(([key, value]) => {
		const input = document.getElementById(key);
		if(input) {
			input.value = value;
		}
	})
})

function initPage() {
	const tables = document.querySelectorAll('th');
	for(let i = 0; i < tables.length; i++) {
		const input = tables.item(i);
		input.addEventListener('click', ({target}) => {
			// Get index
			const columnIndex = [...target.parentElement.children].indexOf(target);
			const table = target.parentElement.parentElement.parentElement;
			// Clean up
			table.querySelectorAll('.table-active').forEach(active => active.classList.remove('table-active'));

			table.querySelectorAll(`td:nth-child(${columnIndex + 1})`)
				.forEach(td => td.classList.add('table-active'));
			target.classList.add('table-active');
		})
	}

	function deductFromSS(ssNumber, civility, birthday) {
		ssNumber.addEventListener('change', () => {
			if(!ssNumber.validity.patternMismatch) {
				Array.from(civility.children)
					.filter(c => c.type == 'radio')[parseInt(ssNumber.value.charAt(0), 10) - 1].checked = true;
				const birthdate = new Date(Date.UTC(1900 + parseInt(ssNumber.value.substr(1,2), 10), parseInt(ssNumber.value.substr(3, 2), 10) - 1)); // Get month and year from SS
				birthday.value = birthdate.toISOString().split('T')[0];
			}
		})
	}

	deductFromSS(
		document.getElementById('socialsecurity'),
		document.getElementById('civility'),
		document.getElementById('birthday')
	);
	deductFromSS(
		document.getElementById('socialsecurity-partner'),
		document.getElementById('civility-partner'),
		document.getElementById('birthday-partner')
	);

	const teletransmission = document.getElementById('teletransmission');
	const teletransmissionSet = document.getElementById('teletransmission-fieldset');
	teletransmission.addEventListener('change', () => {
		teletransmissionSet.classList.toggle('d-none', !teletransmission.checked);
	});

	Array.from(document.getElementsByTagName('input')).forEach(input => {
		input.addEventListener('change', (e) => {
			fetch('http://localhost:1880/affiliates/' + params['id'], {
				method: 'PATCH',
		    headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({[e.target.id]: e.target.value})
			});
		})
	})
}

if(document.readyState === 'loading') {
	window.addEventListener('DOMContentLoaded', initPage);
} else {
	initPage();
}

