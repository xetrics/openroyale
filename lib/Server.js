const net = require("net")
const settings = require("../settings.json")
const PacketReciever = require("./PacketReciever")
const ServerCrypto = require("./server/crypto")
const ClientCrypto = require("./client/crypto")
const Definitions = require("./definitions")
const EMsg = require("../enums/emsg")
const jsome = require("jsome")
const handlers = require("../handlers")

const definitions = new Definitions.decode({})

module.exports = class Server {
    constructor() {
       this.tcp = net.createServer()
       this.ready = false
       this.connections = {}

        // TCP server listen
        this.tcp.listen({ host: "0.0.0.0", port: 9339, exclusive: true }, (err) => {
            if (err) console.error(err)
        })

       // TCP connection opened
        this.tcp.on("connection", (socket) => {
            socket.key = `${ socket.remoteAddress }:${ socket.remotePort }`
            this.connections[socket.key] = socket

            const packet_reciever = new PacketReciever()

            const crypto = new ServerCrypto(settings)
            const client_crypto = new ClientCrypto(settings)

            crypto.setClient(client_crypto)
            client_crypto.setServer(crypto)

            socket.on("data", (chunk) => {
                console.log("got data")
                packet_reciever.packetize(chunk, (packet) => {
                    const message = {
                        messageType: packet.readUInt16BE(0),
                        length: packet.readUInt16BE(2, 3),
                        version: packet.readUInt16BE(5),
                        payload: packet.slice(7, packet.length)
                    }

                    const id = EMsg[message.messageType] ? EMsg[message.messageType] : message.messageType
                    console.log(`[MSG] (${ id })`)

                    crypto.decryptPacket(message)
                    definitions.decode(message)

                    if(message.decoded && Object.keys(message.decoded).length) {
                        jsome(message.decoded)
                    }

                    if(handlers[id]) {
                        handlers[id](message, crypto, socket)
                    } else {
                        console.info(`[WARN] No packet handler exists for type: ${ id }`)
                    }

                })
            })
        })

        // Server started up
        this.tcp.on("listening", () => {
            this.ready = true
            console.info("[MSG] Server started")
        })

        // TCP server error
        this.tcp.on("error", (err) => {
            if(err) {
                console.error(err)
            } else {
                console.log("[ERR] Unknown error occured setting up server")
            }
        })
    }
}