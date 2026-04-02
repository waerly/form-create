declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: ObjectConstructor;
        default: () => {};
    };
    slotName: {
        type: StringConstructor;
        default: string;
    };
    emptyText: {
        type: StringConstructor;
        default: string;
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
    formData(): any;
    currentSlotName(): any;
    slotArgs(): {
        value: any;
        field: any;
        rule: any;
        api: any;
        preview: boolean;
        readonly: boolean;
        setValue: (value: any) => void;
        updateValue: (patch?: {}) => void;
        clearValue: () => void;
    };
    boxStyle(): {
        border: string;
        background: string;
        padding: number;
        minHeight: string;
    };
}, {
    getSlot(): any;
    emitValue(value: any): void;
    setValue(value: any): void;
    updateValue(patch?: {}): void;
    clearValue(): void;
    renderDefault(): any;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:modelValue" | "change")[], "update:modelValue" | "change", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: ObjectConstructor;
        default: () => {};
    };
    slotName: {
        type: StringConstructor;
        default: string;
    };
    emptyText: {
        type: StringConstructor;
        default: string;
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
    modelValue: Record<string, any>;
    slotName: string;
    emptyText: string;
    bordered: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=component.d.ts.map