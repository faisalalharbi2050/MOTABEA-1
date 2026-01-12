import React, { useState } from 'react';

/**
 * مكون تشخيص سريع لاختبار الاتصال مع الخادم
 * يمكن إضافته مؤقتاً لصفحة تسجيل الدخول للتشخيص
 */
const LoginDiagnostics = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const addResult = (type: 'info' | 'success' | 'error', message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    setResults(prev => [...prev, { type, message, data, timestamp }]);
  };

  const testServerConnection = async () => {
    setIsTestingConnection(true);
    setResults([]);
    
    addResult('info', 'بدء اختبار الاتصال مع الخادم...');

    try {
      // اختبار health endpoint
      addResult('info', 'اختبار /api/health...');
      const healthResponse = await fetch('/api/health');
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        addResult('success', 'الخادم يعمل بشكل صحيح', healthData);
      } else {
        addResult('error', `خطأ في health endpoint: ${healthResponse.status}`);
      }

      // اختبار تسجيل الدخول
      addResult('info', 'اختبار تسجيل الدخول...');
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        }),
      });

      addResult('info', `حالة استجابة تسجيل الدخول: ${loginResponse.status}`);

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        addResult('success', 'تسجيل الدخول نجح!', {
          user: loginData.user?.name,
          role: loginData.user?.role,
          hasToken: !!loginData.token
        });
      } else {
        const errorData = await loginResponse.json();
        addResult('error', 'فشل تسجيل الدخول', errorData);
      }

    } catch (error) {
      addResult('error', 'خطأ في الشبكة', error instanceof Error ? error.message : String(error));
    } finally {
      setIsTestingConnection(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-medium text-gray-900 mb-3">🔧 أدوات التشخيص</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={testServerConnection}
          disabled={isTestingConnection}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTestingConnection ? 'جاري الاختبار...' : 'اختبار الاتصال'}
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          مسح النتائج
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded text-sm ${
                result.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : result.type === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium">{result.message}</span>
                <span className="text-xs opacity-70">{result.timestamp}</span>
              </div>
              {result.data && (
                <pre className="mt-2 text-xs opacity-80 whitespace-pre-wrap">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoginDiagnostics;
