import Noty from 'noty';
import {ChannelStreamConnection} from '@channelstream/channelstream';

function DocsFirstAppView(config) {
    let connection = new ChannelStreamConnection();
    connection.connectUrl = config.connectUrl;
    connection.messageUrl = config.messageUrl;
    connection.websocketUrl = config.websocketUrl;
    connection.longPollUrl = config.longPollUrl;
    connection.listenMessageCallback = (messages) => {
        for (let message of messages) {
            console.log('channelstream message', message);
            new Noty({
                text: JSON.stringify(message, null, 4),
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
    connection.channels = ["/tutorial-1"];
    connection.connect();
}

export {DocsFirstAppView}
