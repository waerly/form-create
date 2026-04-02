import {defineComponent, Fragment, h} from 'vue';
import {Empty as AEmpty} from 'ant-design-vue';
import './style.css';

const NAME = 'fcRelationForm';

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cloneValue(value) {
    return isObject(value) ? {...value} : {};
}

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    inject: ['parentFC'],
    formCreateParser: {
        toFormValue(value) {
            return cloneValue(value);
        },
        toValue(value) {
            return cloneValue(value);
        }
    },
    props: {
        modelValue: {
            type: Object,
            default: () => ({})
        },
        slotName: {
            type: String,
            default: ''
        },
        emptyText: {
            type: String,
            default: '暂无关联表单数据'
        },
        bordered: {
            type: Boolean,
            default: true
        },
        formCreateInject: Object,
        showDesignPlaceholder: {
            type: Boolean,
            default: true
        },
    },
    emits: ['update:modelValue', 'change'],
    computed: {
        injectRule() {
            return this.formCreateInject?.rule || {};
        },
        injectField() {
            return this.injectRule.field || this.formCreateInject?.field || '';
        },
        previewState() {
            return !!this.formCreateInject?.preview;
        },
        readonlyState() {
            return this.previewState || !!this.$attrs.readonly || !!this.$attrs.disabled;
        },
        formData() {
            return cloneValue(this.modelValue);
        },
        currentSlotName() {
            return this.slotName || this.injectField || 'relationForm';
        },
        slotArgs() {
            return {
                value: this.formData,
                field: this.injectField,
                rule: this.injectRule,
                api: this.formCreateInject?.api,
                preview: this.previewState,
                readonly: this.readonlyState,
                setValue: this.setValue,
                updateValue: this.updateValue,
                clearValue: this.clearValue,
            };
        },
        boxStyle() {
            return this.bordered
                ? undefined
                : {
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    minHeight: 'auto'
                };
        },
        boundRelationInfo() {
            const props = this.injectRule?.props || {};
            const title = typeof this.injectRule?.title === 'object'
                ? (this.injectRule?.title?.title || this.injectRule?.title?.native || '')
                : (this.injectRule?.title || '');
            return {
                componentName: '关联嵌入表单',
                title,
                relationCode: props.relationCode || '',
                relationLabel: props.relationLabel || props.relationCode || '',
            };
        }
    },
    methods: {
        getSlot() {
            const find = (node) => {
                if (!node) return null;
                const slot = node.slots?.[this.currentSlotName];
                if (slot) {
                    return slot;
                }
                return find(node.setupState?.parent);
            };
            return find(this.parentFC);
        },
        emitValue(value) {
            const nextValue = cloneValue(value);
            this.$emit('update:modelValue', nextValue);
            this.$emit('change', nextValue);
            const field = this.injectField;
            const api = this.formCreateInject?.api;
            if (field && api?.setValue) {
                api.setValue(field, nextValue);
            }
        },
        setValue(value) {
            this.emitValue(value);
        },
        updateValue(patch = {}) {
            this.emitValue({
                ...this.formData,
                ...(isObject(patch) ? patch : {}),
            });
        },
        clearValue() {
            this.emitValue({});
        },
        renderDefault() {
            return (
                <div class="_fc-relation-form-box" style={this.boxStyle}>
                    <div class="_fc-relation-form-empty">
                        <AEmpty description={this.emptyText}/>
                        <div class="_fc-relation-form-empty-hint">
                            请提供命名 slot `#{this.currentSlotName}` 渲染关联嵌入表单
                        </div>
                    </div>
                </div>
            );
        },
        renderBoundPlaceholder() {
            const info = this.boundRelationInfo;
            return (
                <div class="_fc-relation-form-box _fc-relation-form-designer" style={this.boxStyle}>
                    <div class="_fc-relation-design-badge">设计占位</div>
                    <div class="_fc-relation-design-name">{info.componentName}</div>
                    {info.title ? (
                        <div class="_fc-relation-design-meta">
                            <span class="_fc-relation-design-label">组件标题</span>
                            <span class="_fc-relation-design-value">{info.title}</span>
                        </div>
                    ) : null}
                    {info.relationLabel ? (
                        <div class="_fc-relation-design-meta">
                            <span class="_fc-relation-design-label">功能名称</span>
                            <span class="_fc-relation-design-value">{info.relationLabel}</span>
                        </div>
                    ) : null}
                    {info.relationCode ? (
                        <div class="_fc-relation-design-meta">
                            <span class="_fc-relation-design-label">功能编码</span>
                            <span class="_fc-relation-design-value">{info.relationCode}</span>
                        </div>
                    ) : null}
                </div>
            );
        },
    },
    render() {
        const slot = this.getSlot();
        const hasBoundRelation = !!this.injectRule?.props?.relationCode;
        return (
            <div class={['_fc-relation-form', {'_fc-relation-form-preview': this.readonlyState}]}>
                {slot
                    ? h(Fragment, {}, [slot(this.slotArgs)])
                    : hasBoundRelation && this.showDesignPlaceholder
                        ? this.renderBoundPlaceholder()
                        : null}
            </div>
        );
    }
});
