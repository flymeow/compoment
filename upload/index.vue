<template>
    <div>
       <div @click="handleClick" class="upload">
            <input
                ref="input"
                type="file"
                @change="handleChange"
                :multiple="multiple"
                :accept="accept">
            <slot>
                <button type="button">
                    {{defaultName}}
                </button>
            </slot>
        </div>
        <uploadList :files="fileList" @on-fileList-change="onFileListChange"> </uploadList>
    </div>
</template>
<style lang="less">
    @import './index.less';
</style>
<script>
import ajax, {HTTP} from './ajax.js';
import uploadList from './upload-list';

export default {
    name:'upload',
    components:{
        uploadList
    },
    props:{
        name:{
            type:String,
            default: 'file'
        },
        defaultName:{
            type:String,
            default: '文件上传'
        },
        action: {
            type: String,
            required: true
        },
        accept: {
            type: String
        },
        multiple: {
            type: Boolean,
            default: false
        },
        beforeUpload: Function,
        data: {
            type: Object
        },
        format: {
            type: Array,
            default () {
                return [];
            }
        },
        onFormatError: {
            type: Function,
            default () {
                return {};
            }
        },
        onExceededSize:{
            type: Function,
            default () {
                return {};
            }
        },
        onSuccess:{
            type: Function,
            default () {
                return {};
            }
        },
        onError: {
            type: Function,
            default () {
                return {};
            }
        },
        maxSize:{
            type:Number,
        },
        onProgress: {
            type: Function,
            default () {
                return {};
            }
        },
    },
    data() {
        return {
            fileList: [],
            tempIndex: 1,
            isUplaod: true,
            uids:new Map()           
        }
    },
    computed:{
    },
    methods:{
        handleClick() {
            this.$refs.input.click();
        },
        handleChange(e) {
            const files = e.target.files;
            if (!files) {
                return;
            }
            this.uploadFiles(files);
            this.$refs.input.value = null;
        },
        uploadFiles (files) {
            let postFiles = Array.prototype.slice.call(files);
            if (!this.multiple) postFiles = postFiles.slice(0, 1);
            if (postFiles.length === 0) return;
            postFiles.forEach(file => {
                this.upload(file);
            });
        },
        upload (file) {
            if (!this.beforeUpload) {
                return this.post(file);
            }
            const before = this.beforeUpload(file);
            if (before && before.then) {
                before.then(processedFile => {
                    if (Object.prototype.toString.call(processedFile) === '[object File]') {
                        this.post(processedFile);
                    } else {
                        this.post(file);
                    }
                }, () => {
                   return;
                });
            } else if (before !== false) {
                this.post(file);
            } else {
               return;
            }
        },
        handleStart (file) {
            file.uid = Date.now() + this.tempIndex++;
            const _file = {
                status: 'uploading',
                name: file.name,
                size: file.size,
                percentage: 0,
                uid: file.uid,
                showProgress: true
            };
            this.fileList.push(_file);
        },
        onFileListChange(files, removeFile) {
            this.fileList = files;
            if(removeFile) {
                let x = this.uids.get(removeFile.uid);
                x.xhr.abort();
            }
        },
        getFile (file) {
            const fileList = this.fileList;
            let target;
            fileList.every(item => {
                target = file.uid === item.uid ? item : null;
                return !target;
            });
            return target;
        },
        handleProgress (e, file) {
            const _file = this.getFile(file);
            this.onProgress(e, _file, this.fileList);
            if(_file) {
                _file.percentage = e.percent || 0;
            }
        },
        handleSuccess (res, file) {
            const _file = this.getFile(file);
            if (_file) {
                _file.status = 'finished';
                _file.response = res;
                this.onSuccess(res, _file, this.fileList);
                setTimeout(() => {
                    _file.showProgress = false;
                }, 1000);
            }
        },
        handleError (err, response, file) {
            const _file = this.getFile(file);
            const fileList = this.fileList;
            _file.status = 'fail';
            fileList.splice(fileList.indexOf(_file), 1);
            this.onError(err, response, file);
        },
        post (file) {
            if (this.format.length) {
                const _file_format = file.name.split('.').pop().toLocaleLowerCase();
                const checked = this.format.some(item => item.toLocaleLowerCase() === _file_format);
                if (!checked) {
                    this.onFormatError(file, this.fileList);
                    return false;
                }
            }
            if (this.maxSize) {
                if (file.size > this.maxSize * 1024) {
                    this.onExceededSize(file, this.fileList);
                    return false;
                }
            }
            this.handleStart(file);
            let formData = new FormData();
            formData.append(this.name, file);
            let self = this;
            let m = new HTTP({
                headers: self.headers,
                withCredentials: self.withCredentials,
                file: file,
                data: self.data,
                filename: self.name,
                action: self.action,
                onProgress: (e) => {
                    this.progress = parseInt(e.percent);
                    this.handleProgress(e, file);
                },
                onSuccess: res => {
                    this.handleSuccess(res, file);
                },
                onError: (err, response) => {
                    this.handleError(err, response, file);
                },
            });
            this.uids.set(file.uid, m)
        },
    }
}
</script>
