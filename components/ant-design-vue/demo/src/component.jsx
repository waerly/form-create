import {defineComponent} from 'vue';
import {Input} from 'ant-design-vue';

const NAME = 'fcDemo';

export default defineComponent({
    name: NAME,
    inheritAttrs: false,
    formCreateParser: {
        toFormValue(value) {
            return value;
        },
        toValue(value) {
            return value;
        }
    },
    props: {
        modelValue: {
            type: [String, Number, Object, Array],
            default: ''
        },
        formCreateInject: Object,
    },
    emits: ['update:modelValue', 'change'],
    methods: {
        input(value) {
            this.$emit('update:modelValue', value);
            this.$emit('change', value);
        }
    },
    render() {
        return (
            <div>
                <p>{this.modelValue}</p>
                <Input
                    {...this.$attrs}
                    value={this.modelValue}
                    onUpdate:value={this.input}
                />
            </div>

        );
    }
});
