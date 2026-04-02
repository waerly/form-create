declare var _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    title: {
        type: StringConstructor;
        default: string;
    };
    level: {
        type: NumberConstructor;
        default: number;
        validator: (value: unknown) => boolean;
    };
    showDivider: {
        type: BooleanConstructor;
        default: boolean;
    };
    dividerPosition: {
        type: StringConstructor;
        default: string;
    };
    align: {
        type: StringConstructor;
        default: string;
    };
    style: {
        type: ObjectConstructor;
        default: () => {};
    };
    className: {
        type: StringConstructor;
        default: string;
    };
    description: {
        type: StringConstructor;
        default: string;
    };
    formCreateInject: ObjectConstructor;
}>, {}, {}, {
    containerClass(): any[];
    showTopDivider(): boolean;
    showBottomDivider(): boolean;
}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    title: {
        type: StringConstructor;
        default: string;
    };
    level: {
        type: NumberConstructor;
        default: number;
        validator: (value: unknown) => boolean;
    };
    showDivider: {
        type: BooleanConstructor;
        default: boolean;
    };
    dividerPosition: {
        type: StringConstructor;
        default: string;
    };
    align: {
        type: StringConstructor;
        default: string;
    };
    style: {
        type: ObjectConstructor;
        default: () => {};
    };
    className: {
        type: StringConstructor;
        default: string;
    };
    description: {
        type: StringConstructor;
        default: string;
    };
    formCreateInject: ObjectConstructor;
}>> & Readonly<{}>, {
    description: string;
    style: Record<string, any>;
    title: string;
    className: string;
    align: string;
    level: number;
    showDivider: boolean;
    dividerPosition: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
//# sourceMappingURL=component.d.ts.map