document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.menu-header').forEach(e => {
		e.querySelector('.title').addEventListener('click', function () {
			if (e.classList.contains('active')) {
				e.classList.remove('active');

				let container = e.querySelector('.sub-menu-container');
				container.style.maxHeight = '0';
				container.style.overflowY = 'hidden';
			} else {
				e.classList.add('active');

				let container = e.querySelector('.sub-menu-container');
				let h = container.attributes.getNamedItem('data-copacity');

				container.style.maxHeight = h ? h.value : '1000px';

				setTimeout(function () {
					container.style.overflowY = 'auto';
				}, 1000);
			}
		});
	});
});

function EditButtonClick() {
	document.querySelector('#main-btn-group').classList.add('hidden');
	document.querySelector('#edit-btn-group').classList.remove('hidden');
}

function BackButtonClick() {
	document.querySelector('#main-btn-group').classList.remove('hidden');
	document.querySelector('#edit-btn-group').classList.add('hidden');
}