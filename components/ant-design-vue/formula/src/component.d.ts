declare var _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    field: {
        type: StringConstructor;
        required: true;
    };
    formula: {
        type: StringConstructor;
        required: true;
    };
    precision: {
        type: NumberConstructor;
        default: number;
    };
    prefix: {
        type: StringConstructor;
        default: string;
    };
    suffix: {
        type: StringConstructor;
        default: string;
    };
    readonly: {
        type: BooleanConstructor;
        default: boolean;
    };
    showProcess: {
        type: BooleanConstructor;
        default: boolean;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
    onChange: {
        type: FunctionConstructor;
        default: any;
    };
    formCreateInject: ObjectConstructor;
    modelValue: (StringConstructor | NumberConstructor)[];
}>, {}, {
    result: number;
    processText: string;
    watchedFields: any[];
}, {
    displayValue(): string;
    containerClass(): any[];
}, {
    initWatchers(): void;
    calculateFormula(): void;
    recalculate(): void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("change" | "update:modelValue")[], "change" | "update:modelValue", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    field: {
        type: StringConstructor;
        required: true;
    };
    formula: {
        type: StringConstructor;
        required: true;
    };
    precision: {
        type: NumberConstructor;
        default: number;
    };
    prefix: {
        type: StringConstructor;
        default: string;
    };
    suffix: {
        type: StringConstructor;
        default: string;
    };
    readonly: {
        type: BooleanConstructor;
        default: boolean;
    };
    showProcess: {
        type: BooleanConstructor;
        default: boolean;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
    onChange: {
        type: FunctionConstructor;
        default: any;
    };
    formCreateInject: ObjectConstructor;
    modelValue: (StringConstructor | NumberConstructor)[];
}>> & Readonly<{
    onChange?: (...args: any[]) => any;
    "onUpdate:modelValue"?: (...args: any[]) => any;
}>, {
    className: string;
    prefix: string;
    readonly: boolean;
    onChange: Function;
    precision: number;
    suffix: string;
    showProcess: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=component.d.ts.map