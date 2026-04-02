declare var _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    field: StringConstructor;
    slotName: {
        type: StringConstructor;
        default: string;
    };
    tag: {
        type: StringConstructor;
        default: string;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
    style: {
        type: ObjectConstructor;
        default: () => {};
    };
    border: {
        type: BooleanConstructor;
        default: boolean;
    };
    title: {
        type: StringConstructor;
        default: string;
    };
    description: {
        type: StringConstructor;
        default: string;
    };
    minHeight: {
        type: (StringConstructor | NumberConstructor)[];
        default: string;
    };
    padding: {
        type: (StringConstructor | NumberConstructor)[];
        default: string;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    formCreateInject: ObjectConstructor;
}>, {}, {
    slotContent: any;
}, {
    containerStyle(): any;
    containerClass(): any[];
}, {
    handleClick(e: any): void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("click" | "mounted")[], "click" | "mounted", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    field: StringConstructor;
    slotName: {
        type: StringConstructor;
        default: string;
    };
    tag: {
        type: StringConstructor;
        default: string;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
    style: {
        type: ObjectConstructor;
        default: () => {};
    };
    border: {
        type: BooleanConstructor;
        default: boolean;
    };
    title: {
        type: StringConstructor;
        default: string;
    };
    description: {
        type: StringConstructor;
        default: string;
    };
    minHeight: {
        type: (StringConstructor | NumberConstructor)[];
        default: string;
    };
    padding: {
        type: (StringConstructor | NumberConstructor)[];
        default: string;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    formCreateInject: ObjectConstructor;
}>> & Readonly<{
    onClick?: (...args: any[]) => any;
    onMounted?: (...args: any[]) => any;
}>, {
    description: string;
    border: boolean;
    minHeight: string | number;
    padding: string | number;
    style: Record<string, any>;
    title: string;
    className: string;
    disabled: boolean;
    tag: string;
    slotName: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=component.d.ts.map