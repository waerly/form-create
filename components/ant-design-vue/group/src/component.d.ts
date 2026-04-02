declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    field: StringConstructor;
    rule: ArrayConstructor;
    expand: NumberConstructor;
    options: ObjectConstructor;
    button: {
        type: BooleanConstructor;
        default: boolean;
    };
    max: {
        type: NumberConstructor;
        default: number;
    };
    min: {
        type: NumberConstructor;
        default: number;
    };
    modelValue: {
        type: ArrayConstructor;
        default: () => any[];
    };
    defaultValue: ObjectConstructor;
    sortBtn: {
        type: BooleanConstructor;
        default: boolean;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    syncDisabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    title: {
        type: (StringConstructor | FunctionConstructor)[];
        default: any;
    };
    type: {
        type: StringConstructor;
        default: string;
    };
    onBeforeRemove: {
        type: FunctionConstructor;
        default: () => void;
    };
    onBeforeAdd: {
        type: FunctionConstructor;
        default: () => void;
    };
    formCreateInject: ObjectConstructor;
    parse: FunctionConstructor;
}>, {}, {
    len: number;
    cacheRule: {};
    cacheValue: {};
    sort: any[];
    form: any;
}, {}, {
    _value(v: any): any;
    cache(k: any, val: any): void;
    input(value: any): void;
    formData(key: any, formData: any): void;
    setValue(key: any, value: any): void;
    addRule(i: any, emit: any): void;
    add$f(i: any, key: any, $f: any): void;
    removeRule(key: any, emit: any): void;
    add(i: any): void;
    del(index: any, key: any): void;
    addIcon(key: any): any;
    delIcon(index: any, key: any): any;
    sortUpIcon(index: any): any;
    sortDownIcon(index: any): any;
    changeSort(index: any, sort: any): void;
    sortIcon(index: any, total: any): any;
    makeIcon(total: any, index: any, key: any): any[];
    expandRule(n: any): void;
    getTitle(index: any, key: any): any;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:modelValue" | "change" | "add" | "itemMounted" | "remove")[], "update:modelValue" | "change" | "add" | "itemMounted" | "remove", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    field: StringConstructor;
    rule: ArrayConstructor;
    expand: NumberConstructor;
    options: ObjectConstructor;
    button: {
        type: BooleanConstructor;
        default: boolean;
    };
    max: {
        type: NumberConstructor;
        default: number;
    };
    min: {
        type: NumberConstructor;
        default: number;
    };
    modelValue: {
        type: ArrayConstructor;
        default: () => any[];
    };
    defaultValue: ObjectConstructor;
    sortBtn: {
        type: BooleanConstructor;
        default: boolean;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    syncDisabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    title: {
        type: (StringConstructor | FunctionConstructor)[];
        default: any;
    };
    type: {
        type: StringConstructor;
        default: string;
    };
    onBeforeRemove: {
        type: FunctionConstructor;
        default: () => void;
    };
    onBeforeAdd: {
        type: FunctionConstructor;
        default: () => void;
    };
    formCreateInject: ObjectConstructor;
    parse: FunctionConstructor;
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
    onChange?: (...args: any[]) => any;
    onRemove?: (...args: any[]) => any;
    onAdd?: (...args: any[]) => any;
    onItemMounted?: (...args: any[]) => any;
}>, {
    type: string;
    modelValue: unknown[];
    title: string | Function;
    disabled: boolean;
    onBeforeRemove: Function;
    button: boolean;
    max: number;
    min: number;
    sortBtn: boolean;
    syncDisabled: boolean;
    onBeforeAdd: Function;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=component.d.ts.map