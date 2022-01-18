function initPage() {
	//const inputs = document.querySelectorAll('input');
	//for(let i = 0; i < inputs.length; i++) {
		//const input = inputs.item(i);
		//input.addEventListener('change', (e) => {
			//const inp = e.target;
			//inp.classList.toggle('erreur', inp.validity.patternMismatch);
			//inp.classList.toggle('valide', !inp.validity.patternMismatch);
		//});
	//}
	
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

	if(window.location.pathname === '/') {
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
		//deductFromSS(
			//document.getElementById('socialsecurity-child'),
			//document.getElementById('civility-child'),
			//document.getElementById('birthday-child')
		//);
	}

	const teletransmission = document.getElementById('teletransmission');
	const teletransmissionSet = document.getElementById('teletransmission-fieldset');
	teletransmission.addEventListener('change', () => {
		teletransmissionSet.classList.toggle('d-none', !teletransmission.checked);
	});
}

if(document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
