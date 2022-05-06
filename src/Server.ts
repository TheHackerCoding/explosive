/// <reference path="../node_modules/as-lunatic/assembly/index.d.ts" />
import * as lunatic from "as-lunatic";
import { Mailbox, Process, TCPServer, TCPSocket, __lunatic_abort as abort, NetworkResultType } from "as-lunatic";
import { strConvert } from "./utils";

const EXAMPLE: string = `
HTTP/1.1 200 OK
Date: Sun, 10 Oct 2010 23:26:07 GMT
Server: Apache/2.2.8 (Ubuntu) mod_ssl/2.2.8 OpenSSL/0.9.8g
Last-Modified: Sun, 26 Sep 2010 22:04:35 GMT
Accept-Ranges: bytes
Content-Length: 12
Connection: close
Content-Type: text/html

Hello world!`

interface Data {
  data: string;
}

export default class Explosive {
  private tcp: TCPServer

  constructor(ip: StaticArray<u8> = [0, 0, 0, 0], port: u16 = 3000) {
    let _tcp = TCPServer.bindIPv4(ip, port)
    if (!_tcp.isOk()) {
      abort(`Something went wrong making a TCP server: ${_tcp.errorString}`)
    }
    this.tcp = _tcp.value as TCPServer
  }

  start(): void {
    while (true) {
      let _socket = this.tcp.accept()
      if (!_socket.isOk()) {
        abort(`Something went wrong accepting a TCP request: ${_socket.errorString}`)
      }
      let socket = _socket.value as TCPSocket
      console.log(socket.ip.ip.join("."))
      //console.log(socket.byteCount.toString())
      //console.log(socket.read().value.toString())
      //console.log((socket.buffer as StaticArray<u8>).join(","))
      let dat = socket.read(3000)
      if (!dat.isOk()) {
        console.log("uhhh couldnt read data")
      } else {
        console.log(dat.value.toString())
        let result = socket.writeBuffer(strConvert(EXAMPLE), 3000)

        switch (result.value) {
          case NetworkResultType.Error: {
            trace(result.errorString);
            break;
          }
          case NetworkResultType.Closed: {
            trace("Socket closed");
            break;
          }
          case NetworkResultType.Success: {
            // bytes written is stored on byteCount
            trace("Bytes Written", 1, <f64>socket.byteCount);
            break;
          }
        }
        socket.dispose()
      }
      //let result = socket.writeBuffer(strConvert("HTTP/1.0 200 OK\n\nHello World"))
      //socket.writeArray("hi".split(""))
      // @ts-ignore

    }
  }
}
