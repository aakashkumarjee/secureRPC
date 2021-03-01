# secureRPC

It is a secure file system which will allow for nodes in a distributed system to remotely access files using RPC stored on a remote File Server. The File System should have the following functionalities:
- A common Key Distribution Centre (KDC) that provides facilities for registering and sharing symmetric keys of distributed nodes and file servers.
- File servers will register with the KDC for files they store currently.
- In case we want a new file to enter the distributed system, the File Server should inform all the connected nodes regarding the file creation.
- For distributed node to access a file on a FS, it should:
-Register itself at KDC which generates a session key containing the symmetric key using the mutual authentication protocol.
-After registering the node, it should use that symmetric key to mutually authenticate with the File Server.
-After Mutual authentication, the files in the File Server will be mounted at the distributed node.

- Users should be provided with a shell by the Distributed Nodes for accessing the file system. The following commands should be available:
a) ls- View all files in the current directory
b) pwd- List the present working directory
c) cp- copy one file to another in the same folder
d) cat- display contents of a file
e) and all other unix commands
- All communications should happen using RPC.

# What is RPC
In distributed computing, a remote procedure call (RPC) is when a computer program causes a procedure (subroutine) to execute in a different address space (commonly on another computer on a shared network), which is coded as if it were a normal (local) procedure call, without the programmer explicitly coding the details for the remote interaction.

# SEQUENCE OF EVENTS

1.	The client calls the client stub. The call is a local procedure call, with parameters pushed on to the stack in the normal way.
2.	The client stub packs the parameters into a message and makes a system call to send the message. Packing the parameters is called marshalling.
3.	The client's local operating system sends the message from the client machine to the server machine.
4.	The local operating system on the server machine passes the incoming packets to the server stub.
5.	The server stub unpacks the parameters from the message. Unpacking the parameters is called unmarshalling.
6.	Finally, the server stub calls the server procedure. The reply traces the same steps in the reverse direction.


# Why GRPC
In gRPC, a client application can directly call a method on a server application on a different machine as if it were a local object, making it easier for you to create distributed applications and services. As in many RPC systems, gRPC is based around the idea of defining a service, specifying the methods that can be called remotely with their parameters and return types. On the server side, the server implements this interface and runs a gRPC server to handle client calls. On the client side, the client has a stub (referred to as just a client in some languages) that provides the same methods as the server.
