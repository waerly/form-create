declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: ArrayConstructor;
        default: () => any[];
    };
    columns: {
        type: ArrayConstructor;
        default: () => any[];
    };
    rowKey: {
        type: StringConstructor;
        default: string;
    };
    slotName: {
        type: StringConstructor;
        default: string;
    };
    addText: {
        type: StringConstructor;
        default: string;
    };
    emptyText: {
        type: StringConstructor;
        default: string;
    };
    min: {
        type: NumberConstructor;
        default: number;
    };
    max: {
        type: NumberConstructor;
        default: number;
    };
    showToolbar: {
        type: BooleanConstructor;
        default: boolean;
    };
    bordered: {
        type: BooleanConstructor;
        default: boolean;
    };
    formCreateInject: ObjectConstructor;
}>, {}, {}, {
    injectRule(): any;
    injectField(): any;
    previewState(): boolean;
    readonlyState(): boolean;
    rows(): any[];
    currentSlotName(): any;
    tableColumns(): any[];
    slotArgs(): {
        value: any[];
        field: any;
        rule: any;
        api: any;
        preview: boolean;
        readonly: boolean;
        setValue: (value: any) => void;
        addRow: (partial?: {}) => void;
        removeRow: (index: any) => void;
        updateRow: (index: any, patch?: {}) => void;
    };
    canAddRow(): boolean;
}, {
    getSlot(): any;
    emitValue(rows: any): void;
    setValue(value: any): void;
    createRow(partial?: {}): {};
    addRow(partial?: {}): void;
    removeRow(index: any): void;
    updateRow(index: any, patch?: {}): void;
    updateCell(index: any, field: any, value: any): void;
    renderCell(column: any, record: any, index: any): any;
    renderDefault(): any;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:modelValue" | "change")[], "update:modelValue" | "change", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: ArrayConstructor;
        default: () => any[];
    };
    columns: {
        type: ArrayConstructor;
        default: () => any[];
    };
    rowKey: {
        type: StringConstructor;
        default: string;
    };
    slotName: {
        type: StringConstructor;
        default: string;
    };
    addText: {
        type: StringConstructor;
        default: string;
    };
    emptyText: {
        type: StringConstructor;
        default: string;
    };
    min: {
        type: NumberConstructor;
        default: number;
    };
    max: {
        type: NumberConstructor;
        default: number;
    };
    showToolbar: {
        type: BooleanConstructor;
        default: boolean;
    };
    bordered: {
        type: BooleanConstructor;
        default: boolean;
    };
    formCreateInject: ObjectConstructor;
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
    onChange?: (...args: any[]) => any;
}>, {
    modelValue: unknown[];
    slotName: string;
    emptyText: string;
    bordered: boolean;
    columns: unknown[];
    rowKey: string;
    addText: string;
    min: number;
    max: number;
    showToolbar: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=component.d.ts.map