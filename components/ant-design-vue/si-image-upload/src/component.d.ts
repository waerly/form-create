declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: (ArrayConstructor | StringConstructor | ObjectConstructor)[];
        default: () => any[];
    };
    formCreateInject: ObjectConstructor;
    limit: {
        type: NumberConstructor;
        default: number;
    };
    uploadProvider: {
        type: StringConstructor;
        default: string;
    };
    valueType: {
        type: StringConstructor;
        default: string;
    };
    previewSize: {
        type: StringConstructor;
        default: string;
    };
    uploadText: {
        type: StringConstructor;
        default: string;
    };
    uploadTip: {
        type: StringConstructor;
        default: string;
    };
}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:modelValue" | "change" | "remove" | "preview" | "fc.el")[], "update:modelValue" | "change" | "remove" | "preview" | "fc.el", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: (ArrayConstructor | StringConstructor | ObjectConstructor)[];
        default: () => any[];
    };
    formCreateInject: ObjectConstructor;
    limit: {
        type: NumberConstructor;
        default: number;
    };
    uploadProvider: {
        type: StringConstructor;
        default: string;
    };
    valueType: {
        type: StringConstructor;
        default: string;
    };
    previewSize: {
        type: StringConstructor;
        default: string;
    };
    uploadText: {
        type: StringConstructor;
        default: string;
    };
    uploadTip: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
    onChange?: (...args: any[]) => any;
    onRemove?: (...args: any[]) => any;
    onPreview?: (...args: any[]) => any;
    "onFc.el"?: (...args: any[]) => any;
}>, {
    modelValue: string | Record<string, any> | unknown[];
    limit: number;
    uploadProvider: string;
    valueType: string;
    previewSize: string;
    uploadText: string;
    uploadTip: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=component.d.ts.map