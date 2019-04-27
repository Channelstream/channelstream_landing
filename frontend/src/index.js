import './components/channelstream-landing-demo.js';
import Noty from 'noty';
import {ChannelStreamConnection} from '@channelstream/channelstream';

function IndexPageView() {
    let connection = new ChannelStreamConnection();
    connection.connectUrl = '/connect';
    connection.messageUrl = '/message';
    connection.websocketUrl = 'ws://127.0.0.1:8000/ws';
    connection.longPollUrl = 'http://127.0.0.1:8000/listen';
    connection.listenMessageCallback = (messages) => {
        for (let message of messages) {
            console.log('channelstream message', message);
            new Noty({
                text: JSON.stringify(message, null, 4),
                type: 'success',
                theme: 'sunset'
            }).show();
        }
    };
    connection.listenOpenedCallback = () => {
        new Noty({
            text: 'Opened connection',
            type: 'alert',
            theme: 'sunset'
        }).show();

    };
    connection.channels = ["/index"];
    connection.connect();
}

window.IndexPageView = IndexPageView;
