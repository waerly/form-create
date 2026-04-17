import {defineComponent, h} from 'vue';
import {
    Button as AButton,
    Image as AImage,
    Progress as AProgress,
    Upload as AUpload
} from 'ant-design-vue';
import {
    DeleteOutlined,
    EyeOutlined,
    FileOutlined,
    InboxOutlined,
    UploadOutlined
} from '@ant-design/icons-vue';
import './style.css';

const NAME = 'fcSiUpload';

function toArray(value) {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null || value === '') return [];
    return [value];
}

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getFileName(file) {
    return String(file || '').split('/').pop() || '未命名文件';
}

function getFileExt(file) {
    const name = String(file?.name || file?.url || '');
    const index = name.lastIndexOf('.');
    return index > -1 ? name.slice(index + 1).toUpperCase() : '';
}

function isImageFile(file) {
    const type = String(file?.type || file?.contentType || '').toLowerCase();
    const url = String(file?.url || '');
    return type.startsWith('image/') || /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(url);
}

function pickResponseValue(response, paths, fallback = '') {
    if (!isObject(response)) return fallback;
    for (const path of paths) {
        const keys = String(path).split('.');
        let current = response;
        let found = true;
        for (const key of keys) {
            if (!isObject(current) || current[key] === undefined || current[key] === null || current[key] === '') {
                found = false;
                break;
            }
            current = current[key];
        }
        if (found) return current;
    }
    return fallback;
}

function normalizeUploadFile(file, uid, props) {
    if (isObject(file)) {
        const url = file.url || file.fileUrl || file.downloadUrl || file.previewUrl || '';
        const value = file.value ?? file.url ?? file.fileUrl ?? file.id ?? '';
        return {
            uid: file.uid || `si-upload-${uid}`,
            name: file.name || file.fileName || getFileName(url || value),
            status: file.status || 'done',
            url,
            value,
            size: file.size,
            percentage: file.percentage || 100,
            response: file.response,
            raw: file,
            type: file.type || file.contentType || ''
        };
    }

    const url = String(file);
    return {
        uid: `si-upload-${uid}`,
        name: getFileName(url),
        status: 'done',
        url,
        value: url,
        percentage: 100,
        raw: file,
        type: ''
    };
}

function normalizeFileList(value, props) {
    return toArray(value).map((item, index) => normalizeUploadFile(item, index, props));
}

function bytesToText(size) {
    const value = Number(size || 0);
    if (!value) return '';
    if (value < 1024) return `${value}B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)}KB`;
    return `${(value / 1024 / 1024).toFixed(1)}MB`;
}

function resolveGlobalUploadHeaders() {
    if (typeof window === 'undefined') return {};
    if (typeof window.SI_UPLOAD_GET_HEADERS === 'function') {
        return window.SI_UPLOAD_GET_HEADERS() || {};
    }
    return window.SI_UPLOAD_HEADERS || {};
}

function mergeHeaders(...headersList) {
    return headersList.reduce((acc, current) => {
        if (!isObject(current)) return acc;
        Object.keys(current).forEach(key => {
            const value = current[key];
            if (value !== undefined && value !== null && value !== '') {
                acc[key] = value;
            }
        });
        return acc;
    }, {});
}

async function openFileWithHeaders(url, headers = {}) {
    const response = await fetch(url, {
        method: 'GET',
        headers
    });

    if (!response.ok) {
        throw new Error(`preview failed: ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60 * 1000);
}

function createXhrRequest(option, props) {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    const data = typeof props.resolveRequestData === 'function'
        ? props.resolveRequestData()
        : (props.data || {});
    const action = typeof props.resolveAction === 'function'
        ? props.resolveAction()
        : (props.action || '');
    const fieldName = typeof props.resolveUploadFieldName === 'function'
        ? props.resolveUploadFieldName()
        : (props.name || 'file');

    Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });
    formData.append(fieldName, option.file);

    xhr.upload.onprogress = event => {
        if (!event.total) return;
        option.onProgress?.({percent: Math.round((event.loaded / event.total) * 100)});
    };

    xhr.onerror = () => {
        option.onError?.(new Error('upload failed'));
    };

    xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
            option.onError?.(new Error(`upload failed: ${xhr.status}`));
            return;
        }
        let response = xhr.responseText;
        try {
            response = JSON.parse(xhr.responseText);
        } catch {}
        option.onSuccess?.(response);
    };

    xhr.open(props.method || 'POST', action);
    const headers = typeof props.resolveHeaders === 'function'
        ? props.resolveHeaders()
        : (props.headers || {});
    Object.keys(headers).forEach(key => {
        if (headers[key] !== undefined && headers[key] !== null) {
            xhr.setRequestHeader(key, headers[key]);
        }
    });
    xhr.withCredentials = !!props.withCredentials;
    xhr.send(formData);

    return {
        abort() {
            xhr.abort();
        }
    };
}

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    formCreateParser: {
        toFormValue(value) {
            return toArray(value);
        },
        toValue(formValue, ctx) {
            if (ctx.prop.props.limit === 1) {
                return formValue[0] || (ctx.prop.props.valueType === 'object' ? null : '');
            }
            return formValue;
        }
    },
    props: {
        modelValue: {
            type: [Array, String, Object],
            default: () => []
        },
        formCreateInject: Object,
        action: {
            type: String,
            default: ''
        },
        deleteAction: {
            type: String,
            default: ''
        },
        headers: {
            type: Object,
            default: () => ({})
        },
        data: {
            type: Object,
            default: () => ({})
        },
        baseURL: {
            type: String,
            default: ''
        },
        method: {
            type: String,
            default: 'POST'
        },
        name: {
            type: String,
            default: ''
        },
        limit: {
            type: Number,
            default: 0
        },
        maxSize: {
            type: Number,
            default: 0
        },
        accept: String,
        multiple: Boolean,
        disabled: Boolean,
        readonly: Boolean,
        uploadType: {
            type: String,
            default: 'file'
        },
        uploadProvider: {
            type: String,
            default: 'oneBoot'
        },
        isPrivate: {
            type: Number,
            default: 0
        },
        valueType: {
            type: String,
            default: 'url'
        },
        previewSize: {
            type: String,
            default: 'small'
        },
        listType: {
            type: String,
            default: 'card'
        },
        uploadText: {
            type: String,
            default: '上传文件'
        },
        uploadTip: {
            type: String,
            default: ''
        },
        customRequest: Function,
        onSuccess: Function,
        onRemove: Function,
        onPreview: Function,
        responseUrlKey: {
            type: String,
            default: 'url'
        },
        responseNameKey: {
            type: String,
            default: 'fileName'
        },
        responseIdKey: {
            type: String,
            default: 'id'
        }
    },
    emits: ['update:modelValue', 'change', 'remove', 'preview', 'fc.el'],
    data() {
        return {
            fileList: normalizeFileList(this.modelValue, this)
        };
    },
    computed: {
        readonlyState() {
            return !!this.disabled || !!this.readonly;
        },
        canUpload() {
            return !this.readonlyState && (!this.limit || this.fileList.length < this.limit);
        }
    },
    watch: {
        modelValue: {
            deep: true,
            handler(value) {
                this.fileList = normalizeFileList(value, this);
            }
        }
    },
    methods: {
        resolveBaseURL() {
            const baseURL = this.baseURL || window.SI_UPLOAD_BASE_URL || 'http://localhost:9303';
            return String(baseURL || '').replace(/\/$/, '');
        },
        resolveAction() {
            if (this.action) return this.action;
            if (this.uploadProvider === 'oneBoot') {
                return `${this.resolveBaseURL()}/base/file/upload`;
            }
            return '';
        },
        resolveUploadFieldName() {
            if (this.name) return this.name;
            if (this.uploadProvider === 'oneBoot') return 'file_data';
            return 'file';
        },
        resolveRequestData() {
            const customData = this.data || {};
            if (this.uploadProvider !== 'oneBoot') {
                return customData;
            }
            return {
                isPrivate: Number(this.isPrivate || 0),
                typeInt: this.uploadType === 'image' ? -1 : 0,
                ...customData
            };
        },
        resolveHeaders() {
            return mergeHeaders(resolveGlobalUploadHeaders(), this.headers || {});
        },
        emitValue() {
            const nextValue = this.fileList
                .filter(file => file.status === 'done')
                .map(file => {
                    if (this.valueType === 'object') {
                        return {
                            id: file.id || file.raw?.id || '',
                            fileId: file.fileId || file.id || file.raw?.fileId || file.raw?.id || '',
                            name: file.name,
                            fileName: file.fileName || file.name,
                            oldFileName: file.oldFileName || file.name,
                            url: file.url,
                            size: file.size,
                            type: file.type,
                            raw: file.raw
                        };
                    }
                    return file.value || file.url;
                });

            const result = this.limit === 1 ? (nextValue[0] ?? (this.valueType === 'object' ? null : '')) : nextValue;
            this.$emit('update:modelValue', result);
            this.$emit('change', result, this.fileList);
        },
        beforeUpload(file) {
            if (this.maxSize > 0 && Number(file.size || 0) > this.maxSize * 1024 * 1024) {
                window?.$message?.error?.(`文件不能超过 ${this.maxSize}MB`);
                return false;
            }
            return true;
        },
        resolveUploadRequest(option) {
            if (typeof this.customRequest === 'function') {
                return this.customRequest(option);
            }
            if (!this.resolveAction()) {
                option.onError?.(new Error('upload action is required'));
                return;
            }
            return createXhrRequest(option, {
                ...this,
                resolveAction: () => this.resolveAction(),
                resolveUploadFieldName: () => this.resolveUploadFieldName(),
                resolveRequestData: () => this.resolveRequestData(),
                resolveHeaders: () => this.resolveHeaders()
            });
        },
        handleCustomRequest(option) {
            return this.resolveUploadRequest({
                ...option,
                source: this.uploadProvider
            });
        },
        handleInternalChange(info) {
            const fileList = (info.fileList || []).map((file, index) => {
                const response = file.response?.data || file.response || {};
                const url = pickResponseValue(response, [
                    this.responseUrlKey,
                    'data.url',
                    'file.url',
                    'url'
                ], file.url || file.thumbUrl || '');
                const name = pickResponseValue(response, [
                    this.responseNameKey,
                    'file.oldFileName',
                    'data.title',
                    'fileName'
                ], file.name);
                const id = pickResponseValue(response, [
                    this.responseIdKey,
                    'data.id',
                    'file.id',
                    'id'
                ], file.uid);
                const value = this.valueType === 'object'
                    ? {
                        id,
                        name,
                        url,
                        fileId: pickResponseValue(response, ['fileId', 'file.id'], id),
                        fileName: pickResponseValue(response, ['fileName', 'file.fileName'], name),
                        oldFileName: pickResponseValue(response, ['file.oldFileName'], name),
                        size: pickResponseValue(response, ['size', 'file.size'], file.size || 0)
                    }
                    : (url || id);

                return {
                    uid: file.uid || `si-upload-${index}`,
                    name,
                    fileName: pickResponseValue(response, ['fileName', 'file.fileName'], name),
                    oldFileName: pickResponseValue(response, ['file.oldFileName'], name),
                    status: file.status,
                    url,
                    value,
                    id,
                    fileId: pickResponseValue(response, ['fileId', 'file.id'], id),
                    size: file.size,
                    percentage: file.percent || 0,
                    response: file.response,
                    raw: file,
                    type: file.type || ''
                };
            });

            this.fileList = fileList;

            if (info.file.status === 'done') {
                this.onSuccess?.(info.file, info.fileList);
                this.emitValue();
                return;
            }

            if (info.file.status === 'removed') {
                this.emitValue();
            }
        },
        async handleRemove(file) {
            this.onRemove?.(file);
            this.$emit('remove', file);
            return true;
        },
        handlePreview(file) {
            this.onPreview?.(file);
            this.$emit('preview', file);
            if (!this.onPreview && file.url) {
                if (Number(this.isPrivate || 0) === 1) {
                    openFileWithHeaders(file.url, this.resolveHeaders()).catch(error => {
                        window?.$message?.error?.(error?.message || '文件预览失败');
                    });
                    return;
                }
                window.open(file.url, '_blank');
            }
        },
        renderTrigger() {
            if (!this.canUpload) return null;
            return h('div', {
                class: ['fc-si-upload__trigger', this.readonlyState ? 'is-disabled' : '']
            }, [
                h('div', {class: 'fc-si-upload__icon'}, [h(InboxOutlined)]),
                h('div', {class: 'fc-si-upload__title'}, this.uploadText),
                this.uploadTip ? h('div', {class: 'fc-si-upload__tip'}, this.uploadTip) : null
            ]);
        },
        renderPreviewItem(file) {
            const isImage = this.uploadType === 'image' || isImageFile(file);
            return h('div', {class: 'fc-si-upload__item'}, [
                isImage
                    ? h('img', {
                        class: 'fc-si-upload__thumb fc-si-upload__thumb-image',
                        src: file.url,
                        alt: file.name,
                        onClick: () => this.handlePreview(file)
                    })
                    : h('div', {class: 'fc-si-upload__file-icon'}, [h(FileOutlined)]),
                h('div', {class: 'fc-si-upload__meta'}, [
                    h('div', {class: 'fc-si-upload__name', title: file.name}, file.name),
                    h('div', {class: 'fc-si-upload__desc'}, [
                        [bytesToText(file.size), getFileExt(file)].filter(Boolean).join(' · ')
                    ]),
                    file.status === 'uploading'
                        ? h(AProgress, {
                            percent: Number(file.percentage || 0),
                            size: 'small',
                            showInfo: false
                        })
                        : null
                ]),
                h('div', {class: 'fc-si-upload__actions'}, [
                    h(AButton, {
                        type: 'text',
                        size: 'small',
                        onClick: () => this.handlePreview(file)
                    }, {default: () => [h(EyeOutlined)]}),
                    this.readonlyState ? null : h(AButton, {
                        type: 'text',
                        danger: true,
                        size: 'small',
                        onClick: () => {
                            this.fileList = this.fileList.filter(item => item.uid !== file.uid);
                            this.handleRemove(file);
                            this.emitValue();
                        }
                    }, {default: () => [h(DeleteOutlined)]})
                ])
            ]);
        }
    },
    render() {
        return h('div', {
            class: ['fc-si-upload', `is-preview-${this.previewSize || 'small'}`]
        }, [
            h(AUpload, {
                ...this.$attrs,
                disabled: this.readonlyState,
                multiple: this.multiple,
                accept: this.accept,
                showUploadList: false,
                customRequest: this.handleCustomRequest,
                beforeUpload: this.beforeUpload,
                onChange: this.handleInternalChange,
                onRemove: this.handleRemove,
                fileList: this.fileList,
                ref: 'uploadRef'
            }, {
                default: () => this.renderTrigger()
            }),
            this.fileList.length
                ? h('div', {class: 'fc-si-upload__list'}, this.fileList.map(file => this.renderPreviewItem(file)))
                : null
        ]);
    },
    mounted() {
        this.$emit('fc.el', this.$refs.uploadRef);
    }
});
