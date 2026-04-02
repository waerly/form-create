import {defineComponent, Fragment, h} from 'vue';
import './style.css';

const NAME = 'fcSiSlot';

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    inject: ['parentFC'],
    props: {
        // 插槽名称，对应 <template #xxx> 里的 xxx，默认 block_default
        name: {
            type: String,
            default: ''
        },
        formCreateInject: Object,
    },
    computed: {
        slotName() {
            return this.name || 'block_default';
        },
        slotArg() {
            const inject = this.formCreateInject || {};
            const rule = inject.rule || {};
            const prop = rule.__fc__?.prop || {};
            return {
                rule,
                prop,
                preview: inject.preview,
                api: inject.api,
                model: prop.model || {},
                field: rule.field || '',
            };
        },
    },
    methods: {
        getSlot() {
            const find = (n) => {
                if (n) {
                    const slot = n.slots?.[this.slotName];
                    return slot || find(n.setupState?.parent);
                }
            };
            return find(this.parentFC);
        },
    },
    render() {
        const slot = this.getSlot();
        if (slot) {
            return h(Fragment, {}, [slot(this.slotArg)]);
        }
        return h('div', {class: '_fc-si-slot-empty'}, [
            h('div', {class: '_fc-si-slot-empty-icon'}, ['📦']),
            h('div', {class: '_fc-si-slot-empty-text'}, [
                `插槽容器：#${this.slotName}`,
                h('div', {class: '_fc-si-slot-empty-hint'}, [
                    `请在 form-create 上定义 <template #${this.slotName} /> 插槽`
                ]),
            ]),
        ]);
    },
});
