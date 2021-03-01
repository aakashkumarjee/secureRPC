// Author <<=== aakashkumarjee@gmail.com ===>>

const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const packageDef = protoLoader.loadSync('../grpc/KeyDistribution.proto')
const grpcObject = grpc.loadPackageDefinition(packageDef)
const KDCPackage = grpcObject.KDCPackage;

const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator()

const Cryptr = require('cryptr')

const server = new grpc.Server()
server.bind('localhost:40000', grpc.ServerCredentials.createInsecure())



var fileServers = [];
var fileServersWithId = [];
var disClients = [];
var sessionKeys = [];
// RPC Functions 
const registerWithKDC = (call, callback)=>{
    var key = call.request.key;
    // Handling File Server Connection 
    if(call.request.port != -1){
        console.log("Got Register Request from File Server")
        if(!fileServers[key]){
            let server = {
                    "id" : fileServers.length+1,
                    "name": call.request.name,
                    "port" : call.request.port,
                    "key": key
            }
            console.log("Server Name : ", server.name,"\nServer Key: ",server.key)
            fileServers.push(server);
            let id = fileServersWithId.length+1;
            let serverWithId = {
                [id] : {
                    "id" : id,
                    "name": call.request.name,
                    "port" : call.request.port,
                    "key": key
                }
            }
            console.log("Registered Successfully...\n\n")
            fileServersWithId.push(serverWithId);
            return callback(null, {
                "status": 1,
                "key": key,
                "id" : id
            })
        }
    }else
    // Handling Distributed Client Connection 
    {
        console.log("Got Register Request from Client")
        
        if(!disClients[key]){
            let client = {
                [key] : {
                    "id" : disClients.length + 1,
                    "name" : call.request.name,
                    "key"  : key
                }
            }
            disClients.push(client)
            console.log("Client Name : ", call.request.name, "\nClient Key: ",call.request.key)
        }
    }
    
    console.log("Registered Successfully...\n\n")
    callback(null, {
        "status": 1,
        "key": key,
        "id" : disClients.length
    })
}

const connectWith = (call, callback) => {
    let serverId = call.request.id;
    let key = call.request.key;
    let server;
    fileServers.forEach(sev => {
        if(sev.id == serverId){
            server = sev;
        }
    })
    console.log("Connection Requested to Server ", server.name, " at port ", server.port);
    let serverKey = server.key;
    let serverPort = server.port;
    let sessionKey = uidgen.generateSync();
    console.log("Session Key Generated for Connection : ", sessionKey);
    let encryptedKey = encrypt(sessionKey,serverKey);
    let response = {
        "port": serverPort,
        "sessionKey": sessionKey,
        "serverMessage" : encrypt(sessionKey, serverKey),
        "serverKey": serverKey
    }
    callback(null, response)
}

const listServers = (call,callback) => {
    console.log("Got Server Listing Request from Client ", call.request.name);
    let result = [];
    fileServers.forEach(server => {
        result.push({
            "name": server.name,
            "port":server.port,
            "key": server.key,
            "id": server.id
        })
    })
    console.log("Server Name\tServer Id\tServer Port");
    result.forEach(server => {
        console.log(server.name,"\t\t", server.id, "\t\t", server.port);
    })
    callback(null, {
        "list": result
    });
}
// Server
server.addService(KDCPackage.KDC.service, {
    "registerWithKDC": registerWithKDC,
    "connectWith": connectWith,
    "listServers": listServers
})
server.start();
console.log("KDC Server started at port 40000")
// Supporting Fuctions 

function encrypt(message, key){
    let cryptr = new Cryptr(key);
    return cryptr.encrypt(message);
}
function decrypt(message, key){
    let cryptr = new Cryptr(key);
    return cryptr.decrypt(message);
}

// Author <<=== aakashkumarjee@gmail.com ===>>
