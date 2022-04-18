const cssVars = {
	getVh					: function () { return window.innerHeight / 100 },
	getVw					: function () { return window.innerWidth / 100 },
	getExpandedMenuWidth	: function () { return Math.min(this.getVw() * 90, 500) },
	getCollapsedMenuWidth	: function () { return 50 },
};

var inAnimation = false;

document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.menu-header').forEach(e => {
		e.querySelector('.title').addEventListener('click', function () {
			if (e.classList.contains('active')) {
				e.classList.remove('active');

				let container = e.querySelector('.sub-menu-container');
				container.style.overflowY = 'hidden';
				container.style.maxHeight = '0';
			} else {
				e.classList.add('active');

				let container = e.querySelector('.sub-menu-container');
				let h = container.attributes.getNamedItem('data-copacity');

				container.style.maxHeight = h ? h.value : '1000px';

				setTimeout(function () {
					container.style.overflowY = 'auto';
				}, 500);
			}
		});
	});
});

function CopyAddress() {
	if (htmlElems.inputs.address.value) {
		navigator.clipboard.writeText(htmlElems.inputs.address.value);
	}
}

function InitMenuEvents() {
	htmlElems.filters.labels.change(HideLabelsClick);
	htmlElems.filters.types.change(HideTypeClick);

	htmlElems.inputs.mark.addEventListener('change', LoadMarkTypesToSelect);

	htmlElems.buttons.expand.click(ExpandButtonClick);
}

function ExpandButtonClick() {
	if (htmlElems.divs.content.hasClass('expanded-menu')) {
		htmlElems.divs.content.removeClass('expanded-menu');
		setTimeout(() => map.container.fitToViewport(), 750);
	} else {
		htmlElems.divs.content.addClass('expanded-menu');
		setTimeout(() => map.container.fitToViewport(), 10);
	}
}

function HideLabelsClick() {
	if (htmlElems.filters.labels[0].checked) {
		htmlElems.divs.map.addClass('hide-labels');
	} else {
		htmlElems.divs.map.removeClass('hide-labels');
	}
}

function HideTypeClick(e) {
	Filter(e.target.dataset["bindType"], !e.target.checked);
}

function CreateButtonClick() {
	AddPointByAddress();
}

function MoveButtonClick() {
	ChangePlacemarkMovability();
}

function SaveButtonClick() {
	FinishEdit();
}

function CancelButtonClick() {
	CancelEdit();
}

function DeleteButtonClick() {
	if (confirm('Вы уверены, что хотите удалить выбранную метку?')) {
		DeleteActivePoint();
	}
}

function StopMovingButtonClick() {
	if (confirm('Сохранить новые позиции меток?')) {
		UpdateAllPointsCoords();
	} else {
		CancelPointsCoordsChanging();
	}
	ChangePlacemarkMovability();
}