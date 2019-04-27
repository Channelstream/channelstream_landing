// Import the LitElement base class and html helper function
import {LitElement, html, css, unsafeCSS} from 'lit-element';
import CodeMirror from 'codemirror';
import CodeMirrorCss from 'codemirror/lib/codemirror.css';
import CodeMirrorCssDarcula from 'codemirror/theme/darcula.css';

// Extend the LitElement base class
class ChannelstreamLandingDemo extends LitElement {

    static get properties() {
        return {
            requestMethod: {type: String},
            requestURL: {type: String},
            relayUrl: {type: String},
            loading: {type: Boolean},
            responseData: {type: Object}
        };
    }

    constructor() {
        super();
        this.loading = false;
    }

    static get styles() {
        let result = css`
        ${unsafeCSS(CodeMirrorCss)}
        ${unsafeCSS(CodeMirrorCssDarcula)}
        
        :host{
           padding: 1em;
        }
        
        .header {
            font-weight: bold;
            font-size: 1.25em;
        }
        
        .CodeMirror {
            margin:1em 0;
        }
        
        .send-button {
            border: 1px solid;
            background-color: #dc951c;
            padding: 1em 2em;
        }
        
        .response {
            padding: 1em;
            background-color: #3c3c3c;
        }
        
        `;
        return result;
    }

    render() {
        let responseJson = html``;
        let sendLabel = html`Send`;
        if (this.loading) {
            sendLabel = html`LOADING`;
        }
        if (this.responseData) {
            responseJson = html`
            <p><strong>Response</strong></p>
            <pre class="response">${JSON.stringify(this.responseData, null, 4)}</pre>
        `;
        }


        return html`
        <div>
            <div class="header">
                <slot name="header"></slot>
            </div>
            
            <slot name="description"></slot>
            
            <textarea class="json-editor"></textarea>
            <p>Endpoint: <strong>${this.requestURL}</strong> HTTP method: <strong>${this.requestMethod.toUpperCase()}</strong></p>
            <button class="send-button" @click=${this.submit}>${sendLabel}</button>
            
            ${responseJson}

            </div>
        </div>
        
    `;
    }

    async firstUpdated(changedProperties) {
        setTimeout(() => {
            let initialCode = JSON.stringify(JSON.parse(this.querySelectorAll('pre')[0].innerHTML), null, 4);
            let container = this.shadowRoot.querySelector(".json-editor");
            let options = {
                lineNumbers: true,
                theme: "darcula",
                mode: {name: "javascript", json: true},
            };
            let editor = CodeMirror.fromTextArea(container, options);
            this.editor = editor;
            editor.setValue(initialCode);
        });
    }

    submit() {
        let data = {
            payload: JSON.parse(this.editor.getValue()),
            url: this.requestURL,
            method: this.requestMethod
        };
        this.loading = true;
        this.responseData = undefined;
        fetch(this.relayUrl, {
            method: this.requestMethod.toUpperCase(),
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        }).then(response => response.json()).then(data => {
            console.log('success', data)
            this.responseData = data;
        }).catch(error => {
            console.error('error', error);
            this.responseData = "COMMUNICATION ERROR";
        }).finally(() => {
            this.loading = false;
        })
    }

}

// Register the new element with the browser.
customElements.define('channelstream-landing-demo', ChannelstreamLandingDemo);

export {ChannelstreamLandingDemo}
