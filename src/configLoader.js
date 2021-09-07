const path = require('path');
const fs = require('fs');

class ConfigLoader {
    constructor(rootPath) {
        this.rootPath = rootPath
        this.defaultSettingPath = path.join(__dirname, '../assets/default.json')
    }

    loadDefault() {
        return this.loadJsonFile(this.defaultSettingPath);
    }

    load() {
        const customConfigPath = path.join(this.rootPath, 'config.json');

        return {
            ip: null,
            effects: {
                ...this.loadJsonFile(this.defaultSettingPath)
            },
            ...this.loadJsonFile(customConfigPath)
        }
    }

    loadJsonFile(filePath) {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath))
        }

        return {}
    }

    save(config, callback) {
        fs.writeFile(path.join(this.rootPath, `config.json`), JSON.stringify(config), (err) => {
            if (typeof callback === 'function') {
                callback(err)
            }
        })
    }
}

module.exports = ConfigLoader
