const EMsg = require("../enums/emsg")

module.exports = (message, crypto, socket) => {
    socket.write(Buffer.from("4E8400001C00000000001855E14030F7DD69EA090628BAF498EDAFA2AD6E6E492E2A99", "hex"))
}