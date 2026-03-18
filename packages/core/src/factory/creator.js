import extend from '@form-create/utils/lib/extend';
import is from '@form-create/utils/lib/type';
import {attrs} from '../frame/attrs';
import {copyRule, mergeRule} from '../frame/util';
import {$set} from '@form-create/utils/lib/modify';

// rule 的基础结构。maker/Creator 最终都是在这个默认骨架上扩展。
export function baseRule() {
    return {
        props: {},
        on: {},
        options: [],
        children: [],
        hidden: false,
        display: true,
        value: undefined,
    };
}

// 返回某个 type 的构造函数，用于生成 maker.input/maker.select 这类快捷方法。
// init 可以是对象，也可以是函数，用于在创建时补充默认 props 或额外配置。
export function creatorFactory(name, init) {
    return (title, field, value, props = {}) => {
        const maker = new Creator(name, title, field, value, props);
        if (init) {
            if (is.Function(init)) init(maker);
            else maker.props(init);
        }
        return maker;
    };
}

// Creator 是 rule 的链式构造器。
// 所有 maker.xxx() 最终都会落到这里，内部维护的 _data 就是标准 rule 对象。
export default function Creator(type, title, field, value, props) {
    this._data = extend(baseRule(), {type, title, field, value, props: props || {}});
    this.event = this.on;
}

extend(Creator.prototype, {
    // 取出当前构造中的 rule 对象。
    getRule() {
        return this._data;
    },
    // 直接给 rule 设置某个属性，供链式调用继续使用。
    setProp(key, value) {
        $set(this._data, key, value);
        return this;
    },
    // 指定组件使用的 v-model 字段名。
    modelField(field) {
        this._data.modelField = field;
        return this;
    },
    // 深拷贝当前 Creator，避免后续链式操作污染原始 rule。
    _clone() {
        const clone = new this.constructor();
        clone._data = copyRule(this._data);
        return clone;
    },
})

// 把 attrs 中声明的扩展属性挂到 Creator 原型上。
// 这样就可以支持 maker.input(...).col(...).validate(...).info(...) 这种链式写法。
export function appendProto(attrs) {
    attrs.forEach(name => {
        Creator.prototype[name] = function (key) {
            mergeRule(this._data, {[name]: arguments.length < 2 ? key : {[key]: arguments[1]}})
            return this;
        };
    });
}

appendProto(attrs());
