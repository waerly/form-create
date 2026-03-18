/**
 * 打包packages文件
 */
import type {Ora} from 'ora';
import chalk from 'chalk';
import ora from 'ora';
import os from 'os';
import execa from 'execa';
import dayjs from 'dayjs';
import path from 'path';
import fs from 'fs';

let spinner: Ora;
const build = async (target: string, comp: string, targetName: string) => {
    dayjs().startOf('millisecond');
    spinner.text = chalk.bold.yellow(`start build ${targetName} ui \n`);
    /// env 先写死
    const env = 'production'
    await execa(
        'rollup',
        [
            '-c',
            '--environment',
            [
                `NODE_ENV:${env}`,
                `BUILD_TARGET:${targetName}`,
                `BUILD_TARGET_COMP:${comp}`,
                'BUILD_TYPE:packages',
                `BUILD_TARGET_PATH:${target}`
            ].filter(Boolean).join(',')
        ],
        {stdio: 'inherit'}
    );

    // 2. 生成 TypeScript 声明文件
    // 2. 为当前包生成 TypeScript 声明文件
    const pkgTsConfigPath = path.resolve(target, 'tsconfig.json');
    const distPath = path.resolve(target, 'dist');

    // 如果包有自己的 tsconfig，则使用它
    if (fs.existsSync(pkgTsConfigPath)) {
        spinner.text = chalk.bold.yellow(`generating types for ${targetName}...\n`);
        try {
            await execa('npx', [
                'tsc',
                '--project', pkgTsConfigPath,
                '--emitDeclarationOnly',
                '--declaration',
                '--outDir', distPath
            ], {stdio: 'inherit'});
            spinner.text = chalk.bold.green(`types generated for ${targetName}\n`);
        } catch (error) {
            spinner.text = chalk.bold.red(`failed to generate types for ${targetName}: ${error.message}\n`);
        }
    } else {
        // 否则使用根目录的 tsconfig，但限定只编译当前包的源码
        const rootTsConfigPath = path.resolve(process.cwd(), 'tsconfig.json');
        const srcPath = path.resolve(target, 'src');

        if (fs.existsSync(rootTsConfigPath) && fs.existsSync(srcPath)) {
            spinner.text = chalk.bold.yellow(`generating types for ${targetName}...\n`);
            try {
                await execa('npx', [
                    'tsc',
                    '--project', rootTsConfigPath,
                    '--emitDeclarationOnly',
                    '--declaration',
                    '--rootDir', srcPath,
                    '--outDir', distPath
                ], {stdio: 'inherit'});
                spinner.text = chalk.bold.green(`types generated for ${targetName}\n`);
            } catch (error) {
                spinner.text = chalk.bold.red(`failed to generate types for ${targetName}: ${error.message}\n`);
            }
        }
    }


    spinner.text = chalk.bold.green(`finished build ${targetName} ui time: ${dayjs().startOf('millisecond').format('SSS')}ms. \n `);
}


const runParallel = async (maxConcurrency: number, source: string[], buildName: string, iteratorFn: Function) => {
    const ret = []
    const executing = []
    for (const item of source) {
        const comp = item.split('/').pop()
        const p = Promise.resolve().then(() => iteratorFn(item, comp, buildName))
        ret.push(p)

        if (maxConcurrency <= source.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1))
            executing.push(e)
            if (executing.length >= maxConcurrency) {
                await Promise.race(executing)
            }
        }
    }
    return Promise.all(ret)
}

const buildAll = async (comAllTargets) => {
    await runParallel(os.cpus().length, comAllTargets[1], comAllTargets[0], build)
}

const _filter_current_url_ = (urls: Array<any>) => {
    const arr = []
    urls.map((url) => {
        const itemUrlLibName = url[0];
        let itemUrlLibsUrl = '';
        url[1].forEach((item, idx) => {
            const suffix = item.split('/').pop()
            if (suffix === itemUrlLibName) {
                itemUrlLibsUrl = item
            }
        })
        const item = [itemUrlLibName, [itemUrlLibsUrl]]
        arr.push(item)
    })
    return arr
}

const createBuildPackages = async (cpaths: { [k: string]: any }) => {
    const tips = chalk.redBright.bold('\n start build all packages \n')
    spinner = ora(tips).start()
    /// 根据每个不同的ui库去生成每个ui库下面的不同的组件打包
    const cps = Object.entries(cpaths)
    /// 处理下当前的url
    const fCps = _filter_current_url_(cps)
    for (const cpath of fCps) {
        await buildAll(cpath)
    }
}

export default createBuildPackages
