/**
 * 规则指令系统 (Provider)
 * 负责处理规则中的特殊指令，如 loadData, fetch, t (国际化), componentValidate 等
 */
import {err} from '@form-create/utils/lib/console';
import {byCtx, deepGet, invoke, parseFn} from './util';
import is, {hasProperty} from '@form-create/utils/lib/type';
import deepSet from '@form-create/utils/lib/deepset';
import {deepCopy} from '@form-create/utils/lib/deepextend';
import toArray from '@form-create/utils/lib/toarray';
import debounce from '@form-create/utils/lib/debounce';
import {nextTick} from 'vue';
import {toPromise} from '@form-create/utils';

/**
 * loadData 指令
 * 用于根据模板动态加载并监听数据变化，自动更新组件属性
 * 示例：{ type: 'input', loadData: [{ attr: 'options', template: '{{$form.data}}' }] }
 */
const loadData = function (fc) {
    const loadData = {
        name: 'loadData',
        _fn: [], // 存储取消监听的函数
        // 指令加载时的回调
        loaded(inject, rule, api) {
            this.deleted(inject);
            nextTick(() => {
                let attrs = toArray(inject.getValue());
                const unwatchs = [];
                attrs.forEach(attr => {
                    if (attr && (attr.attr || attr.template)) {
                        // 执行更新的逻辑函数
                        let fn = (get) => {
                            let group;
                            if (rule && rule.__fc__) {
                                group = rule.__fc__.getParentGroup();
                            }
                            let value;
                            // 优先级：template > handler > attr
                            if (attr.template) {
                                // 解析模板变量
                                value = fc.$handle.loadStrVar(attr.template, get, group ? {rule, value: (fc.$handle.subRuleData[group.id] || {})} : null);
                            } else if (attr.handler && is.Function(attr.handler)) {
                                // 自定义处理函数
                                value = attr.handler(get, rule, api);
                            } else {
                                // 默认按照字段名解析
                                value = fc.$handle.loadStrVar(`{{${attr.attr}}}`, get, group ? {rule, value: (fc.$handle.subRuleData[group.id] || {})} : null);
                            }
                            // 处理默认值
                            if ((value == null || value === '') && attr.default != null) {
                                value = attr.default;
                            }
                            // 是否深拷贝值
                            if (attr.copy !== false) {
                                value = deepCopy(value)
                            }
                            // 确定修改目标（是修改原始 rule 还是组件 props）
                            const _rule = (attr.modify ? rule : inject.getProp());
                            // 设置值到目标属性
                            if (attr.to === 'child') {
                                if (_rule.children) {
                                    _rule.children[0] = value;
                                } else {
                                    _rule.children = [value];
                                }
                            } else {
                                deepSet(_rule, attr.to || 'options', value);
                            }
                            // 同步规则状态
                            api.sync(rule);
                        };
                        let callback = (get) => fn(get);
                        // 注册数据监听
                        const unwatch = fc.watchLoadData(callback);
                        // 增加防抖处理
                        fn = debounce(fn, attr.wait || 300)
                        // 根据配置决定是否持续监听
                        if (attr.watch !== false) {
                            unwatchs.push(unwatch);
                        } else {
                            unwatch(); // 立即执行一次后取消监听
                        }
                    }
                })
                this._fn[inject.id] = unwatchs;
            });
        },
        // 指令移除时的清理
        deleted(inject) {
            if (this._fn[inject.id]) {
                this._fn[inject.id].forEach(un => {
                    un();
                })
                delete this._fn[inject.id];
            }
            inject.clearProp();
        },
    };
    loadData.watch = loadData.loaded;
    return loadData;
}

/**
 * t 指令
 * 用于属性的多语言翻译（国际化）
 * 示例：{ type: 'input', t: { title: 'user.name' } }
 */
const t = function (fc) {
    const t = {
        name: 't',
        _fn: [],
        loaded(inject, rule, api) {
            this.deleted(inject);
            let attrs = inject.getValue() || {};
            const unwatchs = [];
            Object.keys(attrs).forEach(key => {
                const attr = attrs[key];
                if (attr) {
                    const isObj = typeof attr === 'object';
                    // 翻译执行函数
                    let fn = (get) => {
                        // 调用 fc.t 执行翻译，支持传参
                        let value = fc.t(isObj ? attr.attr : attr, isObj ? attr.params : null, get);
                        const _rule = ((isObj && attr.modify) ? rule : inject.getProp());
                        if (key === 'child') {
                            if (_rule.children) {
                                _rule.children[0] = value;
                            } else {
                                _rule.children = [value];
                            }
                        } else {
                            deepSet(_rule, key, value);
                        }
                        api.sync(rule);
                    };
                    let callback = (get) => fn(get);
                    // 监听语言切换
                    const unwatch = fc.watchLoadData(callback);
                    fn = debounce(fn, attr.wait || 300)
                    if (attr.watch !== false) {
                        unwatchs.push(unwatch);
                    } else {
                        unwatch();
                    }
                }
            })
            this._fn[inject.id] = unwatchs;
        },
        deleted(inject) {
            if (this._fn[inject.id]) {
                this._fn[inject.id].forEach(un => {
                    un();
                })
                delete this._fn[inject.id];
            }
            inject.clearProp();
        },
    };
    t.watch = t.loaded;
    return t;
}

/**
 * componentValidate 指令
 * 用于在自定义组件内实现验证逻辑
 */
const componentValidate = {
    name: 'componentValidate',
    load(attr, rule, api) {
        let options = attr.getValue();
        // 如果未配置或明确禁用
        if (!options || options.method === false) {
            attr.clearProp();
            api.clearValidateState([rule.field]);
        } else {
            if (!is.Object(options)) {
                options = {method: options};
            }
            const method = options.method;
            // 构建 async-validator 格式的验证器
            const validate = {
                ...options,
                validator(...args) {
                    const ctx = byCtx(rule);
                    if (ctx) {
                        // 调用组件内部暴露的方法执行验证
                        return api.exec(ctx.id, is.String(method) ? method : 'formCreateValidate', ...args, {
                            attr,
                            rule,
                            api
                        });
                    }
                }
            };
            delete validate.method;
            // 将生成的验证器添加到规则中
            attr.getProp().validate = [validate];
        }
    },
    watch(...args) {
        componentValidate.load(...args);
    }
};

/**
 * fetch 指令
 * 用于远程加载数据（自动执行接口请求并更新组件属性）
 */
const fetch = function (fc) {

    // 格式化配置
    function parseOpt(option) {
        if (is.String(option)) {
            option = {
                action: option,
                to: 'options'
            }
        }
        return option;
    }

    // 执行请求核心逻辑
    function run(inject, rule, api) {
        let option = inject.value;
        fetchAttr.deleted(inject);
        // 支持函数动态返回配置
        if (is.Function(option)) {
            option = option(rule, api);
        }
        option = parseOpt(option);

        // 设置结果数据
        const set = (val) => {
            if (val === undefined) {
                inject.clearProp();
            } else {
                // 默认更新到 props.options
                deepSet(inject.getProp(), option.to || 'options', val);
            }
            // 全局数据缓存处理
            if (val != null && option && option.key && fc.$handle.options.globalData[option.key]) {
                fc.fetchCache.set(fc.$handle.options.globalData[option.key], {status: true, data: val});
            }
            api.sync(rule);
        }

        if (!option || (!option.action && !option.key)) {
            set(undefined);
            return;
        }
        option = deepCopy(option);
        if (!option.to) {
            option.to = 'options';
        }

        const onError = option.onError;

        const check = () => {
            if (!inject.getValue()) {
                inject.clearProp();
                api.sync(rule);
                return true;
            }
        }
        // 监听并执行请求（带防抖）
        fetchAttr._fn[inject.id] = fc.watchLoadData(debounce((get, change) => {
            if (change && option.watch === false) {
                return fetchAttr._fn[inject.id]();
            }
            // 如果是获取全局共享数据
            if(option.key) {
                fc.targetRule = rule;
                const res = get('$globalData.' + option.key);
                delete fc.targetRule;
                if (res) {
                    if (check()) return;
                    set(res);
                }
                return ;
            }
            // 解析请求地址中的变量 {{field}}
            const _option = fc.$handle.loadFetchVar(deepCopy(option), get, rule);
            const config = {
                headers: {},
                ..._option,
                onSuccess(body, flag) {
                    if (check()) return;
                    // 处理数据解析逻辑（提取 data 字段或使用 parse 函数）
                    let fn = (v) => flag ? v : (hasProperty(v, 'data') ? v.data : v);
                    const parse = parseFn(_option.parse);
                    if (is.Function(parse)) {
                        fn = parse;
                    } else if (parse && is.String(parse)) {
                        fn = (v) => {
                            return deepGet(v, parse);
                        }
                    }
                    toPromise(fn(body, rule, api)).then(res => {
                        set(res);
                    })
                },
                onError(e) {
                    set(undefined);
                    if (check()) return;
                    (onError || ((e) => err(e.message || 'fetch fail ' + _option.action)))(e, rule, api);
                }
            };
            // 执行请求前钩子
            fc.$handle.beforeFetch(config, {rule, api}).then(() => {
                // 如果 action 是函数，手动处理
                if (is.Function(_option.action)) {
                    toPromise(_option.action(rule, api)).then((val) => {
                        config.onSuccess(val, true);
                    }).catch((e) => {
                        config.onError(e);
                    });
                    return;
                }
                // 调用 fc 内部的 fetch 实现（通常是 axios/fetch 的包装）
                invoke(() => fc.create.fetch(config, {inject, rule, api}));
            }).catch(e => {});
        }, option.wait || 600));
    }

    const fetchAttr = {
        name: 'fetch',
        _fn: [],
        loaded(...args) {
            run(...args);
        },
        watch(...args) {
            run(...args);
        },
        deleted(inject) {
            if (this._fn[inject.id]) {
                this._fn[inject.id](); // 执行取消监听
                delete this._fn[inject.id];
            }
            inject.clearProp();
        },
    };

    return fetchAttr;
}


export default {
    fetch,
    loadData,
    t,
    componentValidate,
};
