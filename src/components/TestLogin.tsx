import { useState } from 'react';

export default function TestLogin() {
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testDirectLogin = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Testing direct connection to server...');
      
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'admin', 
          password: 'admin123' 
        }),
      });

      console.log('📡 Direct response status:', response.status);
      const data = await response.json();
      console.log('📡 Direct response data:', data);

      if (response.ok) {
        setResult(`✅ Direct connection successful!\nUser: ${data.user.name}\nRole: ${data.user.role}`);
      } else {
        setResult(`❌ Direct connection failed: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error('💥 Direct connection error:', error);
      setResult(`❌ Direct connection error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testProxyLogin = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Testing proxy connection...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'admin', 
          password: 'admin123' 
        }),
      });

      console.log('📡 Proxy response status:', response.status);
      const data = await response.json();
      console.log('📡 Proxy response data:', data);

      if (response.ok) {
        setResult(`✅ Proxy connection successful!\nUser: ${data.user.name}\nRole: ${data.user.role}`);
      } else {
        setResult(`❌ Proxy connection failed: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error('💥 Proxy connection error:', error);
      setResult(`❌ Proxy connection error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testHealth = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Testing server health...');
      
      const response = await fetch('/api/health');
      const data = await response.json();
      
      setResult(`✅ Server health check passed!\nStatus: ${data.status}\nMessage: ${data.message}`);
    } catch (error) {
      console.error('💥 Health check error:', error);
      setResult(`❌ Health check failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl',
      textAlign: 'right'
    }}>
      <h1>اختبار الاتصال</h1>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={testHealth}
          disabled={isLoading}
          style={{ 
            padding: '10px 20px', 
            margin: '5px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          اختبار صحة الخادم
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={testDirectLogin}
          disabled={isLoading}
          style={{ 
            padding: '10px 20px', 
            margin: '5px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          اختبار الاتصال المباشر
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={testProxyLogin}
          disabled={isLoading}
          style={{ 
            padding: '10px 20px', 
            margin: '5px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          اختبار الاتصال عبر Proxy
        </button>
      </div>

      {isLoading && <p>جاري الاختبار...</p>}
      
      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: result.includes('✅') ? '#d4edda' : '#f8d7da',
          color: result.includes('✅') ? '#155724' : '#721c24',
          border: '1px solid ' + (result.includes('✅') ? '#c3e6cb' : '#f5c6cb'),
          borderRadius: '4px',
          whiteSpace: 'pre-wrap'
        }}>
          {result}
        </div>
      )}
    </div>
  );
}
