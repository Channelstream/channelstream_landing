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
            relayUrl: {type: String}
        };
    }


    static get styles() {
        let result = css`
        ${unsafeCSS(CodeMirrorCss)}
        ${unsafeCSS(CodeMirrorCssDarcula)}
        `;
        return result;
    }

    render() {
        return html`
        <style>
        #send-button {
            border: 1px solid;
            background-color: #dc951c;
            padding: 1em 2em;
        }
        </style>

        <div>
            <div class="header">
                <slot name="header"></slot>
            </div>
            
            <textarea id="jsoneditor"></textarea>
            
            <button id="send-button" @click=${this.submit}>Send</button>
            
            </div>
        </div>
        <slot></slot>
    `;
    }


    connectedCallback() {
        super.connectedCallback();
        this.mo = new MutationObserver(() => this.requestUpdate());
        this.mo.observe(this, {childList: true})
    }

    async firstUpdated(changedProperties) {
        setTimeout(() => {
            let initialCode = JSON.stringify(JSON.parse(this.querySelectorAll('pre')[0].innerHTML), null, 4);
            let container = this.shadowRoot.getElementById("jsoneditor");
            let options = {
                lineNumbers: true,
                theme: "darcula",
                mode:  "javascript"
            };
            let editor = CodeMirror.fromTextArea(container, options);
            this.editor = editor;
            editor.setValue(initialCode);
        });
    }

    submit() {
        let data = {
            payload: this.editor.getValue(),
            url: this.requestURL
        };
        fetch(this.relayUrl, {
            method: this.requestMethod.toUpperCase(),
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        }).then(response => response.json()).then(data => console.log('success', 'data')).catch(error => {
            console.error('error', error)
        })
    }

}

// Register the new element with the browser.
customElements.define('channelstream-landing-demo', ChannelstreamLandingDemo);
