declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: (ArrayConstructor | StringConstructor | NumberConstructor)[];
        default: any;
    };
    formCreateInject: ObjectConstructor;
    request: FunctionConstructor;
    detailRequest: FunctionConstructor;
    placeholder: StringConstructor;
    allowClear: {
        type: BooleanConstructor;
        default: boolean;
    };
    disabled: BooleanConstructor;
    readonly: BooleanConstructor;
    multiple: BooleanConstructor;
    mode: StringConstructor;
    size: StringConstructor;
    maxTagCount: {
        type: (StringConstructor | NumberConstructor)[];
        default: string;
    };
    labelField: {
        type: StringConstructor;
        default: string;
    };
    valueField: {
        type: StringConstructor;
        default: string;
    };
    pageSize: {
        type: NumberConstructor;
        default: number;
    };
    options: {
        type: ArrayConstructor;
        default: () => any[];
    };
}>, {}, {
    loading: boolean;
    requestToken: number;
    innerOptions: any[];
}, {
    multipleMode(): boolean;
    mergedDisabled(): boolean;
    currentValue(): string | number | any[];
    selectOptions(): {
        label: any;
        value: any;
        disabled: any;
    }[];
    notFoundContent(): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
}, {
    runRequest(keyword?: string): Promise<void>;
    ensureSelectedOptions(value: any): Promise<void>;
    handleSearch(keyword: any): void;
    handleFocus(): void;
    handleChange(value: any, option: any): void;
    handleSelect(value: any, option: any): void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:modelValue" | "change" | "search" | "select" | "fc.el")[], "update:modelValue" | "change" | "search" | "select" | "fc.el", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: (ArrayConstructor | StringConstructor | NumberConstructor)[];
        default: any;
    };
    formCreateInject: ObjectConstructor;
    request: FunctionConstructor;
    detailRequest: FunctionConstructor;
    placeholder: StringConstructor;
    allowClear: {
        type: BooleanConstructor;
        default: boolean;
    };
    disabled: BooleanConstructor;
    readonly: BooleanConstructor;
    multiple: BooleanConstructor;
    mode: StringConstructor;
    size: StringConstructor;
    maxTagCount: {
        type: (StringConstructor | NumberConstructor)[];
        default: string;
    };
    labelField: {
        type: StringConstructor;
        default: string;
    };
    valueField: {
        type: StringConstructor;
        default: string;
    };
    pageSize: {
        type: NumberConstructor;
        default: number;
    };
    options: {
        type: ArrayConstructor;
        default: () => any[];
    };
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
    onChange?: (...args: any[]) => any;
    onSearch?: (...args: any[]) => any;
    onSelect?: (...args: any[]) => any;
    "onFc.el"?: (...args: any[]) => any;
}>, {
    disabled: boolean;
    readonly: boolean;
    multiple: boolean;
    modelValue: string | number | unknown[];
    allowClear: boolean;
    maxTagCount: string | number;
    labelField: string;
    valueField: string;
    pageSize: number;
    options: unknown[];
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=component.d.ts.map