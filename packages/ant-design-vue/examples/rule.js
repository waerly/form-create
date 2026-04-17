import {maker} from '../src';
import formHelper from "@form-create/utils/src/formHelper";

window.mock = rule;
const uploadBaseUrl = (window.SI_UPLOAD_BASE_URL || 'http://localhost:9303').replace(/\/$/, '');
const uploadAction = window.SI_UPLOAD_ACTION || `${uploadBaseUrl}/base/file/upload`;
const mockUserList = [
    { id: '1', username: 'admin', nickName: '管理员', account: 'admin' },
    { id: '2', username: 'waerly', nickName: 'Waerly', account: 'waerly' },
    { id: '3', username: 'demo.user', nickName: '演示用户', account: 'demo.user' }
];
//使用maker 生成器生成
export default function rule() {
    var mock;
    return mock = [

        //测试demo
        maker.demo('演示组件', 'demo_field', 'hello').props({
            placeholder: '请输入内容'
        }),

        //测试使用新的方式生成
        formHelper.input('username', '用户名', { required: true,value:"waerly" }),

        //hidden 组件
        maker.hidden('id', '14'),
        //自定义标题
        maker.create('fcTitle', 'fcTitle', '标题').props({

        }),
        //插槽容器组件
        maker.create('fcSlotContainer', 'mySlot', '自定义插槽区域').props({
            border: true,
            padding: 20,
            slotName: 'customSlot',  // 插槽名称
            style: { background: '#f5f5f5' },
        }),
        //自定义组件
        maker.create('testSlot', 'testSlot', 'testSlotTitle').children([
            maker.input('', 'asd').props({type:'search'}).slot('asd'),
            maker.input('', 'asd23').slot('asd'),
        ]),

        maker.treeSelect('树选择', 'treeSelect', ['0-1', '0-1-1', '0-1-2']).props({
            treeCheckable: true,
            allowClear: true,
            treeData: [
                {
                    title: 'Node1',
                    value: '0-0',
                    children: [
                        {
                            title: 'Child Node1',
                            value: '0-0-0',
                        },
                    ],
                },
                {
                    title: 'Node2',
                    value: '0-1',

                    children: [
                        {
                            title: 'Child Node3',
                            value: '0-1-0',
                            disabled: true,
                        },
                        {
                            title: 'Child Node4',
                            value: '0-1-1',
                        },
                        {
                            title: 'Child Node5',
                            value: '0-1-2',
                        },
                    ],
                },
            ]
        }),

        //cascader 多级联动组件
        maker.cascader({title: '所在区域', style: 'color:red'}, 'address', ['陕西省', '西安市', '新城区']).effect({address: 1}),


        //input 输入框组件
        maker.input('商品名称', 'goods_name', 'iphone').props({
            placeholder: '请输入商品名称',
            clearable: true,
            disabled: false,
        }).validate([
            {required: true, message: '请输入商品名称', trigger: 'blur'}
        ]).emit(['change']).className('goods-name').children([
            maker.create('template').children(['append']).slot('addonAfter')
        ]).info({info: '请输入商品名称!!!!!', type: 'tooltip'}),



        //autoComplete 自动选择组件
        maker.auto('自动完成', 'auto', 'xaboy').props({options: [{value: 'aaa'}, {value: 'bbb'}]}).on({
            search: function (inject, value) {
                inject.self.props({options: !value ? [] : [{value}, {value: value + value}, {value: value + value + value}]});
            }
        }).emitPrefix('xaboy').emit(['change']).inject(true),

        maker.siUpload('业务附件', 'si_upload_demo', []).props({
            action: uploadAction,
            name: 'file_data',
            uploadProvider: 'oneBoot',
            isPrivate: 0,
            previewSize: 'small',
            uploadText: '上传文件',
            uploadTip: `当前测试地址：${uploadAction}`,
            limit: 3,
            maxSize: 10,
            accept: '.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.png,.jpg'
        }),

        maker.siImageUpload('封面图片', 'si_image_upload_demo', []).props({
            action: uploadAction,
            name: 'file_data',
            uploadProvider: 'oneBoot',
            isPrivate: 0,
            previewSize: 'small',
            uploadText: '上传图片',
            uploadTip: `当前测试地址：${uploadAction}`,
            limit: 1,
            maxSize: 5
        }),

        maker.siRichEditor2('富文本2', 'si_rich_editor2_demo', '<p>示例内容</p>').props({
            uploadProvider: 'oneBoot',
            action: uploadAction,
            name: 'file_data',
            isPrivate: 0,
            maxFileSize: 10,
            height: 320,
            placeholder: '请输入富文本内容'
        }),

        maker.siUserPicker('用户选择', 'si_user_picker_demo', '').props({
            placeholder: '请选择用户',
            pageSize: 20,
            request: async ({ keyword }) => {
                const currentKeyword = String(keyword || '').trim().toLowerCase();
                return mockUserList.filter(item => {
                    if (!currentKeyword) return true;
                    return [item.username, item.nickName, item.account]
                        .filter(Boolean)
                        .some(text => String(text).toLowerCase().includes(currentKeyword));
                });
            },
            detailRequest: async ids => {
                const idList = Array.isArray(ids) ? ids : [ids];
                const idSet = new Set(idList.map(id => String(id)));
                return mockUserList.filter(item => idSet.has(String(item.id)));
            },
            labelField: 'username',
            valueField: 'id'
        }),

        maker.siUserPicker('用户多选', 'si_user_picker_multi_demo', ['1', '3']).props({
            placeholder: '请选择多个用户',
            multiple: true,
            pageSize: 20,
            request: async ({ keyword }) => {
                const currentKeyword = String(keyword || '').trim().toLowerCase();
                return mockUserList.filter(item => {
                    if (!currentKeyword) return true;
                    return [item.username, item.nickName, item.account]
                        .filter(Boolean)
                        .some(text => String(text).toLowerCase().includes(currentKeyword));
                });
            },
            detailRequest: async ids => {
                const idList = Array.isArray(ids) ? ids : [ids];
                const idSet = new Set(idList.map(id => String(id)));
                return mockUserList.filter(item => idSet.has(String(item.id)));
            },
            labelField: 'username',
            valueField: 'id'
        }),


        //textarea 组件
        maker.textarea('商品简介', 'goods_info', '').props({
            placeholder: '请输入商品名称'
        }),

        maker.password('密码框', 'password', '').props({
            placeholder: '请输入密码'
        }),

        {
            type: 'object',
            title: '对象组件',
            field: 'object',
            value: {date: '2121-12-12', field: 10, field2: '123123123'},
            props: {
                rule: [

                            maker.date('date', 'date', '').native(false).col({span: 12}),
                            {
                                type: 'inputNumber',
                                field: 'field',
                                title: 'field',
                                props: {
                                    disabled: false
                                },
                                validate: [
                                    {required: true, min: 10, type: 'number'}
                                ],
                                col: {
                                    span: 12
                                }
                            },
                    {
                        type: 'input',
                        field: 'field2',
                        title: 'field2',
                        props: {
                            disabled: false
                        },
                        validate: [
                            {required: true}
                        ]
                    }
                ]
            }
        },

        {
            type: 'group',
            title: '批量添加',
            field: 'group',
            value: [{date: '2121-12-12', field: 10, field2: '123123123'}],
            props: {
                max: 5,
                min: 3,
                rule: [
                    {
                        type: 'row',
                        children: [
                            maker.date('', 'date', '').native(false).col({span: 12}),
                            {
                                type: 'inputNumber',
                                field: 'field',
                                props: {
                                    disabled: false
                                },
                                validate: [
                                    {required: true, min: 10, type: 'number'}
                                ],
                                col: {
                                    span: 12
                                }
                            }
                        ]

                    },
                    {
                        type: 'input',
                        field: 'field2',
                        props: {
                            disabled: false
                        },
                        validate: [
                            {required: true}
                        ]
                    }
                ]
            },
            validate: [
                {required: true, min: 3, type: 'array', message: '最少增加3项'},
            ]
        },


        //radio 单选框组件
        maker.radio('是否包邮', 'is_postage', 0).options([
            {value: 0, label: '不包邮', disabled: false},
            {value: 1, label: '包邮', disabled: false},
            {value: 2, label: '未知', disabled: true},
        ]).props({optionType: 'button'})
            .control([
            {
                value: 1,
                rule: [
                    maker.number('满额包邮', 'postage_money', 0)
                ]
            }
        ]),


        //checkbox 复选框付选择
        maker.checkbox('标签', 'label', [1]).options([
            {value: 1, label: '好用', disabled: true},
            {value: 2, label: '方便', disabled: false},
            {value: 3, label: '实用', disabled: false},
            {value: 4, label: '有效', disabled: false},
        ]),


        // switch 开关组件
        maker.switch('是否上架', 'is_show', true).props({
            'checkedChildren': '1',
            'unCheckedChildren': '0'
        }),

        //自定义组件
        maker.create('a-button').props('disabled', false).col({span: 12, push: 2}).children([
            maker.create('span').children(['测试自定义按钮'])
        ]).emit(['click']).emitPrefix('btn'),



        //select 下拉选择组件
        maker.select('产品分类', 'cate_id', '104').options([
            {'value': '104', 'label': '生态蔬菜', 'disabled': false},
            {'value': '105', 'label': '新鲜水果', 'disabled': false},
        ]),


        {
            type: 'fragment',//内置组件
            children: [
                {
                    type: 'a-col',
                    props: {
                        span: 12
                    },
                    children: [

                        // datePicker 日期选择组件
                        maker.rangePicker('活动日期', 'section_day').props({
                            showTime: true,
                            picker: 'year',
                        }),

                        // timePicker 时间选择组件
                        maker.timeRangePicker('活动时间', 'section_time', ['11:11:11', '22:22:22']).props({
                            'placeholder': ['请选择活动时间','请选择活动时间'],
                        }),

                    ]
                },
                {
                    type: 'a-col',
                    props: {
                        span: 12
                    },
                    children: [
                        //inputNumber 数组输入框组件
                        maker.number('排序', 'sort', 0).props({
                            precision: 2
                        }).col({span: 24}).validate(
                            [{require: true, type: 'number', min: 10}]
                        ),
                    ]
                }
            ],
            native: true
        },


        //rate 评分组件
        maker.rate('推荐级别', 'rate', 2)
            .props({
                'count': 10,
            })
            .validate({required: true, type: 'number', min: 3, message: '请大于3颗星', trigger: 'change'})
            .control([
            {
                handle: function (val) {
                    return val > 5;
                },
                rule: [
                    maker.input('好评原因', 'goods_reason', '').props({disabled: false})
                ]
            }, {
                handle: function (val) {
                    return val < 5;
                },
                rule: [
                    maker.input('差评原因', 'bad_reason', '').props({disabled: false})
                ]
            }
        ]),


        //slider 滑块组件
        maker.slider('滑块', 'slider', 80).props({
            'min': 0,
            'max': 100,
            // 'range': true,
        }),

        // ===== 公式计算示例 =====
        maker.number('单价', 'price', 100).props({
            min: 0,
            precision: 2,
            placeholder: '请输入单价'
        }),

        maker.number('数量', 'quantity', 10).props({
            min: 0,
            placeholder: '请输入数量'
        }),

        maker.number('折扣(%)', 'discount', 10).props({
            min: 0,
            max: 100,
            precision: 0,
            placeholder: '请输入折扣'
        }),

        // 公式计算：总价 = 单价 * 数量 * (1 - 折扣/100)
        maker.formula('总价', 'total_price').props({
            formula: '{{price}} * {{quantity}} * (1 - {{discount}} / 100)',
            precision: 2,
            prefix: '¥',
            showProcess: true,
        }),

        // 公式计算：税费 = 总价 * 0.13
        maker.formula('税费(13%)', 'tax').props({
            formula: '{{total_price}} * 0.13',
            precision: 2,
            prefix: '¥',
        }),

        // 公式计算：最终价格 = 总价 + 税费
        maker.formula('最终价格', 'final_price').props({
            formula: '{{total_price}} + {{tax}}',
            precision: 2,
            prefix: '¥',
            suffix: ' 元',
            className: 'final-price-highlight'
        }),

        {
            type: 'wangEditor',
            field: 'txt2',
            title: '富文本框',
            value: '<h1 style="color: #419bf7;">form-create</h1><a href="https://github.com/xaboy/form-create">GitHub</a>'
        },

        //upload 上传组件
        maker.upload('轮播图', 'pic', ['http://form-create.com/logo.png'])
            .props({
                'action': 'http://127.0.0.1:8324/api/test',
                'limit': 2,
                'name': 'file',
                onSuccess: function (file) {
                    file.url = file.response.data.url;
                }
            }),

        //frame 框架组件
        maker.frame('素材', 'fodder', ['http://form-create.com/logo.png']).props({
            src: '../iframe.html',
            maxLength: 0,
            type: 'file',
            width: '80%',
            modalTitle: '预览~~~',
            okBtnText: 'ok',
            closeBtnText: 'close',
            title: 'select'
        }).validate([
            {required: true, type: 'array', min: 2, message: '请选择2张图片', trigger: 'change'}
        ]).event({
            remove: function () {
                alert('删除了');
            },
            open: console.log,
            change() {
                console.log('change');
            }
        }),


        //tree 树形组件
        maker.tree('权限', 'tree', [11, 12]).props({
            defaultExpandAll: true,
            treeData: [
                {
                    title: 'parent 1',
                    expand: true,
                    selected: false,
                    id: 1,
                    children: [
                        {
                            title: 'parent 1-1',
                            expand: true,
                            id: 2,
                            children: [
                                {
                                    title: 'leaf 1-1-1',
                                    disabled: true,
                                    id: 11
                                },
                                {
                                    title: 'leaf 1-1-2',
                                    selected: true,
                                    id: 12
                                }
                            ]
                        },
                        {
                            title: 'parent 1-2',
                            expand: true,
                            id: 3,
                            children: [
                                {
                                    title: 'leaf 1-2-1',
                                    checked: true,
                                    id: 13,
                                },
                                {
                                    title: 'leaf 1-2-1',
                                    id: 14,
                                }
                            ]
                        }
                    ]
                }
            ],
        }).validate([
            {required: true, type: 'array', min: 2, message: '至少选择2个', trigger: 'change'}
        ])
    ];
}
