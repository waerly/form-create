/*
 * @Author       : djkloop
 * @Date         : 2020-08-15 21:16:03
 * @LastEditors   : djkloop
 * @LastEditTime  : 2020-12-23 13:47:39
 * @Description  : 头部注释
 * @FilePath      : /form-create2/packages/iview/vue.config.js
 */
module.exports = {
    pages: {
        app: {
            entry: 'examples/main.js',
            template: 'public/index.html',
            filename: 'index.html'
        }
    },
    configureWebpack: {
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json']
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    include: /node_modules/,
                    type: 'javascript/auto'
                },
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'babel-loader'
                        }
                    ],
                    exclude: /node_modules(?!\/@form-create)/
                }
            ]
        }
    },
    transpileDependencies: ['@form-create']
}
