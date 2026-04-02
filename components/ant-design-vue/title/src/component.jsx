/**
 * fcTitle 组件 - 纯展示性标题组件
 * 用于在表单中添加分组标题或说明文字
 */
import {defineComponent} from 'vue';
import './style.css';

const NAME = 'fcTitle';

export default defineComponent({
    name: NAME,
    props: {
        // 标题内容
        title: {
            type: String,
            default: '标题2'
        },
        // 标题级别 (对应 h1-h6)
        level: {
            type: Number,
            default: 3,
            validator: (value) => value >= 1 && value <= 6
        },
        // 是否显示分割线
        showDivider: {
            type: Boolean,
            default: true
        },
        // 分割线位置: top, bottom, both
        dividerPosition: {
            type: String,
            default: 'bottom'
        },
        // 文字对齐方式
        align: {
            type: String,
            default: 'left' // left, center, right
        },
        // 自定义样式
        style: {
            type: Object,
            default: () => ({})
        },
        // 自定义类名
        className: {
            type: String,
            default: ''
        },
        // 描述文字（副标题）
        description: {
            type: String,
            default: ''
        },
        // form-create 注入
        formCreateInject: Object,
    },
    computed: {
        containerClass() {
            return [
                '_fc-title-container',
                `_fc-title-align-${this.align}`,
                this.className
            ];
        },
        showTopDivider() {
            return this.showDivider && (this.dividerPosition === 'top' || this.dividerPosition === 'both');
        },
        showBottomDivider() {
            return this.showDivider && (this.dividerPosition === 'bottom' || this.dividerPosition === 'both');
        }
    },
    render() {
        const Tag = `h${this.level}`;

        return (
            <div class={this.containerClass} style={this.style}>
                {this.showTopDivider && <div class="_fc-title-divider"></div>}

                <div class="_fc-title-content">
                    <Tag class="_fc-title-text">{this.title}</Tag>
                    {this.description && (
                        <div class="_fc-title-description">{this.description}</div>
                    )}
                </div>

                {this.showBottomDivider && <div class="_fc-title-divider"></div>}
            </div>
        );
    }
});
