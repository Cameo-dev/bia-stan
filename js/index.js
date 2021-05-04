function initPage() {
	const inputs = document.querySelectorAll('input');
	for(let i = 0; i < inputs.length; i++) {
		const input = inputs.item(i);
		input.addEventListener('change', (e) => {
			const inp = e.target;
			inp.classList.toggle('erreur', inp.validity.patternMismatch);
			inp.classList.toggle('valide', !inp.validity.patternMismatch);
		});
	}

	function deductFromSS(ssNumber, civility, birthday) {
		ssNumber.addEventListener('change', () => {
			if(!ssNumber.validity.patternMismatch) {
				civility.children.item(parseInt(ssNumber.value.charAt(0), 10) - 1).classList.add('active');
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
		deductFromSS(
			document.getElementById('socialsecurity-child'),
			document.getElementById('civility-child'),
			document.getElementById('birthday-child')
		);
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
