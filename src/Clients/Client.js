// Author <<=== aakashkumarjee@gmail.com ===>>

const nameGen = require('random-name')
const UIDGenerator = require('uid-generator')
const uidGen = new UIDGenerator();
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
// File Server Package Definition
const packageDefKDC = protoLoader.loadSync('../grpc/KeyDistribution.proto');
const grpcObjectKDC = grpc.loadPackageDefinition(packageDefKDC)
const KDCPackage = grpcObjectKDC.KDCPackage;
// File Server Package Definition
const packageDefFS = protoLoader.loadSync('../grpc/FileServer.proto');
const grpcObjectFS = grpc.loadPackageDefinition(packageDefFS)
const FSPackage = grpcObjectFS.FSPackage;

const KDCClient = new KDCPackage.KDC('localhost:40000', grpc.credentials.createInsecure())

const Cryptr = require('cryptr');
var myKey = uidGen.generateSync();
const prompt = require('prompt-sync')({sigint: true});
let inCli = false;
var myDetails = {
    "name" : nameGen.first(),
    "port" : -1,
    "key"  : uidGen.generateSync(),
    "id"   : null
}
var serverDetails = {
    "sessionKey" : null,
    "port" : null,
    "key"  : null,
    "id"   : null
}
// RPC Functions 
const registerWithKDC = (client) => {
    let request = {
        "port" : myDetails.port,
        "key"  : myDetails.key,
        "id"   : myDetails.id,
        "name" : myDetails.name
    }
    client.registerWithKDC(request, (err, response)=> {
        if(err)return console.log(err)
        console.log("Recieved from server", JSON.stringify(response))
        myKey = response.key;
    })

}
async function listServers(client){
        return new Promise((resolve, reject) => {
            let request = {
                "name" : myDetails.name,
                "port" : myDetails.port,
                "key"  : myDetails.key,
                "id"   : myDetails.id
            }
            client.listServers(request, (err, response)=> {
                if(err)return console.log(err)
                console.log("\nServers Available\n")
                console.log("Name \t  Id \t Port");
                response.list.forEach(server => {
                    console.log(server.name,"\t\t",server.id,"\t", server.port )
                })
                resolve();
            })
        })

        

}
async function startCli(){
    while (!inCli) {
        let command = prompt('Terminal @ Aakash-LT (secureRPC) : ');
        if(command == 'exit'){
            inCli = true;
        }else if(command == 'show file servers'){
            await listServers(KDCClient);
        }else if(command.split(' ')[0] == 'makeConnection'){
            await getSessionKey(Number(command.split(' ')[1]));
            await connectToServer();
        }else
        await runCommand(command);
        
      }
}
// Procedure


var FSClient = new FSPackage.FS('localhost'+serverDetails.port, grpc.credentials.createInsecure())

function runCommand(cmd){
    return new Promise((resolve, reject)=>{
        FSClient.command({
            "command": cmd
        }, (err, response)=> {
            if(err)return console.log(err)
            console.log( (response.output))
            resolve();
        })
    })
}
registerWithKDC(KDCClient);
setTimeout(startCli,100)


function getSessionKey(id){
    return new Promise((resolve, reject)=>{
        let sessionKey = uidGen.generateSync();
        KDCClient.connectWith({
            "id": id,
            "key": myKey
        }, (err, response)=> {
            if(err)return console.log(err)
            //console.log( (response))
            console.log("Got session key, Now decrypting");
            sessionKey = decrypt(sessionKey, myKey);
            console.log("Session key Decrypted : ", response.sessionKey)
            console.log("Server's session Key", response.serverMessage)
            let encryptedKey = encrypt(response.sessionKey, response.serverKey)
            //console.log(encryptedKey);
            serverDetails.port = response.port;
            serverDetails.sessionKey = response.sessionKey;
            serverDetails.key = response.serverMessage;
            resolve();
        })
    })
}
function connectToServer(){
    return new Promise((resolve, reject) => {
        console.log("Now Connecting to Server at", serverDetails.port);
        FSClient = new FSPackage.FS('localhost:'+serverDetails.port, grpc.credentials.createInsecure())

        FSClient.connect({
            "key": serverDetails.sessionKey,
            "message": serverDetails.key
        }, (err, response)=> {
            if(err)return console.log(err)
            console.log( (response))
            resolve();
        })
    })
}

//getSessionKey(1);



function encrypt(message, key){
    let cryptr = new Cryptr(key);
    return cryptr.encrypt(message);
}
function decrypt(message, key){
    let cryptr = new Cryptr(key);
    return (message);
}
// Author <<=== aakashkumarjee@gmail.com ===>>
