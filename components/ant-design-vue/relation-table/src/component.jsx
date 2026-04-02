import {defineComponent, Fragment, h} from 'vue';
import {Button as AButton, Empty as AEmpty, Input as AInput, InputNumber as AInputNumber, Space as ASpace, Table as ATable} from 'ant-design-vue';
import uniqueId from '@form-create/utils/lib/unique';
import './style.css';

const NAME = 'fcRelationTable';

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cloneRows(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.map(item => (isObject(item) ? {...item} : item));
}

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    inject: ['parentFC'],
    formCreateParser: {
        toFormValue(value) {
            return Array.isArray(value) ? value : [];
        },
        toValue(value) {
            return Array.isArray(value) ? value : [];
        }
    },
    props: {
        modelValue: {
            type: Array,
            default: () => []
        },
        columns: {
            type: Array,
            default: () => ([])
        },
        rowKey: {
            type: String,
            default: 'id'
        },
        slotName: {
            type: String,
            default: ''
        },
        addText: {
            type: String,
            default: '新增一行'
        },
        emptyText: {
            type: String,
            default: '暂无关联表格数据'
        },
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 0
        },
        showToolbar: {
            type: Boolean,
            default: true
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
        rows() {
            return cloneRows(this.modelValue);
        },
        currentSlotName() {
            return this.slotName || this.injectField || 'relationTable';
        },
        tableColumns() {
            const columns = (this.columns || []).map((column, index) => {
                const key = column.key || column.dataIndex || `col_${index}`;
                const dataIndex = column.dataIndex || key;
                const title = column.title || dataIndex;
                const valueType = column.valueType || 'text';
                return {
                    ...column,
                    key,
                    dataIndex,
                    title,
                    valueType,
                    customRender: ({record, index: rowIndex}) => this.renderCell(column, record, rowIndex),
                };
            });

            if (!this.readonlyState) {
                columns.push({
                    title: '操作',
                    key: '__action',
                    width: 88,
                    customRender: ({index}) => (
                        <AButton danger type="link" size="small" onClick={() => this.removeRow(index)}>
                            删除
                        </AButton>
                    )
                });
            }

            return columns;
        },
        slotArgs() {
            return {
                value: this.rows,
                field: this.injectField,
                rule: this.injectRule,
                api: this.formCreateInject?.api,
                preview: this.previewState,
                readonly: this.readonlyState,
                setValue: this.setValue,
                addRow: this.addRow,
                removeRow: this.removeRow,
                updateRow: this.updateRow,
            };
        },
        canAddRow() {
            return !this.readonlyState && (!this.max || this.rows.length < this.max);
        },
        boundRelationInfo() {
            const props = this.injectRule?.props || {};
            const title = typeof this.injectRule?.title === 'object'
                ? (this.injectRule?.title?.title || this.injectRule?.title?.native || '')
                : (this.injectRule?.title || '');
            return {
                componentName: '关联嵌入表格',
                title,
                relationCode: props.relationCode || '',
                relationLabel: props.relationLabel || props.relationCode || '',
            };
        },
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
        emitValue(rows) {
            const nextRows = cloneRows(rows);
            this.$emit('update:modelValue', nextRows);
            this.$emit('change', nextRows);
            const field = this.injectField;
            const api = this.formCreateInject?.api;
            if (field && api?.setValue) {
                api.setValue(field, nextRows);
            }
        },
        setValue(value) {
            this.emitValue(Array.isArray(value) ? value : []);
        },
        createRow(partial = {}) {
            const row = isObject(partial) ? {...partial} : {};
            if (!row[this.rowKey]) {
                row[this.rowKey] = uniqueId();
            }
            this.columns.forEach(column => {
                const dataIndex = column.dataIndex || column.key;
                if (!dataIndex || row[dataIndex] !== undefined) {
                    return;
                }
                if (column.defaultValue !== undefined) {
                    row[dataIndex] = typeof column.defaultValue === 'function' ? column.defaultValue() : column.defaultValue;
                } else if (column.valueType === 'number') {
                    row[dataIndex] = 0;
                } else {
                    row[dataIndex] = '';
                }
            });
            return row;
        },
        addRow(partial = {}) {
            if (!this.canAddRow) {
                return;
            }
            this.emitValue([...this.rows, this.createRow(partial)]);
        },
        removeRow(index) {
            if (this.readonlyState || this.rows.length <= this.min) {
                return;
            }
            const rows = this.rows.slice();
            rows.splice(index, 1);
            this.emitValue(rows);
        },
        updateRow(index, patch = {}) {
            const rows = this.rows.slice();
            const current = isObject(rows[index]) ? rows[index] : {};
            rows[index] = {...current, ...patch};
            this.emitValue(rows);
        },
        updateCell(index, field, value) {
            this.updateRow(index, {[field]: value});
        },
        renderCell(column, record, index) {
            const field = column.dataIndex || column.key;
            const value = isObject(record) ? record[field] : undefined;
            if (this.readonlyState) {
                return <span>{value ?? ''}</span>;
            }

            if (column.valueType === 'number') {
                return (
                    <AInputNumber
                        value={value}
                        min={column.min}
                        max={column.max}
                        precision={column.precision}
                        style={{width: '100%'}}
                        onUpdate:value={(next) => this.updateCell(index, field, next ?? 0)}
                    />
                );
            }

            return (
                <AInput
                    value={value}
                    placeholder={column.placeholder || `请输入${column.title || field}`}
                    onUpdate:value={(next) => this.updateCell(index, field, next)}
                />
            );
        },
        renderDefault() {
            if (!this.columns.length) {
                return (
                    <div class="_fc-relation-table-empty">
                        <AEmpty description={this.emptyText}/>
                        {!this.readonlyState ? (
                            <div class="_fc-relation-table-empty-hint">
                                请通过 `props.columns` 配置列，或提供命名 slot `#{this.currentSlotName}`
                            </div>
                        ) : null}
                    </div>
                );
            }

            return (
                <div>
                    {this.showToolbar ? (
                        <div class="_fc-relation-table-toolbar">
                            <ASpace>
                                <AButton type="dashed" disabled={!this.canAddRow} onClick={() => this.addRow()}>
                                    {this.addText}
                                </AButton>
                            </ASpace>
                        </div>
                    ) : null}
                    <ATable
                        size="small"
                        pagination={false}
                        bordered={this.bordered}
                        dataSource={this.rows}
                        columns={this.tableColumns}
                        rowKey={this.rowKey}
                    />
                </div>
            );
        },
        renderBoundPlaceholder() {
            const info = this.boundRelationInfo;
            return (
                <div class="_fc-relation-table-designer">
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
            <div class={['_fc-relation-table-wrapper', {'_fc-relation-table-preview': this.readonlyState}]}>
                {slot
                    ? h(Fragment, {}, [slot(this.slotArgs)])
                    : hasBoundRelation && this.showDesignPlaceholder
                        ? this.renderBoundPlaceholder()
                        : null}
            </div>
        );
    }
});
