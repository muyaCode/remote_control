import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 如果你想开始测量应用程序的性能，传递一个函数
// 记录结果(例如:reportWebVitals(console.log))
// 或发送到分析端点。了解更多信息:https://bit.ly/CRA-vitals
reportWebVitals();
