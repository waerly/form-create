/**
 * FormCreate 核心组件
 * 这是 form-create 的主组件，负责：
 * 1. 管理表单的整个生命周期
 * 2. 处理规则变化和值变化
 * 3. 管理父子表单关系（group、subForm）
 * 4. 提供 API 实例给外部使用
 * 5. 处理全局样式注入
 */
import {
    defineComponent,
    getCurrentInstance,
    inject,
    markRaw,
    nextTick,
    onBeforeMount,
    onBeforeUnmount,
    onMounted,
    onUpdated,
    provide,
    reactive,
    toRefs,
    watch, watchEffect
} from 'vue';
import toArray from '@form-create/utils/lib/toarray';
import debounce from '@form-create/utils/lib/debounce';
import toLine from '@form-create/utils/lib/toline';
import {toJson} from '../frame/util';

/**
 * 递归查找父级的 formCreateInject
 * 用于在嵌套表单中获取父表单的注入数据（如 group、subForm 组件）
 * @param {Object} vm - 当前 Vue 实例
 * @param {Object} parent - 父级 Vue 实例
 * @returns {Object|undefined} formCreateInject 对象
 */
const getGroupInject = (vm, parent) => {
    // 如果没有 vm 或已经到达父级，返回
    if (!vm || vm === parent) {
        return;
    }
    // 如果当前组件有 formCreateInject props，直接返回
    if (vm.props.formCreateInject) {
        return vm.props.formCreateInject
    }
    // 否则继续向上查找父组件
    if (vm.parent) {
        return getGroupInject(vm.parent, parent);
    }
}

/**
 * 创建 FormCreate Vue 组件
 * @param {Object} FormCreate - FormCreate 构造函数
 * @param {Object} components - 要注册的组件
 * @param {Object} directives - 要注册的指令
 * @returns {Object} Vue 组件定义
 */
export default function $FormCreate(FormCreate, components, directives) {
    return defineComponent({
        name: 'FormCreate' + (FormCreate.isMobile ? 'Mobile' : ''),
        components,
        directives,
        // 组件属性定义
        props: {
            // 表单规则数组，【必填】
            rule: {
                type: Array,
                required: true,
                default: () => []
            },
            // 表单配置选项
            option: {
                type: Object,
                default: () => ({})
            },
            // 是否扩展 option（合并而非替换）
            extendOption: Boolean,
            // 驱动类型（UI 框架）
            driver: [String, Object],
            // v-model 双向绑定的表单数据
            modelValue: Object,
            // 是否禁用整个表单
            disabled: {
                type: Boolean,
                default: undefined,
            },
            // 是否预览模式（只读）
            preview: {
                type: Boolean,
                default: undefined,
            },
            // 表单索引（用于数组表单）
            index: [String, Number],
            // API 实例（用于外部控制）
            api: Object,
            // 国际化语言
            locale: [String, Object],
            // 国际化翻译函数
            t: Function,
            // 表单名称
            name: String,
            // 是否作为子表单（影响事件传播）
            subForm: {
                type: Boolean,
                default: true
            },
            // 是否在 v-for 中使用
            inFor: Boolean,
        },
        // 组件事件定义
        emits: ['update:api', 'update:modelValue', 'mounted', 'submit', 'reset', 'change', 'emit-event', 'control', 'remove-rule', 'remove-field', 'sync', 'reload', 'repeat-field', 'update', 'validate-field-fail', 'validate-fail', 'created'],
        // 渲染函数
        render() {
            return this.fc.render();
        },
        /**
         * 组合式 API setup 函数
         * 这里是组件的核心逻辑
         */
        setup(props) {
            // 获取当前组件实例
            const vm = getCurrentInstance();
            // 提供给子组件使用
            provide('parentFC', vm);
            // 注入父组件的 FormCreate 实例
            const parent = inject('parentFC', null);
            let top = parent;

            // 查找顶层 FormCreate 实例
            if (parent) {
                while (top.setupState.parent) {
                    top = top.setupState.parent;
                }
            } else {
                top = vm;
            }

            // 提取响应式 props
            const {rule, modelValue, subForm, inFor} = toRefs(props);

            // 组件内部响应式数据
            const data = reactive({
                ctxInject: {},           // 上下文注入数据
                destroyed: false,        // 是否已销毁
                isShow: true,           // 是否显示
                unique: 1,              // 唯一标识（用于强制刷新）
                renderRule: [...rule.value || []], // 渲染的规则副本
                updateValue: JSON.stringify(modelValue.value || {}), // 序列化的值（用于比较）
            });

            // 创建 FormCreate 实例
            const fc = new FormCreate(vm);
            // 获取 API 实例
            const fapi = fc.api();

            // 是否在循环中使用
            const isMore = inFor.value;

            /**
             * 添加子表单到父表单
             * 用于 group、subForm 等容器组件管理子表单
             */
            const addSubForm = () => {
                if (parent) {
                    const inject = getGroupInject(vm, parent);
                    if (inject) {
                        let sub;
                        if (isMore) {
                            // 如果在 v-for 中，添加到数组
                            sub = toArray(inject.getSubForm());
                            sub.push(fapi);

                        } else {
                            // 否则直接赋值
                            sub = fapi;
                        }
                        inject.subForm(sub);
                    }
                }
            };

            /**
             * 从父表单移除子表单
             * 组件销毁时调用
             */
            const rmSubForm = () => {
                const inject = getGroupInject(vm, parent);
                if (inject) {
                    if (isMore) {
                        // 如果在 v-for 中，从数组中移除
                        const sub = toArray(inject.getSubForm());
                        const idx = sub.indexOf(fapi);
                        if (idx > -1) {
                            sub.splice(idx, 1);
                        }
                    } else {
                        // 否则清空
                        inject.subForm();
                    }
                }
            };

            // 全局样式元素引用
            let styleEl = null;

            /**
             * 组件挂载前的钩子
             * 处理全局样式注入
             */
            onBeforeMount(() => {
                watchEffect(() => {
                    let content = '';
                    const globalClass = (props.option && props.option.globalClass) || {};
                    // 遍历全局类名配置
                    Object.keys(globalClass).forEach(k => {
                        let subCss = '';
                        // 处理 style 对象
                        globalClass[k].style && Object.keys(globalClass[k].style).forEach(key => {
                            subCss += toLine(key) + ':' + globalClass[k].style[key] + ';';
                        });
                        // 处理 content 字符串
                        if (globalClass[k].content) {
                            subCss += globalClass[k].content + ';';
                        }
                        if (subCss) {
                            content += `.${k}{${subCss}}`;
                        }
                    });
                    // 添加自定义样式
                    if (props.option && props.option.style) {
                        content += props.option.style;
                    }
                    // 创建或更新 style 元素
                    if (!styleEl) {
                        styleEl = document.createElement('style');
                        styleEl.type = 'text/css';
                        document.head.appendChild(styleEl);
                    }
                    styleEl.innerHTML = content || '';
                })
            });

            /**
             * 触发顶层表单数据加载事件（防抖）
             * 用于 {{$topForm.field}} 这样的模板变量
             */
            const emit$topForm = debounce(() => {
                fc.bus.$emit('$loadData.$topForm');
            }, 100);

            /**
             * 触发作用域表单数据加载事件（防抖）
             * 用于 {{$scopeForm.field}} 这样的模板变量
             */
            const emit$scopeForm = debounce(function () {
                fc.bus.$emit('$loadData.$scopeForm');
            }, 100);

            /**
             * 触发当前表单数据加载事件（防抖）
             * 用于 {{$form.field}} 这样的模板变量
             */
            const emit$form = debounce(() => {
                fc.bus.$emit('$loadData.$form');
            }, 100);

            /**
             * 触发字段变化事件
             * @param {String} field - 字段名
             */
            const emit$change = (field) => {
                fc.bus.$emit('change-$form.' + field);
            };

            /**
             * 组件挂载后的钩子
             * 注册事件监听器
             */
            onMounted(() => {
                // 如果有父表单，监听顶层表单的事件
                if (parent) {
                    fapi.top.bus.$on('$loadData.$form', emit$topForm);
                    fapi.top.bus.$on('change', emit$change);
                }
                // 如果不是作用域表单本身，监听作用域表单事件
                if (fapi !== fapi.scope) {
                    fapi.scope.bus.$on('$loadData.$scopeForm', emit$scopeForm);
                }
                // 触发 mounted 生命周期
                fc.mounted();
            });

            /**
             * 组件销毁前的钩子
             * 清理事件监听和资源
             */
            onBeforeUnmount(() => {
                // 移除事件监听器
                if (parent) {
                    fapi.top.bus.$off('$loadData.$form', emit$topForm);
                    fapi.top.bus.$off('change', emit$change);
                }
                if (fapi !== fapi.scope) {
                    fapi.scope.bus.$off('$loadData.$scopeForm', emit$scopeForm);
                }
                // 从父表单中移除
                rmSubForm();
                // 标记为已销毁
                data.destroyed = true;
                // 卸载表单
                fc.unmount();
                // 移除样式元素
                styleEl && (styleEl.parentNode || styleEl.parentElement) && document.head.removeChild(styleEl);
            })

            /**
             * 组件更新后的钩子
             */
            onUpdated(() => {
                fc.updated();
            });

            // 初始化时添加到父表单
            addSubForm();

            /**
             * 监听 option 变化
             * 深度监听，同步刷新
             */
            watch(() => props.option, () => {
                fc.initOptions();
                fapi.refresh();
            }, {deep: true, flush: 'sync'});

            /**
             * 监听 rule 数组变化
             * 检测规则添加、删除或顺序变化
             */
            watch(() => [...rule.value], (n) => {
                // 如果正在中断监听，或规则没有实际变化，跳过
                if (fc.$handle.isBreakWatch() || n.length === data.renderRule.length && n.every(v => data.renderRule.indexOf(v) > -1)) return;
                fc.$handle.updateAppendData();
                fc.$handle.reloadRule(rule.value);
                vm.setupState.renderRule();
            })

            /**
             * 监听 disabled 和 preview 变化
             */
            watch(() => [props.disabled, props.preview], () => {
                fapi.refresh();
            });

            /**
             * 监听 modelValue 变化（v-model）
             * 外部修改表单值时触发
             */
            watch(modelValue, (n) => {
                // 如果值没有实际变化，跳过
                if (toJson(n || {}) === data.updateValue) return;
                if (fapi.config.forceCoverValue) {
                    // 强制覆盖模式
                    fapi.coverValue(n || {});
                } else {
                    // 合并模式
                    fapi.setValue(n || {});
                }
            }, {deep: true, flush: 'post'});

            /**
             * 监听 index 变化（用于数组表单）
             * 切换索引时清空值并重置验证状态
             */
            watch(() => props.index, () => {
                fapi.coverValue({});
                fc.$handle.updateAppendData();
                nextTick(() => {
                    nextTick(() => {
                        fapi.clearValidateState();
                    });
                });
            }, {flush: 'sync'});

            // 返回暴露给模板的数据和方法
            return {
                fc: markRaw(fc),           // FormCreate 实例（非响应式）
                parent: parent ? markRaw(parent) : parent, // 父组件实例
                top: markRaw(top),         // 顶层组件实例
                fapi: markRaw(fapi),       // API 实例（非响应式）
                ...toRefs(data),           // 响应式数据
                getGroupInject: () => getGroupInject(vm, parent),
                /**
                 * 强制刷新组件
                 */
                refresh() {
                    ++data.unique;
                },
                /**
                 * 更新渲染规则副本
                 */
                renderRule() {
                    data.renderRule = [...rule.value || []];
                },
                /**
                 * 更新表单值并触发事件
                 * @param {Object} value - 新的表单值
                 */
                updateValue(value) {
                    if (data.destroyed) return;
                    const json = toJson(value);
                    // 如果值没有变化，跳过
                    if (data.updateValue === json) {
                        return;
                    }
                    data.updateValue = json;
                    // 触发 v-model 更新
                    vm.emit('update:modelValue', value);
                    // 触发数据加载事件
                    nextTick(() => {
                        emit$form();
                        if (!parent) {
                            // 顶层表单触发所有事件
                            emit$topForm();
                            emit$scopeForm();
                        } else if (!subForm.value) {
                            // 非子表单模式触发作用域事件
                            emit$scopeForm();
                        }
                    });
                }
            }
        },
        /**
         * created 钩子
         * 组件创建后立即执行
         */
        created() {
            const vm = getCurrentInstance();
            // 触发 API 更新事件
            vm.emit('update:api', vm.setupState.fapi);
            // 初始化表单
            vm.setupState.fc.init();
        },
    })
}
