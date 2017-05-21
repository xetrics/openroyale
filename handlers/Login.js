const EMsg = require("../enums/emsg")
const Long = require("long")
const ByteBuffer = require("../util/bytebuffer-sc")

const defs = require("../lib/definitions")
const defencode = new defs.encode()

module.exports = (message, crypto, socket) => {

    

    // https://github.com/royale-proxy/cr-messages/blob/master/server/LoginOk.json
    let decrypted = {
        userId: {low: 5551025, high: 54, unsigned: false},
        homeId: {low: 5551025, high: 54, unsigned: false},
        userToken: "h3gbtfjyk8p7gerwscak3je9a363wymb7c47fzes",
        gameCenterId: "",
        facebookId: "",
        serverMajorVersion: 3,
        serverBuild: 193,
        contentVersion: 14,
        environment: "prod",
        sessionCount: 1,
        playTimeSeconds: 1029,
        daysSinceStartedPlaying: 0,
        facebookAppId: "1475268786112433",
        serverTime: "1495383971000",
        accountCreatedDate: "1495383971000",
        unknown_16: 0,
        googleServiceId: "",
        unknown_18: "",
        unknown_19: "",
        region: "US",
        contentURL: "http://7166046b142482e67b30-2a63f4436c967aa7d355061bd0d924a1.r65.cf1.rackcdn.com",
        eventAssetsURL: "https://event-assets.clashroyale.com",
        unknown_23: 1
    }

    let msg = {
        messageType: EMsg.LoginOk,
        decoded: decrypted
    }

    defencode.encode(msg)
    crypto.encryptPacket(msg)

    let header = Buffer.alloc(7)
    header.writeInt32BE(EMsg.LoginOk, 0)
    header.writeInt32BE(msg.encrypted.length, 2, 3) 
    header.writeInt32BE(message.version, 5) 

    socket.write(Buffer.concat([header, Buffer.from(message.encrypted)]))
}