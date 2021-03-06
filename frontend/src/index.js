import Noty from 'noty';
import {ChannelStreamConnection} from '@channelstream/channelstream';

function IndexPageView(config) {
    let connection = new ChannelStreamConnection();
    connection.connectUrl = config.connectUrl;
    connection.messageUrl = config.messageUrl;
    connection.websocketUrl = config.websocketUrl;
    connection.longPollUrl = config.longPollUrl;
    connection.listenMessageCallback = (messages) => {
        for (let message of messages) {
            console.log('channelstream message', message);
            let msg = `From: <strong>${message.user}</strong>
                       <p>${JSON.stringify(message.message, null, 4)}</p>`
            new Noty({
                text: msg,
                type: 'alert',
                theme: 'sunset',
                timeout: 3000
            }).show();
        }
    };
    connection.listenOpenedCallback = () => {
        new Noty({
            text: 'Opened websocket',
            type: 'success',
            theme: 'sunset'
        }).show();

    };
    connection.channels = ["/index"];
    connection.username = undefined;
    connection.connect();
}

export {IndexPageView}
