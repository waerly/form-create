/**
 * 依赖注入模块
 * 负责处理事件注入、模板变量解析和数据绑定
 */
import extend from '@form-create/utils/lib/extend';
import is, {hasProperty} from '@form-create/utils/lib/type';
import toLine from '@form-create/utils/lib/toline';
import {deepGet, extractVar, invoke, parseFn, parseTemplateToTree} from '../frame/util';
import toCase from '@form-create/utils/lib/tocase';

/**
 * 为 Handler 原型添加依赖注入相关方法
 * @param {Object} Handler - 处理器类
 */
export default function useInject(Handler) {
    extend(Handler.prototype, {
        /**
         * 解析需要注入的事件
         * @param {Object} rule - 规则对象
         * @param {Object} on - 事件对象
         * @returns {Object} 解析后的事件对象
         */
        parseInjectEvent(rule, on) {
            const inject = rule.inject || this.options.injectEvent;
            return this.parseEventLst(rule, on, inject);
        },
        /**
         * 解析事件列表，遍历处理每个事件
         * @param {Object} rule - 规则对象
         * @param {Object} data - 事件数据对象
         * @param {*} inject - 注入配置
         * @param {Boolean} deep - 是否深度解析
         * @returns {Object} 处理后的事件数据
         */
        parseEventLst(rule, data, inject, deep) {
            Object.keys(data).forEach(k => {
                const fn = this.parseEvent(rule, data[k], inject, deep);
                if (fn) {
                    data[k] = fn;
                }
            });
            return data;
        },
        /**
         * 解析单个事件处理函数
         * - 如果是函数且需要注入，则进行依赖注入
         * - 如果是数组，递归解析
         * - 如果是字符串，尝试解析为函数
         * @param {Object} rule - 规则对象
         * @param {Function|Array|String} fn - 事件处理函数
         * @param {*} inject - 注入配置
         * @param {Boolean} deep - 是否深度解析
         * @returns {Function|undefined} 处理后的函数
         */
        parseEvent(rule, fn, inject, deep) {
            if (is.Function(fn) && ((inject !== false && !is.Undef(inject)) || fn.__inject)) {
                return this.inject(rule, fn, inject)
            } else if (!deep && Array.isArray(fn) && fn[0] && (is.String(fn[0]) || is.Function(fn[0]))) {
                return this.parseEventLst(rule, fn, inject, true);
            } else if (is.String(fn)) {
                const val = parseFn(fn);
                if (val && fn !== val) {
                    return val.__inject ? this.parseEvent(rule, val, inject, true) : val;
                }
            }
        },
        /**
         * 解析组件的 emit 事件配置
         * 将规则中定义的 emit 转换为实际的事件处理器
         * @param {Object} ctx - 上下文对象
         * @returns {Object} 事件对象
         */
        parseEmit(ctx) {
            let event = {}, rule = ctx.rule, {emitPrefix, field, name, inject} = rule;
            let emit = rule.emit || [];
            // 遍历 emit 数组，为每个事件创建处理器
            if (is.trueArray(emit)) {
                emit.forEach(eventName => {
                    if (!eventName) return;
                    let eventInject;
                    // 确定事件前缀，优先级：emitPrefix > field > name
                    let emitKey = emitPrefix || field || name;
                    // 如果 eventName 是对象，提取其配置
                    if (is.Object(eventName)) {
                        eventInject = eventName.inject;
                        eventName = eventName.name;
                        emitKey = eventName.prefix || emitKey;
                    }
                    if (emitKey) {
                        // 生成事件 key，格式：emitKey-eventName（转为短横线命名）
                        const fieldKey = toLine(`${emitKey}-${eventName}`);
                        // 创建事件处理函数
                        const fn = (...arg) => {
                            //// 清理 Vue 3 的 emitsOptions
                            if (this.vm.emitsOptions && !this.vm.emitsOptions[fieldKey]) {
                                this.vm.emitsOptions[fieldKey] = null;
                            }
                            // 触发 Vue 组件事件
                            this.vm.emit(fieldKey, ...arg);
                            // 触发通用 emit-event 事件
                            this.vm.emit('emit-event', fieldKey, ...arg);
                            // 触发事件总线
                            this.bus.$emit(fieldKey, ...arg);
                        };
                        fn.__emit = true;

                        // 根据注入配置决定是否进行依赖注入
                        if (!eventInject && inject === false) {
                            //// 不注入，直接使用原函数
                            event[toCase(eventName)] = fn;
                        } else {
                            // 进行依赖注入
                            let _inject = eventInject || inject || this.options.injectEvent;
                            event[toCase(eventName)] = is.Undef(_inject) ? fn : this.inject(rule, fn, _inject);
                        }
                    }

                });
            }
            // 将事件对象挂载到上下文的 computed.on
            ctx.computed.on = event;
            return event;
        },
        /**
         * 获取要注入的数据对象
         * @param {Object} self - 当前规则对象
         * @param {*} inject - 注入配置
         * @returns {Object} 注入数据对象，包含：
         *   - $f/api: form-create API 实例
         *   - rule: 规则对象
         *   - self: 原始规则对象
         *   - option: 表单配置选项
         *   - inject: 注入配置
         */
        getInjectData(self, inject) {
            const $api = self.__fc__ && self.__fc__.$api;
            const vm = (self.__fc__ && self.__fc__.$handle.vm) || this.vm;
            const {option, rule} = vm.props;
            return {
                $f: $api || this.api,
                api: $api || this.api,
                rule,
                self: self.__origin__,
                option,
                inject
            };
        },
        /**
         * 核心注入方法：为函数注入依赖
         * 将 form-create 的上下文数据（api、rule、option 等）注入到函数的第一个参数
         * @param {Object} self - 当前规则对象
         * @param {Function} _fn - 要注入的原始函数
         * @param {*} inject - 注入配置
         * @returns {Function} 注入后的函数，第一个参数为注入的数据对象
         * @example
         * // 原函数：onChange(value) {}
         * // 注入后：onChange(inject, value) { inject.api, inject.rule ... }
         */
        inject(self, _fn, inject) {
            // 如果已经注入过，避免重复注入
            if (_fn.__origin) {
                if (this.watching && !this.loading)
                    return _fn;
                _fn = _fn.__origin;
            }

            const h = this;

            // 创建包装函数，将注入数据作为第一个参数
            const fn = function (...args) {
                const data = h.getInjectData(self, inject);
                data.args = [...args]; // 保存原始参数
                args.unshift(data); // 将注入数据放在第一个参数位置
                return _fn.apply(this, args);
            };
            fn.__origin = _fn; // 保存原始函数引用
            fn.__json = _fn.__json; // 保留 JSON 序列化标记
            return fn;
        },
        /**
         * 解析字符串中的模板变量 {{变量名}}
         * 支持：
         * - 基础变量：{{field}}
         * - 嵌套属性：{{user.name}}
         * - 默认值：{{field || 默认值}}
         * - 分组数据：{{$form.field}}（在 group 组件中）
         * @param {String} str - 包含模板变量的字符串
         * @param {Function} get - 获取字段值的函数
         * @param {Object} group - 分组上下文（可选）
         * @returns {String|*} 解析后的值，如果整个字符串是单个变量则返回变量值本身
         */
        loadStrVar(str, get, group) {
            // 检查字符串是否包含模板变量标记 {{ }}
            if (str && typeof str === 'string' && str.indexOf('{{') > -1 && str.indexOf('}}') > -1) {
                const tmp = str; // 保存原始字符串
                const vars = extractVar(str); // 提取所有变量名

                /**
                 * 获取字段值的内部函数
                 * @param {String} field - 字段名
                 * @returns {*} 字段值
                 */
                const getValue = (field) => {
                    let flag = false;
                    let val;
                    // 处理分组内的表单字段引用 $form.xxx
                    if (group && field.indexOf('$form.') === 0) {
                        const _split = field.split('.');
                        _split.shift(); // 移除 '$form'
                        if (hasProperty(group.value, _split[0])) {
                            flag = true;
                            val = get ? get({
                                id: '$form.' + _split[0] + '_' + group.rule.__fc__.id,
                                getValue: () => {
                                    return deepGet(group.value, _split);
                                }
                            }) : deepGet(group.value, _split);
                        }
                    }
                    // 获取普通字段值
                    if (!flag) {
                        val = get ? get(field) : this.fc.getLoadData(field)
                    }
                    return val;
                }

                /**
                 * 将解析树转换为实际值
                 * 处理嵌套属性访问，如：user.profile.name
                 * @param {Array} tree - 解析后的语法树
                 * @returns {*} 实际值
                 */
                const treeToVal = (tree) => {
                    const fields = [];
                    // 遍历语法树节点
                    tree.forEach(item => {
                        if (item.key) {
                            fields.push(item.key);
                        } else if (item.children) {
                            // 递归处理子节点
                            fields.push(treeToVal(item.children));
                        }
                    })
                    let flag = false;
                    // 处理字符串字面量（去除引号）
                    fields.forEach((field, idx) => {
                        if (field != null && (field.indexOf('\'') === 0 || field.indexOf('"') === 0)) {
                            fields[idx] = field.slice(1, -1) // 去除首尾引号
                            flag = true;
                        }
                    })
                    // 如果是单个字段且为字符串字面量或数字，直接返回
                    if (fields.length === 1 && (flag || !isNaN(Number(fields[0])))) {
                        return fields[0];
                    }
                    // 否则拼接为路径并获取值
                    return getValue(fields.join('.'));
                }

                let lastVal;
                // 遍历所有变量进行替换
                vars.forEach(v => {
                    const split = v.split('||'); // 分离变量名和默认值
                    const field = split[0].trim();
                    if (field) {
                        const def = (split[1] || '').trim(); // 默认值
                        const tree = parseTemplateToTree(field); // 解析为语法树
                        let val = invoke(() => treeToVal(tree)); // 安全执行，防止异常
                        // 如果值为空且有默认值，使用默认值
                        if ((val == null || val === '') && split.length > 1) {
                            val = def;
                        }
                        lastVal = val;
                        // 替换字符串中的变量标记
                        str = str.replaceAll(`{{${v}}}`, val == null ? '' : val);
                    }
                })
                // 如果整个字符串就是一个变量，返回变量的原始值（保留类型）
                if (vars.length === 1 && tmp === `{{${vars[0]}}}`) {
                    return lastVal;
                }
            }
            return str;
        },
        /**
         * 加载并解析 fetch 请求配置中的变量
         * 用于处理接口请求时的动态参数，如 action、headers、data、query
         * @param {Object} options - fetch 配置对象
         * @param {Function} get - 获取字段值的函数
         * @param {Object} rule - 规则对象
         * @returns {Object} 解析后的配置对象
         */
        loadFetchVar(options, get, rule) {
            let group;
            // 获取父级分组上下文
            if (rule && rule.__fc__) {
                group = rule.__fc__.getParentGroup();
            }
            // 创建加载函数，传递分组上下文
            const loadVal = str => {
                return this.loadStrVar(str, get, group ? {rule, value: (this.subRuleData[group.id] || {})} : null);
            }

            // 解析请求地址
            options.action = loadVal(options.action || '');

            // 解析 headers、data、query 中的变量
            ['headers', 'data', 'query'].forEach(key => {
                if (options[key]) {
                    const data = Array.isArray(options[key]) ? [] : {};
                    // 遍历每个键值对，解析其中的变量
                    Object.keys(options[key]).forEach(k => {
                        data[loadVal(k)] = loadVal(options[key][k]);
                    });
                    options[key] = data;
                }
            });

            return options;
        }
    })
}
