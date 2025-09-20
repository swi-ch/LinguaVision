// LinguaVision前端配置文件
// 这个文件需要上传到Netlify网站根目录

window.LinguaVisionConfig = {
    // API配置
    api: {
        // 本地开发环境
        development: {
            baseUrl: 'http://localhost:3000',
            timeout: 300000 // 5分钟超时
        },
        // 生产环境 - 需要替换为您的公网IP
        production: {
            baseUrl: 'https://b42b14f8338a.ngrok-free.app', // ngrok实际地址
            timeout: 300000 // 5分钟超时
        }
    },
    
    // 功能开关
    features: {
        realtimeProgress: true,
        fileDownload: true,
        errorReporting: true,
        debugMode: false
    },
    
    // 自动检测环境
    getCurrentConfig() {
        const isNetlify = window.location.hostname.includes('netlify.app');
        const isDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';
        
        if (isDevelopment) {
            return this.api.development;
        } else {
            return this.api.production;
        }
    },
    
    // 获取API基础URL
    getApiUrl() {
        return this.getCurrentConfig().baseUrl;
    },
    
    // 获取完整的API端点URL
    getEndpoint(path) {
        return this.getApiUrl() + (path.startsWith('/') ? path : '/' + path);
    }
};

// 全局API调用函数
window.callLinguaVisionAPI = async function(endpoint, options = {}) {
    const config = window.LinguaVisionConfig;
    const url = config.getEndpoint(endpoint);
    
    const defaultOptions = {
        timeout: config.getCurrentConfig().timeout,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        // 创建AbortController用于超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);
        
        const response = await fetch(url, {
            ...finalOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('请求超时，请稍后重试');
        } else if (error.name === 'TypeError') {
            throw new Error('无法连接到后端服务，请检查网络连接');
        } else {
            throw error;
        }
    }
};

// 调试信息
console.log('LinguaVision配置加载完成');
console.log('当前API地址:', window.LinguaVisionConfig.getApiUrl());
console.log('运行环境:', window.location.hostname.includes('netlify.app') ? 'Netlify生产环境' : '本地开发环境');
