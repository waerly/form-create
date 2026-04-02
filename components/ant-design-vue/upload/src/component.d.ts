declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    limit: {
        type: NumberConstructor;
        default: number;
    };
    modelValue: {
        type: (ArrayConstructor | ObjectConstructor | StringConstructor)[];
        default: () => any[];
    };
    onSuccess: {
        type: FunctionConstructor;
        required: true;
    };
    onPreview: FunctionConstructor;
    listType: StringConstructor;
    uploadText: StringConstructor;
    modalTitle: StringConstructor;
    customRequest: FunctionConstructor;
    formCreateInject: ObjectConstructor;
    previewMask: any;
}>, {}, {
    previewImage: string;
    previewVisible: boolean;
    uploadList: any[];
}, {}, {
    handlePreview(file: any, ...args: any[]): void;
    handleChange({ file, fileList }: {
        file: any;
        fileList: any;
    }, ...args: any[]): void;
    input(): void;
    doCustomRequest(option: any): any;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:modelValue" | "change" | "fc.el")[], "update:modelValue" | "change" | "fc.el", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    limit: {
        type: NumberConstructor;
        default: number;
    };
    modelValue: {
        type: (ArrayConstructor | ObjectConstructor | StringConstructor)[];
        default: () => any[];
    };
    onSuccess: {
        type: FunctionConstructor;
        required: true;
    };
    onPreview: FunctionConstructor;
    listType: StringConstructor;
    uploadText: StringConstructor;
    modalTitle: StringConstructor;
    customRequest: FunctionConstructor;
    formCreateInject: ObjectConstructor;
    previewMask: any;
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
    onChange?: (...args: any[]) => any;
    "onFc.el"?: (...args: any[]) => any;
}>, {
    previewMask: any;
    limit: number;
    modelValue: string | Record<string, any> | unknown[];
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=component.d.ts.map