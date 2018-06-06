export class HTTP{
    constructor(option){
        this.xhr = new XMLHttpRequest();
        let self = this;
        if (typeof XMLHttpRequest === 'undefined') {
            return;
        }
        const action = option.action;
        if (this.xhr.upload) {
            this.xhr.upload.onprogress = function progress(e) {
                if (e.total > 0) {
                    e.percent = e.loaded / e.total * 100;
                }
                option.onProgress(e);
            };
        }
    
        const formData = new FormData();
    
        if (option.data) {
            Object.keys(option.data).map(key => {
                formData.append(key, option.data[key]);
            });
        }
    
        formData.append(option.filename, option.file);
        this.xhr.onerror = function error(e) {
            option.onError(e);
        };
    
        this.xhr.onload = function onload() {
            if (this.status < 200 || this.status >= 300) {
                return option.onError(self.getError(action, option), self.getBody());
            }
    
            option.onSuccess(self.getBody());
        };
        this.xhr.open('post', action, true);
    
        if (option.withCredentials && 'withCredentials' in this.xhr) {
            this.xhr.withCredentials = true;
        }
    
        const headers = option.headers || {};
    
    
        for (let item in headers) {
            if (headers.hasOwnProperty(item) && headers[item] !== null) {
                this.xhr.setRequestHeader(item, headers[item]);
            }
        }
        this.xhr.send(formData);
    }

    getBody() {
        const text = this.xhr.responseText || this.xhr.response;
        if (!text) {
            return text;
        }
    
        try {
            return JSON.parse(text);
        } catch (e) {
            return text;
        }
    }

    getError(action, option) {
        const msg = `fail to post ${action} ${this.xhr.status}'`;
        const err = new Error(msg);
        err.status = this.xhr.status;
        err.method = 'post';
        err.url = action;
        return err;
    }
    
}