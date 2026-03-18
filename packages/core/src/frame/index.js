/**
 * form-create 核心工厂模块
 * 负责框架的初始化、组件注册、解析器管理、全局配置以及 API 的生成
 */
import $FormCreate from '../components/formCreate';
import {computed, createApp, h, nextTick, reactive, ref, watch} from 'vue';
import makerFactory from '../factory/maker';
import Handle from '../handler';
import fetch from './fetch';
import {creatorFactory, mergeRule} from '..';
import BaseParser from '../factory/parser';
import {copyRule, copyRules, deepGet, invoke, mergeGlobal, parseFn, parseJson, setPrototypeOf, toJson} from './util';
import fragment from '../components/fragment';
import is, {hasProperty} from '@form-create/utils/lib/type';
import toCase from '@form-create/utils/lib/tocase';
import extend, {copy} from '@form-create/utils/lib/extend';
import {CreateNodeFactory} from '../factory/node';
import {createManager} from '../factory/manager';
import {arrayAttrs, keyAttrs, normalAttrs} from './attrs';
import {appendProto} from '../factory/creator';
import $provider from './provider';
import {deepCopy} from '@form-create/utils/lib/deepextend';
import Mitt from '@form-create/utils/lib/mitt';
import html from '../parser/html';
import uniqueId from '@form-create/utils/lib/unique';
import {cookieDriver, localStorageDriver, sessionStorageDriver} from './dataDriver';
import debounce from '@form-create/utils/lib/debounce';
import {deepSet} from '@form-create/utils';
import baseLanguage from './language';

/**
 * 解析属性工具函数
 */
function parseProp(name, id) {
    let prop;
    if (arguments.length === 2) {
        prop = arguments[1];
        id = prop[name];
    } else {
        prop = arguments[2];
    }
    return {id, prop};
}

/**
 * 解析名称属性
 */
function nameProp() {
    return parseProp('name', ...arguments);
}

/**
 * 导出并注册规则属性
 * 将自定义属性（如 col, wrap, title 等）注入到规则系统中
 */
function exportAttrs(attrs) {
    const key = attrs.key || [];
    const array = attrs.array || [];
    const normal = attrs.normal || [];
    keyAttrs.push(...key);
    arrayAttrs.push(...array);
    normalAttrs.push(...normal);

    // 将属性添加到 Creator 原型上，方便 maker.input().col() 这种链式调用
    appendProto([...key, ...array, ...normal]);
}

let id = 1;
const instance = {}; // 存储所有表单实例的 API
const defValueTag = Symbol('defValue');

/**
 * FormCreate 工厂函数
 * @param {Object} config - 基础配置，包含 UI 框架特定的解析器和管理器
 */
export default function FormCreateFactory(config) {

    // --- 注册中心 ---
    const components = {
        [fragment.name]: fragment
    };
    const parsers = {};      // 解析器注册表 (如 input, select)
    const directives = {};   // 指令注册表
    const modelFields = {};  // v-model 字段映射
    const drivers = {};      // 渲染驱动
    const useApps = [];      // 插件/扩展回调
    const listener = [];     // 事件监听器
    const extendApiFn = [
        config.extendApi
    ];
    const providers = {      // 指令提供者 (如 fetch, loadData)
        ...$provider
    };

    // 生成组件构造器 maker
    const maker = makerFactory();
    let globalConfig = {global: {}};
    const isMobile = config.isMobile === true;

    // 响应式数据存储，用于 {{ $form.field }} 等模板变量的解析
    const loadData = reactive({
        $mobile: isMobile,
    });
    const CreateNode = CreateNodeFactory();
    const formulas = {};      // 公式计算注册表
    const prototype = {};     // 静态原型对象

    // 导出并注册 UI 框架自定义的属性
    exportAttrs(config.attrs || {});

    /**
     * 根据名称获取表单 API
     */
    function getApi(name) {
        const val = instance[name];
        if (Array.isArray(val)) {
            return val.map(v => {
                return v.api();
            });
        } else if (val) {
            return val.api();
        }
    }

    /**
     * 注册插件
     */
    function useApp(fn) {
        useApps.push(fn);
    }

    /**
     * 注册指令
     */
    function directive() {
        const data = nameProp(...arguments);
        if (data.id && data.prop) directives[data.id] = data.prop;
    }

    /**
     * 注册规则指令提供者 (Provider)
     */
    function register() {
        const data = nameProp(...arguments);
        if (data.id && data.prop) providers[data.id] = is.Function(data.prop) ? data.prop : {
            ...data.prop,
            name: data.id
        };
    }

    /**
     * 注册组件别名
     */
    function componentAlias(alias) {
        CreateNode.use(alias);
    }
    /**
     * 注册解析器
     * 将一个组件及其解析逻辑绑定到 type 名上
     */
    function parser(key) {
        if (arguments.length === 0) {
            return BaseParser;
        } else if (typeof key === 'string' && arguments.length === 1) {
            return parsers[toCase(key)];
        }
        const data = nameProp(...arguments);
        if (!data.id || !data.prop) return BaseParser;
        const name = toCase(data.id);
        const parser = data.prop;
        const base = parser.merge === true ? parsers[name] : undefined;
        // 继承基础解析器
        parsers[name] = setPrototypeOf(parser, base || BaseParser);
        // 为 maker 生成对应的便捷方法，如 maker.input()
        maker[name] = creatorFactory(name);
        parser.maker && extend(maker, parser.maker);
    }

    /**
     * 注册全局组件
     */
    function component(id, component) {
        let name;
        if (is.String(id)) {
            name = id;
            if (component === undefined) {
                return components[name];
            }
        } else {
            name = id.displayName || id.name;
            component = id;
        }
        if (!name || !component) return;
        const nameAlias = toCase(name);
        components[name] = component;
        components[nameAlias] = component;
        // 注册组件后清除相关的别名和解析器缓存
        delete CreateNode.aliasMap[name];
        delete CreateNode.aliasMap[nameAlias];
        delete parsers[name];
        delete parsers[nameAlias];
        // 如果组件自带解析器，一并注册
        if (component.formCreateParser) parser(name, component.formCreateParser);
    }

    /**
     * 获取 FormCreate 组件定义
     */
    function $form() {
        return $FormCreate(FormCreate, components, directives);
    }

    /**
     * 快捷创建一个表单应用实例 (Vue App)
     */
    function createFormApp(rule, option) {
        const Type = $form();
        return createApp({
            data() {
                return reactive({
                    rule, option
                });
            },
            render() {
                return h(Type, {ref: 'fc', ...this.$data});
            }
        });
    }

    function $vnode() {
        return fragment;
    }

    /**
     * 插件系统入口
     */
    function use(fn, opt) {
        if (is.Function(fn.install)) fn.install(create, opt);
        else if (is.Function(fn)) fn(create, opt);
        return this;
    }

    /**
     * 静态创建方法：直接在 DOM 上挂载表单并返回 API
     */
    function create(rules, option) {
        let app = createFormApp(rules, option || {});
        useApps.forEach(v => {
            invoke(() => v(create, app));
        })
        const div = document.createElement('div');
        (option?.el || document.body).appendChild(div);
        const vm = app.mount(div);
        return vm.$refs.fc.fapi;
    }

    // 设置原型继承
    setPrototypeOf(create, prototype);

    /**
     * 克隆工厂，用于多 UI 版本并存或继承
     */
    function factory(inherit) {
        let _config = {...config};
        if (inherit) {
            _config.inherit = {
                components,
                parsers,
                directives,
                modelFields,
                providers,
                useApps,
                maker,
                formulas,
                loadData
            }
        } else {
            delete _config.inherit;
        }
        return FormCreateFactory(_config);
    }

    /**
     * 设置 v-model 映射字段
     */
    function setModelField(name, field) {
        modelFields[name] = field;
    }

    /**
     * 设置全局公式
     */
    function setFormula(name, fn) {
        formulas[name] = fn;
    }

    /**
     * 设置渲染驱动 (用于跨平台适配)
     */
    function setDriver(name, driver) {
        const parent = drivers[name] || {};
        const parsers = parent.parsers || {};
        if (driver.parsers) {
            Object.keys(driver.parsers).forEach(k => {
                parsers[k] = setPrototypeOf(driver.parsers[k], BaseParser);
            });
        }
        driver.name = name;
        drivers[name] = {...parent, ...driver, parsers};
    }

    /**
     * 刷新特定数据 ID 绑定的组件
     */
    function refreshData(id) {
        if (id) {
            Object.keys(instance).forEach(v => {
                const apis = Array.isArray(instance[v]) ? instance[v] : [instance[v]];
                apis.forEach(that => {
                    that.bus.$emit('$loadData.' + id);
                })
            })
        }
    }

    /**
     * 设置全局外部数据源
     */
    function setData(id, data) {
        deepSet(loadData, id, data);
        refreshData(id);
    }

    /**
     * 设置数据驱动 (如 Cookie, LocalStorage)
     */
    function setDataDriver(id, data) {
        const callback = (...args) => {
            return invoke(() => data(...args));
        }
        callback._driver = true;
        setData(id, callback);
    }

    /**
     * 获取数据源的值
     */
    function getData(id, def) {
        const split = (id || '').split('.');
        id = split.shift();
        const field = split.join('.');
        if (!hasProperty(loadData, id)) {
            loadData[id] = defValueTag;
        }
        if (loadData[id] !== defValueTag) {
            let val = loadData[id];
            if (val && val._driver) {
                val = val(field);
            } else if (split.length) {
                val = deepGet(val, split);
            }
            return (val == null || val === '') ? def : val;
        } else {
            return def;
        }
    }

    function extendApi(fn) {
        extendApiFn.push(fn);
    }

    function removeData(id) {
        delete loadData[id];
        refreshData(id);
    }

    function on(name, callback) {
        listener.push({name, callback});
    }

    /**
     * FormCreate 实例构造函数
     * 每个 <form-create> 组件对应一个实例
     */
    function FormCreate(vm) {
        extend(this, {
            id: id++,
            create,
            vm,
            manager: createManager(config.manager),
            parsers,
            providers,
            modelFields,
            formulas,
            isMobile,
            rules: vm.props.rule,
            name: vm.props.name || uniqueId(),
            inFor: vm.props.inFor,
            prop: {
                components,
                directives,
            },
            get: null,
            drivers,
            renderDriver: null,
            refreshData,
            loadData,
            CreateNode,
            bus: new Mitt(), // 组件内部私有事件总线
            unwatch: [],
            options: ref({}),
            extendApiFn,
            fetchCache: new WeakMap(),
            tmpData: reactive({}), // 组件局部临时数据
        })

        // 注册全局监听器
        listener.forEach(item => {
            this.bus.$on(item.name, item.callback);
        });

        // 监听配置变化，触发刷新
        nextTick(() => {
            watch(this.options, () => {
                this.$handle.$manager.updateOptions(this.options.value);
                this.api().refresh();
            }, {deep: true})
        });

        // 将组件和指令注入 Vue 实例上下文
        extend(vm.appContext.components, components);
        extend(vm.appContext.directives, directives);

        // 核心处理器，负责规则解析和渲染调度
        this.$handle = new Handle(this)

        // 注册 API 到全局实例表
        if (this.name) {
            if (this.inFor) {
                if (!instance[this.name]) instance[this.name] = [];
                instance[this.name].push(this);
            } else {
                instance[this.name] = this;
            }
        }
    }

    FormCreate.isMobile = isMobile;

    extend(FormCreate.prototype, {
        /**
         * 实例初始化
         */
        init() {
            // 如果是子表单（嵌套在 group/subform 中），监听父表单配置变化
            if (this.isSub()) {
                this.unwatch.push(watch(() => this.vm.setupState.parent.setupState.fc.options.value, () => {
                    this.initOptions();
                    this.$handle.api.refresh();
                }, {deep: true, flush: 'sync'}));
            }
            // 确定渲染驱动
            if (this.vm.props.driver) {
                this.renderDriver = typeof this.vm.props.driver === 'object' ? this.vm.props.driver : this.drivers[this.vm.props.driver];
            }
            if (!this.renderDriver && this.vm.setupState.parent) {
                this.renderDriver = this.vm.setupState.parent.setupState.fc.renderDriver;
            }
            if (!this.renderDriver) {
                this.renderDriver = this.drivers.default;
            }
            this.initOptions();
            this.$handle.init();
        },

        /**
         * 转发调用驱动方法并触发事件
         */
        targetFormDriver(method, ...args) {
            this.bus.$emit(method, ...args);
            if (this.renderDriver && this.renderDriver[method]) {
                return invoke(() => this.renderDriver[method](...args));
            }
        },

        /**
         * 国际化翻译处理
         */
        t(id, params, get) {
            let value = get ? get('$t.' + id) : this.globalLanguageDriver(id);
            if (value == null) {
                value = '';
            }
            // 支持变量占位符替换，如 "hello {name}"
            if (value && params) {
                Object.keys(params).forEach(param => {
                    const regex = new RegExp(`{${param}}`, 'g');
                    value = value.replace(regex, params[param]);
                });
            }
            return value;
        },

        /**
         * 全局数据源驱动 (fetch 类型的 globalData)
         */
        globalDataDriver(id) {
            let split = id.split('.');
            const key = split.shift();
            const option = this.options.value.globalData && this.options.value.globalData[key];
            if (option) {
                if (option.type === 'static') {
                    return deepGet(option.data, split);
                } else {
                    // 处理异步 fetch 逻辑，支持缓存和自动刷新
                    let val;
                    const res = this.fetchCache.get(option);
                    if (res) {
                        if (res.status) {
                            val = deepGet(res.data, split);
                        }
                        if (!res.loading) {
                            return val;
                        }
                        res.loading = false;
                        this.fetchCache.set(option, res);
                    } else {
                        this.fetchCache.set(option, {status: false});
                    }
                    const reload = debounce(() => {
                        unwatch();
                        const res = this.fetchCache.get(option);
                        if ((this.options.value.globalData && Object.values(this.options.value.globalData).indexOf(option) !== -1)) {
                            if (res) {
                                res.loading = true;
                                this.fetchCache.set(option, res);
                            }
                            this.bus.$emit('$loadData.$globalData.' + key);
                        } else {
                            this.fetchCache.delete(option);
                        }
                    }, option.wait || 600)

                    const _emit = (data) => {
                        this.fetchCache.set(option, {status: true, data});
                        this.bus.$emit('$loadData.$globalData.' + key);
                    };

                    const callback = (get, change) => {
                        if (change && option.watch === false) {
                            return unwatch();
                        }
                        if (change) {
                            reload();
                            return;
                        }
                        const options = this.$handle.loadFetchVar(copy(option), get);
                        options.targetRule = this.targetRule;
                        this.$handle.api.fetch(options).then(res => {
                            _emit(res);
                        }).catch(e => {
                            _emit(null);
                        });
                    };
                    const unwatch = this.watchLoadData(callback);
                    if(option.watch === false) {
                        unwatch();
                    }
                    this.unwatch.push(unwatch);
                    return val;
                }
            }
        },

        getLocale() {
            let locale = this.vm.setupState.top.props.locale;
            if (locale && typeof locale === 'object') {
                return locale.name;
            }
            if (typeof locale === 'string') {
                return locale;
            }
            return 'zh-cn';
        },

        /**
         * 语言驱动：解析翻译词条
         */
        globalLanguageDriver(id) {
            let t = this.vm.setupState.top.props.t;
            let locale = this.vm.setupState.top.props.locale;
            let value = undefined;
            if (t) {
                value = invoke(() => t(id));
            }
            // 优先级：外部传入翻译函数 > 外部传入 locale 对象 > 配置中的 language > 内置基础语言包
            if (value == null && locale && typeof locale === 'object') {
                value = deepGet(locale, id);
            }
            if (value == null) {
                const language = this.options.value.language || {};
                const locale = this.getLocale();
                value = deepGet(language[locale] || {}, id);
                if (value == null) {
                    value = deepGet(baseLanguage[locale] || {}, id);
                }
            }
            return value;
        },

        /**
         * 全局变量驱动 (通过 handle 函数计算)
         */
        globalVarDriver(id) {
            let split = id.split('.');
            const key = split.shift();
            const option = this.options.value.globalVariable && this.options.value.globalVariable[key];
            if (option) {
                const handle = is.Function(option) ? option : parseFn(option.handle);
                if (handle) {
                    let val = handle((...args) => this.$handle.api.getData(...args), this.$handle.api);
                    return deepGet(val, split);
                }
            }
        },

        /**
         * 设置临时数据值并广播刷新
         */
        setData(id, data, isGlobal) {
            if (!isGlobal) {
                deepSet(this.vm.setupState.top.setupState.fc.tmpData, id, data);
                this.bus.$emit('$loadData.' + id);
            } else {
                setData(id, data);
            }
        },

        /**
         * 响应式数据解析引擎
         * 支持解析各种特殊作用域：$topForm, $scopeForm, $form, $options, $globalData, $var, $locale, $t, $preview
         */
        getLoadData(id, def) {
            let val = null;
            if (id != null) {
                let split = id.split('.');
                const key = split.shift();
                val = deepGet(this.vm.setupState.top.setupState.fc.tmpData, id);
                if (val != null) {
                    return val;
                } else if (key === '$topForm') {
                    val = this.$handle.api.top.formData(true);
                } else if (key === '$scopeForm') {
                    val = this.$handle.api.scope.formData(true);
                } else if (key === '$form') {
                    val = this.$handle.api.formData(true);
                } else if (key === '$options') {
                    val = this.options.value;
                } else if (key === '$globalData') {
                    val = this.globalDataDriver(split.join('.'));
                    split = [];
                } else if (key === '$var') {
                    val = this.globalVarDriver(split.join('.'));
                    split = [];
                } else if (key === '$locale') {
                    val = this.getLocale();
                    split = [];
                } else if (key === '$t') {
                    val = this.globalLanguageDriver(split.join('.'));
                    split = [];
                } else if (key === '$preview') {
                    return this.$handle.preview;
                } else {
                    val = getData(id);
                    split = [];
                }
                if (val && split.length) {
                    val = deepGet(val, split);
                }
            }
            return (val == null || val === '') ? def : val;
        },

        /**
         * 核心：数据监听收集引擎
         * 当在 loadData 指令或模板中使用变量时，该方法会自动收集依赖并建立监听
         */
        watchLoadData(fn, wait) {
            let unwatch = {};

            const run = (flag) => {
                if (!this.get) {
                    this.get = get;
                }
                invoke(() => {
                    fn(get, flag);
                });
                if (this.get === get) {
                    this.get = undefined;
                }
            };

            // 解析变量并建立监听的闭包函数
            const get = (id, def) => {
                let getValue;
                if (typeof id === 'object') {
                    getValue = id.getValue;
                    id = id.id;
                }
                if (unwatch[id]) {
                    return unwatch[id].val;
                }
                // 使用 Vue 的 computed 建立响应式链
                const data = computed(() => {
                    return getValue ? getValue() : this.getLoadData(id, def);
                })
                const split = id.split('.');
                const key = split.shift();
                const key2 = split.shift() || '';
                const callback = debounce(() => {
                    const temp = getValue ? getValue() : this.getLoadData(id, def);
                    if (!unwatch[id]) {
                        return;
                    } else if (((temp instanceof Function || is.Object(temp) || Array.isArray(temp)) && temp === unwatch[id].val) || JSON.stringify(temp) !== JSON.stringify(unwatch[id].val)) {
                        unwatch[id].val = temp;
                        run(true);
                    }
                }, wait || 0);

                // 监听 Vue 响应式数据
                const un = watch(data, (n) => {
                    callback();
                });

                // 同时监听自定义事件总线
                this.bus.$on('$loadData.' + key, callback);
                if (key2) {
                    this.bus.$on('$loadData.' + key + '.' + key2, callback);
                }

                // 保存清理函数
                unwatch[id] = {
                    fn: (() => {
                        this.bus.$off('$loadData.' + key, callback);
                        if (key2) {
                            this.bus.$off('$loadData.' + key + '.' + key2, callback);
                        }
                        un();
                    }),
                    val: data.value,
                }
                return data.value;
            }
            run(false);
            const un = () => {
                Object.keys(unwatch).forEach(k => unwatch[k].fn());
                unwatch = {};
            }
            this.unwatch.push(un);
            return un;
        },

        isSub() {
            return this.vm.setupState.parent && this.vm.props.extendOption;
        },

        /**
         * 初始化表单配置选项
         */
        initOptions() {
            this.options.value = {};
            let options = {
                formData: {},
                submitBtn: {},
                resetBtn: {},
                globalEvent: {},
                globalData: {}, ...deepCopy(globalConfig)
            };
            const isSubForm = this.isSub();
            // 如果是子表单，合并父表单配置
            if (isSubForm) {
                options = this.mergeOptions(options, this.vm.setupState.parent.setupState.fc.options.value || {}, true);
            }
            // 合并组件自身配置
            options = this.mergeOptions(options, this.vm.props.option);
            const api = this.api();
            this.targetFormDriver('initOptions', options, {api, isSubForm});
            this.updateOptions(options);
        },

        /**
         * 深度合并配置项
         */
        mergeOptions(target, opt, parent) {
            opt = {...opt || {}};
            // 子表单继承父表单时，排除掉一些不应继承的私有配置（如 DOM 元素、生命周期钩子等）
            parent && ['page', 'onSubmit', 'onReset', 'onCreated', 'onChange', 'onMounted', 'mounted', 'onReload', 'reload', 'formData', 'el', 'globalClass', 'style'].forEach((n) => {
                delete opt[n];
            });
            if (opt.global) {
                target.global = mergeGlobal(target.global, opt.global);
                delete opt.global;
            }
            this.$handle.$manager.mergeOptions([opt], target);
            return target;
        },

        /**
         * 更新并应用配置
         */
        updateOptions(options) {
            this.options.value = this.mergeOptions(this.options.value, options);
            this.$handle.$manager.updateOptions(this.options.value);
            this.bus.$emit('$loadData.$options');
        },

        api() {
            return this.$handle.api;
        },

        render() {
            return this.$handle.render();
        },

        mounted() {
            this.$handle.mounted();
        },

        /**
         * 实例销毁清理
         */
        unmount() {
            if (this.name) {
                if (this.inFor) {
                    const idx = instance[this.name].indexOf(this);
                    instance[this.name].splice(idx, 1);
                } else {
                    delete instance[this.name];
                }
            }
            listener.forEach(item => {
                this.bus.$off(item.name, item.callback);
            });
            this.tmpData = {};
            this.unwatch.forEach(fn => fn());
            this.unwatch = [];
            this.$handle.reloadRule([]);
        },

        updated() {
            this.$handle.bindNextTick(() => this.bus.$emit('next-tick', this.$handle.api));
        }
    })


    /**
     * 将核心 API 挂载到 formCreate 构造函数上
     */
    function useAttr(formCreate) {
        extend(formCreate, {
            version: config.version,
            ui: config.ui,
            isMobile,
            extendApi,
            getData,
            setDataDriver,
            setData,
            removeData,
            refreshData,
            maker,
            component,
            directive,
            setModelField,
            setFormula,
            setDriver,
            register,
            $vnode,
            parser,
            use,
            factory,
            componentAlias,
            copyRule,
            copyRules,
            mergeRule,
            fetch,
            $form,
            parseFn,
            parseJson,
            toJson,
            useApp,
            getApi,
            on,
        });
    }

    /**
     * 注册 Vue 插件安装方法
     */
    function useStatic(formCreate) {
        extend(formCreate, {
            create,
            install(app, options) {
                globalConfig = {...globalConfig, ...(options || {})}
                const key = `_installedFormCreate${isMobile ? 'Mobile' : ''}_${config.ui}`;
                if (app[key] === true) return;
                app[key] = true;

                // 定义 $formCreate 全局方法
                const $formCreate = function (rules, opt = {}) {
                    return create(rules, opt, this);
                };

                useAttr($formCreate);

                app.config.globalProperties.$formCreate = $formCreate;
                const $component = $form();
                app.component($component.name, $component);
                useApps.forEach(v => {
                    invoke(() => v(formCreate, app));
                })
            }
        })
    }

    useAttr(prototype);
    useStatic(prototype);

    // 默认数据驱动注册
    setDataDriver('$cookie', cookieDriver);
    setDataDriver('$localStorage', localStorageDriver);
    setDataDriver('$sessionStorage', sessionStorageDriver);

    CreateNode.use({fragment: 'fcFragment'});

    config.install && create.use(config);

    // 为所有组件注入 formCreateInject 属性
    useApp((_, app) => {
        app.mixin({
            props: ['formCreateInject'],
        })
    })

    parser(html);

    // 处理配置继承
    if (config.inherit) {
        const inherit = config.inherit;
        inherit.components && extend(components, inherit.components);
        inherit.parsers && extend(parsers, inherit.parsers);
        inherit.directives && extend(directives, inherit.directives);
        inherit.modelFields && extend(modelFields, inherit.modelFields);
        inherit.providers && extend(providers, inherit.providers);
        inherit.useApps && extend(useApps, inherit.useApps);
        inherit.maker && extend(maker, inherit.maker);
        inherit.loadData && extend(loadData, inherit.loadData);
        inherit.formulas && extend(formulas, inherit.formulas);
    }

    const FcComponent = $form();
    setPrototypeOf(FcComponent, prototype);
    Object.defineProperties(FcComponent, {
        fetch: {
            get() {
                return prototype.fetch;
            },
            set(val) {
                prototype.fetch = val;
            }
        }
    })

    FcComponent.util = prototype;

    return FcComponent;
}
