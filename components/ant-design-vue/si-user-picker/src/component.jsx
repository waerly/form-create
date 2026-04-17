import {defineComponent, h} from 'vue';
import {Empty as AEmpty, Select as ASelect, Spin as ASpin} from 'ant-design-vue';

const NAME = 'fcSiUserPicker';

function toArray(value) {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null || value === '') return [];
    return [value];
}

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getFieldValue(item, keys = []) {
    for (const key of keys) {
        const value = item?.[key];
        if (value !== undefined && value !== null && String(value) !== '') {
            return value;
        }
    }
    return '';
}

function normalizeOption(item, props) {
    if (!isObject(item)) return null;
    const rawValue = getFieldValue(item, [
        props.valueField,
        'value',
        'id',
        'userId'
    ].filter(Boolean));
    if (rawValue === '') return null;

    const rawLabel = getFieldValue(item, [
        props.labelField,
        'label',
        'username',
        'userName',
        'nickName',
        'account',
        'loginName'
    ].filter(Boolean));

    return {
        ...item,
        value: rawValue,
        label: String(rawLabel || rawValue),
        key: String(rawValue)
    };
}

function normalizeOptions(list, props) {
    return (Array.isArray(list) ? list : [])
        .map(item => normalizeOption(item, props))
        .filter(Boolean);
}

function mergeOptions(...optionGroups) {
    const map = new Map();
    optionGroups.flat().forEach(option => {
        if (!option) return;
        map.set(String(option.value), option);
    });
    return Array.from(map.values());
}

function buildResultList(response) {
    const payload = response?.data ?? response;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.records)) return payload.records;
    if (Array.isArray(payload?.list)) return payload.list;
    if (Array.isArray(payload?.data?.records)) return payload.data.records;
    if (Array.isArray(payload?.data?.list)) return payload.data.list;
    return [];
}

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    formCreateParser: {
        toFormValue(value) {
            return value;
        },
        toValue(value) {
            return value;
        }
    },
    props: {
        modelValue: {
            type: [Array, String, Number],
            default: undefined
        },
        formCreateInject: Object,
        request: Function,
        detailRequest: Function,
        placeholder: String,
        allowClear: {
            type: Boolean,
            default: true
        },
        disabled: Boolean,
        readonly: Boolean,
        multiple: Boolean,
        mode: String,
        size: String,
        maxTagCount: {
            type: [Number, String],
            default: 'responsive'
        },
        labelField: {
            type: String,
            default: 'username'
        },
        valueField: {
            type: String,
            default: 'id'
        },
        pageSize: {
            type: Number,
            default: 20
        },
        options: {
            type: Array,
            default: () => []
        }
    },
    emits: ['update:modelValue', 'change', 'search', 'select', 'fc.el'],
    data() {
        return {
            loading: false,
            requestToken: 0,
            innerOptions: normalizeOptions(this.options, this)
        };
    },
    computed: {
        multipleMode() {
            return this.multiple || this.mode === 'multiple';
        },
        mergedDisabled() {
            return !!this.disabled || !!this.readonly;
        },
        currentValue() {
            if (this.multipleMode) {
                return toArray(this.modelValue);
            }
            return this.modelValue;
        },
        selectOptions() {
            return this.innerOptions.map(option => ({
                label: option.label,
                value: option.value,
                disabled: option.disabled
            }));
        },
        notFoundContent() {
            if (this.loading) {
                return h('div', {class: 'fc-si-user-picker__empty'}, [h(ASpin, {size: 'small'})]);
            }
            return h(AEmpty, {image: AEmpty.PRESENTED_IMAGE_SIMPLE, description: '暂无数据'});
        }
    },
    watch: {
        options: {
            deep: true,
            handler(value) {
                this.innerOptions = normalizeOptions(value, this);
            }
        },
        modelValue: {
            immediate: true,
            handler(value) {
                this.ensureSelectedOptions(value);
            }
        }
    },
    methods: {
        async runRequest(keyword = '') {
            if (typeof this.request !== 'function') return;
            const token = ++this.requestToken;
            this.loading = true;
            try {
                const response = await this.request({
                    keyword,
                    page: 1,
                    size: this.pageSize
                });
                if (token !== this.requestToken) return;
                const options = normalizeOptions(buildResultList(response), this);
                this.innerOptions = mergeOptions(this.innerOptions, options);
            } finally {
                if (token === this.requestToken) {
                    this.loading = false;
                }
            }
        },
        async ensureSelectedOptions(value) {
            if (typeof this.detailRequest !== 'function') return;
            const ids = toArray(value).filter(item => item !== undefined && item !== null && item !== '');
            if (!ids.length) return;
            const missing = ids.filter(id => !this.innerOptions.some(option => String(option.value) === String(id)));
            if (!missing.length) return;
            try {
                const response = await this.detailRequest(missing);
                const options = normalizeOptions(buildResultList(response), this);
                this.innerOptions = mergeOptions(this.innerOptions, options);
            } catch {
                // ignore detail preload failure
            }
        },
        handleSearch(keyword) {
            this.$emit('search', keyword || '');
            this.runRequest(keyword || '');
        },
        handleFocus() {
            if (!this.innerOptions.length) {
                this.runRequest('');
            }
        },
        handleChange(value, option) {
            this.$emit('update:modelValue', value);
            this.$emit('change', value, option);
        },
        handleSelect(value, option) {
            this.$emit('select', value, option);
        }
    },
    mounted() {
        this.$emit('fc.el', this.$refs.selectRef);
    },
    render() {
        return h(ASelect, {
            ...this.$attrs,
            ref: 'selectRef',
            value: this.currentValue,
            mode: this.multipleMode ? 'multiple' : undefined,
            placeholder: this.placeholder || '请选择用户',
            allowClear: this.allowClear,
            disabled: this.mergedDisabled,
            showSearch: true,
            filterOption: false,
            options: this.selectOptions,
            loading: this.loading,
            size: this.size,
            maxTagCount: this.maxTagCount,
            notFoundContent: this.notFoundContent,
            onSearch: this.handleSearch,
            onFocus: this.handleFocus,
            onChange: this.handleChange,
            onSelect: this.handleSelect
        });
    }
});
