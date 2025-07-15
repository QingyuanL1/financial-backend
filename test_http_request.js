const axios = require('axios');

// 模拟前端发送的完整数据
const testData = {
    period: '2025',
    data: {
        selectedTable: 'new_orders',
        modifications: {
            'new_orders': [
                {
                    name: '设备',
                    items: [
                        { id: 1, projectName: '上海项目', yearlyBudget: 30000.00 },
                        { id: 2, projectName: '国网项目', yearlyBudget: 8000.00 },
                        { id: 3, projectName: '江苏项目', yearlyBudget: 5000.00 },
                        { id: 4, projectName: '输配电内配', yearlyBudget: 4000.00 },
                        { id: 5, projectName: '西门子项目', yearlyBudget: 5000.00 },
                        { id: 6, projectName: '同业项目', yearlyBudget: 5000.00 },
                        { id: 7, projectName: '用户项目', yearlyBudget: 5000.00 },
                        { id: 8, projectName: '其它项目', yearlyBudget: 0.00 }
                    ]
                },
                {
                    name: '元件',
                    items: [
                        { id: 9, projectName: '用户项目', yearlyBudget: 4000.00 }
                    ]
                },
                {
                    name: '工程',
                    items: [
                        { id: 10, projectName: '一包项目', yearlyBudget: 3900.00 },
                        { id: 11, projectName: '二包项目', yearlyBudget: 2200.00 },
                        { id: 12, projectName: '域内合作项目', yearlyBudget: 5000.00 },
                        { id: 13, projectName: '域外合作项目', yearlyBudget: 1000.00 },
                        { id: 14, projectName: '其它项目', yearlyBudget: 1900.00 }
                    ]
                }
            ]
        },
        timestamp: new Date().toISOString()
    }
};

console.log('发送测试请求...');
console.log('请求数据:', JSON.stringify(testData, null, 2));

async function testHttpRequest() {
    try {
        const response = await axios.post('http://localhost:3000/budget-planning', testData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('请求成功!');
        console.log('响应状态:', response.status);
        console.log('响应数据:', response.data);
        
    } catch (error) {
        console.error('请求失败!');
        console.error('错误状态:', error.response?.status);
        console.error('错误信息:', error.response?.data);
        console.error('错误详情:', error.message);
        
        if (error.response?.data) {
            console.error('服务器返回:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testHttpRequest();