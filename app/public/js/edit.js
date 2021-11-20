const htmlElems = {
    divs: {
        containerTypes: $('#container-types'),
        containerParams: $('#container-params'),
    },
    inputs: {
        id: $('#input-id'),
        name: $('#input-name'),
    },
    buttons: {
        edit: $('#btn-edit'),
        save: $('#btn-save'),
        back: $('#btn-back'),
        types: $('#btn-types'),
        params: $('#btn-params'),
    },
    list: {
        types: $('#list-types'),
        params: $('#list-params')
    }
};

var paramTypes = ['Число', 'Флаг'];

var activeMark = marks[0];

function GetRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function ClearLists() {
    Array.from(htmlElems.list.types[0].children).forEach(x => htmlElems.list.types[0].removeChild(x));
    Array.from(htmlElems.list.params[0].children).forEach(x => htmlElems.list.params[0].removeChild(x));
}

function ClearData() {
    ClearLists();

    htmlElems.inputs.id[0].value = "";
    htmlElems.inputs.name[0].value = "";

    htmlElems.inputs.id.prop('disabled', true);
    htmlElems.inputs.name.prop('disabled', true);

    htmlElems.buttons.types.prop('disabled', true);
    htmlElems.buttons.params.prop('disabled', true);
    htmlElems.buttons.edit.prop('disabled', false);
    htmlElems.buttons.save.prop('disabled', true);
}

function CreateListItem(id, text, selectOptions, activeOption, isSelectedIndex=false, disabled=true) {
    let div = document.createElement('div');
    div.classList.add('col-12', 'd-flex', 'flex-row', 'justify-content-between');

    let inputId = document.createElement('input');
    inputId.type = "hidden";
    inputId.value = id;

    let input = document.createElement('input');
    input.type = "text";
    input.classList.add('form-control');
    input.value = text;
    input.disabled = disabled;
    
    let select = document.createElement('select');
    select.classList.add('form-select');
    select.disabled = disabled;

    let options = selectOptions.map(x => {
        let elem = document.createElement('option');
        elem.value = x;
        elem.innerText = x;

        return elem;
    });
    
    select.append(...options);
    select.value = activeOption;

    div.append(inputId, input, select);

    return div;
}

function FillLists() {
    let typeListItems = activeMark.types.map(x => CreateListItem(x.id, x.name, imgs, x.imgPath));
    let paramsListItems = activeMark.params ? activeMark.params.map(x => CreateListItem(x.id, x.name, paramTypes, paramTypes[x.type])) : [];

    htmlElems.list.types[0].append(...typeListItems);
    htmlElems.list.params[0].append(...paramsListItems);

    if (paramsListItems.length == 0) {
        ChangeListsItemsEnabling(htmlElems.list.params, false);
    }
}

function WriteActiveMarkInfo() {
    htmlElems.inputs.id[0].value = activeMark.id;
    htmlElems.inputs.name[0].value = activeMark.name;

    FillLists()
}

function ChangeListsItemsEnabling(list, enable) {
    list.find('input, select').prop('disabled', !enable);
}

function AddNewListItem(list, options) {
    list.append(CreateListItem(-1, "", options, options[0], false));
}

function ChangeActiveMark(id) {
    $(`#mark-${activeMark.id}`).removeClass('active-mark');
    $(`#mark-${id}`).addClass('active-mark');
    ClearData();
    activeMark = id == -1 ? {id: -1, name: "", types: [], params: []} : marks.find(x => x.id == id);
    WriteActiveMarkInfo();

    if(id == -1) {
        Edit();
    }
}

function Back() {
    document.location.href = "/";
}

function Edit() {
    $('input, select').prop('disabled', false);

    htmlElems.buttons.types.prop('disabled', false);
    htmlElems.buttons.params.prop('disabled', false);
    htmlElems.buttons.edit.prop('disabled', true);
    htmlElems.buttons.save.prop('disabled', false);
}

function Block() {
    $('input, select').prop('disabled', true);

    htmlElems.buttons.types.prop('disabled', true);
    htmlElems.buttons.params.prop('disabled', true);
    htmlElems.buttons.back.prop('disabled', true);
    htmlElems.buttons.save.prop('disabled', true);
}

function Unblock() {
    $('input, select').prop('disabled', false);

    htmlElems.buttons.types.prop('disabled', false);
    htmlElems.buttons.params.prop('disabled', false);
    htmlElems.buttons.back.prop('disabled', false);
    htmlElems.buttons.save.prop('disabled', false);
}

async function Save() {
    Block();

    let types = Array.from(htmlElems.list.types[0].children).map(x => {
        return {
            id: Number(x.children[0].value),
            name: x.children[1].value,
            imgPath: x.children[2].value
        };
    });

    types.forEach(x => {
        if (x.id == -1) {
            x.id = GetRandomInt(1e16);
        }
    });

    let params = Array.from(htmlElems.list.params[0].children).map(x => {
        return {
            id: Number(x.children[0].value),
            name: x.children[1].value,
            type: x.children[2].selectedIndex
        };
    });

    params.forEach(x => {
        if (x.id == -1) {
            x.id = GetRandomInt(1e16);
        }
    });

    if (!types.length) {
        alert('Должен присутствовать хотя бы 1 тип');

        Unblock();
    }
    else if (types.map(x => !Boolean(x.name)).reduce((x,y) => x || y) || params.length != 0 && params.map(x => !Boolean(x.name)).reduce((x,y) => x || y)) {
        alert("Все названия должны быть заполнены");

        Unblock();
    } else {
        let mark = {
            id: Number(htmlElems.inputs.id[0].value),
            name: htmlElems.inputs.name[0].value,
            types: types,
            params: params
        };

        try {
            if (mark.id == -1) {
                mark.id = GetRandomInt(1e16);
                await requests.marks.Add(mark);
            } else {
                await requests.marks.Update(mark);
            }
        } catch (error) {
            alert(`При загрузке произошла ошибка:\n;${error}`);

            Unblock();
        }      

        window.location.reload();
    }
}