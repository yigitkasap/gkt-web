import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Site hatası:', error, info);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          <div className="text-center p-8">
            <p className="text-6xl font-bold text-slate-200 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Hata</p>
            <p className="text-slate-500 mb-6">Bir şeyler yanlış gitti.</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
