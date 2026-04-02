declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: (ArrayConstructor | StringConstructor | BooleanConstructor | NumberConstructor | ObjectConstructor)[];
        default: any;
    };
    formCreateInject: ObjectConstructor;
    options: {
        type: ArrayConstructor;
        default: () => any[];
    };
    dropdownRule: {
        type: (StringConstructor | ObjectConstructor)[];
        default: any;
    };
    request: FunctionConstructor;
    placeholder: StringConstructor;
    allowClear: {
        type: BooleanConstructor;
        default: boolean;
    };
    mode: StringConstructor;
    disabled: BooleanConstructor;
    readonly: BooleanConstructor;
    size: StringConstructor;
    bordered: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, {}, {
    innerOptions: any[];
    loading: boolean;
    requestToken: number;
}, {
    mergedDisabled(): boolean;
    normalizedDropdownRule(): any;
    selectedValue(): string | number | boolean | Record<string, any> | unknown[];
    selectOptions(): any[];
    currentField(): any;
}, {
    getFormData(): any;
    callRequest(value: any, exact: any): Promise<any[]>;
    ensureExactOptions(value: any): Promise<void>;
    handleSearch(keyword: any): Promise<void>;
    handleChange(value: any, option: any): void;
    handleSelect(value: any, option: any): void;
    handleFocus(event: any): void;
    handleBlur(event: any): void;
    renderNotFoundContent(): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:modelValue" | "change" | "select" | "search" | "blur" | "focus" | "fc.el")[], "update:modelValue" | "change" | "select" | "search" | "blur" | "focus" | "fc.el", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: (ArrayConstructor | StringConstructor | BooleanConstructor | NumberConstructor | ObjectConstructor)[];
        default: any;
    };
    formCreateInject: ObjectConstructor;
    options: {
        type: ArrayConstructor;
        default: () => any[];
    };
    dropdownRule: {
        type: (StringConstructor | ObjectConstructor)[];
        default: any;
    };
    request: FunctionConstructor;
    placeholder: StringConstructor;
    allowClear: {
        type: BooleanConstructor;
        default: boolean;
    };
    mode: StringConstructor;
    disabled: BooleanConstructor;
    readonly: BooleanConstructor;
    size: StringConstructor;
    bordered: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
    onChange?: (...args: any[]) => any;
    onSelect?: (...args: any[]) => any;
    onSearch?: (...args: any[]) => any;
    onBlur?: (...args: any[]) => any;
    onFocus?: (...args: any[]) => any;
    "onFc.el"?: (...args: any[]) => any;
}>, {
    disabled: boolean;
    readonly: boolean;
    modelValue: string | number | boolean | Record<string, any> | unknown[];
    options: unknown[];
    dropdownRule: string | Record<string, any>;
    allowClear: boolean;
    bordered: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=component.d.ts.map