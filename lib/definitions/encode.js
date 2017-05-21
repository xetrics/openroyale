const fs = require('fs');
const path = require("path")

const Long = require("long");
var ByteBuffer = require("../../util/bytebuffer-sc");
const EMsg = require('../../enums/emsg');

module.exports = class Definitions {
    constructor() {
        this.definitions = []
        this.components = []

        // Load Definitions
        let types = ["client", "server", "component"]
        types.forEach((folder) => {
            fs.readdir(`./node_modules/cr-messages/${ folder }`, (err, files) => {
                
                if(err) return console.error(`[ERR] error loading ${ folder } messages`)
                
                files.forEach((file) => {
                    let json = JSON.parse(fs.readFileSync(path.join(__dirname,  "../../node_modules/cr-messages", folder, file), "utf8"))
                    
                    if(json.id) {
                        this.definitions[json.id] = json
                    } else {
                        this.components[json.name] = json
                    }
    
                })
            })
        })
    }

    encode(message) {
        this.stream = new ByteBuffer(1024)

        if(this.definitions[message.messageType]) {
            this.encode_fields(this.definitions[message.messageType].fields, message.decoded)
            message.decrypted = this.stream.toArrayBuffer()
        } else {
            console.error(`Unknown message type: ${ message.messageType }`)
        }
    }

    encode_fields(fields, data) {
        fields.forEach((field, index) => {
            this.encode_field(field.type, field.name ? data[field.name] : data[`unknown_${ index++ }`])
        })


    }

    encode_field(type, message) {
        console.log(`${type}: ${message}`)
        switch(type) {
            case "BYTE":
                this.stream.writeByte(message)
                break
            case "LONG":
                this.stream.writeLong(Long.fromValue({high: message.high, low: message.low, unsigned: message.unsigned}))
                break
            case "RRSINT32":
                this.stream.writeRrsInt32(message) // offset??
                break
            case "STRING": 
                this.stream.writeIString(message)
        }
    }
}