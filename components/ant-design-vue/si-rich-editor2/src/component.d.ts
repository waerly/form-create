declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: StringConstructor;
        default: string;
    };
    disabled: BooleanConstructor;
    config: {
        type: ObjectConstructor;
        default: () => {};
    };
    init: FunctionConstructor;
    height: {
        type: NumberConstructor;
        default: number;
    };
    minHeight: {
        type: NumberConstructor;
        default: number;
    };
    placeholder: {
        type: StringConstructor;
        default: string;
    };
    uploadProvider: {
        type: StringConstructor;
        default: string;
    };
    baseURL: {
        type: StringConstructor;
        default: string;
    };
    action: {
        type: StringConstructor;
        default: string;
    };
    uploadImgAction: {
        type: StringConstructor;
        default: string;
    };
    uploadVideoAction: {
        type: StringConstructor;
        default: string;
    };
    uploadFileAction: {
        type: StringConstructor;
        default: string;
    };
    maxImageSize: {
        type: NumberConstructor;
        default: number;
    };
    maxVideoSize: {
        type: NumberConstructor;
        default: number;
    };
    maxAttachmentSize: {
        type: NumberConstructor;
        default: number;
    };
    name: {
        type: StringConstructor;
        default: string;
    };
    isPrivate: {
        type: NumberConstructor;
        default: number;
    };
    maxFileSize: {
        type: NumberConstructor;
        default: number;
    };
    headers: {
        type: ObjectConstructor;
        default: () => {};
    };
    zIndex: {
        type: NumberConstructor;
        default: number;
    };
}>, {}, {
    editor: any;
    toolbar: any;
    uni: number;
    lastValue: string;
    creating: boolean;
    linkClickHandler: any;
}, {}, {
    resolveBaseURL(): string;
    resolveAction(type?: string): string;
    resolveUploadParams(type?: string): {
        isPrivate: number;
        typeInt: number;
    };
    resolveHeaders(): any;
    resolveMaxFileSize(type?: string): number;
    normalizeResponse(response: any): {
        url: any;
        name: any;
        id: any;
    };
    emitValue(): void;
    syncDisabled(): void;
    attachPrivateLinkPreview(): void;
    detachPrivateLinkPreview(): void;
    createEditor(): Promise<void>;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("change" | "update:modelValue" | "fc.el")[], "change" | "update:modelValue" | "fc.el", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: StringConstructor;
        default: string;
    };
    disabled: BooleanConstructor;
    config: {
        type: ObjectConstructor;
        default: () => {};
    };
    init: FunctionConstructor;
    height: {
        type: NumberConstructor;
        default: number;
    };
    minHeight: {
        type: NumberConstructor;
        default: number;
    };
    placeholder: {
        type: StringConstructor;
        default: string;
    };
    uploadProvider: {
        type: StringConstructor;
        default: string;
    };
    baseURL: {
        type: StringConstructor;
        default: string;
    };
    action: {
        type: StringConstructor;
        default: string;
    };
    uploadImgAction: {
        type: StringConstructor;
        default: string;
    };
    uploadVideoAction: {
        type: StringConstructor;
        default: string;
    };
    uploadFileAction: {
        type: StringConstructor;
        default: string;
    };
    maxImageSize: {
        type: NumberConstructor;
        default: number;
    };
    maxVideoSize: {
        type: NumberConstructor;
        default: number;
    };
    maxAttachmentSize: {
        type: NumberConstructor;
        default: number;
    };
    name: {
        type: StringConstructor;
        default: string;
    };
    isPrivate: {
        type: NumberConstructor;
        default: number;
    };
    maxFileSize: {
        type: NumberConstructor;
        default: number;
    };
    headers: {
        type: ObjectConstructor;
        default: () => {};
    };
    zIndex: {
        type: NumberConstructor;
        default: number;
    };
}>> & Readonly<{
    onChange?: (...args: any[]) => any;
    "onUpdate:modelValue"?: (...args: any[]) => any;
    "onFc.el"?: (...args: any[]) => any;
}>, {
    disabled: boolean;
    modelValue: string;
    config: Record<string, any>;
    height: number;
    minHeight: number;
    placeholder: string;
    uploadProvider: string;
    baseURL: string;
    action: string;
    uploadImgAction: string;
    uploadVideoAction: string;
    uploadFileAction: string;
    maxImageSize: number;
    maxVideoSize: number;
    maxAttachmentSize: number;
    name: string;
    isPrivate: number;
    maxFileSize: number;
    headers: Record<string, any>;
    zIndex: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=component.d.ts.map