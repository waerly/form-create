declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: (ArrayConstructor | StringConstructor | ObjectConstructor)[];
        default: () => any[];
    };
    formCreateInject: ObjectConstructor;
    action: {
        type: StringConstructor;
        default: string;
    };
    deleteAction: {
        type: StringConstructor;
        default: string;
    };
    headers: {
        type: ObjectConstructor;
        default: () => {};
    };
    data: {
        type: ObjectConstructor;
        default: () => {};
    };
    method: {
        type: StringConstructor;
        default: string;
    };
    name: {
        type: StringConstructor;
        default: string;
    };
    limit: {
        type: NumberConstructor;
        default: number;
    };
    maxSize: {
        type: NumberConstructor;
        default: number;
    };
    accept: StringConstructor;
    multiple: BooleanConstructor;
    disabled: BooleanConstructor;
    readonly: BooleanConstructor;
    uploadType: {
        type: StringConstructor;
        default: string;
    };
    uploadProvider: {
        type: StringConstructor;
        default: string;
    };
    valueType: {
        type: StringConstructor;
        default: string;
    };
    listType: {
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
    customRequest: FunctionConstructor;
    onSuccess: FunctionConstructor;
    onRemove: FunctionConstructor;
    onPreview: FunctionConstructor;
    responseUrlKey: {
        type: StringConstructor;
        default: string;
    };
    responseNameKey: {
        type: StringConstructor;
        default: string;
    };
    responseIdKey: {
        type: StringConstructor;
        default: string;
    };
}>, {}, {
    fileList: ({
        uid: any;
        name: any;
        status: any;
        url: any;
        value: any;
        size: any;
        percentage: any;
        response: any;
        raw: any;
        type: any;
    } | {
        uid: string;
        name: string;
        status: string;
        url: string;
        value: string;
        percentage: number;
        raw: any;
        type: string;
        size?: undefined;
        response?: undefined;
    })[];
}, {
    readonlyState(): boolean;
    canUpload(): boolean;
}, {
    emitValue(): void;
    beforeUpload(file: any): any;
    resolveUploadRequest(option: any): any;
    handleCustomRequest(option: any): any;
    handleInternalChange(info: any): void;
    handleRemove(file: any): Promise<boolean>;
    handlePreview(file: any): void;
    renderTrigger(): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    renderPreviewItem(file: any): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:modelValue" | "change" | "remove" | "preview" | "fc.el")[], "update:modelValue" | "change" | "remove" | "preview" | "fc.el", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: (ArrayConstructor | StringConstructor | ObjectConstructor)[];
        default: () => any[];
    };
    formCreateInject: ObjectConstructor;
    action: {
        type: StringConstructor;
        default: string;
    };
    deleteAction: {
        type: StringConstructor;
        default: string;
    };
    headers: {
        type: ObjectConstructor;
        default: () => {};
    };
    data: {
        type: ObjectConstructor;
        default: () => {};
    };
    method: {
        type: StringConstructor;
        default: string;
    };
    name: {
        type: StringConstructor;
        default: string;
    };
    limit: {
        type: NumberConstructor;
        default: number;
    };
    maxSize: {
        type: NumberConstructor;
        default: number;
    };
    accept: StringConstructor;
    multiple: BooleanConstructor;
    disabled: BooleanConstructor;
    readonly: BooleanConstructor;
    uploadType: {
        type: StringConstructor;
        default: string;
    };
    uploadProvider: {
        type: StringConstructor;
        default: string;
    };
    valueType: {
        type: StringConstructor;
        default: string;
    };
    listType: {
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
    customRequest: FunctionConstructor;
    onSuccess: FunctionConstructor;
    onRemove: FunctionConstructor;
    onPreview: FunctionConstructor;
    responseUrlKey: {
        type: StringConstructor;
        default: string;
    };
    responseNameKey: {
        type: StringConstructor;
        default: string;
    };
    responseIdKey: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onRemove?: (...args: any[]) => any;
    onPreview?: (...args: any[]) => any;
    "onUpdate:modelValue"?: (...args: any[]) => any;
    onChange?: (...args: any[]) => any;
    "onFc.el"?: (...args: any[]) => any;
}>, {
    multiple: boolean;
    disabled: boolean;
    readonly: boolean;
    modelValue: string | Record<string, any> | unknown[];
    action: string;
    deleteAction: string;
    headers: Record<string, any>;
    data: Record<string, any>;
    method: string;
    name: string;
    limit: number;
    maxSize: number;
    uploadType: string;
    uploadProvider: string;
    valueType: string;
    listType: string;
    uploadText: string;
    uploadTip: string;
    responseUrlKey: string;
    responseNameKey: string;
    responseIdKey: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=component.d.ts.map