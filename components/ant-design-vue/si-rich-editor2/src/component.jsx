import {defineComponent, markRaw} from 'vue';
import {
    Boot as wangEditorBoot,
    createEditor as wangEditorCreateEditor,
    createToolbar as wangEditorCreateToolbar,
    createUploader as wangEditorCreateUploader
} from '@wangeditor/editor';
import './vendor/wangeditor-5.1.23.css';
import './style.css';

const NAME = 'fcSiRichEditor2';
let uni = 1;
let loaderPromise = null;
let customMenusRegistered = false;

function getImportedWangEditor() {
    if (wangEditorCreateEditor && wangEditorCreateToolbar) {
        return {
            Boot: wangEditorBoot,
            createEditor: wangEditorCreateEditor,
            createToolbar: wangEditorCreateToolbar,
            createUploader: wangEditorCreateUploader
        };
    }
    return null;
}

/**
 * 获取 vendor 目录的基础路径，兼容 webpack 4 (不支持 import.meta.url)
 * 优先从 document.currentScript 推导，回退到 SI_RICH_EDITOR_VENDOR_BASE 全局变量或默认相对路径
 */
function getVendorBasePath() {
    if (typeof window === 'undefined') return '';
    // 1) 优先使用全局配置
    if (window.SI_RICH_EDITOR_VENDOR_BASE) return window.SI_RICH_EDITOR_VENDOR_BASE;
    // 2) 尝试从当前 script 标签推导
    try {
        const src = document.currentScript?.src;
        if (src) {
            const base = src.substring(0, src.lastIndexOf('/') + 1);
            // 如果是 js/chunk 或 js/app，说明是 webpack 产物，vendor 应该在同级 js 目录
            if (base.includes('/js/')) {
                return base;
            }
        }
    } catch (_e) { /* ignore */ }
    // 3) 默认相对路径（相对 HTML 页面）
    return './js/';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
    return escapeHtml(value);
}

function normalizeUploadResponse(response) {
    const data = response?.data || response || {};
    return {
        url: pickResponseValue(data, ['url', 'data.url', 'file.url']),
        name: pickResponseValue(data, ['file.oldFileName', 'oldFileName', 'fileName', 'data.title', 'file.fileName']),
        id: pickResponseValue(data, ['id', 'data.id', 'file.id'])
    };
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

function insertUploadedFileLink(editor, url, name, href = '') {
    if (!editor || !url) return;
    const finalHref = href || url;
    const finalName = name || finalHref;
    const isPrivate = Number(editor?.getMenuConfig?.('siUploadFile')?.meta?.isPrivate || 0) === 1;
    editor.restoreSelection?.();
    editor.focus?.();
    editor.dangerouslyInsertHtml(
        `<p><a href="${escapeAttr(finalHref)}" target="_blank" rel="noopener noreferrer" data-si-upload-link="1" data-si-private="${isPrivate ? '1' : '0'}">${escapeHtml(finalName)}</a></p>`
    );
}

function registerSiRichEditorMenus(wangEditor) {
    if (customMenusRegistered || !wangEditor?.createUploader) {
        return;
    }

    class SiUploadFileMenu {
        constructor() {
            this.title = '上传附件';
            this.iconSvg = '<svg viewBox="0 0 1024 1024"><path d="M746.7 277.3a170.7 170.7 0 0 0-241.4 0L217.5 565.2a128 128 0 1 0 181 181l280-280a85.3 85.3 0 0 0-120.7-120.7L312.2 591.1a42.7 42.7 0 1 0 60.4 60.4l230.5-230.5 30.2 30.2-230.5 230.5a85.3 85.3 0 1 1-120.7-120.7l245.6-245.6a128 128 0 0 1 181 181l-280 280a170.7 170.7 0 1 1-241.4-241.4l287.8-287.8a213.3 213.3 0 1 1 301.8 301.8L477 848.5l-30.2-30.2 299.6-299.5a170.7 170.7 0 0 0 0-241.5z"></path></svg>';
            this.tag = 'button';
        }

        getValue() {
            return '';
        }

        isActive() {
            return false;
        }

        isDisabled(editor) {
            return !!editor?.isDisabled?.();
        }

        getMenuConfig(editor) {
            return editor?.getMenuConfig?.('siUploadFile') || {};
        }

        exec(editor) {
            const menuConfig = this.getMenuConfig(editor);
            const customBrowseAndUpload = menuConfig.customBrowseAndUpload;
            const insertFn = (url, name, href) => insertUploadedFileLink(editor, url, name, href);

            if (typeof customBrowseAndUpload === 'function') {
                customBrowseAndUpload(insertFn);
                return;
            }

            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            const allowedFileTypes = Array.isArray(menuConfig.allowedFileTypes) ? menuConfig.allowedFileTypes.filter(Boolean) : [];
            if (allowedFileTypes.length > 0) {
                input.setAttribute('accept', allowedFileTypes.join(', '));
            }
            input.style.display = 'none';
            document.body.appendChild(input);

            const cleanup = () => {
                input.remove();
            };

            input.addEventListener('change', async () => {
                const files = Array.from(input.files || []);
                if (!files.length) {
                    cleanup();
                    return;
                }

                for (const file of files) {
                    const uploader = wangEditor.createUploader({
                        ...menuConfig,
                        maxNumberOfFiles: 1,
                        onProgress: (progress) => {
                            editor.showProgressBar?.(progress);
                            menuConfig.onProgress?.(progress);
                        },
                        onSuccess: (uploadedFile, response) => {
                            editor.hidePanelOrModal?.();
                            const normalized = normalizeUploadResponse(response);
                            if (typeof menuConfig.customInsert === 'function') {
                                menuConfig.customInsert(response, insertFn, uploadedFile);
                            } else if (normalized.url) {
                                insertFn(normalized.url, normalized.name || uploadedFile?.name || normalized.url, normalized.url);
                            }
                            menuConfig.onSuccess?.(uploadedFile, response);
                        },
                        onFailed: (uploadedFile, response) => {
                            menuConfig.onFailed?.(uploadedFile, response);
                            editor.alert?.(response?.msg || '附件上传失败', 'error');
                        },
                        onError: (uploadedFile, response, err) => {
                            menuConfig.onError?.(uploadedFile, response, err);
                            editor.alert?.(err?.message || response?.msg || '附件上传失败', 'error');
                        }
                    });

                    uploader.addFile({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: file
                    });

                    await uploader.upload();
                }

                cleanup();
            }, {once: true});

            input.click();
        }
    }

    const menuConf = {
        key: 'siUploadFile',
        factory() {
            return new SiUploadFileMenu();
        },
        config: {
            server: '',
            fieldName: 'file_data',
            maxFileSize: 20 * 1024 * 1024,
            maxNumberOfFiles: 20,
            allowedFileTypes: [],
            meta: {},
            metaWithUrl: true,
            headers: {},
            withCredentials: false,
            timeout: 10000,
            onBeforeUpload(file) {
                return file;
            },
            onProgress() {},
            onSuccess() {},
            onFailed(file, res) {
                console.error(`'${file?.name || ''}' upload failed`, res);
            },
            onError(file, res, err) {
                console.error(`'${file?.name || ''}' upload error`, res, err);
            }
        }
    };

    if (wangEditor.Boot?.registerModule) {
        wangEditor.Boot.registerModule({
            menus: [menuConf]
        });
    } else if (wangEditor.Boot?.registerMenu) {
        wangEditor.Boot.registerMenu(menuConf);
    } else if (wangEditor.registerMenu) {
        wangEditor.registerMenu(menuConf);
    } else {
        return;
    }

    customMenusRegistered = true;
}

function ensureWangEditor() {
    if (typeof window !== 'undefined' && window.wangEditor?.createEditor && window.wangEditor?.createToolbar) {
        registerSiRichEditorMenus(window.wangEditor);
        return Promise.resolve(window.wangEditor);
    }

    if (loaderPromise) return loaderPromise;

    loaderPromise = new Promise((resolve, reject) => {
        const wangEditor = getImportedWangEditor();
        if (wangEditor) {
            registerSiRichEditorMenus(wangEditor);
            resolve(wangEditor);
            return;
        }

        const script = document.createElement('script');
        // webpack 4 不支持 import.meta.url，通过 document.currentScript 或相对路径兼容
        script.src = getVendorBasePath() + 'vendor/wangeditor-5.1.23.js';
        script.onload = () => {
            if (window.wangEditor?.createEditor && window.wangEditor?.createToolbar) {
                registerSiRichEditorMenus(window.wangEditor);
                resolve(window.wangEditor);
                return;
            }
            reject(new Error('wangEditor 5 load failed'));
        };
        script.onerror = () => reject(new Error('wangEditor 5 script load failed'));
        document.head.appendChild(script);
    });

    return loaderPromise;
}

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
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

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    props: {
        modelValue: {
            type: String,
            default: ''
        },
        disabled: Boolean,
        config: {
            type: Object,
            default: () => ({})
        },
        init: Function,
        height: {
            type: Number,
            default: 320
        },
        minHeight: {
            type: Number,
            default: 220
        },
        placeholder: {
            type: String,
            default: '请输入内容'
        },
        uploadProvider: {
            type: String,
            default: 'oneBoot'
        },
        baseURL: {
            type: String,
            default: ''
        },
        action: {
            type: String,
            default: ''
        },
        uploadImgAction: {
            type: String,
            default: ''
        },
        uploadVideoAction: {
            type: String,
            default: ''
        },
        uploadFileAction: {
            type: String,
            default: ''
        },
        maxImageSize: {
            type: Number,
            default: 10
        },
        maxVideoSize: {
            type: Number,
            default: 20
        },
        maxAttachmentSize: {
            type: Number,
            default: 20
        },
        name: {
            type: String,
            default: 'file_data'
        },
        isPrivate: {
            type: Number,
            default: 0
        },
        maxFileSize: {
            type: Number,
            default: 10
        },
        headers: {
            type: Object,
            default: () => ({})
        },
        zIndex: {
            type: Number,
            default: 20
        }
    },
    emits: ['update:modelValue', 'change', 'fc.el'],
    data() {
        return {
            editor: null,
            toolbar: null,
            uni: uni++,
            lastValue: this.modelValue || '',
            creating: false,
            linkClickHandler: null
        };
    },
    watch: {
        disabled() {
            this.syncDisabled();
        },
        modelValue(value) {
            const nextValue = value || '';
            if (!this.editor || nextValue === this.lastValue) return;
            if (nextValue !== this.editor.getHtml()) {
                this.editor.setHtml(nextValue);
            }
            this.lastValue = nextValue;
        }
    },
    methods: {
        resolveBaseURL() {
            const baseURL = this.baseURL || window.SI_UPLOAD_BASE_URL || 'http://localhost:9303';
            return String(baseURL || '').replace(/\/$/, '');
        },
        resolveAction(type = 'image') {
            const customAction = type === 'image'
                ? this.uploadImgAction
                : type === 'video'
                    ? this.uploadVideoAction
                    : this.uploadFileAction;
            if (customAction) return customAction;
            if (this.action) return this.action;
            if (this.uploadProvider === 'oneBoot') {
                return `${this.resolveBaseURL()}/base/file/upload`;
            }
            return '';
        },
        resolveUploadParams(type = 'image') {
            return {
                isPrivate: Number(this.isPrivate || 0),
                typeInt: type === 'image' ? -1 : 0
            };
        },
        resolveHeaders() {
            return mergeHeaders(resolveGlobalUploadHeaders(), this.headers || {});
        },
        resolveMaxFileSize(type = 'image') {
            const legacySize = Number(this.maxFileSize || 0);
            if (type === 'image') return Number(this.maxImageSize || legacySize || 10) * 1024 * 1024;
            if (type === 'video') return Number(this.maxVideoSize || legacySize || 20) * 1024 * 1024;
            return Number(this.maxAttachmentSize || legacySize || 20) * 1024 * 1024;
        },
        normalizeResponse(response) {
            return normalizeUploadResponse(response);
        },
        emitValue() {
            if (!this.editor) return;
            const html = this.editor.getHtml() || '';
            this.lastValue = html;
            this.$emit('update:modelValue', html);
            this.$emit('change', html);
        },
        syncDisabled() {
            if (!this.editor) return;
            this.disabled ? this.editor.disable() : this.editor.enable();
        },
        attachPrivateLinkPreview() {
            const root = this.$refs.editorRef;
            if (!root || this.linkClickHandler) return;

            this.linkClickHandler = event => {
                const anchor = event.target?.closest?.('a[data-si-upload-link="1"]');
                if (!anchor) return;

                const href = anchor.getAttribute('href') || '';
                const isPrivate = anchor.getAttribute('data-si-private') === '1';
                if (!href || !isPrivate) return;

                event.preventDefault();
                openFileWithHeaders(href, this.resolveHeaders()).catch(error => {
                    window?.$message?.error?.(error?.message || '附件预览失败');
                });
            };

            root.addEventListener('click', this.linkClickHandler, true);
        },
        detachPrivateLinkPreview() {
            const root = this.$refs.editorRef;
            if (root && this.linkClickHandler) {
                root.removeEventListener('click', this.linkClickHandler, true);
            }
            this.linkClickHandler = null;
        },
        async createEditor() {
            if (this.creating || !this.$refs.editorRef || !this.$refs.toolbarRef) return;
            this.creating = true;
            try {
                const wangEditor = await ensureWangEditor();
                const {createEditor, createToolbar} = wangEditor;
                const editorConfig = {
                    placeholder: this.placeholder,
                    autoFocus: false,
                    scroll: true,
                    MENU_CONF: {
                        uploadImage: {
                            server: this.resolveAction('image'),
                            fieldName: this.name || 'file_data',
                            meta: this.resolveUploadParams('image'),
                            metaWithUrl: true,
                            headers: this.resolveHeaders(),
                            maxFileSize: this.resolveMaxFileSize('image'),
                            customInsert: (result, insertFn) => {
                                const normalized = this.normalizeResponse(result);
                                if (normalized.url) {
                                    insertFn(normalized.url, normalized.name || '', normalized.url);
                                }
                            }
                        },
                        uploadVideo: {
                            server: this.resolveAction('video'),
                            fieldName: this.name || 'file_data',
                            meta: this.resolveUploadParams('video'),
                            metaWithUrl: true,
                            headers: this.resolveHeaders(),
                            maxFileSize: this.resolveMaxFileSize('video'),
                            allowedFileTypes: ['video/*'],
                            customInsert: (result, insertFn) => {
                                const normalized = this.normalizeResponse(result);
                                if (normalized.url) {
                                    insertFn(normalized.url, '');
                                }
                            }
                        },
                        siUploadFile: {
                            server: this.resolveAction('file'),
                            fieldName: this.name || 'file_data',
                            meta: this.resolveUploadParams('file'),
                            metaWithUrl: true,
                            headers: this.resolveHeaders(),
                            maxFileSize: this.resolveMaxFileSize('file'),
                            allowedFileTypes: [],
                            customInsert: (result, insertFn) => {
                                const normalized = this.normalizeResponse(result);
                                if (normalized.url) {
                                    insertFn(normalized.url, normalized.name || normalized.url, normalized.url);
                                }
                            }
                        }
                    },
                    onChange: () => this.emitValue()
                };

                const userConfig = this.config || {};
                const {toolbarConfig: userToolbarConfig, MENU_CONF: userMenuConfig, ...restConfig} = userConfig;

                if (userConfig) {
                    Object.assign(editorConfig, restConfig);
                    editorConfig.MENU_CONF = {
                        ...(editorConfig.MENU_CONF || {}),
                        ...(userMenuConfig || {})
                    };
                }

                const editor = markRaw(Object.seal(createEditor({
                    selector: this.$refs.editorRef,
                    html: this.modelValue || '',
                    config: editorConfig,
                    mode: 'default'
                })));

                const toolbar = markRaw(Object.seal(createToolbar({
                    editor,
                    selector: this.$refs.toolbarRef,
                    config: {
                        insertKeys: {
                            index: 24,
                            keys: ['siUploadFile']
                        },
                        ...(userToolbarConfig || {})
                    },
                    mode: 'default'
                })));

                this.editor = editor;
                this.toolbar = toolbar;

                this.init && this.init(editor);
                this.lastValue = this.modelValue || '';
                this.syncDisabled();
                this.attachPrivateLinkPreview();
                this.$emit('fc.el', {
                    $el: this.$refs.editorRef,
                    editor
                });
            } finally {
                this.creating = false;
            }
        }
    },
    mounted() {
        this.$nextTick(() => this.createEditor());
    },
    beforeUnmount() {
        this.detachPrivateLinkPreview();
        if (this.toolbar && typeof this.toolbar.destroy === 'function') {
            this.toolbar.destroy();
            this.toolbar = null;
        }
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    },
    render() {
        const attrs = {...this.$attrs};
        delete attrs.id;
        return (
            <div class="fc-si-rich-editor2" style={{minHeight: `${this.minHeight}px`}}>
                <div ref="toolbarRef" id={`si-rich-editor2-toolbar-${this.uni}`} class="fc-si-rich-editor2__toolbar"/>
                <div
                    {...attrs}
                    ref="editorRef"
                    id={`si-rich-editor2-editor-${this.uni}`}
                    class="fc-si-rich-editor2__body"
                    style={{minHeight: `${this.minHeight}px`, height: `${this.height}px`, lineHeight: 'normal'}}
                />
            </div>
        );
    }
});
