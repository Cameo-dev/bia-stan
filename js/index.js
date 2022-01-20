const STEPS = new Map()
STEPS.set(0, 'step-0');
STEPS.set(1, 'step-1')
STEPS.set(2, 'step-2')
STEPS.set(3, 'step-3')

function initPage() {
	if(window.location.pathname === '/') {
		let hash = window.location.hash;
		if(STEPS.has(hash)) goToStep(STEPS.get(hash));

		const dropzones = Array.from(document.getElementsByClassName('dropzone'));
		dropzones.forEach(zone => {
			zone.ondrop = dropHandler;
			zone.ondragover = dragOverHandler;
			zone.ondragenter = dragEnterHandler;
			zone.ondragleave = dragLeaveHandler;
		})
		
		document.getElementById('select-file').addEventListener( 'change', function( e ) {
			const file = e.target.files[0];
			addUploadedFile(file);
		});
	} else if(window.location.pathname === '/bia') {
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
		//deductFromSS(
		//document.getElementById('socialsecurity-child'),
		//document.getElementById('civility-child'),
		//document.getElementById('birthday-child')
		//);

		const teletransmission = document.getElementById('teletransmission');
		const teletransmissionSet = document.getElementById('teletransmission-fieldset');
		teletransmission.addEventListener('change', () => {
			teletransmissionSet.classList.toggle('d-none', !teletransmission.checked);
		});
	}
}

if(document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}

// Buttons
function goToStep(step) {
	document.querySelector('.step:not([hidden])').setAttribute('hidden', '');
	document.getElementById(`step-${step}`).removeAttribute('hidden');
}

// File handling
const uploadedFiles = [];
function addUploadedFile(file) {
	const files = document.getElementById('uploaded-files');
	const newFile = document.getElementById('file').cloneNode(true).content;
	const li = newFile.querySelector('li');
	li.textContent = file.name;
	files.append(newFile);

	if(uploadedFiles.length === 0) {
		document.getElementById('send').removeAttribute('disabled');
	}
	uploadedFiles.push(file);
}

// Drop
function dropHandler(event) {
	console.log("DROP", event);
	event.preventDefault();
	event.stopPropagation();
	if (event.dataTransfer.items) {
		// Use DataTransferItemList interface to access the file(s)
		for (var i = 0; i < event.dataTransfer.items.length; i++) {
			// If dropped items aren't files, reject them
			if (event.dataTransfer.items[i].kind === 'file') {
				var file = event.dataTransfer.items[i].getAsFile();
				addUploadedFile(file);
			}
		}
	} else {
		// Use DataTransfer interface to access the file(s)
		for (var i = 0; i < event.dataTransfer.files.length; i++) {
			console.log('... file[' + i + '].name = ' + event.dataTransfer.files[i].name);
		}
	}
	event.target.classList.remove('dragover');
}

function dragOverHandler(event) {
	//console.log("DRAG OVER", event)
	event.preventDefault();
	event.stopPropagation();
	//event.target.classList.add('dragover');
}

function dragEnterHandler(event) {
	console.log("DRAG ENTER", event)
	event.preventDefault();
	event.stopPropagation();
	event.target.classList.add('dragover');
}

function dragLeaveHandler(event) {
	console.log("DRAG LEAVE", event);
	event.preventDefault();
	event.stopPropagation();
	event.target.classList.remove('dragover');
}
