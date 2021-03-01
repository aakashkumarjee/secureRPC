// Author <<=== aakashkumarjee@gmail.com ===>>

const nameGen = require('random-name')
const UIDGenerator = require('uid-generator')
const uidGen = new UIDGenerator();
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const packageDef = protoLoader.loadSync('../grpc/FileServer.proto')
const grpcObject = grpc.loadPackageDefinition(packageDef)
const FSPackage = grpcObject.FSPackage;

const PowerShell = require("powershell");

const Cryptr = require('cryptr');

//Registering to KDC
const packageDefKDC = protoLoader.loadSync('../grpc/KeyDistribution.proto');
const grpcObjectKDC = grpc.loadPackageDefinition(packageDefKDC)
const KDCPackage = grpcObjectKDC.KDCPackage;

const KDCClient = new KDCPackage.KDC('localhost:40000', grpc.credentials.createInsecure())

let myPort = process.argv[2];
var myDetails = {
    "name" : nameGen.first(),
    "port" : myPort,
    "key"  : uidGen.generateSync(),
    "id"   : null
}
// RPC Functions 
function registerWithKDC(client, callback){
    let request = {
        "name" : myDetails.name,
        "port" : myDetails.port,
        "key"  : myDetails.key,
        "id"   : myDetails.id
    }
    client.registerWithKDC(request, (err, response)=> {
        if(err)return console.log(err)
        console.log("Registration Successfull from KDC")
        console.log(" My id is : ", response.id, " and Key is ", response.key);
        myKey = response.key;
    })
    callback();
}



var myKey;



const connect = (call, callback) => {
    let message = call.request.message;
    let key = call.request.key;
    //console.log(call.request);
    console.log("Encrypted Session Key Recieved : ", call.request.message);
    myKey == decrypt(message, key)
    console.log("Decrypted Session Key for Transmission : ", call.request.key);
    callback(null, {
        "status": "Recieved the Session Key, Connection Accepted"
    })
}



// Starting Server
function startServer(){
    console.log("KDC Registration Success");
    const server = new grpc.Server()
    console.log('Starting server');
    server.bind('localhost:'+ myPort, grpc.ServerCredentials.createInsecure())
    server.addService(FSPackage.FS.service, {
        "command": runCommands,
        "connect": connect
    })
    server.start();
    console.log("File Server started at the port ", myPort);
}
function runCommands(call, callback){
    let data = "data";
    let command = call.request.command;
    console.log(call.request);
    let ps = new PowerShell(command);
    let output;
    ps.on("output", data => {
       // console.log(data);
        output = data;
    });
    data = encrypt(data, output);
    setTimeout(function (){
        callback(null, {
            "output": output
        })
    }, 1000);
}
//Program
registerWithKDC(KDCClient, startServer);
// Supporting Functions

const decrypt = (message,key) => {
    //let cryptr = new Cryptr(key);
    return (message);
}
function encrypt(message, key){
    //let cryptr = new Cryptr(key);
    return (message);
}
// Author <<=== aakashkumarjee@gmail.com ===>>
