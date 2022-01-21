function initPage() {
	// Watch for hash change (to naviguate between steps)
	window.addEventListener('hashchange', function() {
		let hash = window.location.hash || '#0';
		goToStep(hash)
	}, false);
	let hash = window.location.hash;
	if(hash) goToStep(hash);

	// Init dropzone
	const dropzones = Array.from(document.getElementsByClassName('dropzone'));
	dropzones.forEach(zone => {
		zone.ondrop = dropHandler;
		zone.ondragover = dragOverHandler;
		zone.ondragenter = dragEnterHandler;
		zone.ondragleave = dragLeaveHandler;
	})

	Array.from(document.getElementsByClassName('file-select')).forEach(fs => {
		fs.addEventListener( 'change', function( e ) {
			const file = e.target.files[0];
			addUploadedFile(file);
		});
	});

	// Detect link that need update
	Array.from(document.getElementsByTagName('a')).forEach(a => {
		a.href = a.href.replace('${query}', window.location.search.substr(1));
	});
}

if(document.readyState === 'loading') {
	window.addEventListener('DOMContentLoaded', initPage);
} else {
	initPage();
}

// Buttons
function goToStep(step) {
	if(!step.startsWith('#')) return;
	document.querySelector('.step:not([hidden])').setAttribute('hidden', '');
	document.getElementById(`step-${step.replace("#", "")}`).removeAttribute('hidden');
}

// File handling
function addUploadedFile(file) {
	const dropzone = document.querySelector('.step:not(hidden) .dropzone');
	const spinner = document.getElementById('spinner').content.cloneNode(true);
	dropzone.innerHTML = '';
	dropzone.appendChild(spinner);
	var data = new FormData();
	data.append('file', file);
	fetch('http://localhost:1880/file', {
		method: 'POST',
		body: data
	}).then(res => {
		console.log(res.status, res.body)
		dropzone.innerHTML = file.name
	});
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
