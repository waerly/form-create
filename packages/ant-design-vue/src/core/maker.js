import {creatorFactory} from '@form-create/core/src/index';

// 这个文件的作用是为 ant-design-vue 场景扩展 maker 快捷构造方法。
// 业务侧通过 maker.input/maker.upload/maker.frameInput 这类 API 构造 rule，
// 最终仍然会回到 core 的 Creator，只是这里额外补充了当前 UI 包专属的别名、
// 默认 props 和组合型快捷方法，减少业务层直接手写 rule 的成本。
const maker = {};

// 注册当前 UI 包需要的基础别名方法。
// 例如让业务层可以直接使用 maker.formula()、maker.slotContainer()。
function useAlias(maker) {
    ['treeSelect', 'upload', 'frame', 'autoComplete', 'cascader', 'datePicker', 'frame', 'inputNumber',  'inputPassword', 'radio', 'rate', 'switch', 'rate', 'slider', 'timePicker', 'slotContainer', 'formula', 'title','demo'].reduce((maker, name) => {
        maker[name] = creatorFactory(name);
        return maker;
    }, maker);
    maker.auto = maker.autoComplete;
    maker.number = maker.inputNumber;
    maker.time = maker.timePicker;
    maker.password = maker.inputPassword;
    maker.slot = maker.slotContainer;
}

// 基于 frame 组件再封装一层更具体的快捷方法。
// 例如 frameFiles/frameImageOne，本质上都是 frame，只是预置了 type 和 maxLength。
function useFrame(maker) {
    const types = {
        frameInputs: ['input', 0],
        frameFiles: ['file', 0],
        frameImages: ['image', 0],
        frameInputOne: ['input', 1],
        frameFileOne: ['file', 1],
        frameImageOne: ['image', 1]
    };

    Object.keys(types).reduce((maker, key) => {
        maker[key] = creatorFactory('frame', m => m.props({type: types[key][0], maxLength: types[key][1]}));
        return maker
    }, maker);

    maker.frameInput = maker.frameInputs;
    maker.frameFile = maker.frameFiles;
    maker.frameImage = maker.frameImages;
}

// 提供 range 模式的 slider 快捷方法。
function useSlider(maker) {
    maker['sliderRange'] = creatorFactory('slider', {range: true})
}

// 为 select 预置不同的 mode，减少业务侧重复写 props。
function useSelect(m) {
    const name = 'select';
    m.selectMultiple = creatorFactory(name, {mode:'multiple'});
    m.selectTags = creatorFactory(name, {mode: 'tags'});
    m.selectCombobox = creatorFactory(name, {mode:'combobox'});
}

// 基于 upload 组件封装常用上传场景。
// 例如 image/file/uploadImageOne，本质上是 upload + 预设 uploadType/maxLength。
function useUpload(maker) {
    const types = {
        image: ['image', 0],
        file: ['file', 0],
        uploadFileOne: ['file', 1],
        uploadImageOne: ['image', 1],
    };

    Object.keys(types).reduce((maker, key) => {
        maker[key] = creatorFactory('upload', m => m.props({uploadType: types[key][0], maxLength: types[key][1]}));
        return maker
    }, maker);

    maker.uploadImage = maker.image;
    maker.uploadFile = maker.file;
}

useAlias(maker);
useSlider(maker);
useFrame(maker);
useUpload(maker);
useSelect(maker);

export default maker;
