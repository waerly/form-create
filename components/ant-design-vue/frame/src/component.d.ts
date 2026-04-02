declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    type: {
        type: StringConstructor;
        default: string;
    };
    field: StringConstructor;
    helper: {
        type: BooleanConstructor;
        default: boolean;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    src: {
        type: StringConstructor;
        required: true;
    };
    icon: {
        type: StringConstructor;
        default: string;
    };
    width: {
        type: (NumberConstructor | StringConstructor)[];
        default: number;
    };
    height: {
        type: StringConstructor;
        default: string;
    };
    maxLength: {
        type: NumberConstructor;
        default: number;
    };
    okBtnText: {
        type: StringConstructor;
        default: string;
    };
    closeBtnText: {
        type: StringConstructor;
        default: string;
    };
    modalTitle: StringConstructor;
    handleIcon: {
        type: (StringConstructor | BooleanConstructor)[];
        default: any;
    };
    title: StringConstructor;
    allowRemove: {
        type: BooleanConstructor;
        default: boolean;
    };
    onOpen: {
        type: FunctionConstructor;
        default: () => void;
    };
    onOk: {
        type: FunctionConstructor;
        default: () => void;
    };
    onCancel: {
        type: FunctionConstructor;
        default: () => void;
    };
    onLoad: {
        type: FunctionConstructor;
        default: () => void;
    };
    onBeforeRemove: {
        type: FunctionConstructor;
        default: () => void;
    };
    onRemove: {
        type: FunctionConstructor;
        default: () => void;
    };
    onHandle: FunctionConstructor;
    modal: {
        type: ObjectConstructor;
        default: () => {};
    };
    srcKey: (NumberConstructor | StringConstructor)[];
    modelValue: (ArrayConstructor | ObjectConstructor | NumberConstructor | StringConstructor)[];
    previewMask: any;
    footer: {
        type: BooleanConstructor;
        default: boolean;
    };
    reload: {
        type: BooleanConstructor;
        default: boolean;
    };
    closeBtn: {
        type: BooleanConstructor;
        default: boolean;
    };
    okBtn: {
        type: BooleanConstructor;
        default: boolean;
    };
    formCreateInject: ObjectConstructor;
}>, {}, {
    fileList: any[];
    previewVisible: boolean;
    frameVisible: boolean;
    previewImage: string;
    bus: any;
}, {}, {
    close(): void;
    closeModal(close: any): void;
    handleCancel(): void;
    showModal(): void;
    input(): void;
    getComponent(name: any): import("vue").Component<any, any, any, import("vue").ComputedOptions, import("vue").MethodOptions, {}, any>;
    getModalProps(visible: any): {
        open: any;
        visible: any;
    };
    makeInput(): any;
    makeGroup(children: any): any;
    makeItem(index: any, children: any): any;
    valid(f: any): void;
    makeIcons(val: any, index: any): any;
    makeHandleIcon(val: any, index: any): any;
    makeRemoveIcon(val: any, index: any): any;
    makeFiles(): any;
    makeImages(): any;
    makeBtn(): any;
    handleClick(src: any): any;
    handleRemove(src: any): void;
    getSrc(src: any): any;
    frameLoad(iframe: any): void;
    makeFooter(): any[];
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:modelValue" | "change")[], "update:modelValue" | "change", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    type: {
        type: StringConstructor;
        default: string;
    };
    field: StringConstructor;
    helper: {
        type: BooleanConstructor;
        default: boolean;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    src: {
        type: StringConstructor;
        required: true;
    };
    icon: {
        type: StringConstructor;
        default: string;
    };
    width: {
        type: (NumberConstructor | StringConstructor)[];
        default: number;
    };
    height: {
        type: StringConstructor;
        default: string;
    };
    maxLength: {
        type: NumberConstructor;
        default: number;
    };
    okBtnText: {
        type: StringConstructor;
        default: string;
    };
    closeBtnText: {
        type: StringConstructor;
        default: string;
    };
    modalTitle: StringConstructor;
    handleIcon: {
        type: (StringConstructor | BooleanConstructor)[];
        default: any;
    };
    title: StringConstructor;
    allowRemove: {
        type: BooleanConstructor;
        default: boolean;
    };
    onOpen: {
        type: FunctionConstructor;
        default: () => void;
    };
    onOk: {
        type: FunctionConstructor;
        default: () => void;
    };
    onCancel: {
        type: FunctionConstructor;
        default: () => void;
    };
    onLoad: {
        type: FunctionConstructor;
        default: () => void;
    };
    onBeforeRemove: {
        type: FunctionConstructor;
        default: () => void;
    };
    onRemove: {
        type: FunctionConstructor;
        default: () => void;
    };
    onHandle: FunctionConstructor;
    modal: {
        type: ObjectConstructor;
        default: () => {};
    };
    srcKey: (NumberConstructor | StringConstructor)[];
    modelValue: (ArrayConstructor | ObjectConstructor | NumberConstructor | StringConstructor)[];
    previewMask: any;
    footer: {
        type: BooleanConstructor;
        default: boolean;
    };
    reload: {
        type: BooleanConstructor;
        default: boolean;
    };
    closeBtn: {
        type: BooleanConstructor;
        default: boolean;
    };
    okBtn: {
        type: BooleanConstructor;
        default: boolean;
    };
    formCreateInject: ObjectConstructor;
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
    onChange?: (...args: any[]) => any;
}>, {
    previewMask: any;
    type: string;
    onCancel: Function;
    footer: boolean;
    helper: boolean;
    disabled: boolean;
    icon: string;
    width: string | number;
    height: string;
    maxLength: number;
    okBtnText: string;
    closeBtnText: string;
    handleIcon: string | boolean;
    allowRemove: boolean;
    onOpen: Function;
    onOk: Function;
    onLoad: Function;
    onBeforeRemove: Function;
    onRemove: Function;
    modal: Record<string, any>;
    reload: boolean;
    closeBtn: boolean;
    okBtn: boolean;
}, {}, {
    CloseCircleOutlined: any;
    FolderOutlined: any;
    FileOutlined: any;
    DeleteOutlined: any;
    EyeOutlined: any;
}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=component.d.ts.map