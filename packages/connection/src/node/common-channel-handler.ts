import {WebSocketHandler} from './ws';
import * as pathMatch from 'path-match';
import * as ws from 'ws';
import {WSChannel, ChannelMessage} from '../common/ws-channel';
const route = pathMatch();

export interface IPathHander {
  dispose: (connection: any, connectionId: string) => void;
  handler: (connection: any, connectionId: string) => void;
  connection?: any;
}

// export const pathHandler: Map<string, ((connection: any) => void)[]> = new Map();

export class CommonChannelPathHandler {
  private handlerMap: Map<string, IPathHander[]> = new Map();

  register(channelPath: string, handler: IPathHander) {
    if (!this.handlerMap.has(channelPath)) {
      this.handlerMap.set(channelPath, []);
    }
    const handlerArr = this.handlerMap.get(channelPath) as IPathHander[];
    const handlerFn = handler.handler.bind(handler);
    const setHandler = (connection, clientId) => {
      handler.connection = connection;
      handlerFn(connection, clientId);
    };
    handler.handler = setHandler;
    handlerArr.push(handler);
    this.handlerMap.set(channelPath, handlerArr);
  }
  removeHandler(channelPath: string, handler: IPathHander) {
    const handlerArr = this.handlerMap.get(channelPath) || [];
    const removeIndex = handlerArr.indexOf(handler);
    if (removeIndex !== -1) {
      handlerArr.splice(removeIndex, 1);
    }
    this.handlerMap.set(channelPath, handlerArr);
  }
  get(channelPath: string) {
    return this.handlerMap.get(channelPath);
  }
  disposeConnectionClientId(connection: ws, clientId: string) {
    this.handlerMap.forEach((handlerArr: IPathHander[]) => {
      handlerArr.forEach((handler: IPathHander) => {
        handler.dispose(connection, clientId);
      });
    });
  }
  disposeAll() {
    // this.handlerMap.forEach((handlerArr: IPathHander[]) => {
    //   handlerArr.forEach((handler: IPathHander) => {
    //     handler.dispose(handler.connection);
    //   });
    // });
  }
  getAll() {
    return Array.from(this.handlerMap.values());
  }
}

export const commonChannelPathHandler = new CommonChannelPathHandler();
export class CommonChannelHandler extends WebSocketHandler {
  static channelId = 0;

  public handlerId = 'common-channel';
  private wsServer: ws.Server;
  private handlerRoute: (wsPathname: string) => any;
  private channelMap: Map<number, WSChannel> = new Map();
  private connectionMap: Map<string, ws> = new Map();

  constructor(routePath: string, private logger: any = console) {
    super();
    this.handlerRoute = route(routePath);
    this.initWSServer();
  }

  private initWSServer() {
    this.logger.log('init Common Channel Handler');
    this.wsServer = new ws.Server({noServer: true});
    this.wsServer.on('connection', (connection: ws) => {
      let connectionId;
      connection.on('message', (msg: string) => {
        let msgObj: ChannelMessage;
        try {
          msgObj = JSON.parse(msg);

          // 链接管理
          if (msgObj.kind === 'client') {
            const clientId = msgObj.clientId;
            this.connectionMap.set(clientId, connection);
            console.log('connectionMap', this.connectionMap.keys());
            connectionId = clientId;
          // channel 消息处理
          } else if (msgObj.kind === 'open') {
            const channelId = msgObj.id; // CommonChannelHandler.channelId ++;
            const {path} = msgObj;

            // 生成 channel 对象
            const connectionSend = this.channelConnectionSend(connection);
            const channel = new WSChannel(connectionSend, channelId);
            this.channelMap.set(channelId, channel);

            // 根据 path 拿到注册的 handler
            const handlerArr = commonChannelPathHandler.get(path);
            if (handlerArr) {
              for (let i = 0, len = handlerArr.length; i < len; i++) {
                const handler = handlerArr[i];
                handler.handler(channel, connectionId);
              }
            }

            channel.ready();
          } else {
            const {id} = msgObj;
            const channel = this.channelMap.get(id);
            if (channel) {
              channel.handleMessage(msgObj);
            } else {
              this.logger.log(`channel ${id} not found`);
            }

          }
        } catch (e) {
          this.logger.log(e);
        }

      });

      connection.on('close', () => {
        // commonChannelPathHandler.disposeAll();
        commonChannelPathHandler.disposeConnectionClientId(connection, connectionId as string);
        this.channelMap.clear();
      });
    });
  }
  private channelConnectionSend = (connection: any) => {
    return (content: string) => {
      connection.send(content, (err: any) => {
        if (err) {
          this.logger.log(err);
        }
      });
    };
  }
  public handleUpgrade(wsPathname: string, request: any, socket: any, head: any): boolean {
    const routeResult = this.handlerRoute(wsPathname);

    if (routeResult) {
      const wsServer = this.wsServer;
      wsServer.handleUpgrade(request, socket, head, (connection: any) => {
        connection.routeParam = {
          pathname: wsPathname,
        };

        wsServer.emit('connection', connection);
      });
      return true;
    }

    return false;
  }

}
