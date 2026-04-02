import {defineComponent, h, nextTick} from 'vue';
import {Empty as AEmpty, Select as ASelect, Spin as ASpin, message as AMessage} from 'ant-design-vue';
import {useInjectFormItemContext} from 'ant-design-vue/es/form/FormItemContext';

const NAME = 'fcSuggestSearch';

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeDropdownRule(dropdownRule) {
    if (!dropdownRule) return null;
    if (isObject(dropdownRule)) return dropdownRule;
    if (typeof dropdownRule !== 'string') return null;
    try {
        return JSON.parse(dropdownRule);
    } catch {
        return null;
    }
}

function resolveFieldName(fieldName, fallback) {
    const normalized = String(fieldName || '').trim();
    if (!normalized) return fallback || '';
    return normalized.includes('.') ? (normalized.split('.').pop() || normalized) : normalized;
}

function getOptionLabel(option, dropdownRule) {
    const viewField = dropdownRule?.viewField || {};
    const fallbackKeys = [
        resolveFieldName(dropdownRule?.label, 'label'),
        resolveFieldName(viewField.label),
        'label',
        'name',
        'title',
        'text'
    ].filter(Boolean);

    for (const key of fallbackKeys) {
        const value = option?.[key];
        if (value !== undefined && value !== null && String(value) !== '') {
            return String(value);
        }
    }

    return String(option?.value ?? '');
}

function getOptionValue(option, dropdownRule) {
    const viewField = dropdownRule?.viewField || {};
    const fallbackKeys = [
        resolveFieldName(dropdownRule?.value, 'value'),
        resolveFieldName(viewField.value),
        'value',
        'id',
        'key'
    ].filter(Boolean);

    for (const key of fallbackKeys) {
        const value = option?.[key];
        if (value !== undefined && value !== null && String(value) !== '') {
            return value;
        }
    }

    return '';
}

function normalizeOptions(source, dropdownRule) {
    const list = Array.isArray(source) ? source : [];
    return list
        .map(item => {
            if (!isObject(item)) return null;
            const rawValue = getOptionValue(item, dropdownRule);
            if (rawValue === '') return null;
            return {
                ...item,
                value: rawValue,
                label: getOptionLabel(item, dropdownRule),
                rawValue
            };
        })
        .filter(Boolean);
}

function mergeOptions(currentOptions, incomingOptions) {
    const map = new Map();
    [...(currentOptions || []), ...(incomingOptions || [])].forEach(option => {
        if (!option) return;
        map.set(String(option.value), option);
    });
    return Array.from(map.values());
}

function isEmptyValue(value) {
    return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

function toKeyword(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch {
                // fall through to comma-split handling
            }
        }
    }
    if (typeof value === 'string' && value.includes(',')) {
        return value.split(',').map(item => item.trim()).filter(Boolean);
    }
    return value;
}

function buildRequestResult(response, dropdownRule) {
    const payload = response?.data ?? response;
    const dataOptions = normalizeOptions(payload?.data, dropdownRule);
    if (dataOptions.length) {
        return dataOptions;
    }
    return normalizeOptions(payload?.value, dropdownRule);
}

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    setup() {
        const formItemContext = useInjectFormItemContext();
        return {
            formItemContext
        };
    },
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
            type: [Array, String, Number, Boolean, Object],
            default: undefined
        },
        formCreateInject: Object,
        options: {
            type: Array,
            default: () => []
        },
        dropdownRule: {
            type: [String, Object],
            default: null
        },
        request: Function,
        placeholder: String,
        allowClear: {
            type: Boolean,
            default: true
        },
        mode: String,
        disabled: Boolean,
        readonly: Boolean,
        size: String,
        bordered: {
            type: Boolean,
            default: true
        },
        autoSearchOnFocus: {
            type: Boolean,
            default: true
        },
        maxCount: {
            type: [Number, String],
            default: undefined
        }
    },
    emits: ['update:modelValue', 'change', 'select', 'search', 'blur', 'focus', 'fc.el'],
    data() {
        return {
            innerOptions: normalizeOptions(this.formCreateInject?.options || this.options, normalizeDropdownRule(this.dropdownRule)),
            loading: false,
            requestToken: 0,
            searchValue: '',
            dropdownOpen: false,
            hasLoadedDefaultOptions: false
        };
    },
    computed: {
        mergedDisabled() {
            return !!this.disabled || !!this.readonly;
        },
        normalizedDropdownRule() {
            return normalizeDropdownRule(this.dropdownRule);
        },
        isMultipleMode() {
            return this.mode === 'multiple' || this.mode === 'tags';
        },
        normalizedModelValue() {
            const value = this.modelValue;
            if (this.isMultipleMode) {
                return Array.isArray(value) ? value : toKeyword(value);
            }
            return value;
        },
        selectedValue() {
            const value = this.normalizedModelValue;
            if (Array.isArray(value)) {
                return value.map(item => {
                    const matched = (this.innerOptions || []).find(option => String(option.value) === String(item));
                    return matched ? matched.value : item;
                });
            }
            const matched = (this.innerOptions || []).find(option => String(option.value) === String(value));
            return matched ? matched.value : value;
        },
        normalizedMaxCount() {
            const count = Number(this.maxCount);
            return Number.isFinite(count) && count > 0 ? count : undefined;
        },
        selectOptions() {
            return (this.innerOptions || []).map(item => ({
                ...item,
                label: item.label,
                value: item.value
            }));
        },
        currentField() {
            return this.formCreateInject?.rule?.field || this.formCreateInject?.field || '';
        }
    },
    watch: {
        options: {
            deep: true,
            handler(value) {
                this.innerOptions = normalizeOptions(value, this.normalizedDropdownRule);
            }
        },
        'formCreateInject.options': {
            deep: true,
            handler(value) {
                if (!Array.isArray(value)) return;
                this.innerOptions = normalizeOptions(value, this.normalizedDropdownRule);
            }
        },
        modelValue: {
            immediate: true,
            handler(value) {
                this.ensureExactOptions(value);
            }
        }
    },
    methods: {
        getFormData() {
            const api = this.formCreateInject?.api;
            if (api && typeof api.formData === 'function') {
                return api.formData() || {};
            }
            return {};
        },
        async callRequest(value, exact) {
            if (typeof this.request !== 'function' || !this.currentField) {
                return [];
            }
            const token = ++this.requestToken;
            this.loading = true;
            try {
                const response = await this.request({
                    field: this.currentField,
                    value,
                    fromData: this.getFormData(),
                    batch: exact,
                    dropdownRule: this.normalizedDropdownRule
                });
                if (token !== this.requestToken) {
                    return null;
                }
                return buildRequestResult(response, this.normalizedDropdownRule);
            } finally {
                if (token === this.requestToken) {
                    this.loading = false;
                }
            }
        },
        getInputSearchValue() {
            const input = this.$refs.selectRef?.$el?.querySelector?.('input');
            if (!input) {
                return '';
            }
            return typeof input.value === 'string' ? input.value : '';
        },
        resolveSearchKeyword(keyword) {
            if (typeof keyword === 'string' && keyword !== '') {
                return keyword;
            }
            if (typeof this.searchValue === 'string' && this.searchValue !== '') {
                return this.searchValue;
            }
            return this.getInputSearchValue();
        },
        async ensureExactOptions(value) {
            if (isEmptyValue(value) || typeof this.request !== 'function') {
                return;
            }
            const options = await this.callRequest(toKeyword(value), true);
            if (!options || !options.length) {
                return;
            }
            this.innerOptions = mergeOptions(this.innerOptions, options);
        },
        async ensureDefaultOptionsLoaded() {
            if (!this.autoSearchOnFocus || this.mergedDisabled || this.hasLoadedDefaultOptions) {
                return;
            }
            this.hasLoadedDefaultOptions = true;
            if (typeof this.request !== 'function') {
                return;
            }
            const options = await this.callRequest('', false);
            if (!options) return;
            this.innerOptions = mergeOptions(this.innerOptions, options);
        },
        async handleSearch(keyword) {
            this.searchValue = typeof keyword === 'string' ? keyword : '';
            const nextKeyword = this.resolveSearchKeyword(keyword);
            this.$emit('search', nextKeyword);
            if (this.mergedDisabled || typeof this.request !== 'function') {
                return;
            }
            const options = await this.callRequest(nextKeyword, false);
            if (!options) return;
            this.innerOptions = options;
        },
        handleUpdateSearchValue(value) {
            this.searchValue = typeof value === 'string' ? value : '';
        },
        handleValueUpdate(value) {
            const field = this.currentField;
            const api = this.formCreateInject?.api;
            this.searchValue = '';
            let nextValue = value;
            if (this.normalizedMaxCount && Array.isArray(nextValue) && nextValue.length > this.normalizedMaxCount) {
                nextValue = nextValue.slice(0, this.normalizedMaxCount);
                AMessage.warning(`最多只能选择 ${this.normalizedMaxCount} 项`);
            }
            this.$emit('update:modelValue', nextValue);
            nextTick(() => {
                if (field && api?.clearValidateState) {
                    api.clearValidateState([field]);
                }
                this.formItemContext?.onFieldChange?.();
            });
        },
        handleChange(value, option) {
            this.$emit('change', value, option);
        },
        handleSelect(value, option) {
            this.searchValue = '';
            this.$emit('select', value, option);
        },
        async handleFocus(event) {
            this.dropdownOpen = true;
            await this.ensureDefaultOptionsLoaded();
            this.$emit('focus', event);
        },
        handleDropdownVisibleChange(open) {
            this.dropdownOpen = open;
            if (open) {
                this.ensureDefaultOptionsLoaded();
            }
        },
        handleBlur(event) {
            this.$emit('blur', event);
            nextTick(() => {
                this.formItemContext?.onFieldBlur?.();
            });
        },
        renderNotFoundContent() {
            if (this.loading) {
                return h('div', {class: 'fc-suggest-search__loading'}, [
                    h(ASpin, {size: 'small'})
                ]);
            }
            return h(AEmpty, {image: AEmpty.PRESENTED_IMAGE_SIMPLE, description: '暂无数据'});
        }
    },
    mounted() {
        nextTick(() => {
            this.$emit('fc.el', this.$refs.selectRef);
        });
    },
    render() {
        return h(ASelect, {
            ...this.$attrs,
            ref: 'selectRef',
            value: this.selectedValue,
            options: this.selectOptions,
            showSearch: true,
            filterOption: false,
            allowClear: this.allowClear,
            mode: this.mode,
            open: this.dropdownOpen,
            maxCount: this.normalizedMaxCount,
            disabled: this.mergedDisabled,
            placeholder: this.placeholder,
            size: this.size,
            bordered: this.bordered,
            loading: this.loading,
            notFoundContent: this.renderNotFoundContent(),
            'onUpdate:value': this.handleValueUpdate,
            'onUpdate:searchValue': this.handleUpdateSearchValue,
            onSearch: this.handleSearch,
            onChange: this.handleChange,
            onSelect: this.handleSelect,
            onFocus: this.handleFocus,
            onBlur: this.handleBlur,
            onDropdownVisibleChange: this.handleDropdownVisibleChange
        });
    }
});
