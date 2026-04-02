import {defineComponent} from 'vue';
import './style.css';

const NAME = 'fcFormula';

// 公式解析和计算工具
class FormulaCalculator {
    constructor(formula, formData) {
        this.formula = formula;
        this.formData = formData;
    }

    // 解析公式中的字段引用 {{fieldName}}
    parseFields() {
        const regex = /\{\{([^}]+)\}\}/g;
        const fields = [];
        let match;
        while ((match = regex.exec(this.formula)) !== null) {
            fields.push(match[1].trim());
        }
        return fields;
    }

    // 替换公式中的字段为实际值
    replaceFields() {
        let expression = this.formula;
        const fields = this.parseFields();

        fields.forEach(field => {
            const value = this.getFieldValue(field);
            const regex = new RegExp(`\\{\\{\\s*${field}\\s*\\}\\}`, 'g');
            expression = expression.replace(regex, value);
        });

        return expression;
    }

    // 获取字段值
    getFieldValue(field) {
        const value = this.formData[field];

        // 处理空值
        if (value === undefined || value === null || value === '') {
            return 0;
        }

        // 处理数组（如多选框）
        if (Array.isArray(value)) {
            return value.length;
        }

        // 处理对象
        if (typeof value === 'object') {
            return 0;
        }

        // 转换为数字
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    }

    // 计算公式
    calculate() {
        try {
            const expression = this.replaceFields();

            // 安全的数学函数映射
            const mathFunctions = {
                abs: Math.abs,
                ceil: Math.ceil,
                floor: Math.floor,
                round: Math.round,
                max: Math.max,
                min: Math.min,
                pow: Math.pow,
                sqrt: Math.sqrt,
                sin: Math.sin,
                cos: Math.cos,
                tan: Math.tan,
                log: Math.log,
                exp: Math.exp,
            };

            // 创建安全的计算上下文
            const func = new Function(...Object.keys(mathFunctions), `
                'use strict';
                try {
                    return ${expression};
                } catch (e) {
                    return NaN;
                }
            `);

            const result = func(...Object.values(mathFunctions));

            // 处理结果
            if (isNaN(result) || !isFinite(result)) {
                return 0;
            }

            return result;
        } catch (error) {
            console.error('公式计算错误:', error);
            return 0;
        }
    }
}

export default defineComponent({
    name: NAME,
    props: {
        field: {
            type: String,
            default: ''
        },
        // 公式字符串，如: "{{price}} * {{quantity}}"
        formula: {
            type: String,
            required: true
        },
        // 精度（小数位数）
        precision: {
            type: Number,
            default: 2
        },
        // 前缀（如货币符号）
        prefix: {
            type: String,
            default: ''
        },
        // 后缀（如单位）
        suffix: {
            type: String,
            default: ''
        },
        // 是否只读
        readonly: {
            type: Boolean,
            default: true
        },
        // 是否显示计算过程
        showProcess: {
            type: Boolean,
            default: false
        },
        // 自定义样式
        className: {
            type: String,
            default: ''
        },
        // 计算结果变化时的回调
        onChange: {
            type: Function,
            default: null
        },
        // form-create 注入
        formCreateInject: Object,
        modelValue: [Number, String],
    },
    emits: ['update:modelValue', 'change'],
    data() {
        return {
            result: 0,
            processText: '',
            watchedFields: [],
        };
    },
    computed: {
        displayValue() {
            const value = this.result.toFixed(this.precision);
            return `${this.prefix}${value}${this.suffix}`;
        },
        containerClass() {
            return [
                '_fc-formula-container',
                this.className,
                {
                    '_fc-formula-readonly': this.readonly
                }
            ];
        }
    },
    watch: {
        formula: {
            handler() {
                this.initWatchers();
                this.calculateFormula();
            },
            immediate: true
        },
        // 监听表单数据变化
        'formCreateInject.form': {
            handler(newForm, oldForm) {
                // 只有监听的字段变化时才重新计算
                if (this.watchedFields.length > 0 && newForm && oldForm) {
                    const hasChanged = this.watchedFields.some(field => {
                        return newForm[field] !== oldForm[field];
                    });
                    if (hasChanged) {
                        this.calculateFormula();
                    }
                }
            },
            deep: true
        }
    },
    methods: {
        // 初始化字段监听
        initWatchers() {
            if (!this.formCreateInject || !this.formCreateInject.api) {
                return;
            }

            const calculator = new FormulaCalculator(this.formula, {});
            const fields = calculator.parseFields();

            // 更新监听的字段列表
            this.watchedFields = fields;
        },

        // 计算公式
        calculateFormula() {
            if (!this.formCreateInject || !this.formCreateInject.api) {
                return;
            }

            const formData = this.formCreateInject.api.form;
            const calculator = new FormulaCalculator(this.formula, formData);

            // 生成计算过程文本
            if (this.showProcess) {
                this.processText = calculator.replaceFields();
            }

            // 计算结果
            const result = calculator.calculate();

            // 更新结果
            if (this.result !== result) {
                this.result = result;

                // 触发更新
                this.$emit('update:modelValue', result);
                this.$emit('change', result);

                // 更新表单数据
                const field = this.formCreateInject?.field || this.field;
                if (field) {
                    this.formCreateInject.api.setValue(field, result);
                }

                // 自定义回调
                if (this.onChange) {
                    this.onChange(result, formData);
                }
            }
        },

        // 手动触发计算（供外部调用）
        recalculate() {
            this.calculateFormula();
        }
    },
    mounted() {
        this.initWatchers();
        this.calculateFormula();
    },
    render() {
        return (
            <div class={this.containerClass}>
                <div class="_fc-formula-result">
                    <AInput
                        value={this.displayValue}
                        readonly={this.readonly}
                        class="_fc-formula-input"
                        addonBefore={this.showProcess ? '计算结果' : null}
                    />
                </div>
                {this.showProcess && (
                    <div class="_fc-formula-process">
                        <div class="_fc-formula-process-label">计算过程：</div>
                        <div class="_fc-formula-process-text">
                            {this.formula} = {this.processText} = {this.result.toFixed(this.precision)}
                        </div>
                    </div>
                )}
            </div>
        );
    }
});
