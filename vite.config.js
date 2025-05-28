import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

//普通的vue项目是webpack vite项目肯定是vite
//按需安装导入配置
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

//svg插件方法
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 获取.env文件里定义的环境变量
  const env = loadEnv(mode, process.cwd())
  // .env文件中的环境变量必须以VITE_为前缀，否则无法引用成功
  return{
    plugins: [
      AutoImport({
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef, useRouter 等
        imports: ['vue','vue-router'],
        // 自动导入element plus相关函数（带样式）
        // resolvers: [ElementPlusResolver()],
      }),
      Components({
        // 局部安装自动导入element plus组件
        // 按需引入产生大bug，如果没有在APP.vue挂载Element ui，
        // 则proxy就是this.message is not function
        // 解决1.直接使用ElMessage({})
        // 解决2.去App.vue的原型上挂载messge
        //import { Message } from 'element-ui' 或者 'element-plus'
        //Vue.prototype.$message = Message  或者  app.config.globalProperties.$message =  ElMessage;
        //这样就可以使用this.$message了  直接全局引用没有这么多事  
        //本项目配置了解决1和2，都能使用
        // resolvers: [ElementPlusResolver()],
      }),
      vue(),
      createSvgIconsPlugin({
        // process.cwd() 表示返回运行当前脚本的工作目录的路径
        //绑定需要存放的图标文件夹
        iconDirs:[resolve(process.cwd(),'src/components/svgIcon/icon')],
        //指定symbolId格式
        symbolId:'icon-[dir]-[name]'
      })
    ],
    resolve:{
      alias:{
        '@': resolve(__dirname,'src'),
        '@u': resolve(__dirname, './src/utils'),
        '@a': resolve(__dirname, './src/api'),
        '@c': resolve(__dirname, './src/components')
      }
    },
    css:{
      //测试时vue文件记得配置<style lang="csss">里面还要至少写下一条标签样式
      // </style>不然没有效果
      preprocessorOptions: {
        scss: {
          //记得若要在stlye.css配置，这里则不能先编译配置
          // additionalData: `@import "./src/styles/main.scss";`,  
          
          //sass定义的变量文件在style.css中引入无效，所以我们才有additionalData导入
          additionalData: `@import "./src/styles/sassConfig.scss";`,  
        },
      },
    },
    define:{
      // 环境变量通常可以从 process.env 获得。注意Vite默认是不加载env文件的
      'process.env': {
        VITE_BASE_API: env.VITE_BASE_API,
        VITE_API_DEV_TARGET: env.VITE_API_DEV_TARGET
      }
    },
    server: {
      hmr: true, // vue3 vite配置热更新不用手动刷新
      // 默认打开的端口和本地
      host: '0.0.0.0',  //指定使用地址，默认localhost, 0.0.0.0 代表可以被外界访问
      port: 8889,  //访问端口
      open: false, //编译完成时是否自动打开网页
      https: false, // 不支持https
      proxy: {
        [env.VITE_BASE_API]: {
          target: env.VITE_API_DEV_TARGET,	// API服务器的地址
          changeOrigin: true, // 是否允许跨域
          rewrite: path => path.replace(RegExp(`^${env.VITE_BASE_API}`), '')  // 匹配开头为 /devApi的字符串，并替换为空字符串
        },
      }

      // proxy: {
      //   "/devApi": {
      //     target: "http://v3.web-jshtml.cn/api",	// API服务器的地址
      //     changeOrigin: true, // 是否允许跨域
      //     rewrite: (path) => path.replace(/^\/devApi/, '')
      //   },
      // }

    },
  }
})
