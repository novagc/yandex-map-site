const UpdateInterval = 1000;

var map             = {},
    states          = {
        points: -1,
        marks : -1,
    },
    marks           = [],
    marksFilter     = [],
    allPoints       = [],
    activePoint     = null, 
    movable         = false,
    htmlElems       = {
        divs    : {
            content : {},
            menu    : {},
            map     : {},
            route   : {},
            mainBtns: {},
            editBtns: {},
            moveBtns: {},
            paramsLi: {},
            paramsContainer: {},
            paramsFilterLi: {},
            paramsFilterContainer: {}
        },
        buttons : {
            expand  : {},
            save    : {},
            cancel  : {},
            create  : {},
            edit    : {},
            delete  : {},
        },
        inputs  : {
            mark    : {},
            markType: {},
            title   : {},
            profile : {},
            whatsapp: {},
            desc    : {},
            address : {},
            paramsFilterTypeSelect: {},
        },
        outputs : {
            len     : {},
            time    : {}, 
        },
        uls     : {
            filter  : {},
        },
        filters : {
            labels  : {},
            types   : {}
        }
    },
    activePlacemark = null,
    placemarks      = [],
    route  = {
        points        : [],
        searchControls: []
    },
    multyRouter     = {};


function Init() {
    htmlElems = {
        divs    : {
            content : $('#content-container'),
            menu    : $('#menu'),
            map     : $('#map'),
            route   : $('#routeInfo')       [0],
            mainBtns: $('#main-btn-group'),
            editBtns: $('#edit-btn-group'),
            moveBtns: $('#move-btn-group'),
            paramsLi: $('#params-li'),
            paramsContainer: $('#params-container')[0],
            paramsFilterLi: $('#params-filter-li'),
            paramsFilterContainer: $('#params-filter-container')[0]
        },
        buttons : {
            expand  : $('img.menu-button'),
            save    : $('#saveButton')      [0],
            cancel  : $('#cancelButton')    [0],
            create  : $('#createButton')    [0],
            edit    : $('#editButton')      [0],
            delete  : $('#deleteButton')    [0],
        },
        inputs  : {
            mark    : $('#markSelector')    [0],
            markType: $('#markTypeSelector')[0],
            title   : $('#titleInput')      [0],
            profile : $('#profileInput')    [0],
            whatsapp: $('#whatsappInput')   [0],
            desc    : $('#descriptionInput')[0],
            address : $('#addressInput')    [0],
            paramsFilterTypeSelect: $('#params-filter-type-select'),
        },
        outputs : {
            len     : $('#routeLenInfo')    [0],
            time    : $('#routeTimeInfo')   [0], 
        },
        uls     : {
            filter  : $('#filter-list')     [0],
        },
        filters : {
            labels  : $('#hidenLabels'),
            types   : $('input[id^=hiden_]'),
        },
    };

    InitMenuEvents();

    new ymaps.SuggestView('addressInput');

	multyRouter = new ymaps.multiRouter.MultiRoute({ referencePoints: [] });

	map = new ymaps.Map(
		'map',
		{
			center: [ 55.755814, 37.617635 ],
			zoom    : 8,
			controls: [ 'zoomControl', ],
		},
		{
			restrictMapArea: [
				[ 81.921321, 25.069906 ],
				[ 37.812328, -167.468124 ],
			],
		}
	);

	map.behaviors.disable('dblClickZoom');
	map.behaviors.disable('Ruler');

	map.events.add('dblclick', MapDoubleClickHandler);

    AddNewSearchControll(0);

	let clearButton =  new ymaps.control.Button({
        data: { content: '<b>Очистить</b>' },
        options: {
            selectOnClick: false,
            float     	 : 'right',
            floatIndex   : 99,
        },
    });

    clearButton.events.add('press', function () {
        route.searchControls[0].clear();
		route.searchControls.slice(1).forEach(x => {
            x.clear();
            map.controls.remove(x);
        });
		route.searchControls = [ route.searchControls[0] ];
		
		multyRouter.model.setReferencePoints([]);

		route.searchControls.points.forEach(x => map.geoObjects.remove(x));
		route.searchControls.points = [];
		
        htmlElems.divs.route.addClass('hide');
	});

    map.controls.add(clearButton);

	let paveButton = new ymaps.control.Button({
        data: { content: '<b>Проложить</b>' },
        options: {
            maxWidth     : [ 30, 100, 150 ],
            selectOnClick: false,
            float      	 : 'left',
            floatIndex   : 100,
        },
    });

    paveButton.events.add('press', function () {
        if (route.points.length)
		{
            multyRouter.model.setReferencePoints(route.points.map(x => x.geometry.getCoordinates()));
            route.points.forEach(x => map.geoObjects.remove(x));
            route.points = [];
        }
	});

    map.controls.add(paveButton);

	let addButton = new ymaps.control.Button({
        data    : { content: '<b>+</b>' },
        options : {
            selectOnClick: false,
            float        : 'left',
            floatIndex   : 101,
        },
    });

	addButton.events.add('press', function () {
        AddNewSearchControll(route.searchControls.length);

		map.controls.add(route.searchControls[route.searchControls.length - 1]);
	});

    map.controls.add(addButton);

	multyRouter.model.events.add('requestsuccess', function () {
		let activeRoute = multyRouter.getActiveRoute();
		if (activeRoute) {
			htmlElems.divs.route.removeClass('hide');
			htmlElems.outputs.len.innerText  = `Длина: ${activeRoute.properties.get("distance").text}`;
			htmlElems.outputs.time.innerText = `Время: ${activeRoute.properties.get("durationInTraffic").text}`;
		} else {
			htmlElems.divs.route.addClass('hide');
		}
	});

	map.geoObjects.add(multyRouter);

	CheckUpdation(() => {    
        LoadParamsList();
        LoadParamFilters();
    });

    setInterval(CheckUpdation, UpdateInterval);


}

function GetParamList() {
    let activeMarkId = htmlElems.inputs.mark.value;
    if (!activeMarkId || isNaN(Number(activeMarkId))) {
        return [];
    }
    activeMarkId = Number(activeMarkId);
    return marks.find(x => x.id == activeMarkId).params ?? [];
}

function ClearParamsList() {
    let childs = Array.from(htmlElems.divs.paramsContainer.children); 
    if (childs && childs.length) {
        childs.forEach(x => htmlElems.divs.paramsContainer.removeChild(x));
    }
}

function LoadParamsList() {
    ClearParamsList();
    let params = GetParamList();
    if (!params.length) {
        HideParams();
    } else {
        ShowParams();
        
        params.forEach(x => {
            let li = document.createElement('li');
            
            let input = document.createElement('input');

            input.placeholder = x.name;
            input.paramId = x.id;
            input.typeId = x.type;

            switch(x.type) {
                case 0:
                    input.type="number";
                    li.append(input)
                    break;
                case 1:
                    input.type="checkbox";
                    input.id = `param-${x.id}`;

                    let label = document.createElement('label');
                    label.setAttribute('for', input.id);
                    label.innerText = x.name;
                    label.classList.add('mx-2');

                    li.append(input, label);

                    break;
                default:
                    input.type="text";
                    li.append(input)
                    break;
            }


            htmlElems.divs.paramsContainer.append(li);
        });
    }

    if (activePoint) {
        FillParams();
    }
}

function GetParams() {
    if (htmlElems.divs.paramsLi.hasClass('hiden')) {
        return [];
    } else {
        let result = Array.from(htmlElems.divs.paramsContainer.children).map(x => {
            let resObj = { id: x.children[0].paramId };
            switch(x.children[0].typeId) {
                case 0:
                    resObj.value = Number(x.children[0].value);
                    break;
                case 1:
                    resObj.value = x.children[0].checked ? 1 : 0;
                    break;
                default:
                    resObj.value = x.children[0].value;
                    break;
            }
            return resObj;
        });

        return result;
    }
}

function FillParams() {
    if (activePoint.params && activePoint.params.length) {
        Array.from(htmlElems.divs.paramsContainer.children).forEach(x => {
            let id = x.children[0].paramId;
            let type = x.children[0].typeId;
            let param = activePoint.params.find(y => y.id == id);
            
            if(param) {
                switch(type) {
                    case 0:
                        x.children[0].value = param.value;
                        break;
                    case 1:
                        x.children[0].checked = param.value == 1;
                        break;
                    default:
                        x.children[0].value = param.value;
                        break;
                        
                }
            }
        });
    }
}

function HideParams() {
    htmlElems.divs.paramsLi.addClass('hiden');
}

function ShowParams() {
    htmlElems.divs.paramsLi.removeClass('hiden');
}

function LoadMarkToFilterSelect() {
    Array.from(htmlElems.inputs.paramsFilterTypeSelect[0].children).forEach(x => htmlElems.inputs.paramsFilterTypeSelect[0].removeChild(x));
    marks.forEach(x => {
        let option = document.createElement('option');
        option.value = x.id;
        option.innerText = x.name;
        htmlElems.inputs.paramsFilterTypeSelect[0].append(option);
    });
    htmlElems.inputs.paramsFilterTypeSelect[0].selectedIndex = 0;
}


function ClearParamFiltersList() {
    let childs = Array.from(htmlElems.divs.paramsFilterContainer.children);

    if (childs && childs.length) {
        childs.forEach(x => htmlElems.divs.paramsFilterContainer.removeChild(x));
    }
}

function LoadParamFilters() {
    ClearParamFiltersList();
    let id = Number(htmlElems.inputs.paramsFilterTypeSelect[0].value);
    let paramList = marks.find(x => x.id == id).params;
    if (paramList) {
        paramList.forEach(x => {
            let li = document.createElement('li');
    
            switch(x.type) {
                case 0:
                    let minInput = document.createElement('input');
                    minInput.type="number";
                    minInput.style="width:45%";
                    minInput.classList.add('mx-1');
                    minInput.paramId = x.id;
                    minInput.role = 0;
                    minInput.placeholder = x.name + "(min)";
                    minInput.title = x.name + "(min)";
                    minInput.paramType = x.type;
                    
                    let maxInput = document.createElement('input');
                    maxInput.type="number";
                    maxInput.style="width:45%";
                    maxInput.paramId = x.id;
                    maxInput.role = 1;
                    maxInput.placeholder = x.name + "(max)";
                    maxInput.title = x.name + "(max)";
                    maxInput.paramType = x.type;
    
                    li.append(minInput, maxInput);
                    break;
                case 1:
                    let input = document.createElement('input');
                    input.type="checkbox";
                    input.paramId = x.id;
                    input.role = 0;
                    input.id = `param-filter-${x.id}`;
                    input.paramType = x.type;
    
                    let label = document.createElement('label');
                    label.setAttribute('for', input.id);
                    label.innerText = x.name;
                    label.classList.add('mx-2');
                    
                    li.append(input, label);
                    break;
            }
    
            htmlElems.divs.paramsFilterContainer.append(li);
        });
    }
}

function GetParamsFilters() {
    let temp = Array.from(htmlElems.divs.paramsFilterContainer.children).map(x => {
        switch(x.children[0].paramType) {
            case 0:
                let mn = x.children[0].value;
                let mx = x.children[1].value;

                return mn || mx ? {
                    id: Number(x.children[0].paramId),
                    min: mn ? Number(mn) : -10000,
                    max: mx ? Number(mx) : 10000
                } : undefined;
            case 1:
                return x.children[0].checked ? {
                    id: Number(x.children[0].paramId),
                    min: 1,
                    max: 2,
                } : undefined;
        }
        return undefined;
    }).filter(x => Boolean(x));
    let result = {};
    temp.forEach(x => result[x.id]=x);
    return temp;
}

function Between(num, min, max) {
    if (!num) {
        return false;
    }
    return (!min || num >= min) && (!max || num <= max);
}

function ParamFilter() {
    let paramsFilters = GetParamsFilters();
    let markId = Number(htmlElems.inputs.paramsFilterTypeSelect[0].value);

    placemarks.forEach(x => {
        if (x.sourcePoint.markIds[0] != markId || paramsFilters.length && !Boolean(x.sourcePoint.params)) {
            x.options.set('visible', false);
            return;
        } 
        let hiden = false;
        paramsFilters.forEach(y => {
            let param = x.sourcePoint.params.find(z => z.id == y.id);
            if (!param || !Between(param.value, y.min, y.max)) {
                hiden = hiden || true;
            }
        });
        x.options.set('visible', !hiden);
    });
}

function DisplayAll() {
    placemarks.forEach(x => x.options.set('visible', true));
    Array.from($('input[id*=hiden_]')).filter(x=>x.checked).forEach(x => Filter(Number(x.getAttribute('data-bind-type')), false));
}

function AddNewSearchControll(number) {
    route.searchControls[number] = new ymaps.control.SearchControl({
        options: {
            float               : 'left',
            floatIndex     	    : 198 - number,
            placeholderContent  : `Точка маршрута №${number + 1}`,
            noCentering    	    : true,
            noPlacemark         : true,
            provider       	    : 'yandex#map',
            resultsPerPage 	    : 5,
        },
    });

    route.searchControls[number].number = number;
    route.searchControls[number].events.add('resultselect', AddNewRoutePoint);
    route.searchControls[number].events.add('clear', ClearSearchControll);

    map.controls.add(route.searchControls[number], 'left');
}

function ClearSearchControll(e) {
    map.geoObjects.remove(route.points[e.originalEvent.target.number]);

    delete route.points[e.originalEvent.target.number];
}

function AddNewRoutePoint(e) {
	e.originalEvent.target.getResult(e.get('index'))
        .then(result => {
            var placemark = new ymaps.Placemark(result.geometry.getCoordinates(), { }, { preset: 'islands#circleDotIcon' });

            if (route.points[e.originalEvent.target.number]) {
                map.geoObjects.remove(route.points[e.originalEvent.target.number]);
            }

            route.points[e.originalEvent.target.number] = placemark;
            map.geoObjects.add(placemark);
        });
}

async function LoadPoints() {
    return (await requests.points.Get()).points;
}

async function LoadMarks() {
    return (await requests.marks.Get()).marks;
}

async function CheckUpdation(callback=null) {
    let pointState = (await requests.points.State()).stateId,
        marksState = (await requests.marks.State()).stateId;

    if (marksState != states.marks) {
        let newMarks = await LoadMarks();
        CompleteMarksChanges(newMarks);
        states.marks = marksState;
    }

    if (pointState != states.points) {
        let newPoints = await LoadPoints();
        CompletePointsChanges(newPoints);
        states.points = pointState;
    }

    if (callback) {
        callback();
    }
}

function CompletePointsChanges(newPoints) {
    let temp     = Array.from(newPoints),
        toDelete = [],
        toUpdate = [],
        toAdd    = [];
    
    allPoints.forEach((x, i) => {
        let j = temp.findIndex(y => y.id === x.id);
        if (j === -1) {
            toDelete.push(i);
        } else {
            if (!_.isEqual(x, temp[j])) {
                toUpdate.push(temp[j]);
            }
            temp.splice(j, 1);
        }
    });

    toAdd = temp;

    DeletePoints(toDelete);
    UpdatePoints(toUpdate);
    AddPoints   (toAdd);
}

function DeletePoints(toDelete) {
    allPoints = allPoints.filter(x => toDelete.findIndex(y => x.id === y.id) === -1);

    toDelete.forEach(x => {
        let pm = placemarks.find(y => y.sourcePoint.id === x.id);

        map.geoObjects.remove(pm);
    });

    placemarks = placemarks.filter(x => toDelete.findIndex(y => x.sourcePoint.id === y.id) === -1);

    if(activePoint && toDelete.find(x => x.id === activePoint.id)) {
        alert('Выбранная метда была удалена!');
        ClearPointSelection();
    }
}

function UpdatePoints(toUpdate) {
    toUpdate.forEach(x => {
        let placemark = placemarks.find(y => y.sourcePoint.id == x.id);
        let point = placemark.sourcePoint;

        Object.getOwnPropertyNames(x).forEach(y => point[y] = x[y]);

        UpdatePlacemark(placemark);
    });

    if (activePoint && toUpdate.indexOf(x => x.id === activePoint.id) != -1) {
        if(!confirm('Выбранная метка была изменена.\nСохранить текущие значения полей в меню?')) {
            WritePointInfoToMenu(x)
        }
    }
}

function UpdatePlacemark(pm) {
    pm.properties.set('hintContent', pm.sourcePoint.title);
    pm.properties.set('iconContent', pm.sourcePoint.title);
    pm.properties.set('balloonContentHeader', pm.sourcePoint.title);
    pm.properties.set('balloonContent', pm.sourcePoint.desc);
    pm.properties.set('iconImageHref', GetImgPath(pm.sourcePoint));
    pm.geometry.setCoordinates(pm.sourcePoint.coords);
}

function AddPoints(toAdd) {
    toAdd.forEach(x => {
        allPoints.push(x);
        DrawPoint(x);
    });
}

function CompleteMarksChanges(newMarks) {
    let markSelectedIndex = htmlElems.inputs.mark.selectedIndex,
        typeSelectedIndex = htmlElems.inputs.markType.selectedIndex;

    marks = newMarks;

    htmlElems.inputs.mark.options.length = 0;

    newMarks.forEach(x => {
        let option = document.createElement('option');
        option.value = x.id;
        option.innerText = x.name;
        htmlElems.inputs.mark.options.add(option);
    });

    htmlElems.inputs.mark.selectedIndex = markSelectedIndex;

    LoadMarkTypesToSelect();

    htmlElems.inputs.markType.selectedIndex = typeSelectedIndex;
}

function Draw() {
    allPoints.forEach(x => DrawPoint(x));
}

function DrawPoint(point) {
    var placemark = new ymaps.Placemark(
		point.coords,
		{
			hintContent       		: point.title,
			balloonContentHeader    : point.title,
			balloonContent    		: point.description,
			iconContent       		: point.title,
		},
		{
            visible                 : IsVisible(point),
			hideIconOnBalloonOpen   : false,
			iconLayout              : 'default#imageWithContent',
			iconImageHref           : GetImgPath(point),
			iconImageSize           : [ 32, 32 ],
			iconImageOffset         : [ -15, -15 ],
			iconContentOffset       : [ 0, 32 ],
			iconContentLayout       : ymaps.templateLayoutFactory.createClass(`<div class="iconContentDiv">$[properties.iconContent]</div>`),
		}
	);

    placemark.sourcePoint = point;

    placemark.events.add('click', function(e) {
        if(!movable) {
            activePoint = e.originalEvent.target.sourcePoint;
            activePlacemark = e.originalEvent.target;
            
            StartEdit();
        }
    });

    placemark.events.add('balloonclose', function(e) {
        setTimeout(function () {
            if (activePoint === e.originalEvent.currentTarget.sourcePoint || activePoint == null) {
                ClearPointSelection();
                ClearParamsList();
                LoadParamsList();
                ShowMainButtons();
            }
        }, 50);
    });

    placemarks.push(placemark);
    map.geoObjects.add(placemark);
}

function ReDrawActivePoint() {
    map.geoObjects.remove(activePlacemark);
    DrawPoint(activePoint);
}

function ChangePlacemarkMovability() {
    let newValue = !movable;

    placemarks.forEach(x => {
        x.options.set('draggable', newValue);
        x.options.set('openBalloonOnClick', movable);
    });

    if (newValue) {
        ShowMoveButtons();
    } else {
        ShowMainButtons();
    }

    movable = newValue;
}

function ClearPointSelection() {
    ClearPointInfo();
    activePoint = null;
    activePlacemark = null;
}

function Filter(markId, visible) {
    if (visible) {
        let i = marksFilter.indexOf(markId);
        if (i != -1) {
            marksFilter.splice(i, 1);
        }
    } else {
        marksFilter.push(markId);
    }
    placemarks.forEach(x => {
        if (x.sourcePoint.markIds[0] == markId){
            x.options.set('visible', visible);
        }
    });
}

function AddPointByAddress() {
    if (CheckInputValidity(true)) {
        ymaps.geocode(htmlElems.inputs.address.value)
            .catch(() => alert('Адрес не найден'))
            .then(res => {
                let point = AddNewPoint(
                    res.geoObjects.get(0).geometry.getCoordinates(),
                    htmlElems.inputs.title.value,
                    htmlElems.inputs.desc.value,
                    htmlElems.inputs.profile.value,
                    htmlElems.inputs.whatsapp.value,
                    htmlElems.inputs.mark.value,
                    htmlElems.inputs.markType.value,
                    GetParams()
                );

                DrawPoint(point);
                ClearPointSelection();
            });
    }
}

function StartEdit() {
    WritePointInfoToMenu(activePoint);
    ClearParamsList();
    LoadParamsList();
    ShowEditButtons();
}

function FinishEdit() {
    if (CheckInputValidity()) {
        UpdatePoint(
            activePoint.id,
            activePoint.coords,
            htmlElems.inputs.title.value,
            htmlElems.inputs.desc.value,
            htmlElems.inputs.profile.value,
            htmlElems.inputs.whatsapp.value,
            Number(htmlElems.inputs.mark.value),
            Number(htmlElems.inputs.markType.value),
            GetParams()
        );

        ReDrawActivePoint();
        ClearPointSelection();
        ClearParamsList();
        LoadParamsList();
        ShowMainButtons();
    }
}

function CancelEdit() {
    activePlacemark.balloon.close();
    ShowMainButtons();
}

function ShowMoveButtons() {
    htmlElems.divs.editBtns.addClass('hiden');
    htmlElems.divs.mainBtns.addClass('hiden');
    htmlElems.divs.moveBtns.removeClass('hiden');
}

function ShowEditButtons() {
    htmlElems.divs.mainBtns.addClass('hiden');
    htmlElems.divs.moveBtns.addClass('hiden');
    htmlElems.divs.editBtns.removeClass('hiden');
}

function ShowMainButtons() {
    htmlElems.divs.editBtns.addClass('hiden');
    htmlElems.divs.moveBtns.addClass('hiden');
    htmlElems.divs.mainBtns.removeClass('hiden');
}

function DeleteActivePoint() {
    requests.points.Delete(activePoint);

    allPoints.splice(allPoints.indexOf(activePoint), 1);
    map.geoObjects.remove(activePlacemark);

    ClearPointSelection();

    ShowMainButtons();
}

function WritePointInfoToMenu(point) {
    htmlElems.inputs.title.value = point.title;
    htmlElems.inputs.desc.value  = point.desc;
    htmlElems.inputs.profile.value = point.profile;
    htmlElems.inputs.whatsapp.value = point.whatsapp;
    htmlElems.inputs.mark.value = point.markIds[0];

    LoadMarkTypesToSelect();

    htmlElems.inputs.markType.value = point.markIds[1];
}

function ClearPointInfo() {
    htmlElems.inputs.title.value = '';
    htmlElems.inputs.desc.value  = '';
    htmlElems.inputs.profile.value = '';
    htmlElems.inputs.whatsapp.value = '';
    htmlElems.inputs.address.value = '';
    htmlElems.inputs.mark.selectedIndex = 0;

    LoadMarkTypesToSelect();

    htmlElems.inputs.markType.selectedIndex = 0;
}

function LoadMarkTypesToSelect() {
    let mark = marks.find(x => htmlElems.inputs.mark.value == x.id);
    htmlElems.inputs.markType.options.length = 0;

    mark.types.forEach(x => {
        let option = document.createElement('option');
        option.value = x.id;
        option.innerText = x.name;
        htmlElems.inputs.markType.options.add(option);
    });
}

function AddNewPoint(coord, title, desc, profile, whatsapp, markId, markTypeId, params=[]) {
    var point = { 
        id          : GetRandomInt(1e20),
        coords      : coord, 
        markIds     : [Number(markId), Number(markTypeId)],
        title       : title, 
        description : desc ?? '', 
        profile     : profile, 
        whatsapp    : whatsapp, 
        params      : params
    }

    allPoints.push(point);
    requests.points.Add(point);

    return point;
}

function CancelPointsCoordsChanging() {
    placemarks.forEach(x => {
        let pmCoords = x.geometry.getCoordinates();
        if (pmCoords[0] != x.sourcePoint.coords[0] || pmCoords[1] != x.sourcePoint.coords[1]) {
            x.geometry.setCoordinates(x.sourcePoint.coords)
        }
    });
}

function UpdateAllPointsCoords() {
    let newCoordsDictionary = {};

    placemarks.forEach(x => newCoordsDictionary[x.sourcePoint.id] = x.geometry.getCoordinates());
    requests.points.UpdateCoords(newCoordsDictionary);
}

function UpdatePointCoords(point, coords, updatePlacemark=false) {
    if (point.coords[0] != coords[0] || point.coords[1] != coords[1]) {
        point.coords = coords;
        requests.points.Update(point);

        if (updatePlacemark) {
            let placemark = placemarks.find(x => x.sourcePoint.id == point.id);

            if (placemark) {
                placemark.geometry.setCoordinates(point.coords);
            }
        }
    }
}

function UpdatePoint(id, coords, title, desc, profile, whatsapp, markId, markTypeId, params=[]) {
    var point = { 
        id      : id,
        coords  : coords, 
        markIds : [markId, markTypeId],
        title   : title, 
        desc    : desc, 
        profile : profile, 
        whatsapp: whatsapp, 
        params  : params
    }

    requests.points.Update(point);

    Object.getOwnPropertyNames(point).forEach(x => activePoint[x] = point[x]);
}

function CheckInputValidity(needAddress = false) {
    let error = 'Ошибки:\n',
        valid = true;
    
    if (!htmlElems.inputs.title.value) {
        error += 'Необходимо заполнить поле "Название"\n';
        valid = false;
    }

    if (needAddress && !htmlElems.inputs.address.value) {
        error += 'Необходимо заполнить поле "Адрес"';
        valid = false;
    }

    if (!valid) {
        alert(error);
    }

    return valid;
}

function MapDoubleClickHandler(e) {
    if (CheckInputValidity()) {
        if (!activePoint) {
            let point = AddNewPoint(
                e.get('coords'),
                htmlElems.inputs.title.value,
                htmlElems.inputs.desc.value,
                htmlElems.inputs.profile.value,
                htmlElems.inputs.whatsapp.value,
                htmlElems.inputs.mark.value,
                htmlElems.inputs.markType.value,
                GetParams()
            );
    
            DrawPoint(point);
            ClearPointSelection();
        } else {
            if (confirm('Сохранить изменения и обновить позицию метки?')) {
                UpdatePoint(
                    activePoint.id,
                    e.get('coords'),
                    htmlElems.inputs.title.value,
                    htmlElems.inputs.desc.value,
                    htmlElems.inputs.profile.value,
                    htmlElems.inputs.whatsapp.value,
                    htmlElems.inputs.mark.value,
                    htmlElems.inputs.markType.value,
                    GetParams()
                );
            }
        }
    }
}

function GetImgPathFromMarks(markId, markTypeId) {
    let result = 'default.png';

    let mark = marks.find(x => x.id === markId);
    
    if (mark) {
        let markType = mark.types.find(x => x.id === markTypeId);
        result = markType ? markType.imgPath : result;
    }

    return `img/marks/${result}`;
}

function GetImgPath(point) {
    return GetImgPathFromMarks(point.markIds[0], point.markIds[1]);
}

function GetRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function IsVisible(point) {
    return marksFilter.indexOf(x => x == point.markIds[0]) == -1;
}

document.addEventListener("DOMContentLoaded", () => {
    ymaps.ready(Init);
});