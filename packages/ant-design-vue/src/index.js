import antdvFormCreate from './core/index';
import formHelper from '@form-create/utils/src/formHelper';

// 👇 临时加这一行（强制触发 JSX 转译）
// const _TEST_ = () => <div>test</div>;

const FormCreate = antdvFormCreate();

if (typeof window !== 'undefined') {
    window.formCreate = FormCreate;
    window.formHelper = formHelper;
}

const maker = FormCreate.maker;

export {maker, formHelper}

export default FormCreate;
