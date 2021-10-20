const fs = require('fs');

class DataController {
    constructor(filePath, typeName='data') {
        this.typeName = typeName;
        this.filePath = filePath;
        this.data = [];

        if(!fs.existsSync(this.filePath)) {
            this.Save();
        } else {
            this.data = require(this.filePath);
        }
    }

    Save() {
        fs.writeFile(this.filePath, JSON.stringify(this.data), () => {});
    }
    
    Add(elem) {
        this.data.push(elem);
        this.Save();
    }
    
    Update(elem) {
        let index = this.data.findIndex(x => x.id === elem.id);
    
        if (index !== -1) {
            this.data[index] = elem;
            this.Save();
        }
    }
    
    Delete(elem) {
        let index = this.data.findIndex(x => x.id === elem.id);
    
        if (index !== -1) {
            this.data.splice(index, 1);
            this.Save();
        }
    }
    
    ToString() {
        return JSON.stringify({ [this.typeName]: this.data, });
    }
}

module.exports = DataController;