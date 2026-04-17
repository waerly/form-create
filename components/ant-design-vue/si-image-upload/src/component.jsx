import {defineComponent, h} from 'vue';
import SiUpload from '../../si-upload/src/component';
import './style.css';

const NAME = 'fcSiImageUpload';

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    props: {
        modelValue: {
            type: [Array, String, Object],
            default: () => []
        },
        formCreateInject: Object,
        limit: {
            type: Number,
            default: 9
        },
        uploadProvider: {
            type: String,
            default: 'oneBoot'
        },
        valueType: {
            type: String,
            default: 'url'
        },
        previewSize: {
            type: String,
            default: 'small'
        },
        uploadText: {
            type: String,
            default: '上传图片'
        },
        uploadTip: {
            type: String,
            default: '支持封面图、相册图，默认展示缩略图效果'
        }
    },
    emits: ['update:modelValue', 'change', 'remove', 'preview', 'fc.el'],
    render() {
        return h('div', {class: 'fc-si-image-upload'}, [
            h(SiUpload, {
                ...this.$attrs,
                modelValue: this.modelValue,
                formCreateInject: this.formCreateInject,
                limit: this.limit,
                uploadProvider: this.uploadProvider,
                valueType: this.valueType,
                previewSize: this.previewSize,
                uploadText: this.uploadText,
                uploadTip: this.uploadTip,
                uploadType: 'image',
                accept: this.$attrs.accept || 'image/*',
                multiple: this.$attrs.multiple !== false,
                'onUpdate:modelValue': value => this.$emit('update:modelValue', value),
                onChange: (...args) => this.$emit('change', ...args),
                onRemove: (...args) => this.$emit('remove', ...args),
                onPreview: (...args) => this.$emit('preview', ...args),
                onFcEl: el => this.$emit('fc.el', el)
            })
        ]);
    }
});
